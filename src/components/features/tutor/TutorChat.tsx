"use client";

import {
  BookOpen,
  Menu,
  MessageSquarePlus,
  MoreVertical,
  SendHorizontal,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
} from "react";
import { toast } from "sonner";

import {
  createConversation,
  deleteConversation,
  getConversationDetail,
  getConversationMessages,
  getConversations,
  sendMessage,
  updateConversationLanguage,
  type SendMessageResult,
  type TutorConversationSummary,
} from "@/app/(app)/tuteur-ia/actions";
import { ChapterMarkdown } from "@/components/features/chapter/ChapterMarkdown";
import { QuotaBadge } from "@/components/features/tutor/QuotaBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import type { QuotaCheckResult } from "@/lib/claude/quota";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database.types";

type LanguagePref = Database["public"]["Enums"]["language_pref"];

type DisplayMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
};

const LANGUAGE_OPTIONS: { value: LanguagePref; label: string }[] = [
  { value: "fr", label: "FR" },
  { value: "ar", label: "AR" },
  { value: "darija", label: "Darija" },
];

const SUGGESTED_QUESTIONS = [
  "Explique-moi les fonctions exponentielles",
  "Comment réviser efficacement ?",
  "Aide-moi sur la mécanique",
  "Qu'est-ce qu'une dérivée ?",
];

function formatConversationDate(iso: string | null): string {
  if (!iso) return "Récent";
  const date = new Date(iso);
  const now = new Date();
  const sameDay =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (sameDay) {
    return date.toLocaleTimeString("fr-DZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return date.toLocaleDateString("fr-DZ", {
    day: "numeric",
    month: "short",
  });
}

function revealTextGradually(
  fullText: string,
  onUpdate: (text: string) => void,
  onComplete: () => void,
): () => void {
  const tokens = fullText.match(/\S+\s*|\s+/g) ?? [fullText];
  let index = 0;
  let accumulated = "";

  const timer = window.setInterval(() => {
    if (index >= tokens.length) {
      window.clearInterval(timer);
      onUpdate(fullText);
      onComplete();
      return;
    }
    accumulated += tokens[index];
    index += 1;
    onUpdate(accumulated);
  }, 32);

  return () => window.clearInterval(timer);
}

function TutorAvatar({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-gold-400 shadow-sm",
        className,
      )}
      aria-hidden
    >
      <Sparkles className="size-4" />
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <TutorAvatar />
      <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-sand bg-cream px-4 py-3 shadow-sm">
        <p className="mb-2 text-sm text-muted">Le tuteur réfléchit...</p>
        <div className="flex items-center gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-2 animate-pulse rounded-full bg-emerald-600"
              style={{ animationDelay: `${i * 180}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-gold-100 px-4 py-3 text-sm leading-relaxed text-emerald-900 shadow-sm">
        {content}
      </div>
    </div>
  );
}

function AssistantBubble({
  content,
  streaming,
}: {
  content: string;
  streaming?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <TutorAvatar />
      <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-sand bg-cream px-4 py-3 shadow-sm">
        <div className="text-sm leading-relaxed text-ink/90">
          <ChapterMarkdown content={content || "…"} className="text-sm" />
        </div>
        {streaming ? (
          <span className="mt-1 inline-block h-4 w-0.5 animate-pulse bg-emerald-700" />
        ) : null}
      </div>
    </div>
  );
}

function ConversationListItem({
  conversation,
  isActive,
  disabled,
  onSelect,
  onRequestDelete,
}: {
  conversation: TutorConversationSummary;
  isActive: boolean;
  disabled?: boolean;
  onSelect: (id: string) => void;
  onRequestDelete: (id: string) => void;
}) {
  const label = conversation.title?.trim() || "Nouvelle conversation";

  return (
    <li>
      <div
        className={cn(
          "group flex items-stretch gap-0.5 rounded-xl transition-colors",
          isActive
            ? "bg-emerald-100 ring-1 ring-inset ring-emerald-600/20"
            : "hover:bg-paper",
        )}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelect(conversation.id)}
          className={cn(
            "min-w-0 flex-1 px-3 py-2.5 text-left disabled:opacity-60",
            isActive && "border-l-2 border-emerald-700 pl-[calc(0.75rem-2px)]",
          )}
        >
          <p
            className={cn(
              "truncate text-sm font-medium",
              isActive ? "text-emerald-900" : "text-emerald-800",
            )}
          >
            {label}
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {formatConversationDate(conversation.updated_at)}
          </p>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={disabled}
            className={cn(
              "mr-1 self-center rounded-lg p-2 text-muted transition-opacity",
              "opacity-0 group-hover:opacity-100 data-popup-open:opacity-100",
              "hover:bg-sand/80 hover:text-emerald-900 disabled:opacity-0",
            )}
            aria-label={`Options pour ${label}`}
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-40">
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onRequestDelete(conversation.id)}
            >
              <Trash2 />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}

function ConversationList({
  conversations,
  activeId,
  onSelect,
  onRequestDelete,
  disabled,
}: {
  conversations: TutorConversationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onRequestDelete: (id: string) => void;
  disabled?: boolean;
}) {
  if (conversations.length === 0) {
    return (
      <p className="px-3 py-6 text-center text-sm text-muted">
        Aucune conversation pour l&apos;instant.
      </p>
    );
  }

  return (
    <ul className="space-y-1 p-2">
      {conversations.map((conversation) => (
        <ConversationListItem
          key={conversation.id}
          conversation={conversation}
          isActive={conversation.id === activeId}
          disabled={disabled}
          onSelect={onSelect}
          onRequestDelete={onRequestDelete}
        />
      ))}
    </ul>
  );
}

function ConversationSidebar({
  conversations,
  activeId,
  onNewConversation,
  onSelect,
  onRequestDelete,
  pending,
  className,
}: {
  conversations: TutorConversationSummary[];
  activeId: string | null;
  onNewConversation: () => void;
  onSelect: (id: string) => void;
  onRequestDelete: (id: string) => void;
  pending: boolean;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "flex h-full w-72 shrink-0 flex-col border-r border-sand bg-paper/40",
        className,
      )}
    >
      <div className="border-b border-sand p-4">
        <h2 className="font-display text-lg font-semibold text-emerald-900">
          Tuteur IA
        </h2>
        <p className="mt-1 text-xs text-muted">
          Ton assistant pédagogique 24h/24
        </p>
        <Button
          type="button"
          className="mt-4 w-full bg-emerald-800 text-cream hover:bg-emerald-700"
          onClick={onNewConversation}
          disabled={pending}
        >
          <MessageSquarePlus data-icon="inline-start" />
          Nouvelle conversation
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={onSelect}
          onRequestDelete={onRequestDelete}
          disabled={pending}
        />
      </div>
    </aside>
  );
}

export interface TutorChatProps {
  firstName: string;
  initialQuota: QuotaCheckResult;
  initialConversations: TutorConversationSummary[];
  defaultLanguage: LanguagePref;
  initialChapterSlug?: string;
}

export function TutorChat({
  firstName,
  initialQuota,
  initialConversations,
  defaultLanguage,
  initialChapterSlug,
}: TutorChatProps) {
  const [conversations, setConversations] =
    useState(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [conversationTitle, setConversationTitle] = useState<string | null>(
    null,
  );
  const [chapterTitle, setChapterTitle] = useState<string | null>(null);
  const [language, setLanguage] = useState<LanguagePref>(defaultLanguage);
  const [quota, setQuota] = useState(initialQuota);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDraftNew, setIsDraftNew] = useState(false);

  const [isPending, startTransition] = useTransition();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamCleanupRef = useRef<(() => void) | null>(null);
  const chapterBootstrappedRef = useRef(false);

  const canSend =
    quota.allowed &&
    input.trim().length > 0 &&
    !isTyping &&
    !isPending &&
    !loadingConversation;

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    return () => {
      streamCleanupRef.current?.();
    };
  }, []);

  const refreshConversations = useCallback(async () => {
    const next = await getConversations();
    setConversations(next);
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      void refreshConversations();
    }
  }, [drawerOpen, refreshConversations]);

  const resetToNewConversation = useCallback(() => {
    streamCleanupRef.current?.();
    streamCleanupRef.current = null;
    setIsTyping(false);
    setActiveConversationId(null);
    setIsDraftNew(true);
    setMessages([]);
    setConversationTitle(null);
    setChapterTitle(null);
    setInput("");
    setLanguage(defaultLanguage);
    setDrawerOpen(false);
  }, [defaultLanguage]);

  const loadConversation = useCallback(
    (conversationId: string) => {
      setIsDraftNew(false);
      setLoadingConversation(true);
      setActiveConversationId(conversationId);
      setMessages([]);
      setConversationTitle(null);
      setChapterTitle(null);

      startTransition(async () => {
        try {
          const [detail, rows] = await Promise.all([
            getConversationDetail(conversationId),
            getConversationMessages(conversationId),
          ]);

          setConversationTitle(detail.title);
          setChapterTitle(detail.chapterTitle);
          setLanguage(detail.language);
          setMessages(
            rows.map((row) => ({
              id: row.id,
              role: row.role === "assistant" ? "assistant" : "user",
              content: row.content,
            })),
          );
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Impossible de charger la conversation.",
          );
          setActiveConversationId(null);
        } finally {
          setLoadingConversation(false);
        }
      });
    },
    [],
  );

  const bootstrapChapterConversation = useCallback(
    (chapterSlug: string) => {
      startTransition(async () => {
        try {
          const id = await createConversation(chapterSlug);
          await refreshConversations();
          setActiveConversationId(id);
          setIsDraftNew(true);
          setMessages([]);
          setConversationTitle(null);
          setInput("");

          const detail = await getConversationDetail(id);
          setChapterTitle(detail.chapterTitle);
          setLanguage(detail.language);
          setDrawerOpen(false);
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Impossible de créer la conversation.",
          );
        }
      });
    },
    [refreshConversations],
  );

  useEffect(() => {
    if (!initialChapterSlug || chapterBootstrappedRef.current) return;
    chapterBootstrappedRef.current = true;
    bootstrapChapterConversation(initialChapterSlug);
  }, [initialChapterSlug, bootstrapChapterConversation]);

  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      if (conversationId === activeConversationId) {
        setDrawerOpen(false);
        return;
      }
      loadConversation(conversationId);
      setDrawerOpen(false);
    },
    [activeConversationId, loadConversation],
  );

  const handleRequestDelete = useCallback((conversationId: string) => {
    setPendingDeleteId(conversationId);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!pendingDeleteId) return;
    const idToDelete = pendingDeleteId;
    setPendingDeleteId(null);

    startTransition(async () => {
      try {
        await deleteConversation(idToDelete);
        await refreshConversations();
        if (activeConversationId === idToDelete) {
          setActiveConversationId(null);
          setIsDraftNew(false);
          setMessages([]);
          setConversationTitle(null);
          setChapterTitle(null);
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Impossible de supprimer la conversation.",
        );
      }
    });
  }, [pendingDeleteId, activeConversationId, refreshConversations]);

  const handleLanguageChange = useCallback(
    (nextLanguage: LanguagePref) => {
      setLanguage(nextLanguage);
      if (!activeConversationId) return;

      startTransition(async () => {
        try {
          await updateConversationLanguage(activeConversationId, nextLanguage);
        } catch (error) {
          toast.error(
            error instanceof Error
              ? error.message
              : "Impossible de changer la langue.",
          );
        }
      });
    },
    [activeConversationId],
  );

  const ensureConversation = useCallback(async (): Promise<string | null> => {
    if (activeConversationId) return activeConversationId;

    try {
      const id = await createConversation();
      if (language !== defaultLanguage) {
        await updateConversationLanguage(id, language);
      }
      await refreshConversations();
      setActiveConversationId(id);
      setIsDraftNew(false);
      setConversationTitle(null);
      setChapterTitle(null);
      if (language !== defaultLanguage) {
        await updateConversationLanguage(id, language);
      }
      return id;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Impossible de créer la conversation.",
      );
      return null;
    }
  }, [activeConversationId, defaultLanguage, language, refreshConversations]);

  const handleAssistantResponse = useCallback(
    (fullResponse: string, result: Extract<SendMessageResult, { success: true }>) => {
      const assistantId = `assistant-${Date.now()}`;
      setIsTyping(false);
      setQuota({
        allowed: result.remaining === "unlimited" || result.remaining > 0,
        remaining: result.remaining,
        plan: quota.plan,
      });

      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", streaming: true },
      ]);

      streamCleanupRef.current?.();
      streamCleanupRef.current = revealTextGradually(
        fullResponse,
        (partial) => {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? { ...message, content: partial }
                : message,
            ),
          );
        },
        () => {
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantId
                ? { ...message, streaming: false }
                : message,
            ),
          );
          streamCleanupRef.current = null;
        },
      );
    },
    [quota.plan],
  );

  const submitMessage = useCallback(
    (rawText: string) => {
      const text = rawText.trim();
      if (!text || !quota.allowed || isTyping || isPending) return;

      startTransition(async () => {
        const conversationId = await ensureConversation();
        if (!conversationId) return;

        const userMessageId = `user-${Date.now()}`;
        const isFirstExchange = messages.length === 0;
        setMessages((prev) => [
          ...prev,
          { id: userMessageId, role: "user", content: text },
        ]);
        setInput("");
        setIsTyping(true);

        try {
          const result = await sendMessage(conversationId, text);

          if ("error" in result) {
            setIsTyping(false);
            setMessages((prev) =>
              prev.filter((message) => message.id !== userMessageId),
            );
            setQuota({ allowed: false, remaining: 0, plan: quota.plan });
            toast.error("Tu as utilisé tes questions gratuites du jour.");
            return;
          }

          if (isFirstExchange) {
            setConversationTitle(
              text.length > 60 ? `${text.slice(0, 59)}…` : text,
            );
          }

          handleAssistantResponse(result.response, result);
          await refreshConversations();

          const detail = await getConversationDetail(conversationId);
          setConversationTitle(detail.title);
          setChapterTitle(detail.chapterTitle);
          setLanguage(detail.language);
        } catch (error) {
          setIsTyping(false);
          setMessages((prev) =>
            prev.filter((message) => message.id !== userMessageId),
          );
          toast.error(
            error instanceof Error
              ? error.message
              : "Une erreur est survenue. Réessaie dans un instant.",
          );
        }
      });
    },
    [
      ensureConversation,
      handleAssistantResponse,
      isPending,
      isTyping,
      messages.length,
      quota.allowed,
      quota.plan,
      refreshConversations,
    ],
  );

  const handleSubmit = () => {
    submitMessage(input);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (canSend) handleSubmit();
    }
  };

  const headerTitle =
    conversationTitle?.trim() ||
    (isDraftNew || activeConversationId ? "Nouvelle conversation" : "Tuteur IA");

  const showWelcome =
    !loadingConversation &&
    isDraftNew &&
    messages.length === 0 &&
    !isTyping;

  const showLanding =
    !loadingConversation &&
    !isDraftNew &&
    messages.length === 0 &&
    activeConversationId === null;

  return (
    <div className="flex h-[calc(100dvh-5.5rem)] flex-col lg:h-[calc(100dvh-1rem)]">
      <div className="flex min-h-0 flex-1 overflow-hidden rounded-none lg:rounded-2xl lg:border lg:border-sand lg:bg-cream lg:shadow-sm">
        <ConversationSidebar
          conversations={conversations}
          activeId={activeConversationId}
          onNewConversation={resetToNewConversation}
          onSelect={handleSelectConversation}
          onRequestDelete={handleRequestDelete}
          pending={isPending}
          className="hidden md:flex"
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="shrink-0 border-b border-sand bg-cream/95 px-4 py-3 backdrop-blur-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="md:hidden"
                  onClick={() => setDrawerOpen(true)}
                  aria-label="Ouvrir les conversations"
                >
                  <Menu className="size-4" />
                </Button>
                <div className="min-w-0">
                  <h1 className="truncate font-display text-lg font-semibold text-emerald-900 sm:text-xl">
                    {headerTitle}
                  </h1>
                  <p className="mt-0.5 text-xs text-muted">
                    Pose ta question, je te guide pas à pas.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div
                  className="inline-flex rounded-lg border border-sand bg-paper p-0.5"
                  role="group"
                  aria-label="Langue du tuteur"
                >
                  {LANGUAGE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      disabled={isPending}
                      onClick={() => handleLanguageChange(option.value)}
                      className={cn(
                        "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50",
                        language === option.value
                          ? "bg-emerald-800 text-cream"
                          : "text-muted hover:text-emerald-900",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <QuotaBadge quota={quota} className="hidden sm:block max-w-xs" />
              </div>
            </div>

            <div className="mt-3 sm:hidden">
              <QuotaBadge quota={quota} />
            </div>

            {chapterTitle ? (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                <BookOpen className="size-4 shrink-0" aria-hidden />
                <span>
                  Tu discutes du chapitre :{" "}
                  <strong className="font-medium">{chapterTitle}</strong>
                </span>
              </div>
            ) : null}
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
            {loadingConversation ? (
              <div className="flex h-full min-h-40 items-center justify-center text-sm text-muted">
                Chargement de la conversation…
              </div>
            ) : null}

            {!loadingConversation && showLanding ? (
              <div className="mx-auto flex h-full max-w-lg flex-col items-center justify-center text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                  <Sparkles className="size-8" />
                </div>
                <h2 className="mt-6 font-display text-2xl font-semibold text-emerald-900">
                  Bienvenue sur ton tuteur IA
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  Choisis une conversation ou démarre-en une nouvelle pour poser
                  tes questions de révision.
                </p>
                <Button
                  type="button"
                  className="mt-6 bg-emerald-800 text-cream hover:bg-emerald-700"
                  onClick={resetToNewConversation}
                  disabled={isPending}
                >
                  <MessageSquarePlus data-icon="inline-start" />
                  Nouvelle conversation
                </Button>
              </div>
            ) : null}

            {!loadingConversation && showWelcome ? (
              <div className="mx-auto max-w-2xl">
                <div className="rounded-2xl border border-sand bg-paper/60 px-5 py-6 sm:px-6">
                  <p className="text-base leading-relaxed text-emerald-900">
                    Salut {firstName} ! Pose-moi ta question. Je peux t&apos;expliquer
                    un concept, t&apos;aider sur un exercice, ou réviser avec toi.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {SUGGESTED_QUESTIONS.map((question) => (
                      <button
                        key={question}
                        type="button"
                        disabled={!quota.allowed || isPending || isTyping}
                        onClick={() => submitMessage(question)}
                        className="rounded-full border border-sand bg-cream px-3 py-1.5 text-left text-sm text-emerald-800 transition-colors hover:border-emerald-600/30 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {!loadingConversation && !showLanding && !showWelcome ? (
              <div className="mx-auto max-w-2xl space-y-4">
                {messages.map((message) =>
                  message.role === "user" ? (
                    <UserBubble key={message.id} content={message.content} />
                  ) : (
                    <AssistantBubble
                      key={message.id}
                      content={message.content}
                      streaming={message.streaming}
                    />
                  ),
                )}
                {isTyping ? <TypingIndicator /> : null}
                <div ref={messagesEndRef} />
              </div>
            ) : null}
          </div>

          <div className="shrink-0 border-t border-sand bg-cream px-4 py-3">
            {!quota.allowed ? (
              <QuotaBadge quota={quota} />
            ) : (
              <div className="mx-auto flex max-w-2xl items-end gap-2">
                <Textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Écris ta question ici…"
                  rows={1}
                  disabled={!quota.allowed || isTyping || isPending}
                  className="min-h-11 max-h-40 resize-none border-sand bg-paper py-2.5"
                  aria-label="Message au tuteur"
                />
                <Button
                  type="button"
                  size="icon-lg"
                  className="shrink-0 bg-emerald-800 text-cream hover:bg-emerald-700"
                  onClick={handleSubmit}
                  disabled={!canSend}
                  aria-label="Envoyer le message"
                >
                  <SendHorizontal className="size-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={pendingDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDeleteId(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la conversation ?</DialogTitle>
            <DialogDescription>
              Cette conversation et tous ses messages seront définitivement
              supprimés. Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setPendingDeleteId(null)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isPending}
            >
              <Trash2 data-icon="inline-start" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drawer conversations mobile */}
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent
          showCloseButton
          className={cn(
            "top-0 left-0 h-full max-h-none w-[min(100%,18rem)] max-w-none translate-x-0 translate-y-0 rounded-none border-r p-0 sm:max-w-none",
            "data-open:slide-in-from-left-4 data-closed:slide-out-to-left-4",
          )}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Conversations</DialogTitle>
          </DialogHeader>
          <ConversationSidebar
            conversations={conversations}
            activeId={activeConversationId}
            onNewConversation={resetToNewConversation}
            onSelect={handleSelectConversation}
            onRequestDelete={handleRequestDelete}
            pending={isPending}
            className="w-full border-r-0"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
