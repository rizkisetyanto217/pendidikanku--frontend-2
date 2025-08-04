import { useState } from "react";

interface ShimmerImageProps {
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  shimmerClassName?: string; // optional custom shimmer style
}

export default function ShimmerImage({
  src,
  alt,
  className,
  style,
  shimmerClassName,
}: ShimmerImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ ...style }}
    >
      {/* Shimmer Placeholder */}
      {!loaded && !error && (
        <div
          className={`absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${shimmerClassName}`}
        />
      )}

      {/* Image (hidden until loaded) */}
      {!error && src && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </div>
  );
}