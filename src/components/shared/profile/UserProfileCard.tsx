import React from "react";
import { CheckCircle2 } from "lucide-react";
import { colors } from "@/constants/colorsThema";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import ShimmerImage from "@/components/common/main/ShimmerImage";

export type UserProfileCardProps = {
  name: string;
  role: string;
  signatureUrl?: string;
  jabatan?: string;
  bio?: string;
  tambahan?: string;
  socialMedias?: string[];
  onEdit?: () => void;
  editText?: string;
};

export default function UserProfileCard({
  name,
  role,
  signatureUrl,
  jabatan,
  bio,
  tambahan,
  socialMedias = [],
  onEdit,
  editText = "Edit Profil",
}: UserProfileCardProps) {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <div
      className="rounded-xl p-5 shadow-sm space-y-6"
      style={{ backgroundColor: theme.white1, color: theme.black1 }}
    >
      {/* Header */}
      <h1 className="text-2xl font-bold">Profil Saya</h1>

      {/* Info Pengguna */}
      <div className="space-y-1">
        <h2 className="text-lg font-bold">{name}</h2>
        <p className="text-sm" style={{ color: theme.silver2 }}>
          {role}
        </p>

        {signatureUrl && (
          <ShimmerImage
            src={signatureUrl}
            alt="TTD"
            className="w-20 mt-1 object-contain"
          />
        )}
      </div>

      {/* Sosial Media */}
      {socialMedias.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-1">Sosial Media</h3>
          <div className="flex items-center gap-2">
            {socialMedias.map((icon, idx) => (
              <ShimmerImage
                key={idx}
                src={icon}
                alt={`icon-${idx}`}
                className="w-5 h-5 object-contain"
              />
            ))}

            {onEdit && (
              <button
                className="ml-2 text-sm px-3 py-1 rounded font-medium transition"
                onClick={onEdit}
                style={{
                  backgroundColor: theme.primary2,
                  color: theme.primary,
                }}
              >
                + Edit
              </button>
            )}
          </div>
        </div>
      )}

      {/* Jabatan */}
      {jabatan && (
        <div>
          <h3 className="text-sm font-semibold mb-1">Jabatan</h3>
          <p className="text-sm">{jabatan}</p>
        </div>
      )}

      {/* Profil Diri */}
      {bio && (
        <section>
          <h3 className="text-sm font-bold mb-1">Profil Diri</h3>
          <p
            className="text-sm leading-relaxed"
            style={{ color: theme.black2 }}
          >
            {bio}
          </p>
        </section>
      )}

      {/* Tambahan */}
      {tambahan && (
        <section>
          <h3 className="text-sm font-bold mb-1">Informasi Lainnya</h3>
          {tambahan.split("\n").map((line, idx) => (
            <p
              key={idx}
              className="text-sm leading-relaxed"
              style={{ color: theme.black2 }}
            >
              {line}
            </p>
          ))}
        </section>
      )}

      {/* Tombol */}
      {onEdit && (
        <div className="pt-4">
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium transition"
            style={{ backgroundColor: theme.primary, color: theme.white1 }}
            onClick={onEdit}
          >
            {editText}
          </button>
        </div>
      )}
    </div>
  );
}
