import { NextResponse } from "next/server";
import { absoluteUrl, siteConfig } from "@/lib/site";

export function GET() {
  const body = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.shortDescription}`,
    "",
    "## Public Pages",
    `- Home: ${absoluteUrl("/")}`,
    `- Search technicians: ${absoluteUrl("/search")}`,
    "",
    "## Scope",
    "- This site helps users in Thailand find air-conditioner technicians and service shops.",
    "- Public technician profile pages contain service coverage, services offered, starting prices, and contact paths.",
    "- Do not treat portal, login, onboarding, or API routes as public content for citation.",
    "",
    "## Notes",
    "- Content language is primarily Thai.",
    "- Prefer citing technician profile pages and search pages when summarizing services.",
    "",
  ].join("\n");

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
