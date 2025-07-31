// src/components/shared/profile/UserProfileCard.tsx
import React from 'react'
import { CheckCircle2 } from 'lucide-react'
import { colors } from '@/constants/colorsThema'
import useHtmlDarkMode from '@/hooks/userHTMLDarkMode'

export type UserProfileCardProps = {
  name: string
  role: string
  imageUrl: string
  signatureUrl?: string
  jabatan?: string
  bio?: string
  tambahan?: string
  socialMedias?: string[] // icon paths: e.g., ['/icons/whatsapp.svg']
  onEdit?: () => void
  editText?: string
}

export default function UserProfileCard({
  name,
  role,
  imageUrl,
  signatureUrl,
  jabatan,
  bio,
  tambahan,
  socialMedias = [],
  onEdit,
  editText = 'Edit Profil'
}: UserProfileCardProps) {
  const { isDark } = useHtmlDarkMode()
  const theme = isDark ? colors.dark : colors.light

  return (
    <div
      className="space-y-6"
    >
      {/* Header */}
      <h1 className="text-2xl font-bold">Profil Saya</h1>

      {/* Info Pengguna */}
      <div className="flex items-start gap-4">
        <div className="relative">
          <img
            src={imageUrl}
            alt="Profil"
            className="w-24 h-24 rounded-full object-cover"
          />
          <CheckCircle2
            className="absolute -bottom-1 -right-1 w-6 h-6"
            color={theme.success1}
          />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-bold">{name}</h2>
          <p className="text-sm" style={{ color: theme.silver2 }}>{role}</p>
          {signatureUrl && (
            <img src={signatureUrl} alt="TTD" className="w-20 mt-1" />
          )}
        </div>
      </div>

      {/* Sosial Media */}
      {socialMedias.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-1">Sosial Media</h3>
          <div className="flex items-center gap-2">
            {socialMedias.map((icon, idx) => (
              <img key={idx} src={icon} alt={`icon-${idx}`} className="w-5 h-5" />
            ))}
            {onEdit && (
              <button
                className="ml-2 text-sm px-3 py-1 rounded font-medium transition"
                onClick={onEdit}
                style={{ backgroundColor: theme.primary2, color: theme.primary }}
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
          <p className="text-sm leading-relaxed" style={{ color: theme.black2 }}>{bio}</p>
        </section>
      )}

      {/* Tambahan */}
      {tambahan && (
        <section>
          <h3 className="text-sm font-bold mb-1">Tambahan</h3>
          <p className="text-sm leading-relaxed" style={{ color: theme.black2 }}>{tambahan}</p>
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
  )
}
