import Credit from "../db/models/credit.js";

// Plain objects lang (safe ipasa sa client components)
export async function getCredits() {
  try {
    const rows = await Credit.findAll({
      order: [
        ["sortOrder", "ASC"],
        ["id", "ASC"],
      ],
    });
    return rows.map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
      description: c.description || "",
      photoUrl: c.photoUrl || null,
      photoX: c.photoX ?? 50,
      photoY: c.photoY ?? 50,
    }));
  } catch {
    return []; // wala pang table / may error
  }
}
