// utils/auth.ts
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  masjid_admin_ids?: string[];
}

export function getMasjidIdFromSession(): string | null {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) return null;

    const decoded = jwtDecode<TokenPayload>(token);
    return decoded.masjid_admin_ids?.[0] ?? null;
  } catch (err) {
    return null;
  }
}
