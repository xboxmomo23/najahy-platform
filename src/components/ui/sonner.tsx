"use client";

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      position="top-right"
      duration={4000}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-emerald-700" />,
        info: <InfoIcon className="size-4 text-emerald-800" />,
        warning: <TriangleAlertIcon className="size-4 text-gold-600" />,
        error: <OctagonXIcon className="size-4 text-coral" />,
        loading: <Loader2Icon className="size-4 animate-spin text-emerald-800" />,
      }}
      style={
        {
          "--normal-bg": "#faf6ef",
          "--normal-text": "#1a1a1a",
          "--normal-border": "#ede4d3",
          "--border-radius": "0.5rem",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast !bg-cream !text-ink !border !border-sand !shadow-md",
          title: "!text-ink",
          description: "!text-muted",
          actionButton: "!bg-emerald-800 !text-cream",
          cancelButton: "!bg-paper !text-ink",
          closeButton: "!bg-cream !text-muted !border-sand",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
