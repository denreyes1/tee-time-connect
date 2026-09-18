CREATE TABLE public.registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  participants INTEGER NOT NULL DEFAULT 1,
  player_names TEXT,
  comments TEXT,
  attend BOOLEAN NOT NULL DEFAULT false,
  donate_prizes BOOLEAN NOT NULL DEFAULT false,
  sponsor_hole BOOLEAN NOT NULL DEFAULT false,
  prize_description TEXT,
  sponsorship_notes TEXT,
  organizer_email_status TEXT NOT NULL DEFAULT 'pending',
  registrant_email_status TEXT NOT NULL DEFAULT 'pending',
  calendar_invite_status TEXT NOT NULL DEFAULT 'pending',
  delivery_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX registrations_email_unique ON public.registrations (lower(email));

GRANT ALL ON public.registrations TO service_role;

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER registrations_set_updated_at BEFORE UPDATE ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();