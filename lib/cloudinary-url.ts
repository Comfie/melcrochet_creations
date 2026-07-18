/**
 * Pure Cloudinary URL transformation helpers — no SDK, no secrets, safe to
 * import from client components. `imageUrl`/`gallery[].url` are always full
 * secure_url strings from the upload API (see lib/cloudinary.ts), so this
 * only needs to inject a transformation segment after "/upload/".
 */
type Preset = "card" | "thumb" | "detail" | "og" | "blur";

const PRESETS: Record<Preset, string> = {
  card: "f_auto,q_auto,c_fill,ar_1:1,w_600",
  thumb: "f_auto,q_auto,c_fill,ar_1:1,w_150",
  detail: "f_auto,q_auto,w_1200",
  og: "f_auto,q_auto,c_fill,w_1200,h_630",
  blur: "e_blur:1000,q_1,w_40,f_auto",
};

export function cld(url: string, preset: Preset): string {
  if (!url.includes("/upload/")) return url;
  return url.replace(/\/upload\/(?:(?!v\d+\/)[^/]+\/)?/, `/upload/${PRESETS[preset]}/`);
}

export const IMG_SIZES = {
  hero: "100vw",
  card: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px",
  detail: "(max-width: 768px) 100vw, 600px",
  thumb: "80px",
} as const;
