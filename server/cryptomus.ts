/**
 * Cryptomus crypto payment integration
 *
 * Required environment variables:
 * - CRYPTOMUS_MERCHANT_ID : your Cryptomus merchant UUID
 * - CRYPTOMUS_API_KEY      : your Cryptomus *payment* API key
 * - VITE_APP_URL / APP_URL : public base URL of the app (for callback/return URLs)
 *
 * Behavior: creates a hosted Cryptomus payment and returns its URL. Payment
 * confirmation arrives via webhook, which records the payment on the order but
 * KEEPS the order "pending" so an admin still assigns/verifies it manually.
 */
import { createHash } from "node:crypto";
import type { Express, Request, Response } from "express";
import { ENV } from "./_core/env";
import * as db from "./db";

const API_BASE = "https://api.cryptomus.com/v1";

export function isCryptomusConfigured(): boolean {
  return Boolean(ENV.cryptomusMerchantId && ENV.cryptomusApiKey);
}

/**
 * Cryptomus signs requests/webhooks as:
 *   md5( base64( json_body ) + API_KEY )
 * Cryptomus uses PHP json_encode which escapes forward slashes ("/" -> "\/"),
 * so we replicate that to keep signatures consistent.
 */
function makeSign(payload: unknown): string {
  const json = JSON.stringify(payload).replace(/\//g, "\\/");
  const base64 = Buffer.from(json).toString("base64");
  return createHash("md5").update(base64 + ENV.cryptomusApiKey).digest("hex");
}

export function verifyWebhookSign(body: Record<string, any>): boolean {
  if (!body || typeof body !== "object" || !body.sign) return false;
  const { sign, ...rest } = body;
  try {
    const expected = makeSign(rest);
    return expected === sign;
  } catch {
    return false;
  }
}

type CreatePaymentParams = {
  orderId: number;
  amount: string; // e.g. "12.00"
  currency?: string; // default USD
};

/**
 * Create a Cryptomus hosted payment. Returns the payment page URL + uuid,
 * or null if not configured / on error.
 */
export async function createCryptomusPayment(
  params: CreatePaymentParams
): Promise<{ uuid: string; url: string } | null> {
  if (!isCryptomusConfigured()) {
    console.error("[Cryptomus] Not configured (missing CRYPTOMUS_MERCHANT_ID / CRYPTOMUS_API_KEY)");
    return null;
  }

  const baseUrl = (ENV.appUrl || "").replace(/\/$/, "");

  // order_id must be unique per invoice; suffix with a short timestamp so a
  // retried checkout can create a fresh invoice.
  const cryptomusOrderId = `${params.orderId}-${Date.now().toString(36)}`;

  const payload: Record<string, any> = {
    amount: String(params.amount),
    currency: params.currency || "USD",
    order_id: cryptomusOrderId,
    // Where Cryptomus sends payment status updates
    url_callback: `${baseUrl}/api/cryptomus/webhook`,
    // Where the user is sent back after paying
    url_return: `${baseUrl}/orders`,
    url_success: `${baseUrl}/orders`,
    // Pass our internal order id so the webhook can map it back
    additional_data: String(params.orderId),
  };

  try {
    const res = await fetch(`${API_BASE}/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        merchant: ENV.cryptomusMerchantId,
        sign: makeSign(payload),
      },
      body: JSON.stringify(payload),
    });

    const data: any = await res.json();

    if (!res.ok || data?.state !== 0 || !data?.result?.url) {
      console.error("[Cryptomus] Create payment failed:", res.status, JSON.stringify(data));
      return null;
    }

    return { uuid: data.result.uuid as string, url: data.result.url as string };
  } catch (error: any) {
    console.error("[Cryptomus] Create payment error:", error?.message || error);
    return null;
  }
}

// Cryptomus statuses that mean the customer has paid
const PAID_STATUSES = new Set(["paid", "paid_over"]);

/**
 * Register the Cryptomus webhook route. Must be mounted before the SPA catch-all.
 */
export function registerCryptomusRoutes(app: Express) {
  app.post("/api/cryptomus/webhook", async (req: Request, res: Response) => {
    try {
      const body = req.body as Record<string, any>;

      if (!verifyWebhookSign(body)) {
        console.warn("[Cryptomus] Webhook signature verification failed");
        res.status(400).json({ error: "Invalid sign" });
        return;
      }

      // Map back to our order. We pass our internal id in additional_data, and
      // order_id is "<orderId>-<suffix>".
      const internalId =
        parseInt(body.additional_data, 10) ||
        parseInt(String(body.order_id || "").split("-")[0], 10);

      const status: string = body.status || "";

      if (Number.isFinite(internalId)) {
        const order = await db.getOrderById(internalId);
        if (order) {
          await db.updateOrder(internalId, {
            cryptomusUuid: body.uuid || order.cryptomusUuid,
            cryptomusStatus: status,
            // Record that money arrived, but DO NOT auto-verify.
            // Admin still assigns/verifies the order manually.
            ...(PAID_STATUSES.has(status) && !order.paymentConfirmedAt
              ? { paymentConfirmedAt: new Date() }
              : {}),
          });

          if (PAID_STATUSES.has(status)) {
            try {
              await db.createActivityLog({
                userId: order.userId,
                action: "cryptomus_payment_received",
                entityType: "order",
                entityId: internalId,
                details: { status, uuid: body.uuid, amount: body.amount },
              });
            } catch {
              /* non-fatal */
            }
          }
        } else {
          console.warn("[Cryptomus] Webhook for unknown order:", internalId);
        }
      }

      // Always 200 so Cryptomus stops retrying once received
      res.json({ ok: true });
    } catch (error: any) {
      console.error("[Cryptomus] Webhook error:", error?.message || error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });
}
