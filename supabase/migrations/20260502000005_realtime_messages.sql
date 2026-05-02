-- Add messages table to the realtime publication so the thread UI can
-- subscribe to INSERTs over WebSocket. RLS still gates which rows each
-- client receives.
alter publication supabase_realtime add table public.messages;
