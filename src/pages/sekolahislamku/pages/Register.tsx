import React from "react";
import { ModalRegister } from "./ModalRegister";

export default function PendaftaranPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Pendaftaran Peserta Baru
        </h1>
        <p className="mt-2 text-slate-600">
          Silakan klik tombol di bawah untuk memulai proses pendaftaran.
        </p>
        <div className="mt-6">
          <ModalRegister
            slug="murid" // opsional; kalau route kamu sudah di dalam /:slug maka bisa dihapus
            onSubmit={async (payload) => {
              // contoh sambung API
              // await fetch(`/api/${payload.angkatan}/register`, { method: "POST", body: JSON.stringify(payload) });
              console.log("submit payload:", payload);
            }}
          />
        </div>
      </div>
    </div>
  );
}
