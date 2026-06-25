import { supabaseAuthProvider } from "ra-supabase-core";
import { supabase } from "@/supabase/client";

export const authProvider = supabaseAuthProvider(supabase, {
  getIdentity: async (user) => {
    // Check if user has admin role in app_metadata
    const isAdmin = user.app_metadata?.role === "admin";
    if (!isAdmin) {
      throw new Error("Unauthorized: admin role required");
    }
    return {
      id: user.id,
      fullName: user.email || user.id,
      avatar: user.user_metadata?.avatar_url,
    };
  },
});
