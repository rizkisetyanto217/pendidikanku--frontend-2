// MasjidDKMTeacherDetailMobile.tsx
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";

type ProfileItem = {
  masjid_profile_teacher_dkm_id: string;
  masjid_profile_teacher_dkm_masjid_id: string;
  masjid_profile_teacher_dkm_name: string;
  masjid_profile_teacher_dkm_role: string;
  masjid_profile_teacher_dkm_description?: string;
  masjid_profile_teacher_dkm_message?: string;
  masjid_profile_teacher_dkm_image_url?: string;
  masjid_profile_teacher_dkm_created_at: string;
};

export default function MasjidDetailDKMPengajarMobile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation() as {
    state?: { item?: ProfileItem; slug?: string; from?: string };
  };
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const itemFromState = location.state?.item;
  const slug = location.state?.slug;

  // Fallback fetch kalau user masuk langsung tanpa state
  const {
    data: list,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["masjid-profile-teacher-dkm", slug],
    queryFn: async () => {
      if (!slug) return [] as ProfileItem[];
      const res = await axios.get(
        `/public/masjid-profile-teacher-dkm/by-masjid-slug/${slug}`
      );
      return (res.data?.data || []) as ProfileItem[];
    },
    enabled: !!slug && !itemFromState,
    staleTime: 60_000,
  });

  const item = useMemo<ProfileItem | null>(() => {
    if (itemFromState) return itemFromState;
    if (!list || !id) return null;
    return list.find((x) => x.masjid_profile_teacher_dkm_id === id) || null;
  }, [itemFromState, list, id]);

  return (
    <div className="min-h-screen">
      <PageHeaderUser
        title="Detail Profil"
        onBackClick={() =>
          window.history.length > 1 ? navigate(-1) : navigate("/")
        }
      />

      <div className="space-y-4">
        {!item &&
          (isLoading ? (
            <p className="text-sm" style={{ color: theme.silver2 }}>
              Memuat data…
            </p>
          ) : isError ? (
            <p className="text-sm text-red-500">Gagal memuat data.</p>
          ) : (
            <p className="text-sm" style={{ color: theme.silver2 }}>
              Data tidak ditemukan.
            </p>
          ))}

        {item && (
          <>
            {/* {item.masjid_profile_teacher_dkm_image_url ? (
              <img
                src={item.masjid_profile_teacher_dkm_image_url}
                alt={item.masjid_profile_teacher_dkm_name}
                className="w-full h-48 object-cover rounded-lg"
              />
            ) : null} */}

            <div>
              <h1
                className="text-xl font-semibold"
                style={{ color: theme.black1 }}
              >
                {item.masjid_profile_teacher_dkm_name}
              </h1>
              <span
                className="inline-block mt-1 px-3 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: theme.white2,
                  color: theme.quaternary,
                  border: `1px solid ${theme.silver1}`,
                }}
              >
                {item.masjid_profile_teacher_dkm_role || "—"}
              </span>
            </div>

            {item.masjid_profile_teacher_dkm_description && (
              <div className="space-y-1">
                <p className="font-semibold" style={{ color: theme.black2 }}>
                  Deskripsi
                </p>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: theme.black1 }}
                >
                  {item.masjid_profile_teacher_dkm_description}
                </p>
              </div>
            )}

            {item.masjid_profile_teacher_dkm_message && (
              <div className="space-y-1">
                <p className="font-semibold" style={{ color: theme.black2 }}>
                  Sambutan
                </p>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: theme.black1 }}
                >
                  {item.masjid_profile_teacher_dkm_message}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
