-- Earlier we did `revoke all on api_keys from anon, authenticated` to belt-
-- and-suspender the auto-Data-API exposure. That stripped basic CRUD grants
-- so even signed-in users couldn't INSERT — the role failed permission checks
-- before RLS got a chance to evaluate.
--
-- RLS already restricts row access to (auth.uid() = owner_user_id) on every
-- operation, so we can grant normal CRUD to authenticated and rely on RLS for
-- the actual gating. anon stays without grants so unauthenticated PostgREST
-- clients can't touch the table at all (keeping key hashes out of any
-- enumeration).

grant select, insert, update, delete on table public.api_keys to authenticated;
