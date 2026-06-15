import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yfbxilydskczrycrigkb.supabase.co";
const supabaseAnonKey = "sb_publishable_XcPzmENi0-Y1nOtJV7yErQ_at4peUqn";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
