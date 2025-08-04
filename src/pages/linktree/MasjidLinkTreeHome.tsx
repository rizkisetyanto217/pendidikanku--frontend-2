import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "@/lib/axios";
import { useResponsive } from "@/hooks/isResponsive";
import { LocationEditIcon, Share } from "lucide-react";
import { useState } from "react";
import { useRef, useEffect } from "react";
import useHtmlDarkMode from "@/hooks/userHTMLDarkMode";
import { colors } from "@/constants/colorsThema";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PublicNavbar from "@/components/common/public/PublicNavbar";
import BottomNavbar from "@/components/common/public/ButtonNavbar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import BorderLine from "@/components/common/main/Border";
import SharePopover from "@/components/common/public/SharePopover";
import CartLink from "@/components/common/main/CardLink";
import FormattedDate from "@/constants/formattedDate";
import SholatScheduleCard from "@/components/pages/home/SholatSchedule";
import SocialMediaModal from "@/components/pages/home/SocialMediaModal";
import ShimmerImage from "@/components/common/main/ShimmerImage";

const currentUrl = window.location.href;

// Types
interface Masjid {
  masjid_id: string;
  masjid_name: string;
  masjid_bio_short?: string;
  masjid_location?: string;
  masjid_image_url?: string;
  masjid_google_maps_url?: string;
  masjid_slug: string;
  masjid_instagram_url?: string;
  masjid_whatsapp_url?: string;
  masjid_youtube_url?: string;
  masjid_donation_link?: string;
  masjid_created_at: string;
}

interface Kajian {
  lecture_session_id: string;
  lecture_session_title: string;
  lecture_session_image_url: string;
  lecture_session_teacher_name: string;
  lecture_session_place: string;
  lecture_session_start_time: string;
}

export default function PublicLinktree() {
  const navigate = useNavigate();
  const { slug } = useParams();
  const { isDesktop } = useResponsive();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const { isDark } = useHtmlDarkMode();
  const themeColors = isDark ? colors.dark : colors.light;

  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  const [searchParams] = useSearchParams();
  const cacheKey = searchParams.get("k") || "default";

  const sliderRef = useRef<HTMLDivElement>(null);

  const { data: user, isLoading: loadingUser } = useCurrentUser();
  const isLoggedIn = !!user;
  const [showSocialModal, setShowSocialModal] = useState(false);

  const scrollLeft = () => {
    sliderRef.current?.scrollBy({ left: -300, behavior: "smooth" });

    setTimeout(() => {
      updateArrowVisibility();
    }, 50); // delay untuk memastikan scrollLeft ter-update
  };

  const scrollRight = () => {
    sliderRef.current?.scrollBy({ left: 300, behavior: "smooth" });

    setTimeout(() => {
      updateArrowVisibility();
    }, 50); // delay untuk memastikan scrollLeft ter-update
  };

  const { data: masjidData, isLoading: loadingMasjid } = useQuery<Masjid>({
    queryKey: ["masjid", slug],
    queryFn: async () => {
      const res = await axios.get(`/public/masjids/${slug}`);
      return res.data?.data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const { data: kajianList, isLoading: loadingKajian } = useQuery<Kajian[]>({
    queryKey: ["kajianListBySlug", slug, cacheKey],
    queryFn: async () => {
      const res = await axios.get(
        `/public/lecture-sessions-u/mendatang/${slug}`
      );
      return res.data?.data?.slice(0, 3) ?? [];
    },
    enabled: !!slug,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const handleShareClick = () => {
    if (!masjidData) return;
    if (isDesktop && navigator.share) {
      navigator.share({ title: masjidData.masjid_name, url: currentUrl });
    } else {
      setShowShareMenu(true);
    }
  };

  const updateArrowVisibility = () => {
    const el = sliderRef.current;
    if (!el) return;

    const atStart = Math.floor(el.scrollLeft) <= 0;
    const atEnd = Math.ceil(el.scrollLeft + el.clientWidth) >= el.scrollWidth;

    setShowLeft(!atStart);
    setShowRight(!atEnd);
  };

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;

    updateArrowVisibility(); // initial check
    el.addEventListener("scroll", updateArrowVisibility);

    return () => el.removeEventListener("scroll", updateArrowVisibility);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(updateArrowVisibility, 100); // sedikit delay setelah render
    return () => clearTimeout(timeout);
  }, [kajianList]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node)
      ) {
        setShowShareMenu(false);
      }
    }
    if (showShareMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showShareMenu]);

  if (loadingMasjid || loadingKajian || loadingUser || !masjidData)
    return <div>Loading...</div>;

  // console.log("user", user);
  // console.log("isLoggedIn", isLoggedIn);

  // if (isDesktop) {
  return (
    <>
      {/* NAVBAR */}
      <PublicNavbar masjidName={masjidData.masjid_name} />

      <div className="w-full max-w-2xl mx-auto min-h-screen pb-28 overflow-auto bg-cover bg-no-repeat bg-center pt-16">
        <div className="p-4">
          <h2
            className="text-base font-semibold mb-4 mt-4"
            style={{ color: themeColors.black1 }}
          >
            Kajian Mendatang
          </h2>
          {/* Gambar Kajian */}
          <div className="relative">
            {kajianList && kajianList.length > 0 && (
              <div className="relative">
                {/* Tombol kiri */}
                {showLeft && (
                  <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 bg-opacity-70 hover:bg-opacity-100 p-2 rounded-full shadow"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}

                {/* Tombol kanan */}
                {showRight && (
                  <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 bg-opacity-70 hover:bg-opacity-100 p-2 rounded-full shadow"
                  >
                    <ChevronRight size={20} />
                  </button>
                )}

                <div className="overflow-hidden">
                  <div
                    ref={sliderRef}
                    className="flex overflow-x-auto no-scrollbar space-x-4 pr-4 snap-x scroll-smooth"
                  >
                    {kajianList.map((kajian, idx) => (
                      <div
                        key={idx}
                        onClick={() =>
                          navigate(
                            `/masjid/${slug}/jadwal-kajian/${kajian.lecture_session_id}`
                          )
                        }
                        className="flex-shrink-0 snap-start w-[320px] rounded-lg overflow-hidden shadow cursor-pointer hover:opacity-90 transition"
                        style={{ backgroundColor: themeColors.white1 }}
                      >
                        <ShimmerImage
                          src={kajian.lecture_session_image_url || ""}
                          alt={kajian.lecture_session_title}
                          className="w-full aspect-[3/4] rounded-lg"
                        />
                        <div className="p-3">
                          <h2
                            className="font-semibold text-sm truncate"
                            style={{ color: themeColors.black1 }}
                          >
                            {kajian.lecture_session_title}
                          </h2>
                          <p
                            className="text-xs"
                            style={{ color: themeColors.silver2 }}
                          >
                            {kajian.lecture_session_teacher_name} •{" "}
                            {kajian.lecture_session_start_time ? (
                              <FormattedDate
                                value={kajian.lecture_session_start_time}
                              />
                            ) : (
                              "-"
                            )}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: themeColors.silver4 }}
                          >
                            {kajian.lecture_session_place}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tambahan teks "Kajian Terbaru Lainnya" */}
                <div className="mt-4 text-right ">
                  <span
                    className="text-sm underline cursor-pointer hover:text-primary transition"
                    style={{ color: themeColors.quaternary }}
                    onClick={() => navigate(`/masjid/${slug}/jadwal-kajian`)}
                  >
                    Kajian Terbaru Lainnya
                  </span>
                </div>
              </div>
            )}
          </div>
          <BorderLine />
          <SholatScheduleCard location="DKI Jakarta" slug={slug || ""} />
          {/* --- SECTION: INFO MASJID --- */}
          <div className="mb-4 mt-4">
            <h1
              className="text-lg font-semibold"
              style={{ color: themeColors.black1 }}
            >
              {masjidData.masjid_name}
            </h1>
            <p
              className="text-base mt-2"
              style={{ color: themeColors.silver2 }}
            >
              Dikelola oleh DKM Masjid untuk ummat muslim
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(masjidData.masjid_location || "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm inline-flex flex-col gap-0.5 pb-2"
              style={{ color: themeColors.silver2 }}
            >
              <span className="inline-flex items-center gap-0.5">
                <span>{masjidData.masjid_location || "-"}</span>
              </span>
              <span className="underline text-xs mt-0.5">Alamat Masjid</span>
            </a>

            {/* <p
                className="text-sm italic mt-2"
                style={{ color: themeColors.silver4 }}
              >
                Bergabung pada{" "}
                <FormattedDate value={masjidData.masjid_created_at} fullMonth />
              </p> */}

            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-3">
                {masjidData.masjid_whatsapp_url && (
                  <a
                    href={masjidData.masjid_whatsapp_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ShimmerImage
                      src="/icons/whatsapp.svg"
                      alt="WhatsApp"
                      className="w-6 h-6"
                      shimmerClassName="rounded"
                    />
                  </a>
                )}
                {masjidData.masjid_instagram_url && (
                  <a
                    href={masjidData.masjid_instagram_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ShimmerImage
                      src="/icons/instagram.svg"
                      alt="Instagram"
                      className="w-6 h-6"
                      shimmerClassName="rounded"
                    />
                  </a>
                )}
                {masjidData.masjid_youtube_url && (
                  <a
                    href={masjidData.masjid_youtube_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ShimmerImage
                      src="/icons/youtube.svg"
                      alt="YouTube"
                      className="w-6 h-6"
                      shimmerClassName="rounded"
                    />
                  </a>
                )}
              </div>

              <button
                onClick={handleShareClick}
                className="flex items-center space-x-1 text-sm"
                style={{ color: themeColors.quaternary }}
              >
                <Share size={16} />
                <span>Bagikan</span>
              </button>
            </div>
          </div>
          <BorderLine />
          {/* --- SECTION: MENU UTAMA --- */}
          <div>
            <h2
              className="text-base font-semibold mb-2"
              style={{ color: themeColors.black1 }}
            >
              Menu Utama
            </h2>
            <div className="space-y-2 pt-2">
              <CartLink
                label="Profil Masjid"
                icon="📍"
                href={`/masjid/${masjidData.masjid_slug}/profil`}
              />
              <CartLink
                label="Jadwal Kajian"
                icon="📚"
                href={`/masjid/${masjidData.masjid_slug}/jadwal-kajian`}
              />
              <CartLink
                label="Grup Masjid & Sosial Media"
                icon="📚"
                onClick={() => setShowSocialModal(true)}
              />
              <CartLink
                label="Hubungi Kami"
                icon="🏛️"
                href={`/masjid/${masjidData.masjid_slug}/profil`}
                internal
              />
              <SocialMediaModal
                show={showSocialModal}
                onClose={() => setShowSocialModal(false)}
                data={{
                  instagram: "masjidbaitussalam",
                  whatsapp: "6281234567890",
                  youtube: "https://www.youtube.com/@masjidbaitussalam",
                  facebook: "masjidbaitussalam.id",
                  tiktok: "masjidbaitussalam",
                }}
              />

              {/* <LinkItem
                  label="Laporan Keuangan"
                  icon="📆"
                  href={`/masjid/${masjidData.masjid_slug}/keuangan`}
                  internal
                /> */}
              {/* <LinkItem
                  label="Jelajahi"
                  icon="📚"
                  href={`/masjid/${masjidData.masjid_slug}/soal-materi`}
                  internal
                /> */}
            </div>
          </div>
          {/* Bottom Navigation */}
          <BottomNavbar />
        </div>
      </div>
    </>
  );
  // }

  // return (
  //   <>
  //     {/* Navbar Atas */}
  //     <PublicNavbar masjidName={masjidData.masjid_name} />

  //     <div
  //       className="w-full min-h-screen flex items-center justify-center overflow-hidden"
  //       style={{
  //         backgroundColor: themeColors.white2,
  //       }}
  //     >
  //       <div
  //         className="max-w-4xl w-full grid md:grid-cols-2 gap-8 items-center p-6 rounded-xl shadow"
  //         style={{ backgroundColor: themeColors.white1 }}
  //       >
  //         {/* Gambar Kajian */}
  //         <div className="relative">
  //           {kajianList && kajianList.length > 0 && (
  //             <div className="relative">
  //               {/* Tombol kiri */}
  //               {showLeft && (
  //                 <button
  //                   onClick={scrollLeft}
  //                   className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 bg-opacity-70 hover:bg-opacity-100 p-2 rounded-full shadow"
  //                 >
  //                   <ChevronLeft size={20} />
  //                 </button>
  //               )}

  //               {/* Tombol kanan */}
  //               {showRight && (
  //                 <button
  //                   onClick={scrollRight}
  //                   className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 bg-opacity-70 hover:bg-opacity-100 p-2 rounded-full shadow"
  //                 >
  //                   <ChevronRight size={20} />
  //                 </button>
  //               )}

  //               <div className="w-full overflow-x-auto">
  //                 <div
  //                   ref={sliderRef}
  //                   className="flex space-x-4 snap-x scroll-smooth no-scrollbar"
  //                   style={{
  //                     minWidth: "fit-content",
  //                     maxWidth: "100%",
  //                   }}
  //                 >
  //                   {kajianList.map((kajian, idx) => (
  //                     <div
  //                       key={idx}
  //                       onClick={() =>
  //                         navigate(
  //                           `/masjid/${slug}/jadwal-kajian/${kajian.lecture_session_id}`
  //                         )
  //                       }
  //                       className="flex-shrink-0 snap-start w-[320px] rounded-lg overflow-hidden shadow cursor-pointer hover:opacity-90 transition"
  //                       style={{ backgroundColor: themeColors.white1 }}
  //                     >
  //                       <img
  //                         src={
  //                           kajian.lecture_session_image_url ||
  //                           "/assets/placeholder/lecture.png"
  //                         }
  //                         alt={kajian.lecture_session_title}
  //                         className="w-full aspect-[3/4] object-cover"
  //                       />
  //                       <div className="p-3">
  //                         <h2
  //                           className="font-semibold text-sm truncate"
  //                           style={{ color: themeColors.black1 }}
  //                         >
  //                           {kajian.lecture_session_title}
  //                         </h2>
  //                         <p
  //                           className="text-xs"
  //                           style={{ color: themeColors.silver2 }}
  //                         >
  //                           {kajian.lecture_session_teacher_name} •{" "}
  //                           {kajian.lecture_session_start_time ? (
  //                             <FormattedDate
  //                               value={kajian.lecture_session_start_time}
  //                             />
  //                           ) : (
  //                             "-"
  //                           )}
  //                         </p>
  //                         <p
  //                           className="text-xs"
  //                           style={{ color: themeColors.silver4 }}
  //                         >
  //                           {kajian.lecture_session_place}
  //                         </p>
  //                       </div>
  //                     </div>
  //                   ))}
  //                 </div>
  //               </div>

  //               {/* Tambahan teks "Kajian Terbaru Lainnya" */}
  //               <div className="mt-2 pr-4 text-right">
  //                 <span
  //                   className="text-sm underline cursor-pointer hover:text-primary transition"
  //                   style={{ color: themeColors.tertiary }}
  //                   onClick={() => navigate(`/masjid/${slug}/jadwal-kajian`)}
  //                 >
  //                   Kajian Terbaru Lainnya
  //                 </span>
  //               </div>
  //             </div>
  //           )}
  //         </div>

  //         {/* Masjid Info */}
  //         <div className="space-y-4">
  //           <div>
  //             <SholatScheduleCard location="DKI Jakarta" />{" "}
  //             <h1
  //               className="text-2xl font-semibold pb-2 mt-6"
  //               style={{ color: themeColors.black1 }}
  //             >
  //               {masjidData.masjid_name}
  //             </h1>
  //             <a
  //               href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(masjidData.masjid_location || "")}`}
  //               target="_blank"
  //               rel="noopener noreferrer"
  //               className="text-sm inline-flex flex-col gap-0.5 pb-2"
  //               style={{ color: themeColors.silver2 }}
  //             >
  //               <span className="inline-flex items-center gap-0.5">
  //                 <span>{masjidData.masjid_location || "-"}</span>
  //               </span>
  //               <span className="underline text-xs mt-0.5">Alamat Masjid</span>
  //             </a>
  //             <p
  //               className="text-xs italic pb-2"
  //               style={{ color: themeColors.silver4 }}
  //             >
  //               {masjidData.masjid_bio_short}
  //             </p>
  //           </div>

  //           <div className="flex items-center justify-between mt-2">
  //             <div className="flex items-center space-x-3">
  //               {masjidData.masjid_instagram_url && (
  //                 <a
  //                   href={masjidData.masjid_instagram_url}
  //                   target="_blank"
  //                   rel="noopener noreferrer"
  //                 >
  //                   <img
  //                     src="/icons/instagram.svg"
  //                     alt="IG"
  //                     className="w-6 h-6"
  //                   />
  //                 </a>
  //               )}
  //               {masjidData.masjid_youtube_url && (
  //                 <a
  //                   href={masjidData.masjid_youtube_url}
  //                   target="_blank"
  //                   rel="noopener noreferrer"
  //                 >
  //                   <img
  //                     src="/icons/youtube.svg"
  //                     alt="YT"
  //                     className="w-6 h-6"
  //                   />
  //                 </a>
  //               )}
  //               {masjidData.masjid_whatsapp_url && (
  //                 <a
  //                   href={masjidData.masjid_whatsapp_url}
  //                   target="_blank"
  //                   rel="noopener noreferrer"
  //                 >
  //                   <img
  //                     src="/icons/whatsapp.svg"
  //                     alt="WA"
  //                     className="w-6 h-6"
  //                   />
  //                 </a>
  //               )}
  //             </div>

  //             <SharePopover
  //               title={`Profil Masjid ${masjidData.masjid_name}`}
  //               url={window.location.href}
  //               forceCustom // agar selalu tampil popover versi kamu
  //             />
  //           </div>

  //           <div className="space-y-2 pt-2">
  //             <CartLink
  //               label="Profil Masjid"
  //               icon="📍"
  //               href={`/masjid/${masjidData.masjid_slug}/profil`}
  //             />
  //             <CartLink
  //               label="Jadwal Kajian"
  //               icon="📚"
  //               href={`/masjid/${masjidData.masjid_slug}/jadwal-kajian`}
  //             />
  //             <CartLink
  //               label="Grup Masjid & Sosial Media"
  //               icon="📚"
  //               onClick={() => setShowSocialModal(true)}
  //             />
  //             <CartLink
  //               label="Hubungi Kami"
  //               icon="📞"
  //               href={`https://wa.me/${masjidData.masjid_whatsapp_url}`}
  //               internal={false}
  //             />
  //             <SocialMediaModal
  //               show={showSocialModal}
  //               onClose={() => setShowSocialModal(false)}
  //               data={{
  //                 instagram: "masjidbaitussalam",
  //                 whatsapp: "6281234567890",
  //                 youtube: "https://www.youtube.com/@masjidbaitussalam",
  //                 facebook: "masjidbaitussalam.id",
  //                 tiktok: "masjidbaitussalam",
  //               }}
  //             />

  //             {/* <LinkItem
  //                 label="Laporan Keuangan"
  //                 icon="📆"
  //                 href={`/masjid/${masjidData.masjid_slug}/keuangan`}
  //                 internal
  //               /> */}
  //             {/* <LinkItem
  //                 label="Jelajahi"
  //                 icon="📚"
  //                 href={`/masjid/${masjidData.masjid_slug}/soal-materi`}
  //                 internal
  //               /> */}
  //           </div>

  //           {/* <button
  //             onClick={() =>
  //               navigate(`/masjid/${masjidData.masjid_slug}/donasi`)
  //             }
  //             className="block w-full text-center py-3 rounded font-bold"
  //             style={{
  //               backgroundColor: themeColors.primary,
  //               color: themeColors.white1,
  //             }}
  //           >
  //             Donasi
  //           </button> */}
  //         </div>
  //       </div>
  //     </div>

  //     {/* Bottom navigation */}
  //     <BottomNavbar hideOnScroll />
  //   </>
  // );
}
