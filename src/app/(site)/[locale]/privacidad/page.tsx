import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/legal-page";
import { PRIVACIDAD } from "@/content/legal";
import { isLocale, pick, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  return { ...pageMetadata(locale, "/privacidad", pick(PRIVACIDAD.title, locale), pick(PRIVACIDAD.intro, locale)), robots: { index: false } };
}

export default async function Page({ params }: Props) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  return <LegalPage doc={PRIVACIDAD} locale={locale} />;
}
