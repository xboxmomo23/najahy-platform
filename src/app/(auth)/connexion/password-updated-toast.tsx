"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function PasswordUpdatedToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("passwordUpdated") === "1") {
      toast.success("Mot de passe mis à jour avec succès");
      window.history.replaceState(null, "", "/connexion");
    }
  }, [searchParams]);

  return null;
}
