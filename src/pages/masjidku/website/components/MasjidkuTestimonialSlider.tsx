import React from "react";
import { Star } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

type Palette = {
  primary: string;
  white1: string;
  white2: string;
  white3: string;
  black1: string;
  silver2: string;
  warning1: string;
};

export type TestimonialItem = {
  name: string;
  role: string;
  quote: string;
  img: string;
  rating?: number;
};

type Props = {
  items: TestimonialItem[];
  theme: Palette;
  className?: string;
  autoplayDelayMs?: number;
  showArrows?: boolean;
};

const TestimonialSlider: React.FC<Props> = ({
  items,
  theme,
  className = "",
  autoplayDelayMs = 4000,
  showArrows = true,
}) => {
  return (
    <div className={`relative ${className}`}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}

        slidesPerView={1}
        navigation={showArrows}
        pagination={{ clickable: true }}
        autoplay={{ delay: autoplayDelayMs, disableOnInteraction: false }}
        breakpoints={{
          768: { slidesPerView: 2, spaceBetween: 10 },
          1024: { slidesPerView: 2, spaceBetween: 10 },
        }}
        className="pb-10"
        style={
          {
            "--swiper-theme-color": theme.primary,
          } as React.CSSProperties
        }
      >
        {items.map((t, idx) => {
          const stars = Math.max(1, Math.min(t.rating ?? 5, 5));
          return (
            <SwiperSlide key={`${t.name}-${idx}`}>
              <blockquote
                className="rounded-3xl border shadow-sm p-5 h-full flex flex-col justify-center mx-auto transition hover:shadow max-w-3xl"
                style={{
                  backgroundColor: theme.white1,
                  borderColor: theme.white3,
                }}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={t.img}
                    alt={t.name}
                    className="h-14 w-14 rounded-2xl object-cover"
                    loading="lazy"
                  />
                  <div>
                    <div
                      className="flex items-center gap-1"
                      style={{ color: theme.warning1 }}
                    >
                      {Array.from({ length: stars }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                    <p className="mt-2 text-sm" style={{ color: theme.black1 }}>
                      “{t.quote}”
                    </p>
                    <footer
                      className="mt-3 text-xs"
                      style={{ color: theme.silver2 }}
                    >
                      {t.name} • {t.role}
                    </footer>
                  </div>
                </div>
              </blockquote>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Override posisi arrow agar sejajar tengah */}
      {showArrows && (
        <style>
          {`
          .swiper-button-next,
          .swiper-button-prev {
            top: 50% !important;
            transform: translateY(-50%) !important;
            width: 40px;
            height: 40px;
            border-radius: 9999px;
            background: ${theme.white1};
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          }
          .swiper-button-next::after,
          .swiper-button-prev::after {
            font-size: 16px !important;
            color: ${theme.black1};
          }
        `}
        </style>
      )}
    </div>
  );
};

export default TestimonialSlider;
