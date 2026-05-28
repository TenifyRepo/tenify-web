import { createClient } from "@/lib/supabase/server";

/**
 * Resolves the current landlord ID (same as auth.users.id).
 * Uses Supabase session when available; falls back to DEV_LANDLORD_ID in development.
 */
export async function getLandlordId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id) {
    return user.id;
  }

  const devLandlordId = process.env.DEV_LANDLORD_ID;
  if (process.env.NODE_ENV === "development" && devLandlordId) {
    return devLandlordId;
  }

  throw new Error(
    "Sign in required. Set DEV_LANDLORD_ID in .env.local for local development without auth."
  );
}
