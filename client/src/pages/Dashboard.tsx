import UserLayout from "@/components/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { toast } from "sonner";
import { 
  Package, 
  ShoppingCart, 
  Key, 
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Tv,
  MessageCircle,
  BookOpen,
  Copy,
  Server,
  User,
  Lock,
  Link as LinkIcon,
  FileText,
  AlertCircle,
  Coins,
  X
} from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const { data: orders, isLoading: ordersLoading } = trpc.orders.myOrders.useQuery();
  const { data: credentials, isLoading: credentialsLoading } = trpc.credentials.myCredentials.useQuery();
  const { data: plans } = trpc.plans.list.useQuery({ activeOnly: true });
  const { data: pointsData } = trpc.activations.myPoints.useQuery();
  const { data: messages } = trpc.dashboardMessages.forMe.useQuery();
  const dismissMessage = trpc.dashboardMessages.dismiss.useMutation({
    onSuccess: () => utils.dashboardMessages.forMe.invalidate(),
  });

  const activationPoints = pointsData?.points ?? 0;
  
  const pendingOrders = orders?.filter(o => o.status === "pending").length || 0;
  const verifiedOrders = orders?.filter(o => o.status === "verified").length || 0;
  const activeCredentials = credentials?.filter(c => c.isActive).length || 0;
  const expiredCredentials = credentials?.filter(c => !c.isActive).length || 0;
  
  const recentOrders = orders?.slice(0, 3) || [];
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />;
      case "verified":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "pending":
        return `${baseClasses} badge-pending`;
      case "verified":
        return `${baseClasses} badge-verified`;
      case "rejected":
        return `${baseClasses} badge-rejected`;
      default:
        return baseClasses;
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const CopyButton = ({ text, label }: { text: string; label: string }) => (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 shrink-0"
      onClick={() => copyToClipboard(text, label)}
    >
      <Copy className="h-4 w-4" />
    </Button>
  );

  const CredentialField = ({ 
    icon: Icon, 
    label, 
    value, 
    copyLabel 
  }: { 
    icon: React.ElementType; 
    label: string; 
    value: string; 
    copyLabel: string;
  }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-3 min-w-0">
        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="font-mono text-sm truncate">{value}</div>
        </div>
      </div>
      <CopyButton text={value} label={copyLabel} />
    </div>
  );

  const CredentialCard = ({ credential }: { credential: NonNullable<typeof credentials>[0] }) => {
    const isExpired = credential.expiresAt && new Date(credential.expiresAt) < new Date();
    
    return (
      <Card className={`card-hover ${!credential.isActive || isExpired ? "opacity-60" : ""}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Connection {credential.connectionNumber}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {credential.credentialType.toUpperCase()}
                  </Badge>
                </CardDescription>
              </div>
            </div>
            {credential.isActive && !isExpired ? (
              <Badge className="badge-verified gap-1">
                <CheckCircle className="h-3 w-3" />
                Active
              </Badge>
            ) : (
              <Badge className="badge-rejected gap-1">
                <AlertCircle className="h-3 w-3" />
                {isExpired ? "Expired" : "Inactive"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Xtream Codes / Combined */}
          {(credential.credentialType === "xtream" || credential.credentialType === "combined") && (
            <>
              {credential.serverUrl && (
                <CredentialField 
                  icon={Server} 
                  label="Server URL" 
                  value={credential.serverUrl} 
                  copyLabel="Server URL"
                />
              )}
              {credential.username && (
                <CredentialField 
                  icon={User} 
                  label="Username" 
                  value={credential.username} 
                  copyLabel="Username"
                />
              )}
              {credential.password && (
                <CredentialField 
                  icon={Lock} 
                  label="Password" 
                  value={credential.password} 
                  copyLabel="Password"
                />
              )}
            </>
          )}
          
          {/* M3U / Combined */}
          {(credential.credentialType === "m3u" || credential.credentialType === "combined") && (
            <>
              {credential.m3uUrl && (
                <CredentialField 
                  icon={LinkIcon} 
                  label="M3U URL" 
                  value={credential.m3uUrl} 
                  copyLabel="M3U URL"
                />
              )}
              {credential.epgUrl && (
                <CredentialField 
                  icon={FileText} 
                  label="EPG URL" 
                  value={credential.epgUrl} 
                  copyLabel="EPG URL"
                />
              )}
            </>
          )}
          
          {/* Portal */}
          {credential.credentialType === "portal" && (
            <>
              {credential.portalUrl && (
                <CredentialField 
                  icon={Tv} 
                  label="Portal URL" 
                  value={credential.portalUrl} 
                  copyLabel="Portal URL"
                />
              )}
              {credential.macAddress && (
                <CredentialField 
                  icon={Server} 
                  label="MAC Address" 
                  value={credential.macAddress} 
                  copyLabel="MAC Address"
                />
              )}
            </>
          )}
          
          {/* Expiry */}
          {credential.expiresAt && (
            <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {isExpired ? "Expired on " : "Expires on "}
                {format(new Date(credential.expiresAt), "MMM d, yyyy")}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name || "User"}!</h1>
            <p className="text-muted-foreground">Here's an overview of your IPTV subscription</p>
          </div>
<div className="flex flex-wrap gap-3">
  {/* Browse Plans */}
  <Link href="/plans">
    <Button className="gradient-primary">
      <Package className="mr-2 h-4 w-4" />
      Browse Plans
    </Button>
  </Link>

  {/* Free Trial Chat */}
  <a
    href="https://members.iptvtop.live/chat"
    target="_blank"
    rel="noopener noreferrer"
  >
    <Button
      variant="outline"
      className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
    >
      <MessageCircle className="mr-2 h-4 w-4" />
      Request Free Trial 24H
    </Button>
  </a>

  {/* Tutorial */}
  <a
    href="https://revsfr.com/iptv-guide/"
    target="_blank"
    rel="noopener noreferrer"
  >
    <Button
      variant="outline"
      className="border-blue-500 text-blue-600 hover:bg-blue-50"
    >
      <BookOpen className="mr-2 h-4 w-4" />
      Tutorial
    </Button>
  </a>
</div>

        </div>
        
        {/* Dashboard Messages */}
        {messages && messages.length > 0 && (
          <div className="space-y-3">
            {messages.map((m) => {
              const styles: Record<string, string> = {
                info: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
                success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
                error: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
              };
              return (
                <div
                  key={m.id}
                  className={`relative rounded-lg border px-4 py-3 ${styles[m.style] || styles.info}`}
                >
                  {m.title && <div className="font-semibold mb-1">{m.title}</div>}
                  <div className="text-sm whitespace-pre-line pr-6">{m.body}</div>
                  {m.isDismissible && (
                    <button
                      onClick={() => dismissMessage.mutate({ messageId: m.id })}
                      className="absolute top-2 right-2 p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
                      aria-label="Dismiss"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Cards - Important Stats Only */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Activation Points
              </CardTitle>
              <Coins className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activationPoints}</div>
              <Link href="/apps">
                <span className="text-xs text-primary hover:underline cursor-pointer mt-1 inline-block">
                  Activate apps
                </span>
              </Link>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Credentials
              </CardTitle>
              <Key className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCredentials}</div>
              <p className="text-xs text-muted-foreground mt-1">
                connections active
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Orders
              </CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                awaiting verification
              </p>
            </CardContent>
          </Card>
          
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Verified Orders
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{verifiedOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                completed purchases
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Expired/Inactive
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expiredCredentials}</div>
              <p className="text-xs text-muted-foreground mt-1">
                credentials
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Credentials Section */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">My Credentials</h2>
              <p className="text-muted-foreground">Access your IPTV login information</p>
            </div>
            <Link href="/plans">
              <Button className="gradient-primary gap-2">
                <Key className="h-4 w-4" />
                Get More Connections
              </Button>
            </Link>
          </div>

          {/* Credentials Tabs */}
          {!credentials || credentials.length === 0 ? (
            <div className="space-y-6">
              <Card>
                <CardContent className="py-10 text-center">
                  <Key className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-semibold mb-2">No Active Subscription Yet</h3>
                  <p className="text-muted-foreground text-sm">
                    You don't have any IPTV credentials yet. Choose a plan below to get started.
                  </p>
                </CardContent>
              </Card>

              {/* Inline Plans */}
              {plans && plans.length > 0 && (
                <div>
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold">Choose a Plan</h3>
                    <p className="text-muted-foreground text-sm">
                      Pick a subscription to activate your IPTV access
                    </p>
                  </div>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan, index) => {
                      const pricing = plan.pricing
                        ?.slice()
                        .sort((a, b) => a.connections - b.connections);
                      const startingPrice = pricing?.[0]?.price ?? "0.00";
                      const startingConnections = pricing?.[0]?.connections ?? 1;
                      const isPopular = index === 1;

                      return (
                        <Card
                          key={plan.id}
                          className={`relative card-hover ${isPopular ? "border-primary shadow-lg shadow-primary/10" : ""}`}
                        >
                          {plan.promoText && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                              <Badge className="bg-red-500 hover:bg-red-600 text-white">
                                {plan.promoText}
                              </Badge>
                            </div>
                          )}
                          <CardHeader className="text-center pb-2">
                            <CardTitle className="text-xl">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="text-center">
                              <div className="flex items-baseline justify-center gap-1">
                                <span className="text-xs text-muted-foreground">from</span>
                                <span className="text-3xl font-bold">${startingPrice}</span>
                                <span className="text-muted-foreground">/{plan.durationDays} days</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              {((plan.features as string[]) || []).slice(0, 4).map((feature, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm">
                                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                                <span>Up to {plan.maxConnections} connections</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                                <span>{plan.durationDays} days validity</span>
                              </div>
                            </div>
                            <Link
                              href={`/checkout/${plan.id}?connections=${startingConnections}`}
                              className="block"
                            >
                              <Button
                                className={`w-full ${isPopular ? "gradient-primary" : ""}`}
                                variant={isPopular ? "default" : "outline"}
                              >
                                Select Plan
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  <div className="text-center mt-4">
                    <Link href="/plans">
                      <Button variant="ghost" className="gap-2">
                        View all plan details
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Tabs defaultValue="active" className="w-full">
              <TabsList>
                <TabsTrigger value="active">Active ({activeCredentials})</TabsTrigger>
                <TabsTrigger value="expired">Expired ({expiredCredentials})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="active" className="mt-4">
                {activeCredentials === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No active credentials
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {credentials.filter(c => c.isActive).map(cred => (
                      <CredentialCard key={cred.id} credential={cred} />
                    ))}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="expired" className="mt-4">
                {expiredCredentials === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      No expired credentials
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {credentials.filter(c => !c.isActive).map(cred => (
                      <CredentialCard key={cred.id} credential={cred} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          {/* Help Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How to Use Your Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div>
                <strong className="text-foreground">Xtream Codes:</strong> Enter the Server URL, Username, and Password in your IPTV app's Xtream Codes section.
              </div>
              <div>
                <strong className="text-foreground">M3U:</strong> Copy the M3U URL and paste it into your IPTV player. Add the EPG URL for program guide.
              </div>
              <div>
                <strong className="text-foreground">Portal:</strong> Enter the Portal URL and MAC Address in your STB Emulator or similar app.
              </div>
              <div className="pt-2">
                Need help? <a href="https://members.iptvtop.live/chat" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Contact our support team</a>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Quick Actions & Recent Orders */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Link href="/plans">
                <Button variant="outline" className="w-full justify-between h-auto py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Browse Plans</div>
                      <div className="text-xs text-muted-foreground">View available subscription plans</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              
              <Link href="/orders">
                <Button variant="outline" className="w-full justify-between h-auto py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <ShoppingCart className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Order History</div>
                      <div className="text-xs text-muted-foreground">Track your orders and payments</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              
              <a
                href="https://revsfr.com/iptv-guide/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full justify-between h-auto py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <BookOpen className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Setup Guide</div>
                      <div className="text-xs text-muted-foreground">Learn how to use your credentials</div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </a>
            </CardContent>
          </Card>
          
          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Your latest subscription orders</CardDescription>
              </div>
              <Link href="/orders">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="skeleton h-16 rounded-lg" />
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Tv className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                  <p className="text-muted-foreground">No orders yet</p>
                  <Link href="/plans">
                    <Button variant="link" className="mt-2">Browse plans to get started</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map(order => (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(order.status)}
                        <div>
                          <div className="font-medium">Order #{order.id}</div>
                          <div className="text-xs text-muted-foreground">
                            {order.connections} {order.connections === 1 ? "connection" : "connections"} • ${order.price}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={getStatusBadge(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <div className="text-xs text-muted-foreground mt-1">
                          {format(new Date(order.createdAt), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </UserLayout>
  );
}
