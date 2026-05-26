import { buildSystemPrompt } from "./system-prompt";
import type { TutorContext, TutorMessage, TutorResponse } from "./types";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randomDelayMs(): number {
  return 1000 + Math.floor(Math.random() * 1000);
}

function getLastUserMessage(messages: TutorMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "user") {
      return messages[i].content.trim();
    }
  }
  return "";
}

function estimateTokens(text: string): number {
  return Math.max(1, Math.ceil(text.length / 4));
}

type MockReply = { content: string };

function mockExponentielles(ctx: TutorContext): MockReply {
  const name = ctx.studentFirstName ?? "toi";
  if (ctx.language === "ar") {
    return {
      content: `مرحباً ${name}، دعنا نفهم الدالة الأسية خطوة بخطوة.

لو كانت $f(x) = a^x$ مع $a > 0$ و $a \\neq 1$، ماذا يعني أن $f(0) = 1$؟ جرّب مثالاً من حياتك اليومية: نمو عدد سكان مدينة مثل وهران بنسبة ثابتة كل سنة.

قبل أن أعطيك قاعدة المشتقة $ (a^x)' = a^x \\ln(a) $، ما العلاقة بين النمو «النسبي» و«المطلق»؟ أجب بجملتين فقط.`,
    };
  }
  if (ctx.language === "darija") {
    return {
      content: `Salam ${name}, khallina n'hallou l-exponentielle étape par étape.

Imagine une balance felfel f Blida: kol 3am tzid proportion fixe. Ila $f(x)=a^x$, ach mena $f(0)=1$? Chhal farq bin n-nmo proportionnel w l-moqaran?

Ma n3tikch $(a^x)' = a^x \\ln(a)$ direct — 9bel, chnou l'effet de $\\ln(a)$ ila $a>1$ wla $0<a<1$? Jib exemple men la vie.`,
    };
  }
  return {
    content: `Bonjour ${name}, on va décomposer les exponentielles ensemble.

Imagine la croissance d'une population de dattes exportées depuis Biskra : chaque année, le stock est multiplié par un même facteur. Si $f(x)=a^x$, que peut-on dire de $f(0)$ ? Pourquoi ce point est-il une « ancre » sur le graphique ?

Je ne te donne pas encore $(a^x)' = a^x \\ln(a)$. D'abord, dis-moi : quand $a>1$, la courbe monte — que se passe-t-il si $0<a<1$ ? Donne un exemple concret avant qu'on dérive.`,
  };
}

function mockMecanique(ctx: TutorContext): MockReply {
  const chapter = ctx.chapterTitle ? ` (lié à « ${ctx.chapterTitle} »)` : "";
  if (ctx.language === "ar") {
    return {
      content: `لنطبّق قانون نيوتن الثاني بشكل هادئ${chapter}.

عربة كريم في الجزائر العاصمة: القوة المحصورة $F$، الكتلة $m$، التسارع $a$. اكتب $\\vec{F} = m\\vec{a}$ ثم حدّد جميع القوى على جسم حر.

قبل الحساب: لماذا نختار محوراً واحداً؟ ما الفرق بين وزن الجسم ورد فعل الأرض؟ جاوب بسؤال واحد تطرحه أنت على نفسك.`,
    };
  }
  if (ctx.language === "darija") {
    return {
      content: `Nkemmlou mécanique m3a Newton, step by step${chapter}.

Taxi f Alger: force $\\vec{F}$, masse $m$, accélération $\\vec{a}$. Kteb $\\vec{F}=m\\vec{a}$ — walakin 9bel, 9leb wach kol force li dert diagramme dyalha.

Ma t7sebch direct — chhal farq bin poids w réaction du sol? Chnou force li ma dirhach travail? Jib wa7ed exemple men transport.`,
    };
  }
  return {
    content: `On va appliquer Newton pas à pas${chapter}.

Un tramway à Alger : masse $m$, force résultante $\\vec{F}$, accélération $\\vec{a}$. Commence par écrire $\\vec{F} = m\\vec{a}$, puis liste les forces (poids, réaction, éventuellement frottement).

Avant de calculer : pourquoi un diagramme des forces aide-t-on ? Quelle est la différence entre le poids et la réaction du sol ? Pose-toi une question, puis réponds-y en deux phrases.`,
  };
}

function mockSvt(ctx: TutorContext): MockReply {
  if (ctx.language === "ar") {
    return {
      content: `لنفهم التوازن الهرموني عبر مثال الإنسولين.

بعد وجبة كسكس في رمضان، يرتفع سكر الدم. ما الدور الأول للبنكرياس؟ لا تعطِ التعريف كاملاً — صف آلية بسيطة: مستقبل → إشارة → استجابة.

لماذا يهم أن نميّز بين السكريات البسيطة والمعقدة؟ اطرح سؤالاً واحداً تريد أن تجيب عنه بعد التلميح التالي.`,
    };
  }
  if (ctx.language === "darija") {
    return {
      content: `Nfhemu hormones b exemple concret.

Mba3d ftour f Ramadan, sucre f dem ytra7. Chnou rôle l-bancréas 9bel ma t9oul « insuline »? Décris signal → réponse, bla définition complète.

Chhal farq bin sucre simple w complexe? 3tini question wa7da li bghiti tjawebha mba3d hint.`,
    };
  }
  return {
    content: `Prenons les hormones avec un exemple du quotidien.

Après un repas traditionnel, le taux de glucose augmente. Quel est le rôle du pancréas *avant* que tu cites « insuline » ? Décris une chaîne simple : récepteur → signal → réponse.

Quelle différence entre glucides simples et complexes ici ? Formule une question que tu te poseras toi-même pour avancer.`,
  };
}

function mockGeneric(ctx: TutorContext): MockReply {
  const chapter = ctx.chapterTitle
    ? ` On travaille sur « ${ctx.chapterTitle} ».`
    : "";

  if (ctx.language === "ar") {
    return {
      content: `سؤال مهم قبل أن نمضي قدماً.${chapter}

ما الذي تفهمه بالفعل في مسألتك، وما الجزء الذي يوقفك؟ اكتب خطوة واحدة جربتها (حتى لو كانت خاطئة).

لنبدأ بسؤال بسيط: إذا شرحت المفهوم لصديق في السوق، كيف ستقوله بكلماتك؟ بعد جوابك، سأعطيك تلميحاً واحداً فقط — بدون الحل الكامل.`,
    };
  }

  if (ctx.language === "darija") {
    return {
      content: `Mzyan, nbdaw b tariqa s7i7a.${chapter}

Chnou fhemti deja w fin raki/w raki bloqué? Kteb étape wa7da jrabtiha.

Ila tشرح l'idée l'صاحبك f souk, chnou ghadi tgoul? Men ba3d njik hint wa7ed — bla solution kamla.`,
    };
  }

  return {
    content: `Bonne question — on va avancer ensemble.${chapter}

Qu'est-ce que tu comprends déjà, et où est-ce que tu bloques exactement ? Note une étape que tu as déjà essayée, même si elle est fausse.

Imagine que tu expliques l'idée à un ami au marché : comment la formulerais-tu avec tes mots ? Ensuite je te donnerai un seul indice, pas la solution complète.`,
  };
}

function pickMockReply(ctx: TutorContext, messages: TutorMessage[]): MockReply {
  const last = getLastUserMessage(messages).toLowerCase();
  const normalized = last.normalize("NFD").replace(/\p{M}/gu, "");

  if (
    /exponentielle|exponentiel|derivee|derivée|dérivée|derivation|dérivation|ln\(|exp\(/.test(
      normalized,
    )
  ) {
    return mockExponentielles(ctx);
  }

  if (/newton|force|mecanique|mécanique|poids|frottement|vecteur/.test(normalized)) {
    return mockMecanique(ctx);
  }

  if (/hormone|insuline|glucose|pancreas|pancréas|svt|cellule/.test(normalized)) {
    return mockSvt(ctx);
  }

  return mockGeneric(ctx);
}

async function getMockTutorResponse(
  messages: TutorMessage[],
  context: TutorContext,
): Promise<TutorResponse> {
  await sleep(randomDelayMs());

  const reply = pickMockReply(context, messages);

  return {
    content: reply.content,
    tokensUsed: estimateTokens(reply.content),
    isMock: true,
  };
}

async function getClaudeTutorResponse(
  _messages: TutorMessage[],
  context: TutorContext,
): Promise<TutorResponse> {
  const systemPrompt = buildSystemPrompt(context);
  // TODO: appel Anthropic Messages API (system: systemPrompt, messages)
  void systemPrompt;
  throw new Error("Claude not configured yet");
}

/**
 * Point d'entrée unique du tuteur IA (pattern adapter).
 * `AI_PROVIDER=claude` → API réelle ; sinon mock configurable.
 */
export async function getTutorResponse(
  messages: TutorMessage[],
  context: TutorContext,
): Promise<TutorResponse> {
  if (process.env.AI_PROVIDER === "claude") {
    return getClaudeTutorResponse(messages, context);
  }

  return getMockTutorResponse(messages, context);
}
