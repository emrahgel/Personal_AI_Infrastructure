import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";
const isServer = typeof window === "undefined";

const requiredInProd = (name: string) =>
  z
    .string()
    .optional()
    .refine((value) => !isProd || Boolean(value?.trim()), {
      message: `[env] ${name} is required in production`,
    });

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: requiredInProd("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requiredInProd("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: requiredInProd(
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  ),
});

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: requiredInProd("SUPABASE_SERVICE_ROLE_KEY"),
  DATABASE_URL: requiredInProd("DATABASE_URL"),
  STRIPE_SECRET_KEY: requiredInProd("STRIPE_SECRET_KEY"),
  STRIPE_WEBHOOK_SECRET: requiredInProd("STRIPE_WEBHOOK_SECRET"),
  RESEND_API_KEY: requiredInProd("RESEND_API_KEY"),
  APP_URL: requiredInProd("APP_URL"),
  AI_PROVIDER: z.enum(["openai", "anthropic"]).optional(),
  OPENAI_API_KEY: requiredInProd("OPENAI_API_KEY"),
  ANTHROPIC_API_KEY: requiredInProd("ANTHROPIC_API_KEY"),
  SENTRY_DSN: requiredInProd("SENTRY_DSN"),
});

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
});

let cachedServerEnv: z.infer<typeof serverEnvSchema> | null = null;

export const getServerEnv = () => {
  if (!isServer) {
    throw new Error(
      "[env] getServerEnv() can only be called on the server. Do not import server secrets in client bundles.",
    );
  }

  if (!cachedServerEnv) {
    cachedServerEnv = serverEnvSchema.parse({
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      DATABASE_URL: process.env.DATABASE_URL,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
      RESEND_API_KEY: process.env.RESEND_API_KEY,
      APP_URL: process.env.APP_URL,
      AI_PROVIDER: process.env.AI_PROVIDER,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
      SENTRY_DSN: process.env.SENTRY_DSN,
    });
  }

  return cachedServerEnv;
};
