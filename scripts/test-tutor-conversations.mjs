/**
 * Test d'intégration : conversations tuteur IA (sidebar, navigation, suppression, titre auto).
 * Usage : node scripts/test-tutor-conversations.mjs
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const raw = readFileSync(".env.local", "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx);
    const value = trimmed.slice(idx + 1);
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const userClient = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const QUESTIONS = [
  "Explique-moi les fonctions exponentielles",
  "Comment réviser efficacement pour le BAC ?",
  "Aide-moi sur la mécanique du point",
];

function buildTitle(firstMessage) {
  const cleaned = firstMessage.replace(/\s+/g, " ").trim();
  if (cleaned.length <= 60) return cleaned;
  return `${cleaned.slice(0, 59)}…`;
}

async function getStudentUser() {
  const { data, error } = await admin
    .from("users")
    .select("id, email, first_name, language_preference")
    .eq("role", "student")
    .limit(1)
    .single();

  if (error || !data) throw new Error("Aucun élève trouvé en base.");
  return data;
}

async function signInAsStudent(email) {
  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

  if (linkError) throw linkError;

  const tokenHash = linkData.properties.hashed_token;
  const { data: sessionData, error: verifyError } =
    await userClient.auth.verifyOtp({
      token_hash: tokenHash,
      type: "magiclink",
    });

  if (verifyError) throw verifyError;
  return sessionData.user.id;
}

async function createConversation(userId, language) {
  const { data, error } = await userClient
    .from("ai_conversations")
    .insert({
      user_id: userId,
      title: null,
      language,
      message_count: 0,
      total_tokens_used: 0,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

async function sendFirstMessage(conversationId, text) {
  const title = buildTitle(text);

  const { error: userMsgError } = await userClient.from("ai_messages").insert({
    conversation_id: conversationId,
    role: "user",
    content: text,
    tokens_used: 0,
  });
  if (userMsgError) throw userMsgError;

  const { error: assistantMsgError } = await userClient
    .from("ai_messages")
    .insert({
      conversation_id: conversationId,
      role: "assistant",
      content: "Réponse mock de test.",
      tokens_used: 42,
    });
  if (assistantMsgError) throw assistantMsgError;

  const { error: updateError } = await userClient
    .from("ai_conversations")
    .update({
      title,
      message_count: 2,
      updated_at: new Date().toISOString(),
      total_tokens_used: 42,
    })
    .eq("id", conversationId);

  if (updateError) throw updateError;
  return title;
}

async function getConversations(userId) {
  const { data, error } = await userClient
    .from("ai_conversations")
    .select("id, title, updated_at, message_count")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

async function getMessages(conversationId) {
  const { data, error } = await userClient
    .from("ai_messages")
    .select("id, role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

async function deleteConversation(conversationId) {
  const { error } = await userClient
    .from("ai_conversations")
    .delete()
    .eq("id", conversationId);
  if (error) throw error;
}

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

async function cleanupConversationIds(ids) {
  for (const id of ids) {
    await admin.from("ai_conversations").delete().eq("id", id);
  }
}

async function main() {
  console.log("🧪 Test conversations tuteur IA\n");

  const student = await getStudentUser();
  console.log(`Élève : ${student.first_name} (${student.email})`);

  await signInAsStudent(student.email);
  console.log("✓ Session authentifiée\n");

  const createdIds = [];

  try {
    for (const question of QUESTIONS) {
      const id = await createConversation(
        student.id,
        student.language_preference ?? "fr",
      );
      createdIds.push(id);
      const title = await sendFirstMessage(id, question);
      console.log(`✓ Conversation créée — titre : "${title}"`);
    }

    const list = await getConversations(student.id);
    assert(list.length >= 3, `Sidebar : attendu ≥3 conversations, reçu ${list.length}`);
    console.log(`\n✓ Sidebar : ${list.length} conversation(s) listée(s)`);
    for (const conv of list.slice(0, 3)) {
      console.log(`  · ${conv.title ?? "(sans titre)"} — ${conv.message_count} msgs`);
    }

    const convA = list[0];
    const convB = list[1];

    const msgsA = await getMessages(convA.id);
    const msgsB = await getMessages(convB.id);
    assert(msgsA.length === 2, "Navigation conv A : 2 messages attendus");
    assert(msgsB.length === 2, "Navigation conv B : 2 messages attendus");
    assert(
      msgsA[0].content !== msgsB[0].content,
      "Les conversations doivent avoir des contenus distincts",
    );
    console.log("\n✓ Navigation : contenus distincts chargés entre conversations");

    const toDelete = convB.id;
    await deleteConversation(toDelete);
    createdIds.splice(createdIds.indexOf(toDelete), 1);

    const afterDelete = await getConversations(student.id);
    assert(
      !afterDelete.some((c) => c.id === toDelete),
      "La conversation supprimée ne doit plus apparaître",
    );
    console.log(`\n✓ Suppression : conversation retirée (${afterDelete.length} restantes)`);

    const titled = list.find((c) => c.title === buildTitle(QUESTIONS[0]));
    assert(titled, "Titre auto manquant pour la première question");
    assert(
      titled.title === QUESTIONS[0],
      `Titre attendu "${QUESTIONS[0]}", reçu "${titled.title}"`,
    );
    console.log(`\n✓ Titre auto : "${titled.title}"`);

    console.log("\n✅ Tous les tests passent.");
  } finally {
    if (createdIds.length > 0) {
      await cleanupConversationIds(createdIds);
      console.log("\n🧹 Conversations de test nettoyées.");
    }
  }
}

main().catch((err) => {
  console.error("\n❌", err.message);
  process.exit(1);
});
