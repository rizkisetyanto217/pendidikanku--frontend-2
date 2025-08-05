import { useRef, useState } from "react";

interface ShimmerImageProps {
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  shimmerClassName?: string;
  onDoubleClick?: (e: React.MouseEvent | React.TouchEvent) => void; // ✅ dukung keduanya
}

export default function ShimmerImage({
  src,
  alt = "image",
  className,
  style,
  shimmerClassName,
  onDoubleClick,
}: ShimmerImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const lastTapRef = useRef<number | null>(null);
  const doubleTapDelay = 300; // ms

  const handleTouchEnd = (e: React.TouchEvent<HTMLImageElement>) => {
    const now = Date.now();
    if (lastTapRef.current && now - lastTapRef.current < doubleTapDelay) {
      e.preventDefault();
      onDoubleClick?.(e); // ✅ trigger
      lastTapRef.current = null;
    } else {
      lastTapRef.current = now;
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {/* Shimmer Placeholder */}
      {!loaded && !error && (
        <div
          className={`absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700 ${shimmerClassName}`}
        />
      )}

      {/* Image */}
      {!error && src && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          onDoubleClick={(e) => {
            e.preventDefault();
            onDoubleClick?.(e);
          }}
          onTouchEnd={handleTouchEnd} // ✅ mobile double tap
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}
