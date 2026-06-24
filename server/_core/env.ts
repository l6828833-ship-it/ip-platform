export const ENV = {
  appId: process.env.VITE_APP_ID ?? "iptv-saas",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // Supabase configuration
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY ?? "",
  // Brevo email configuration
  brevoApiKey: process.env.BREVO_API_KEY ?? "",
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL ?? "",
  brevoSenderName: process.env.BREVO_SENDER_NAME ?? "IPTV Premium",
  // Cryptomus crypto payment configuration
  cryptomusMerchantId: process.env.CRYPTOMUS_MERCHANT_ID ?? "",
  cryptomusApiKey: process.env.CRYPTOMUS_API_KEY ?? "",
  // Public base URL of the app (used for payment callback/return URLs)
  appUrl: process.env.VITE_APP_URL ?? process.env.APP_URL ?? "",
};
