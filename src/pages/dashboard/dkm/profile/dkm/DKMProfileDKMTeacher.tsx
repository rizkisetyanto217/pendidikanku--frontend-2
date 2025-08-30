import { useResponsive } from "@/hooks/isResponsive";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PageHeader from "@/components/common/home/PageHeaderDashboard";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";

interface Profile {
  masjid_profile_teacher_dkm_id: string;
  masjid_profile_teacher_dkm_name: string;
  masjid_profile_teacher_dkm_role: string;
  masjid_profile_teacher_dkm_description: string;
  masjid_profile_teacher_dkm_message: string;
  masjid_profile_teacher_dkm_image_url: string;
  masjid_profile_teacher_dkm_created_at: string;
}

export default function DKMProfileDKMTeacher() {
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const [selectedDetail, setSelectedDetail] = useState<Profile | null>(null);
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);
  const { data, isLoading } = useQuery({
    queryKey: ["masjid-profile-teacher-dkm"],
    queryFn: async () => {
      const res = await axios.get(
        "/api/a/masjid-profile-teacher-dkm/by-masjid-id"
      );
      console.log("📦 Data pengajar:", res.data.data);
      return res.data.data as Profile[];
    },
  });

  const handleSelect = (person: Profile) => {
    if (isMobile) {
      navigate("/dkm/pengajar/edit/" + person.masjid_profile_teacher_dkm_id);
    } else {
      setSelectedDetail(person);
    }
  };

  const renderPersonCard = (item: Profile) => {
    const isActive =
      selectedDetail?.masjid_profile_teacher_dkm_id ===
      item.masjid_profile_teacher_dkm_id;

    return (
      <button
        key={item.masjid_profile_teacher_dkm_id}
        onClick={() => handleSelect(item)}
        className="w-full flex justify-between items-center p-3 rounded border mt-2"
        style={{
          backgroundColor: isActive ? theme.success2 : theme.white1,
          borderColor: theme.silver1,
          color: theme.black1,
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = theme.white2;
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = theme.white1;
          }
        }}
      >
        <span className="flex flex-col items-start text-left">
          <span className="font-medium">
            {item.masjid_profile_teacher_dkm_role}
          </span>
          <span className="text-sm" style={{ color: theme.silver2 }}>
            {item.masjid_profile_teacher_dkm_name}
          </span>
        </span>
        <span className="text-lg">›</span>
      </button>
    );
  };

  const pengurus = data?.filter((p) =>
    ["ketua", "sekretaris", "bendahara", "dkm"].includes(
      p.masjid_profile_teacher_dkm_role.toLowerCase()
    )
  );

  const pengajar = data?.filter((p) =>
    ["teacher", "pengajar", "ustadz"].includes(
      p.masjid_profile_teacher_dkm_role.toLowerCase()
    )
  );

  return (
    <>
      <PageHeader
        title="Profil DKM & Pengajar"
        onBackClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />

      <div className="md:flex md:gap-6">
        <div className="md:w-1/2 space-y-4">
          <div>
            <h2
              className="font-semibold text-lg"
              style={{ color: theme.primary }}
            >
              DKM Masjid
            </h2>
            {pengurus?.map(renderPersonCard)}
          </div>

          <div className="pt-4">
            <h3
              className="text-md font-semibold"
              style={{ color: theme.primary }}
            >
              Pengajar
            </h3>
            {pengajar?.map(renderPersonCard)}
          </div>
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
                  <div>
                    <p className="font-semibold">Jabatan / Peran</p>
                    <p>{selectedDetail.masjid_profile_teacher_dkm_role}</p>
                  </div>

                  <div>
                    <p className="font-semibold">Sambutan</p>
                    <p>{selectedDetail.masjid_profile_teacher_dkm_message}</p>
                  </div>

                  <div>
                    <p className="font-semibold">Deskripsi</p>
                    <p>
                      {selectedDetail.masjid_profile_teacher_dkm_description}
                    </p>
                  </div>
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
