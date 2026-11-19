import { siteConfig, type SiteLang } from "@/src/config/site";

import { en, type Dictionary, type I18nKey } from "./en";
import { ja_JP } from "./ja_JP";
import { zh_CN } from "./zh_CN";

export const dictionaries: Record<SiteLang, Dictionary> = { zh_CN, en, ja_JP };

export const htmlLang: Record<SiteLang, string> = {
  zh_CN: "zh-CN",
  en: "en",
  ja_JP: "ja-JP",
};

const dictionary = dictionaries[siteConfig.lang];

export function t(
  key: I18nKey,
  values?: Record<string, string | number>,
): string {
  const template = dictionary[key] ?? en[key];
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}

export const lang = siteConfig.lang;
export const currentHtmlLang = htmlLang[siteConfig.lang];

export const dateFormat = new Intl.DateTimeFormat(currentHtmlLang, {
  dateStyle: "long",
  timeZone: siteConfig.timezone,
});

export const shortDateFormat = new Intl.DateTimeFormat(currentHtmlLang, {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: siteConfig.timezone,
});

export const relativeFormat = new Intl.RelativeTimeFormat(currentHtmlLang, {
  numeric: "auto",
});

export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

export function formatDateIso(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: siteConfig.timezone,
  }).formatToParts(date);
  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export type { I18nKey };
