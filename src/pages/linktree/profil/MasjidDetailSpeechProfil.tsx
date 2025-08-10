// MasjidDetailSpeech.tsx
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { useMemo } from "react";

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

export default function MasjidDetailSpeech() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["masjid-profile-teacher-dkm", slug],
    queryFn: async () => {
      const res = await axios.get(
        `/public/masjid-profile-teacher-dkm/by-masjid-slug/${slug}`
      );
      return (res.data?.data || []) as ProfileItem[];
    },
    enabled: !!slug,
    staleTime: 60_000,
  });

  const speeches = useMemo(
    () =>
      (data || [])
        .filter((p) => !!p.masjid_profile_teacher_dkm_message)
        .sort(
          (a, b) =>
            new Date(b.masjid_profile_teacher_dkm_created_at).getTime() -
            new Date(a.masjid_profile_teacher_dkm_created_at).getTime()
        ),
    [data]
  );

  return (
    <>
      <PageHeaderUser
        title="Sambutan"
        onBackClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />

      <div className="space-y-4 mt-4">
        {isLoading ? (
          <p className="text-sm" style={{ color: themeColors.silver2 }}>
            Memuat sambutan…
          </p>
        ) : isError ? (
          <p className="text-sm text-red-500">Gagal memuat sambutan.</p>
        ) : speeches.length === 0 ? (
          <p className="text-sm" style={{ color: themeColors.silver2 }}>
            Belum ada sambutan.
          </p>
        ) : (
          speeches.map((item) => (
            <div
              key={item.masjid_profile_teacher_dkm_id}
              className="border rounded-md p-4 shadow-sm"
              style={{
                backgroundColor: themeColors.white1,
                borderColor: themeColors.silver1,
              }}
            >
              <div className="flex items-start gap-3">
                {/* {item.masjid_profile_teacher_dkm_image_url ? (
                  <img
                    src={item.masjid_profile_teacher_dkm_image_url}
                    alt={item.masjid_profile_teacher_dkm_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : null} */}

                <div className="flex-1">
                  <p
                    className="font-semibold"
                    style={{ color: themeColors.black1 }}
                  >
                    {item.masjid_profile_teacher_dkm_name}
                  </p>
                  <p
                    className="text-sm mb-2"
                    style={{ color: themeColors.silver2 }}
                  >
                    {item.masjid_profile_teacher_dkm_role || "—"}
                  </p>

                  <p
                    className="text-base leading-relaxed"
                    style={{ color: themeColors.black2 }}
                  >
                    {item.masjid_profile_teacher_dkm_message}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
