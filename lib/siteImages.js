import SiteImage from "../db/models/siteImage.js";

export async function getSiteImages() {
  try {
    const rows = await SiteImage.findAll();
    return Object.fromEntries(rows.map((r) => [r.slot, r.url]));
  } catch {
    return {};
  }
}
