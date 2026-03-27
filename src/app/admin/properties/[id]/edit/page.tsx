import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Property from "@/models/Property";
import PropertyForm from "@/components/admin/PropertyForm";
import type { PropertyCreateData } from "@/lib/validators";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await dbConnect();

  const property = await Property.findById(id).lean();
  if (!property) notFound();

  const defaultValues: Partial<PropertyCreateData> = {
    title: property.title,
    description: property.description,
    price: property.price,
    currency: (property.currency as "USD" | "EUR") ?? "USD",
    category: property.category as PropertyCreateData["category"],
    propertyGroup: property.propertyGroup as PropertyCreateData["propertyGroup"],
    propertyType: property.propertyType ?? undefined,
    status: property.status as PropertyCreateData["status"],
    country: property.country,
    city: property.city,
    district: property.district,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    parkings: property.parkings,
    areaSqm: property.areaSqm,
    yearBuilt: property.yearBuilt,
    view: property.view,
    features: property.features ?? [],
    agentId: property.agentId,
    isFeatured: property.isFeatured,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Property</h1>
      <PropertyForm defaultValues={defaultValues} propertyId={id} />
    </div>
  );
}
