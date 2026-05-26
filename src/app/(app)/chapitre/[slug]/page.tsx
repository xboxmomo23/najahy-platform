import { ChapterDetail } from "@/components/features/chapter/ChapterDetail";

import { getChapterDetail } from "./actions";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getChapterDetail(slug);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ChapterDetail data={data} />
    </div>
  );
}
