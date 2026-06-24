import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { trpc } from "@/lib/trpc";
import { useRoute, Link } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Copy, CheckCircle, Clock, Bitcoin, Check, ChevronsUpDown } from "lucide-react";

type CreatedPayment = {
  paymentId: string;
  payAddress: string;
  payAmount: number;
  payCurrency: string;
  payinExtraId: string | null;
  network: string | null;
  paymentStatus: string;
};

type AvailableCurrency = { ticker: string; name: string; network: string | null };

export default function Pay() {
  const [, params] = useRoute("/pay/:orderId");
  const orderId = params?.orderId ? parseInt(params.orderId) : null;

  const { data: order, isLoading: orderLoading } = trpc.orders.getById.useQuery(
    { id: orderId! },
    { enabled: !!orderId }
  );
  const { data: currencies } = trpc.nowpayments.currencies.useQuery(undefined, {
    enabled: !!orderId,
  });

  const createPayment = trpc.nowpayments.createPayment.useMutation();

  const [payCurrency, setPayCurrency] = useState<string>("");
  const [payment, setPayment] = useState<CreatedPayment | null>(null);
  const [coinPickerOpen, setCoinPickerOpen] = useState(false);

  // Poll payment status once a payment has been generated
  const { data: status } = trpc.nowpayments.status.useQuery(
    { orderId: orderId! },
    { enabled: !!orderId && !!payment, refetchInterval: 15000 }
  );

  const isPaid = !!status?.paid || !!order?.paymentConfirmedAt;

  const coinList = (currencies || []) as AvailableCurrency[];
  const selectedCoin = coinList.find((c) => c.ticker === payCurrency);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const handleGenerate = async () => {
    if (!orderId) return;
    if (!payCurrency) {
      toast.error("Please choose a coin to pay with");
      return;
    }
    try {
      const result = await createPayment.mutateAsync({ orderId, payCurrency });
      setPayment(result as CreatedPayment);
    } catch (e: any) {
      toast.error(e?.message || "Failed to create payment");
    }
  };

  if (orderLoading || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-lg">
        <div className="mb-6">
          <Link href="/orders">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              My Orders
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Crypto Payment</h1>
          <p className="text-muted-foreground mt-1">Order #{order.id} • ${String(order.price)}</p>
        </div>

        {/* Paid / preparing state */}
        {isPaid ? (
          <Card>
            <CardContent className="py-10 text-center space-y-4">
              <div className="h-16 w-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-9 w-9 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Payment Received</h2>
                <p className="text-muted-foreground mt-1">
                  Your payment is confirmed. Your account is being prepared and will be
                  activated shortly.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 text-sm text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-full">
                <Clock className="h-4 w-4" />
                Account preparing
              </div>
              <div className="pt-2">
                <Link href="/orders">
                  <Button className="gradient-primary">View My Orders</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : !payment ? (
          /* Choose a coin */
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bitcoin className="h-5 w-5 text-amber-500" />
                Pay with Crypto
              </CardTitle>
              <CardDescription>Select the coin you want to pay with</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Coin / Network</Label>
                <Popover open={coinPickerOpen} onOpenChange={setCoinPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={coinPickerOpen}
                      className="w-full justify-between font-normal"
                    >
                      {selectedCoin ? (
                        <span className="flex items-center gap-2 truncate">
                          <span className="truncate">{selectedCoin.name}</span>
                          {selectedCoin.network && (
                            <span className="text-xs text-muted-foreground">({selectedCoin.network})</span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {selectedCoin.ticker.toUpperCase()}
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Choose a coin</span>
                      )}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0"
                    align="start"
                  >
                    <Command>
                      <CommandInput placeholder="Search coin or network..." />
                      <CommandList>
                        <CommandEmpty>No coin found.</CommandEmpty>
                        {(currencies || []).map((c) => (
                          <CommandItem
                            key={c.ticker}
                            value={`${c.name} ${c.network ?? ""} ${c.ticker}`}
                            onSelect={() => {
                              setPayCurrency(c.ticker);
                              setCoinPickerOpen(false);
                            }}
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${payCurrency === c.ticker ? "opacity-100" : "opacity-0"}`}
                            />
                            <span className="flex-1 truncate">{c.name}</span>
                            {c.network && (
                              <span className="text-xs text-muted-foreground mr-2">{c.network}</span>
                            )}
                            <span className="text-xs text-muted-foreground">{c.ticker.toUpperCase()}</span>
                          </CommandItem>
                        ))}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                {(!currencies || currencies.length === 0) && (
                  <p className="text-xs text-muted-foreground">
                    No coins available. Crypto payments may not be configured yet.
                  </p>
                )}
              </div>
              <Button
                className="w-full gradient-primary"
                onClick={handleGenerate}
                disabled={createPayment.isPending}
              >
                {createPayment.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Payment Address"
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Show payment details */
          <Card>
            <CardHeader>
              <CardTitle>Send Payment</CardTitle>
              <CardDescription>
                Send exactly the amount below. This page updates automatically once
                your payment is detected.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* QR */}
              <div className="flex justify-center">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(payment.payAddress)}`}
                  alt="Payment address QR"
                  width={220}
                  height={220}
                  className="rounded-lg border"
                />
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Amount</Label>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-mono text-sm break-all">
                    {payment.payAmount} {payment.payCurrency.toUpperCase()}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => copy(String(payment.payAmount), "Amount")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {payment.network ? `Address (${payment.network.toUpperCase()})` : "Address"}
                </Label>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-mono text-sm break-all">{payment.payAddress}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => copy(payment.payAddress, "Address")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Extra id / memo if needed */}
              {payment.payinExtraId && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Memo / Extra ID (required)</Label>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <span className="font-mono text-sm break-all">{payment.payinExtraId}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => copy(payment.payinExtraId!, "Memo")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Waiting indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground pt-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Waiting for payment{status?.paymentStatus ? ` (${status.paymentStatus})` : ""}...
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Keep this page open. Once your payment is confirmed, your order will be
                marked paid and your account prepared.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
