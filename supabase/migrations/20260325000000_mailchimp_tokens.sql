CREATE TABLE IF NOT EXISTS public.mailchimp_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_token text NOT NULL,
  server_prefix text NOT NULL,
  connected_at timestamptz DEFAULT now(),
  connected_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.mailchimp_tokens ENABLE ROW LEVEL SECURITY;

-- Block all direct access; only service role (edge functions) can read/write
CREATE POLICY "No direct access" ON public.mailchimp_tokens
  USING (false);
