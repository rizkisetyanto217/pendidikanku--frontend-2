// src/utils/loadGsiScript.ts
let gsiScriptLoading: Promise<void> | null = null;

export function loadGsiScript(): Promise<void> {
  if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
    return Promise.resolve();
  }

  if (gsiScriptLoading) return gsiScriptLoading;

  gsiScriptLoading = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById("google-identity");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", (e) => reject(e));
      return;
    }

    const s = document.createElement("script");
    s.id = "google-identity";
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = (e) => reject(e);
    document.body.appendChild(s);
  });

  return gsiScriptLoading;
}
