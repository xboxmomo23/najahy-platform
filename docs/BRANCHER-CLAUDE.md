# Brancher la vraie API Claude — guide 15 minutes

Ce document décrit **exactement** comment remplacer le mock du tuteur IA par l’API Anthropic.  
Le reste de l’app (UI, quotas, historique, sidebar) **ne change pas** : seul `src/lib/claude/tutor.ts` est modifié (+ variables d’environnement).

---

## Prérequis (5 min)

### 1. Crédit Anthropic

1. Va sur [console.anthropic.com](https://console.anthropic.com)
2. **Billing → Add credits** (5–10 € suffisent pour démarrer)
3. **API Keys → Create Key** → copie la clé `sk-ant-...`

### 2. Variables d’environnement

Dans `.env.local` :

```env
# Clé API (déjà présente en placeholder — remplace sk-ant-XXX)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxx

# Active la vraie API (sans cette ligne = mode mock)
AI_PROVIDER=claude

# Modèles (optionnel — valeurs par défaut ci-dessous)
ANTHROPIC_MODEL_SIMPLE=claude-3-5-haiku-20241022
ANTHROPIC_MODEL_COMPLEX=claude-sonnet-4-20250514
```

> **Sécurité** : `ANTHROPIC_API_KEY` ne doit **jamais** avoir le préfixe `NEXT_PUBLIC_`. Elle reste côté serveur uniquement.

### 3. Table cache Supabase

Si ce n’est pas déjà fait, exécute le SQL dans le SQL Editor Supabase :

```
docs/supabase/ai_response_cache.sql
```

### 4. Installer le SDK

```bash
npm install @anthropic-ai/sdk
```

Redémarre le serveur dev après modification de `.env.local` :

```bash
npm run dev
```

---

## Code à coller dans `src/lib/claude/tutor.ts`

### Étape 1 — Ajouter les imports en tête de fichier

```typescript
import Anthropic from "@anthropic-ai/sdk";

import {
  cacheTutorResponse,
  generateCacheKey,
  getCachedResponse,
  isGenericTutorQuestion,
} from "./cache";
```

### Étape 2 — Constantes et helpers (ajouter avant `getClaudeTutorResponse`)

```typescript
const DEFAULT_MODEL_SIMPLE =
  process.env.ANTHROPIC_MODEL_SIMPLE ?? "claude-3-5-haiku-20241022";
const DEFAULT_MODEL_COMPLEX =
  process.env.ANTHROPIC_MODEL_COMPLEX ?? "claude-sonnet-4-20250514";

const MAX_TOKENS_SIMPLE = 768;
const MAX_TOKENS_COMPLEX = 1536;

function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.startsWith("sk-ant-XXX")) {
    throw new Error(
      "ANTHROPIC_API_KEY manquante ou invalide dans .env.local",
    );
  }
  return new Anthropic({ apiKey });
}

/** Haiku = questions simples ; Sonnet = suivi, chapitre long, questions complexes. */
function pickModel(messages: TutorMessage[], context: TutorContext): {
  model: string;
  maxTokens: number;
} {
  const lastUser = getLastUserMessage(messages);
  const isFollowUp = messages.some((m) => m.role === "assistant");
  const hasLongChapter = (context.chapterContent?.length ?? 0) > 800;
  const isLongQuestion = lastUser.length > 350;
  const isComplexTopic =
    /d[ée]monstr|d[ée]veloppe|en d[ée]tail|bac blanc|exercice complet|corrig[ée]|d[ée]riv[ée]e partielle|int[ée]grale double/i.test(
      lastUser,
    );

  if (isFollowUp || hasLongChapter || isLongQuestion || isComplexTopic) {
    return { model: DEFAULT_MODEL_COMPLEX, maxTokens: MAX_TOKENS_COMPLEX };
  }

  return { model: DEFAULT_MODEL_SIMPLE, maxTokens: MAX_TOKENS_SIMPLE };
}

function toAnthropicMessages(
  messages: TutorMessage[],
): Anthropic.MessageParam[] {
  return messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
}
```

### Étape 3 — Remplacer `getClaudeTutorResponse` (copier-coller intégral)

Remplace **toute** la fonction actuelle (celle avec le `throw new Error("Claude not configured yet")`) par :

```typescript
async function getClaudeTutorResponse(
  messages: TutorMessage[],
  context: TutorContext,
): Promise<TutorResponse> {
  const lastQuestion = getLastUserMessage(messages);
  const systemPrompt = buildSystemPrompt(context);

  // ── 1. Cache (questions génériques uniquement) ──────────────────────────
  if (isGenericTutorQuestion(messages)) {
    const cacheKey = generateCacheKey(lastQuestion, context);
    const cached = await getCachedResponse(cacheKey);

    if (cached) {
      return {
        content: cached,
        tokensUsed: 0,
        isMock: false,
      };
    }
  }

  // ── 2. Appel API Anthropic (streaming → concaténation) ──────────────────
  const client = getAnthropicClient();
  const { model, maxTokens } = pickModel(messages, context);

  const stream = client.messages.stream({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: toAnthropicMessages(messages),
  });

  let content = "";

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      content += event.delta.text;
    }
  }

  const finalMessage = await stream.finalMessage();
  const tokensUsed =
    (finalMessage.usage?.input_tokens ?? 0) +
    (finalMessage.usage?.output_tokens ?? 0);

  if (!content.trim()) {
    throw new Error("Réponse vide de l'API Claude.");
  }

  // ── 3. Stocker en cache si question générique ───────────────────────────
  if (isGenericTutorQuestion(messages)) {
    try {
      await cacheTutorResponse(lastQuestion, context, content);
    } catch (err) {
      // Ne pas bloquer l'élève si le cache échoue
      console.error("[ai_response_cache] cacheTutorResponse:", err);
    }
  }

  return {
    content,
    tokensUsed,
    isMock: false,
  };
}
```

### Étape 4 — Vérifier `getTutorResponse` (déjà en place)

```typescript
export async function getTutorResponse(
  messages: TutorMessage[],
  context: TutorContext,
): Promise<TutorResponse> {
  if (process.env.AI_PROVIDER === "claude") {
    return getClaudeTutorResponse(messages, context);
  }
  return getMockTutorResponse(messages, context);
}
```

Aucun autre fichier n’est obligatoire pour un premier branchement.

---

## Comment fonctionne le cache

| Étape | Fichier | Action |
|-------|---------|--------|
| Avant l’API | `cache.ts` → `isGenericTutorQuestion()` | `true` seulement si **1 seule** question user, **aucune** réponse assistant, ≥ 12 caractères |
| Lookup | `getCachedResponse(cacheKey)` | Lit `ai_response_cache`, incrémente `hit_count` |
| Miss | `getClaudeTutorResponse()` | Appelle Claude |
| Après réponse | `cacheTutorResponse()` | Stocke via service role (ignore si clé déjà existante) |

**Clé de cache** = SHA-256 de `langue | chapitre normalisé | question normalisée`.

Les conversations de **suivi** (2e message, 3e message…) ne passent **pas** par le cache — le contexte historique compte.

---

## Optimisations de coût (déjà intégrées ou recommandées)

| Levier | Détail |
|--------|--------|
| **Haiku par défaut** | ~80 % des questions simples ; Sonnet seulement si suivi, chapitre long ou question complexe |
| **`max_tokens` limité** | 768 (simple) / 1536 (complexe) — le system prompt demande déjà 2–4 paragraphes |
| **Cache agressif** | Toute question générique identique = 0 appel API |
| **Quota free** | 3 questions/jour (`src/lib/claude/quota.ts`) — limite naturelle des coûts en plan gratuit |
| **System prompt concis** | `buildSystemPrompt()` tronque le chapitre à 12 000 caractères max |

### Ajustements optionnels (après mise en prod)

- Baisser `MAX_TOKENS_SIMPLE` à `512` si les réponses sont trop longues.
- Ajouter des mots-clés dans `pickModel()` pour forcer Haiku sur les questions courtes (« c’est quoi », « définition de »).
- Monitorer `ai_response_cache.hit_count` dans Supabase pour mesurer l’économie réelle.

---

## Estimatif de coût

Tarifs indicatifs **Claude 3.5 Haiku** (vérifier sur [anthropic.com/pricing](https://www.anthropic.com/pricing)) :

| | Input | Output |
|---|-------|--------|
| Haiku | ~0,25 $ / M tokens | ~1,25 $ / M tokens |
| Sonnet | ~3 $ / M tokens | ~15 $ / M tokens |

**Question moyenne (Haiku)** :
- ~800 tokens input (system prompt + question)
- ~400 tokens output (réponse 2–4 paragraphes)
- Coût ≈ **0,001–0,003 $** par question (~0,001–0,003 €)

| Budget | Questions estimées (Haiku) |
|--------|----------------------------|
| 5 € | ~2 000 – 5 000 questions |
| 10 € | ~4 000 – 10 000 questions |

Avec cache + quota free (3/jour/élève), le coût réel en phase beta reste très bas.

---

## Checklist de validation (15 min)

```bash
# 1. SDK installé
npm ls @anthropic-ai/sdk

# 2. Variables chargées (redémarrer le dev server avant)
grep AI_PROVIDER .env.local
grep ANTHROPIC_API_KEY .env.local

# 3. Test manuel
# → /app/tuteur-ia
# → Nouvelle conversation
# → Poser : "Explique-moi les fonctions exponentielles"
# → Vérifier : réponse réaliste (pas le mock), isMock=false en logs si ajoutés
# → Re-poser la même question (autre élève ou après cache) : réponse instantanée, 0 token API

# 4. Vérifier quota free
# → 4e question du jour sur plan free → encadré limite affiché
```

### Erreurs fréquentes

| Symptôme | Cause | Fix |
|----------|-------|-----|
| `Claude not configured yet` | `AI_PROVIDER` absent | Ajouter `AI_PROVIDER=claude` |
| `401 authentication_error` | Clé invalide / pas de crédit | Vérifier console.anthropic.com |
| `Impossible d'enregistrer la réponse en cache` | Table SQL non créée | Exécuter `docs/supabase/ai_response_cache.sql` |
| Réponses mock | `AI_PROVIDER` non lu (cache Next) | Redémarrer `npm run dev` |

---

## Phase 2 (optionnelle) — streaming temps réel dans l’UI

Aujourd’hui, le streaming API est consommé **côté serveur** (chunks concaténés), puis l’UI simule l’affichage mot par mot.  
Pour un vrai streaming SSE vers le navigateur :

1. Créer une Route Handler `src/app/api/tuteur/stream/route.ts`
2. Propager les chunks Anthropic au client
3. Adapter `TutorChat.tsx` pour lire le flux

Ce n’est **pas nécessaire** pour activer Claude — c’est un confort UX ultérieur.

---

## Architecture rappel

```
TutorChat.tsx
    └── sendMessage()          [actions.ts — inchangé]
            └── getTutorResponse()   [tutor.ts — SEUL fichier modifié]
                    ├── cache hit?  → réponse immédiate
                    └── cache miss? → Anthropic API → cache store
            └── incrementUsage()     [quota.ts — inchangé]
```

**Principe adapter** : demain, changer de fournisseur = remplacer `getClaudeTutorResponse` uniquement.
