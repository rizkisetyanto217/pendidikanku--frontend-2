import PageHeader from "@/components/common/home/PageHeaderDashboard";
import { useNavigate } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";

const dummySambutan = [
  {
    id: 1,
    name: "Muhammad",
    role: "Pengajar",
    content:
      "Semoga Allah ta'ala mudahkan kita dalam menuntut ilmu agama. Allah ta'ala berikan kemudahan bagi kita semua terutama bagi orang-orang yang sedang kesulitan agar dilancarkan usahanya.",
  },
  {
    id: 2,
    name: "Budi",
    role: "Ketua DKM",
    content:
      "Semoga Allah ta'ala mudahkan kita dalam menuntut ilmu agama. Allah ta'ala berikan kemudahan bagi kita semua terutama bagi orang-orang yang sedang kesulitan agar dilancarkan usahanya.",
  },
];

export default function MasjidDetailSpeech() {
  const navigate = useNavigate();
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  return (
    <>
      <PageHeaderUser
        title="Sambutan"
        onBackClick={() => {
          if (window.history.length > 1) navigate(-1);
        }}
      />

      <div className="space-y-4 mt-4">
        {dummySambutan.map((item) => (
          <div
            key={item.id}
            className="border rounded-md p-4 shadow-sm"
            style={{
              backgroundColor: themeColors.white1,
              borderColor: themeColors.silver1,
            }}
          >
            <p className="font-semibold" style={{ color: themeColors.black1 }}>
              {item.name}
            </p>
            <p className="text-sm mb-2" style={{ color: themeColors.silver2 }}>
              {item.role}
            </p>
            <p className="text-sm" style={{ color: themeColors.black2 }}>
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
