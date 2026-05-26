import { TutorChat } from "@/components/features/tutor/TutorChat";

import { getTutorPageContext } from "./actions";

type TuteurIaPageProps = {
  searchParams: Promise<{ chapitre?: string }>;
};

/** Page tuteur IA — chat pédagogique avec historique. */
export default async function TuteurIaPage({ searchParams }: TuteurIaPageProps) {
  const params = await searchParams;
  const context = await getTutorPageContext();

  return (
    <TutorChat
      firstName={context.firstName}
      initialQuota={context.quota}
      initialConversations={context.conversations}
      defaultLanguage={context.defaultLanguage}
      initialChapterSlug={params.chapitre?.trim() || undefined}
    />
  );
}
