/**
 * NowPayments crypto integration (white-label / API mode)
 *
 * Required environment variables:
 * - NOWPAYMENTS_API_KEY    : your NowPayments API key
 * - NOWPAYMENTS_IPN_SECRET : your IPN secret (Store settings) for webhook verification
 * - VITE_APP_URL / APP_URL : public base URL of the app (for the IPN callback URL)
 *
 * Flow: we create a payment via the API and show the pay address/amount/QR on our
 * OWN page (no NowPayments branding). NowPayments calls our IPN webhook when the
 * payment status changes. On payment we mark the order as paid (paymentConfirmedAt)
 * but keep status "pending" so the account is still "preparing" until an admin assigns it.
 */
import { createHmac } from "node:crypto";
import type { Express, Request, Response } from "express";
import { ENV } from "./_core/env";
import * as db from "./db";

const API_BASE = "https://api.nowpayments.io/v1";

export function isNowPaymentsConfigured(): boolean {
  return Boolean(ENV.nowpaymentsApiKey);
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    "x-api-key": ENV.nowpaymentsApiKey,
  };
}

// Statuses that mean the customer's payment has been received
export const PAID_STATUSES = new Set(["confirmed", "sending", "finished"]);

/** Coins the merchant has enabled (e.g. ["btc","eth","usdttrc20", ...]) */
export async function getMerchantCoins(): Promise<string[]> {
  if (!isNowPaymentsConfigured()) return [];
  try {
    const res = await fetch(`${API_BASE}/merchant/coins`, { headers: authHeaders() });
    const data: any = await res.json();
    if (!res.ok) {
      console.error("[NowPayments] coins error:", res.status, JSON.stringify(data));
      return [];
    }
    return Array.isArray(data?.selectedCurrencies) ? data.selectedCurrencies : [];
  } catch (e: any) {
    console.error("[NowPayments] coins exception:", e?.message || e);
    return [];
  }
}

export type CreatedPayment = {
  paymentId: string;
  payAddress: string;
  payAmount: number;
  payCurrency: string;
  payinExtraId: string | null;
  network: string | null;
  paymentStatus: string;
};

export async function createPayment(params: {
  orderId: number;
  amount: string | number;
  payCurrency: string;
  description?: string;
}): Promise<CreatedPayment> {
  if (!isNowPaymentsConfigured()) {
    throw new Error("Crypto payments are not configured");
  }

  const baseUrl = (ENV.appUrl || "").replace(/\/$/, "");
  const payload = {
    price_amount: Number(params.amount),
    price_currency: "usd",
    pay_currency: params.payCurrency,
    order_id: String(params.orderId),
    order_description: params.description || `Order #${params.orderId}`,
    ipn_callback_url: `${baseUrl}/api/nowpayments/ipn`,
    is_fixed_rate: true,
  };

  const res = await fetch(`${API_BASE}/payment`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  const data: any = await res.json().catch(() => ({}));
  if (!res.ok || !data?.payment_id || !data?.pay_address) {
    console.error("[NowPayments] create payment failed:", res.status, JSON.stringify(data));
    const raw = data?.message || `NowPayments error (${res.status})`;
    // Friendlier message for the common minimum-amount error
    const msg = /too small/i.test(String(raw))
      ? "This coin's minimum payment is higher than the order amount. Please choose another coin (e.g. USDT TRC20)."
      : raw;
    throw new Error(msg);
  }
  return {
    paymentId: String(data.payment_id),
    payAddress: data.pay_address,
    payAmount: Number(data.pay_amount),
    payCurrency: data.pay_currency,
    payinExtraId: data.payin_extra_id ?? null,
    network: data.network ?? null,
    paymentStatus: data.payment_status,
  };
}

export async function getPaymentStatus(
  paymentId: string
): Promise<{ paymentStatus: string; actuallyPaid: number; payAmount: number } | null> {
  if (!isNowPaymentsConfigured()) return null;
  try {
    const res = await fetch(`${API_BASE}/payment/${paymentId}`, { headers: authHeaders() });
    const data: any = await res.json();
    if (!res.ok) {
      console.error("[NowPayments] status error:", res.status, JSON.stringify(data));
      return null;
    }
    return {
      paymentStatus: data.payment_status,
      actuallyPaid: Number(data.actually_paid || 0),
      payAmount: Number(data.pay_amount || 0),
    };
  } catch (e: any) {
    console.error("[NowPayments] status exception:", e?.message || e);
    return null;
  }
}

// Recursively sort object keys (NowPayments signs the sorted JSON)
function sortObject(obj: any): any {
  if (Array.isArray(obj)) return obj.map(sortObject);
  if (obj && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce((acc: Record<string, any>, key) => {
        acc[key] = sortObject(obj[key]);
        return acc;
      }, {});
  }
  return obj;
}

export function verifyIpnSignature(body: Record<string, any>, signature: string | undefined): boolean {
  if (!signature || !ENV.nowpaymentsIpnSecret) return false;
  try {
    const sorted = JSON.stringify(sortObject(body));
    const hmac = createHmac("sha512", ENV.nowpaymentsIpnSecret).update(sorted).digest("hex");
    return hmac === signature;
  } catch {
    return false;
  }
}

/** Apply a payment status update to an order (shared by IPN + polling fallback). */
async function applyPaymentStatusToOrder(orderId: number, paymentStatus: string) {
  const order = await db.getOrderById(orderId);
  if (!order) return;
  const update: Record<string, any> = { nowpaymentsStatus: paymentStatus };
  if (PAID_STATUSES.has(paymentStatus) && !order.paymentConfirmedAt) {
    update.paymentConfirmedAt = new Date();
  }
  await db.updateOrder(orderId, update);
  if (PAID_STATUSES.has(paymentStatus)) {
    try {
      await db.createActivityLog({
        userId: order.userId,
        action: "nowpayments_payment_received",
        entityType: "order",
        entityId: orderId,
        details: { status: paymentStatus },
      });
    } catch {
      /* non-fatal */
    }
  }
}

export async function syncOrderPaymentStatus(orderId: number, paymentId: string): Promise<string | null> {
  const status = await getPaymentStatus(paymentId);
  if (!status) return null;
  await applyPaymentStatusToOrder(orderId, status.paymentStatus);
  return status.paymentStatus;
}

/** Register the IPN webhook route. Must be mounted before the SPA catch-all. */
export function registerNowPaymentsRoutes(app: Express) {
  app.post("/api/nowpayments/ipn", async (req: Request, res: Response) => {
    try {
      const body = req.body as Record<string, any>;
      const signature = req.header("x-nowpayments-sig") || undefined;

      if (!verifyIpnSignature(body, signature)) {
        console.warn("[NowPayments] IPN signature verification failed");
        res.status(400).json({ error: "Invalid signature" });
        return;
      }

      const orderId = parseInt(String(body.order_id || ""), 10);
      const paymentStatus: string = body.payment_status || "";

      if (Number.isFinite(orderId) && paymentStatus) {
        await applyPaymentStatusToOrder(orderId, paymentStatus);
      }

      res.json({ ok: true });
    } catch (e: any) {
      console.error("[NowPayments] IPN error:", e?.message || e);
      res.status(500).json({ error: "IPN processing failed" });
    }
  });
}
