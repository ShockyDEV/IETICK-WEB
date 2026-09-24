"use client";

import { Toaster } from "react-hot-toast";

/** Avisos flotantes del panel (react-hot-toast), con la tipografía y colores del panel. */
export function AdminToaster() {
  return (
    <Toaster
      position="top-right"
      gutter={10}
      toastOptions={{
        duration: 4000,
        className: "text-sm",
        style: {
          color: "#0B2A36",
          background: "#FFFFFF",
          border: "1px solid #D5E6EC",
          boxShadow: "0 2px 4px rgba(6, 34, 47, 0.08), 0 16px 32px -16px rgba(6, 34, 47, 0.35)",
          borderRadius: "0.75rem",
          padding: "0.625rem 0.875rem",
          maxWidth: "26rem",
        },
        success: { iconTheme: { primary: "#167492", secondary: "#FFFFFF" } },
        error: { duration: 6000, iconTheme: { primary: "#B91C1C", secondary: "#FFFFFF" } },
      }}
    />
  );
}
