-- Table de cache des réponses tuteur IA (à exécuter dans le SQL Editor Supabase)
-- Réutilise les réponses pour des questions similaires et évite des appels API redondants.

CREATE TABLE IF NOT EXISTS public.ai_response_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL UNIQUE,
  question_normalized text NOT NULL,
  response text NOT NULL,
  language public.language_pref NOT NULL,
  hit_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_response_cache_cache_key
  ON public.ai_response_cache (cache_key);

COMMENT ON TABLE public.ai_response_cache IS
  'Cache partagé des réponses tuteur IA (questions génériques). Écriture via service role uniquement.';

ALTER TABLE public.ai_response_cache ENABLE ROW LEVEL SECURITY;

-- Lecture : tout utilisateur authentifié
CREATE POLICY "ai_response_cache_select_authenticated"
  ON public.ai_response_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- Pas de policy INSERT / UPDATE / DELETE pour authenticated :
-- seul le service role (createAdminClient) peut écrire (contourne le RLS).
