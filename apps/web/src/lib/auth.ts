import { cache } from "react";
import { createClient } from "./supabase/server";

// React.cache dedupes within a single server request: Header + the page's
// data layer often both want auth.uid(), and without this we'd round-trip to
// Supabase Auth twice per render. With it, the second call is a memoized
// pointer to the first.
//
// Always returns a verified user (i.e. JWT validated against Supabase Auth)
// so we don't fall into the getSession()-is-insecure trap.

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

export const getCurrentSession = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  // Pull session for places that need the JWT or expiry, without making them
  // round-trip again — getSession() reads cookies locally.
  const { data: { session } } = await supabase.auth.getSession();
  return session;
});
