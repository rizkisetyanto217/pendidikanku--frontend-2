// src/components/common/main/ImagePreview.tsx

import React from "react";

interface ImagePreviewProps {
  label: string;
  url?: string | null;
}

export default function ImagePreview({ label, url }: ImagePreviewProps) {
  if (!url) return null;

  return (
    <div className="mt-2">
      <p className="text-xs text-muted-foreground mb-1">
        Gambar {label} Saat Ini:
      </p>
      <img
        src={url}
        alt={`Gambar ${label}`}
        className="rounded-md w-full max-h-40 object-contain border"
      />
    </div>
  );
}
