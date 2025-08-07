import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";

interface LectureThemeCardProps {
  slug: string;
  lecture_slug: string;
  lecture_title: string;
  total_sessions: number;
}

export default function LectureThemeCard({
  slug,
  lecture_slug,
  lecture_title,
  total_sessions,
}: LectureThemeCardProps) {
  const { isDark } = useHtmlDarkMode();
  const theme = isDark ? colors.dark : colors.light;
  const navigate = useNavigate();

  return (
    <div
      onClick={() =>
        navigate(`/masjid/${slug}/tema/${lecture_slug}`, {
          state: {
            from: { slug, tab: "tema" },
          },
        })
      }
      className="p-4 rounded-lg cursor-pointer hover:opacity-90"
      style={{
        backgroundColor: theme.white1,
        border: `1px solid ${theme.silver1}`,
      }}
    >
      <h3 className="text-base font-medium">{lecture_title}</h3>
      <p className="text-sm" style={{ color: theme.silver2 }}>
        Total {total_sessions} kajian
      </p>
    </div>
  );
}
