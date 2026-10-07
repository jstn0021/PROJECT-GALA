import { NextResponse } from "next/server";
import { createTrip, listTrips } from "../../../lib/tripsStore";

export const dynamic = "force-dynamic";

async function getCurrentUser() {
  // TODO: palitan ng totoong auth. Pansamantala, hardcoded.
  return { id: 1 };
}

const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;
// Hindi tayo nagtitiwala sa galing sa browser, kaya chine-check ulit dito
function validate(body) {
  const errors = {};

  const destination = typeof body.destination === "string" ? body.destination.trim() : "";
  if (!destination) errors.destination = "Destination is required.";
  else if (destination.length > 150) errors.destination = "Destination is too long.";

  if (!DATE_FORMAT.test(body.startDate ?? "")) errors.startDate = "Start date must be YYYY-MM-DD.";
  if (!DATE_FORMAT.test(body.endDate ?? "")) errors.endDate = "End date must be YYYY-MM-DD.";
  else if (!errors.startDate && body.endDate < body.startDate) {
    errors.endDate = "End date can't be before the start date.";
  }

  const budget = Number(body.budget ?? 0);
  if (!Number.isFinite(budget) || budget < 0) errors.budget = "Budget must be 0 or more.";

  const toStrings = (list, max) =>
    Array.isArray(list)
      ? list.filter((x) => typeof x === "string" && x.trim() !== "").map((x) => x.trim()).slice(0, max)
      : [];

  const notes = typeof body.notes === "string" ? body.notes.slice(0, 2000) : "";

  return {
    errors,
    data: {
      title: destination,
      destination,
      startDate: body.startDate,
      endDate: body.endDate,
      activities: toStrings(body.activities, 50),
      notes,
      budget,
      budgetCategories: toStrings(body.budgetCategories, 20),
      template: typeof body.template === "string" ? body.template.slice(0, 30) : "Blank",
    },
  };
}

// POST /api/trips: gumawa ng bagong plan
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const { errors, data } = validate(body);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Ang server ang gumagawa ng id, hindi ang galing sa browser
    const trip = await createTrip(user.id, data);
    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    console.error("POST /api/trips failed:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// GET /api/trips: listahan ng plans ng user (pang-test at para sa My plans page)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }
    const trips = await listTrips(user.id);
    return NextResponse.json({ trips });
  } catch (error) {
    console.error("GET /api/trips failed:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}