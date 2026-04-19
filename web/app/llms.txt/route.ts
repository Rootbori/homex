import { NextResponse } from "next/server";
import { locales } from "@/lib/i18n/config";
import { absoluteUrl, siteConfig } from "@/lib/site";

export function GET() {
  const publicPages = locales.flatMap((locale) => {
    const ucLocale = locale.toUpperCase();
    return [
      `- Home (${ucLocale}): ${absoluteUrl("/" + locale)}`,
      `- Search technicians (${ucLocale}): ${absoluteUrl("/" + locale + "/search")}`,
    ];
  });

  const body = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.shortDescription}`,
    "",
    "## Public Pages",
    ...publicPages,
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
