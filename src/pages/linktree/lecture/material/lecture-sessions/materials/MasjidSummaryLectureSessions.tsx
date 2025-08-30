import React, { useMemo } from "react";
import PageHeaderUser from "@/components/common/home/PageHeaderUser";
import { pickTheme, ThemeName } from "@/constants/thema";
import useHtmlDarkMode from "@/hooks/useHTMLThema";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import FormattedDate from "@/constants/formattedDate";
import parse from "html-react-parser";
import cleanTranscriptHTML from "@/constants/cleanTransciptHTML";

type SessionDetail = {
  lecture_session_id: string;
  lecture_session_title: string;
  lecture_session_description?: string;
  lecture_session_teacher_name?: string;
  lecture_session_start_time?: string;
  lecture_session_place?: string;
  lecture_session_image_url?: string;
};

type MaterialSummary = {
  lecture_sessions_material_id: string;
  lecture_sessions_material_summary: string;
  lecture_sessions_material_lecture_session_id: string;
};

export default function MasjidSummaryLectureSessions() {
  const { lecture_session_slug = "", slug = "" } = useParams<{
    lecture_session_slug: string;
    slug: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, themeName } = useHtmlDarkMode();
  const theme = pickTheme(themeName as ThemeName, isDark);

  const backUrl = useMemo(
    () =>
      location.state?.from ||
      `/masjid/${slug}/soal-materi/${lecture_session_slug}`,
    [location.state?.from, slug, lecture_session_slug]
  );

  /** 1) Ambil ringkasan materi (sekalian ambil lecture_session_id untuk fallback) */
  const {
    data: materialData,
    isLoading: isLoadingSummary,
    isError: isErrorSummary,
    error: errorSummary,
  } = useQuery<MaterialSummary | null>({
    queryKey: ["public-lecture-session-summary", lecture_session_slug],
    queryFn: async () => {
      const res = await axios.get(
        "/public/lecture-sessions-materials/filter-slug",
        {
          params: { lecture_session_slug, type: "summary" },
        }
      );
      const payload = res?.data;
      // Normalisasi struktur respons
      const first = Array.isArray(payload?.data)
        ? payload.data[0]
        : Array.isArray(payload?.data?.data)
          ? payload.data.data[0]
          : (payload ?? null);
      return first ?? null;
    },
    enabled: !!lecture_session_slug,
    staleTime: 5 * 60 * 1000,
    retry: (count, err: any) =>
      err?.response?.status === 404 ? false : count < 2,
  });

  const materialSessionId =
    materialData?.lecture_sessions_material_lecture_session_id;

  /** 2) Ambil detail sesi: coba by-slug; kalau 404 dan kita punya ID dari material, fallback by-id */
  const {
    data: sessionDetail,
    isLoading: isLoadingSession,
    isError: isErrorSession,
    error: errorSession,
  } = useQuery<SessionDetail & { __via?: "slug" | "id" }>({
    queryKey: [
      "lecture-session-detail",
      lecture_session_slug,
      materialSessionId,
    ],
    enabled: !!lecture_session_slug,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const url = `/public/lecture-sessions-u/by-slug/${encodeURIComponent(
        lecture_session_slug.trim()
      )}`;
      try {
        const res = await axios.get(url);
        return { ...res.data, __via: "slug" as const };
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 404 && materialSessionId) {
          const res2 = await axios.get(
            `/public/lecture-sessions-u/by-id/${materialSessionId}`
          );
          return { ...res2.data, __via: "id" as const };
        }
        throw err;
      }
    },
    retry: (count, err: any) =>
      err?.response?.status === 404 ? false : count < 2,
  });

  const summaryHTML = materialData?.lecture_sessions_material_summary ?? "";

  const isLoading = isLoadingSession || isLoadingSummary;
  const anyError = isErrorSession || isErrorSummary;

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeaderUser
        title="Materi Kajian"
        onBackClick={() => navigate(backUrl)}
      />

      <div
        className="p-4 rounded-xl shadow-sm"
        style={{ backgroundColor: theme.white1, color: theme.black1 }}
      >
        {isLoading ? (
          <p>Memuat data...</p>
        ) : anyError ? (
          <div className="text-sm">
            {isErrorSession && (
              <p className="text-red-500">
                Gagal memuat detail sesi kajian.
                <span className="block text-xs opacity-70">
                  {(errorSession as any)?.response?.status} —{" "}
                  {(errorSession as any)?.message}
                </span>
              </p>
            )}
            {isErrorSummary && (
              <p className="text-red-500">
                Gagal memuat ringkasan kajian.
                <span className="block text-xs opacity-70">
                  {(errorSummary as any)?.response?.status} —{" "}
                  {(errorSummary as any)?.message}
                </span>
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-1 mb-4">
              <h2 className="text-base font-semibold text-sky-600">
                {sessionDetail?.lecture_session_title || "-"}
              </h2>

              <p className="text-sm text-gray-500">
                {sessionDetail?.lecture_session_start_time ? (
                  <FormattedDate
                    value={sessionDetail.lecture_session_start_time}
                    fullMonth
                    className="inline"
                  />
                ) : (
                  "-"
                )}{" "}
                / {sessionDetail?.lecture_session_place || "-"}
              </p>

              <p
                className="text-sm font-semibold"
                style={{ color: theme.primary }}
              >
                {sessionDetail?.lecture_session_teacher_name || "-"}
              </p>

              {/* Tampilkan badge kecil jika data didapat via fallback by-id */}
              {sessionDetail?.__via === "id" && (
                <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded border">
                  loaded via ID (fallback)
                </span>
              )}
            </div>

            <div
              className="space-y-4 text-sm leading-relaxed text-justify"
              style={{ color: theme.black1 }}
            >
              {summaryHTML ? (
                <div className="whitespace-pre-wrap text-sm text-justify leading-relaxed">
                  {parse(cleanTranscriptHTML(summaryHTML))}
                </div>
              ) : (
                <p className="italic text-gray-500">
                  Belum ada materi ringkasan tersedia.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
