import { getDevLandlordId } from "@/lib/supabase/landlord-data";
import { createClient } from "@/lib/supabase/server";

/**
 * Resolves the current landlord ID (same as auth.users.id).
 * When DEV_LANDLORD_ID is set, returns it immediately (no cookie/session read).
 */
export async function getLandlordId(): Promise<string> {
  const devLandlordId = getDevLandlordId();
  if (devLandlordId) {
    return devLandlordId;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.id) {
    const { data: landlord } = await supabase
      .from("landlords")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (landlord?.id) {
      return user.id;
    }
  }

  throw new Error(
    "Sign in required. Set DEV_LANDLORD_ID in .env.local for local development without auth."
  );
}
