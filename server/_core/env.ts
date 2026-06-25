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
  // NowPayments crypto payment configuration
  nowpaymentsApiKey: process.env.NOWPAYMENTS_API_KEY ?? "",
  nowpaymentsIpnSecret: process.env.NOWPAYMENTS_IPN_SECRET ?? "",
  // Public base URL of the app (used for payment callback/return URLs)
  appUrl: process.env.VITE_APP_URL ?? process.env.APP_URL ?? "",
  // AI / LLM configuration (OpenAI-compatible)
  forgeApiKey: process.env.OPENAI_API_KEY ?? "",
  forgeApiUrl: process.env.OPENAI_API_URL ?? "",
  aiModel: process.env.AI_MODEL ?? "gpt-4o-mini",
  // Support chat AI auto-reply
  aiSupportEnabled: (process.env.AI_SUPPORT_ENABLED ?? "").toLowerCase() === "true",
  aiSupportPrompt: process.env.AI_SUPPORT_PROMPT ?? "",
};
