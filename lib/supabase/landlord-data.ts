import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export function getDevLandlordId(): string | null {
  const id = process.env.DEV_LANDLORD_ID?.trim();
  return id || null;
}

export function isDevLandlordMode(): boolean {
  return getDevLandlordId() !== null;
}

/**
 * Anon Supabase client with no Next.js cookies and no persisted auth.
 * Postgres sees auth.uid() as null so TEMP _dev_landlord_access RLS applies.
 */
export function createCookielessClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {},
      },
    }
  );
}

async function logCookielessAuthContext(label: string) {
  const client = createCookielessClient();
  const { data: userData, error: userError } = await client.auth.getUser();
  const { data: sessionData, error: sessionError } =
    await client.auth.getSession();

  console.log(`createLandlordDataClient [${label}] auth.getUser()`, {
    user: userData.user,
    error: userError?.message ?? null,
  });
  console.log(`createLandlordDataClient [${label}] auth.getSession()`, {
    session: sessionData.session,
    error: sessionError?.message ?? null,
  });
}

/**
 * Mutations for the dev allowlist landlord always use a cookieless anon client.
 * Never attaches request cookies or Authorization headers from a stale session.
 */
export async function createLandlordDataClient(landlordId: string) {
  const devLandlordId = getDevLandlordId();

  if (devLandlordId && landlordId === devLandlordId) {
    await logCookielessAuthContext("cookieless-dev");
    return createCookielessClient();
  }

  return createClient();
}
