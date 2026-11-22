import rss from "@astrojs/rss";
import { SITE } from "../config";
import { getProjects } from "../projects";

export async function GET() {
  const projects = await getProjects();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: SITE.url,
    items: projects.map((p) => ({
      title: p.data.title,
      description: p.data.subtitle,
      link: `/projects/${p.id}`,
      pubDate: p.data.date,
    })),
  });
}
