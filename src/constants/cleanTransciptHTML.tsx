import { decode } from "html-entities";

export default function cleanTranscriptHTML(html: string): string {
  if (!html) return "";

  let decoded = decode(html);

  // Hapus atribut data-* dan style
  decoded = decoded.replace(/(data-start|data-end|style)="[^"]*"/g, "");

  // Ganti <h2>, <h3> → <p>
  decoded = decoded.replace(/<h2[^>]*>/g, "<p>");
  decoded = decoded.replace(/<\/h2>/g, "</p>");
  decoded = decoded.replace(/<h3[^>]*>/g, "<p>");
  decoded = decoded.replace(/<\/h3>/g, "</p>");

  // Hapus <br />
  decoded = decoded.replace(/<br\s*\/?>/gi, "");

  // 🔁 Bersihkan <p> dalam <p>
  while (/<p>\s*<p>(.*?)<\/p>\s*<\/p>/gis.test(decoded)) {
    decoded = decoded.replace(/<p>\s*<p>(.*?)<\/p>\s*<\/p>/gis, "<p>$1</p>");
  }

  // 🔁 Bersihkan <li> yang mengandung <p>
  while (/<li[^>]*>\s*<p[^>]*>(.*?)<\/p>\s*<\/li>/gis.test(decoded)) {
    decoded = decoded.replace(
      /<li[^>]*>\s*<p[^>]*>(.*?)<\/p>\s*<\/li>/gis,
      "<li>$1</li>"
    );
  }

  // 🔁 Bersihkan <li> yang mengandung <p><strong>...</strong></p> (opsional tambahan)
  while (
    /<li[^>]*>\s*<p[^>]*>(<strong[^>]*>.*?<\/strong>.*?)<\/p>\s*<\/li>/gis.test(
      decoded
    )
  ) {
    decoded = decoded.replace(
      /<li[^>]*>\s*<p[^>]*>(<strong[^>]*>.*?<\/strong>.*?)<\/p>\s*<\/li>/gis,
      "<li>$1</li>"
    );
  }

  // <p> bungkus <ul>/<ol>/<li>
  decoded = decoded.replace(/<p>\s*(<(ul|ol)[^>]*>.*?<\/\2>)\s*<\/p>/gis, "$1");
  decoded = decoded.replace(/<p>\s*(<li[^>]*>.*?<\/li>)\s*<\/p>/gis, "$1");

  // Hapus tag kosong
  decoded = decoded.replace(/<p>\s*<\/p>/gi, "");
  decoded = decoded.replace(/<li>\s*<\/li>/gi, "");
  decoded = decoded.replace(/<(ul|ol)>\s*<\/\1>/gi, "");

  return decoded.trim();
}
