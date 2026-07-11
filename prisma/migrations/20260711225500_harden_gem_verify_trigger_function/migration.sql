-- The append-only trigger function must not be callable through PostgREST RPC.
ALTER FUNCTION public.gem_verify_block_access_event_mutation() SECURITY INVOKER;
REVOKE ALL ON FUNCTION public.gem_verify_block_access_event_mutation() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.gem_verify_block_access_event_mutation() FROM anon;
REVOKE ALL ON FUNCTION public.gem_verify_block_access_event_mutation() FROM authenticated;
