import { LibraryView } from "@/components/features/library/LibraryView";

import {
  getCompetencyTree,
  getDiagnosticRecommendations,
  getLibraryData,
  getStudentSubscriptionPlan,
} from "./actions";

/** Bibliothèque élève — données chargées côté serveur. */
export default async function BibliothequePage() {
  const [library, competencyTree, recommendations, subscriptionPlan] =
    await Promise.all([
      getLibraryData(),
      getCompetencyTree(),
      getDiagnosticRecommendations(),
      getStudentSubscriptionPlan(),
    ]);

  return (
    <LibraryView
      chapters={library.chapters}
      stats={library.stats}
      competencyTree={competencyTree}
      recommendations={recommendations}
      subscriptionPlan={subscriptionPlan}
    />
  );
}
