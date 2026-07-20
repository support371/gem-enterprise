revoke all on function public.gem_operator_invitation_status(text) from public, anon, authenticated;
revoke all on function public.gem_consume_operator_invitation(text, text, text, text) from public, anon, authenticated;
grant execute on function public.gem_operator_invitation_status(text) to service_role;
grant execute on function public.gem_consume_operator_invitation(text, text, text, text) to service_role;

comment on function public.gem_operator_invitation_status(text) is
'Private service-role function used only by the GEM operator invitation Edge Function.';
comment on function public.gem_consume_operator_invitation(text, text, text, text) is
'Private service-role function atomically consuming a one-time operator invitation through the GEM Edge Function.';
