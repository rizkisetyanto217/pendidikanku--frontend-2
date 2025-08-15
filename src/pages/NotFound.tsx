import React, { useState, useEffect } from "react";
import { Home, Search, ArrowLeft, Zap, Star } from "lucide-react";

export default function NotFound() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 3000);

    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      clearInterval(glitchInterval);
    };
  }, []);

  const floatingElements = Array.from({ length: 6 }, (_, i) => (
    <div
      key={i}
      className={`absolute w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-bounce opacity-70`}
      style={{
        left: `${20 + i * 15}%`,
        top: `${30 + (i % 3) * 20}%`,
        animationDelay: `${i * 0.5}s`,
        animationDuration: "3s",
      }}
    />
  ));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Background animated gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 opacity-30 animate-pulse"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(139, 92, 246, 0.3), transparent 50%)`,
        }}
      />

      {/* Floating elements */}
      {floatingElements}

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Main content */}
      <div className="text-center z-10 max-w-2xl mx-auto px-6">
        {/* 404 Number with glitch effect */}
        <div className="relative mb-8">
          <h1
            className={`text-9xl md:text-[12rem] font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 bg-clip-text text-transparent select-none ${glitchActive ? "animate-pulse" : ""}`}
          >
            404
          </h1>
          {glitchActive && (
            <>
              <h1 className="absolute top-0 left-0 text-9xl md:text-[12rem] font-black text-red-500 opacity-70 animate-ping">
                404
              </h1>
              <h1 className="absolute top-1 left-1 text-9xl md:text-[12rem] font-black text-cyan-400 opacity-50">
                404
              </h1>
            </>
          )}
        </div>

        {/* Error message */}
        <div className="mb-8 space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 animate-fadeIn">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-lg text-gray-300 max-w-md mx-auto leading-relaxed">
            Sepertinya Anda tersesat di ruang digital. Jangan khawatir, mari
            kita bawa Anda kembali ke jalur yang benar!
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.history) {
                window.history.back();
              }
            }}
            className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
          >
            <ArrowLeft className="w-5 h-5 group-hover:animate-bounce" />
            Kembali
          </button>

          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/";
              }
            }}
            className="group flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-purple-400 text-purple-400 font-semibold rounded-full hover:bg-purple-400 hover:text-white transition-all duration-300 transform hover:scale-105"
          >
            <Home className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            Beranda
          </button>

          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = "/search";
              }
            }}
            className="group flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-pink-400 text-pink-400 font-semibold rounded-full hover:bg-pink-400 hover:text-white transition-all duration-300 transform hover:scale-105"
          >
            <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Cari
          </button>
        </div>

        {/* Fun interactive element */}
        <div className="mt-12 flex justify-center items-center gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Zap className="w-4 h-4 animate-pulse text-yellow-400" />
            <span className="text-sm">
              Tip: Gunakan navigasi untuk menjelajah
            </span>
          </div>
        </div>

        {/* Decorative stars */}
        <div className="mt-8 flex justify-center gap-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 text-purple-400 opacity-60 animate-pulse`}
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-900/50 to-transparent" />
    </div>
  );
}
