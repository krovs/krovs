import { getCollection } from "astro:content";

/** Projects, newest first. */
export async function getProjects() {
  return (await getCollection("projects")).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** "Ansible, Docker" -> ["Ansible", "Docker"] */
export function stackList(stack?: string): string[] {
  return stack?.split(",").map((technology) => technology.trim()).filter(Boolean) ?? [];
}
