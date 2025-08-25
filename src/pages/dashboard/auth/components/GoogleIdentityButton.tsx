// src/components/auth/GoogleIdentityButton.tsx
import React, { useEffect, useRef } from "react";
import { loadGsiScript } from "@/pages/dashboard/auth/utils/loadGsiScript";

type Props = {
  clientId: string;
  /** dipanggil ketika Google mengembalikan credential (JWT) */
  onSuccess: (credential: string) => void | Promise<void>;
  /** opsional: outline/filled_blue; default: filled_blue */
  theme?: "outline" | "filled_blue";
  /** opsional: large/medium/small; default: large */
  size?: "large" | "medium" | "small";
  /** opsional: continue_with/signin_with/signup_with; default: continue_with */
  text?: "continue_with" | "signin_with" | "signup_with";
  /** opsional: auto_select GSI; default: false */
  autoSelect?: boolean;
  /** opsional: width max Google ≈ 400px. default: 400 */
  maxWidth?: number;
  /** opsional: style wrapper div */
  className?: string;
};

declare global {
  interface Window {
    google?: any;
  }
}

const GoogleIdentityButton: React.FC<Props> = ({
  clientId,
  onSuccess,
  theme = "filled_blue",
  size = "large",
  text = "continue_with",
  autoSelect = false,
  maxWidth = 400,
  className,
}) => {
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ro: ResizeObserver | null = null;

    const init = async () => {
      await loadGsiScript();
      if (!window.google || !btnRef.current) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp: any) => {
          const cred = resp?.credential;
          if (cred) onSuccess(cred);
        },
        auto_select: autoSelect,
      });

      const render = () => {
        if (!btnRef.current) return;
        btnRef.current.innerHTML = "";
        const width = Math.min(
          btnRef.current.offsetWidth || maxWidth,
          maxWidth
        );
        window.google.accounts.id.renderButton(btnRef.current, {
          theme,
          size,
          text,
          shape: "rectangular",
          logo_alignment: "left",
          width,
        });
      };

      render();
      ro = new ResizeObserver(render);
      ro.observe(btnRef.current);
    };

    init();

    return () => {
      if (ro && btnRef.current) ro.disconnect();
    };
  }, [clientId, onSuccess, theme, size, text, autoSelect, maxWidth]);

  return <div ref={btnRef} className={className} />;
};

export default GoogleIdentityButton;
