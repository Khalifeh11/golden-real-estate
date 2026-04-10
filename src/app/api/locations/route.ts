import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";

export async function GET() {
  await dbConnect();

  const [countries, cities] = await Promise.all([
    Property.distinct("country", { status: { $ne: "INACTIVE" } }),
    Property.distinct("city", { status: { $ne: "INACTIVE" } }),
  ]);

  return NextResponse.json({
    countries: countries.filter(Boolean).sort(),
    cities: cities.filter(Boolean).sort(),
  });
}
