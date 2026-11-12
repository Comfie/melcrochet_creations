import { PORTFOLIO, type PortfolioPhoto } from "@/lib/portfolio";

export type PreparedPhoto = PortfolioPhoto & { publicId: string; group: string; view: string };

function prepared(photo: PortfolioPhoto, group: string, view: string): PreparedPhoto {
  const match = photo.url.match(/\/image\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
  if (!match) throw new Error(`Prepared photo needs an original Cloudinary URL: ${photo.name}`);
  return { ...photo, publicId: match[1], group, view };
}

/** Permanent edited assets shared by the public website and product-photo picker. */
export const PREPARED_PHOTOS: PreparedPhoto[] = [
  prepared(PORTFOLIO.redCardiganAlternate, "Red tie-front cardigan", "Flat lay — alternate"),
  prepared(PORTFOLIO.redCardiganFlatlay, "Red tie-front cardigan", "Flat lay — front"),
  prepared(PORTFOLIO.colourblockDress, "Orange and cream dress", "Mannequin front"),
  prepared(PORTFOLIO.floralDressBack, "Orange floral dress", "Mannequin back"),
  prepared(PORTFOLIO.floralDressWorn, "Orange floral dress", "On model — original photo"),
  prepared(PORTFOLIO.pinkBikini, "Pink crochet bikini", "Flat lay"),
  prepared(PORTFOLIO.floralDress, "Orange floral dress", "Mannequin front"),
  prepared(PORTFOLIO.pinkBag, "Pink chunky handbag", "Front"),
  prepared(PORTFOLIO.blackHat, "Black bucket hat", "Front"),
  prepared(PORTFOLIO.greyHat, "Grey bucket hat", "Side"),
  prepared(PORTFOLIO.twoToneHat, "Grey and black bucket hat", "Front"),
  prepared(PORTFOLIO.greyScarf, "Grey beanie and scarf set", "Front"),
  prepared(PORTFOLIO.navyScarf, "Navy beanie and scarf set", "Front"),
];

const permanentIds = new Set(PREPARED_PHOTOS.map((photo) => photo.publicId));
export function isPreparedPhoto(publicId: string): boolean {
  return permanentIds.has(publicId);
}
