import { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://codeelevate.com";

  // Static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/internships`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/how-it-works`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/verify`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // Dynamic routes (Internships)
  try {
    const supabase = createAdminClient();
    const { data: internships } = await supabase
      .from("internships")
      .select("slug, updated_at")
      .eq("status", "PUBLISHED");

    if (internships) {
      const dynamicRoutes = internships.map((internship) => ({
        url: `${siteUrl}/internships/${internship.slug}`,
        lastModified: new Date(internship.updated_at || new Date()),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
      routes.push(...dynamicRoutes);
    }
  } catch (error) {
    console.error("Sitemap generation error:", error);
  }

  return routes;
}
