"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      richColors
      position="top-right"
      closeButton
      toastOptions={{
        style: {
          background: "#fffaf4",
          color: "#111318",
          border: "1px solid rgba(17, 19, 24, 0.12)",
        },
      }}
    />
  );
}
