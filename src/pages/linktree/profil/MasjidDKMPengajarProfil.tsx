// MasjidDKMPengajarProfil.tsx
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useResponsive } from "@/hooks/isResponsive";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

type ProfileItem = {
  masjid_profile_teacher_dkm_id: string;
  masjid_profile_teacher_dkm_masjid_id: string;
  masjid_profile_teacher_dkm_name: string;
  masjid_profile_teacher_dkm_role: string; // "DKM" | "Teacher" | lainnya
  masjid_profile_teacher_dkm_description?: string; // jabatan/aktivitas ringkas
  masjid_profile_teacher_dkm_message?: string; // sambutan / pesan
  masjid_profile_teacher_dkm_image_url?: string;
  masjid_profile_teacher_dkm_created_at: string;
};

export default function MasjidDKMPengajarProfil() {
  const { slug } = useParams();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const [selectedDetail, setSelectedDetail] = useState<ProfileItem | null>(
    null
  );

  const { data, isLoading, isError } = useQuery({
    queryKey: ["masjid-profile-teacher-dkm", slug],
    queryFn: async () => {
      const res = await axios.get(
        `/public/masjid-profile-teacher-dkm/by-masjid-slug/${slug}`
      );
      return (res.data.data || []) as ProfileItem[];
    },
    enabled: !!slug,
  });

  const dkmList = useMemo(
    () =>
      (data || []).filter(
        (x) => (x.masjid_profile_teacher_dkm_role || "").toUpperCase() === "DKM"
      ),
    [data]
  );

  const pengajarList = useMemo(
    () =>
      (data || []).filter(
        (x) => (x.masjid_profile_teacher_dkm_role || "").toUpperCase() !== "DKM"
      ),
    [data]
  );

  // di MasjidDKMPengajarProfil.tsx
  const handleSelect = (person: ProfileItem) => {
    if (isMobile) {
      navigate(`detail/${person.masjid_profile_teacher_dkm_id}`, {
        state: { item: person, slug },
      });
    } else {
      setSelectedDetail(person);
    }
  };

  const renderPersonCard = (item: ProfileItem, label?: string) => {
    const isActive =
      selectedDetail?.masjid_profile_teacher_dkm_id ===
      item.masjid_profile_teacher_dkm_id;

    return (
      <button
        key={item.masjid_profile_teacher_dkm_id}
        onClick={() => handleSelect(item)}
        className="w-full flex justify-between items-center p-3 rounded border mt-2 transition-colors"
        style={{
          backgroundColor: isActive ? theme.success2 : theme.white1,
          borderColor: theme.silver1,
          color: theme.black1,
        }}
        onMouseEnter={(e) => {
          if (!isActive)
            e.currentTarget.style.backgroundColor = theme.white2;
        }}
        onMouseLeave={(e) => {
          if (!isActive)
            e.currentTarget.style.backgroundColor = theme.white1;
        }}
      >
        <span className="flex flex-col items-start text-left">
          <span className="font-medium">
            {label || item.masjid_profile_teacher_dkm_role || "—"}
          </span>
          <span className="text-sm" style={{ color: theme.silver2 }}>
            {item.masjid_profile_teacher_dkm_name}
          </span>
        </span>
        <span className="text-lg">›</span>
      </button>
    );
  };

  return (
    <>
      <PageHeaderUser
        title="Profil DKM & Pengajar"
        onBackClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />

      <div className="md:flex md:gap-6">
        <div className="md:w-1/2 space-y-4">
          {isLoading ? (
            <p className="text-sm" style={{ color: theme.silver2 }}>
              Memuat data…
            </p>
          ) : isError ? (
            <p className="text-sm text-red-500">Gagal memuat data.</p>
          ) : (
            <>
              <div>
                <h2
                  className="font-semibold text-lg"
                  style={{ color: theme.black1 }}
                >
                  DKM Masjid
                </h2>
                {dkmList.length > 0 ? (
                  dkmList.map((item) =>
                    renderPersonCard(item, item.masjid_profile_teacher_dkm_role)
                  )
                ) : (
                  <p
                    className="text-sm mt-2"
                    style={{ color: theme.silver2 }}
                  >
                    Belum ada data DKM.
                  </p>
                )}
              </div>

              <div className="pt-4">
                <h3
                  className="text-md font-semibold"
                  style={{ color: theme.black1 }}
                >
                  Pengajar
                </h3>
                {pengajarList.length > 0 ? (
                  pengajarList.map((item) => renderPersonCard(item))
                ) : (
                  <p
                    className="text-sm mt-2"
                    style={{ color: theme.silver2 }}
                  >
                    Belum ada data pengajar.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {!isMobile && (
          <div
            className="md:w-1/2 rounded shadow p-4 space-y-3 mt-6 md:mt-0"
            style={{ backgroundColor: theme.white1 }}
          >
            {selectedDetail ? (
              <>
                <h3
                  className="text-lg font-semibold"
                  style={{ color: theme.quaternary }}
                >
                  {selectedDetail.masjid_profile_teacher_dkm_name}
                </h3>

                <div
                  className="space-y-2 text-sm"
                  style={{ color: theme.black2 }}
                >
                  {selectedDetail.masjid_profile_teacher_dkm_role && (
                    <div>
                      <p className="font-semibold">Peran</p>
                      <p>{selectedDetail.masjid_profile_teacher_dkm_role}</p>
                    </div>
                  )}

                  {selectedDetail.masjid_profile_teacher_dkm_description && (
                    <div>
                      <p className="font-semibold">Deskripsi</p>
                      <p>
                        {selectedDetail.masjid_profile_teacher_dkm_description}
                      </p>
                    </div>
                  )}

                  {selectedDetail.masjid_profile_teacher_dkm_message && (
                    <div>
                      <p className="font-semibold">Sambutan</p>
                      <p>{selectedDetail.masjid_profile_teacher_dkm_message}</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm" style={{ color: theme.silver2 }}>
                Klik salah satu untuk melihat detail.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
