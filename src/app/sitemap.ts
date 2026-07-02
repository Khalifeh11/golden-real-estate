import type { MetadataRoute } from "next";
import dbConnect from "@/lib/mongodb";
import PropertyModel from "@/models/Property";
import AgentModel from "@/models/Agent";
import { MIN_LISTING_DATE } from "@/lib/constants";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://goldenlandrealestate.net";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await dbConnect();

  const [properties, agents] = await Promise.all([
    PropertyModel.find({
      status: "ACTIVE",
      trash: { $ne: true },
      createdAt: { $gte: MIN_LISTING_DATE },
    })
      .select("slug updatedAt")
      .lean(),
    AgentModel.find({ trash: { $ne: true } }).select("_id updatedAt").lean(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/properties`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/agents`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const propertyRoutes: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${BASE_URL}/properties/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const agentRoutes: MetadataRoute.Sitemap = agents.map((a) => ({
    url: `${BASE_URL}/agents/${a._id}`,
    lastModified: a.updatedAt,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...propertyRoutes, ...agentRoutes];
}
