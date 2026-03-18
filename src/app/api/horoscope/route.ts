import { NextResponse } from "next/server";
import { DOMParser } from "@xmldom/xmldom";

export const runtime = "nodejs";

const ASTROLOGY_RSS = "https://www.astrology.com/horoscopes/daily-horoscope.rss";

type HoroscopeResult = {
  description_ru: string;
  mood_ru: string;
  lucky_number: string;
};

const cache = new Map<string, { expires: number; data: HoroscopeResult }>();

function ymd(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function cacheKey(sign: string, d = new Date()) {
  return `${sign}:${ymd(d)}`;
}

async function translateEnToRu(text: string) {
  if (!text) return "";

  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "en");
  url.searchParams.set("tl", "ru");
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return text;
    const data = (await res.json()) as any;
    const chunks: any[] = Array.isArray(data?.[0]) ? data[0] : [];
    const translated = chunks.map((c) => c?.[0]).filter(Boolean).join(" ");
    return translated || text;
  } catch {
    return text;
  }
}

function parseRssForSign(xml: string, signTitleEn: string): string | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");
  const items = Array.from(doc.getElementsByTagName("item"));

  const norm = (s: string) => s.toLowerCase().trim();
  const target = norm(signTitleEn);

  for (const item of items) {
    const titleNode = item.getElementsByTagName("title")?.[0];
    const descNode = item.getElementsByTagName("description")?.[0];
    const title = titleNode?.textContent || "";
    const description = descNode?.textContent || "";

    if (!title || !description) continue;
    // Astrology.com: заголовок обычно вида "Aries Daily Horoscope"
    if (!norm(title).startsWith(target)) continue;

    // description часто в HTML, убираем теги
    let clean = description.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

    // убираем маркетинговый хвост "More horoscopes!... Today's Free Reading..."
    clean = clean
      .replace(/More horoscopes[\s\S]*$/i, "")
      .replace(/Today'?s Free Reading[\s\S]*$/i, "")
      .trim();

    // на всякий случай убираем любой длинный конечный английский хвост,
    // который не содержит русских букв (как обрезанный "You've certainly got...")
    clean = clean.replace(/[A-Za-z][A-Za-z0-9\s,'’"!.?;-]{10,}$/g, "").trim();

    return clean || null;
  }

  return null;
}

function fallbackRu(): HoroscopeResult {
  return {
    description_ru:
      "Источник гороскопа временно недоступен. Совет на сегодня: действуй мягко, но последовательно — одно маленькое дело важнее десяти планов.",
    mood_ru: "Спокойное",
    lucky_number: "7",
  };
}

const allowedSigns = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
] as const;

async function getHoroscope(sign: string) {
  const key = cacheKey(sign);
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return { sign, source: "cache" as const, data: cached.data };
  }

  const rssRes = await fetch(ASTROLOGY_RSS, { cache: "no-store" });
  if (!rssRes.ok) {
    const data = fallbackRu();
    cache.set(key, { expires: Date.now() + 24 * 60 * 60 * 1000, data });
    return { sign, source: "fallback" as const, data };
  }

  const xml = await rssRes.text();
  const descriptionEn = parseRssForSign(xml, sign.charAt(0).toUpperCase() + sign.slice(1));
  if (!descriptionEn) {
    const data = fallbackRu();
    cache.set(key, { expires: Date.now() + 24 * 60 * 60 * 1000, data });
    return { sign, source: "fallback" as const, data };
  }

  const description_ru = await translateEnToRu(descriptionEn);
  const result: HoroscopeResult = {
    description_ru,
    mood_ru: "",
    lucky_number: "",
  };

  cache.set(key, { expires: Date.now() + 24 * 60 * 60 * 1000, data: result });
  return { sign, source: "rss" as const, data: result };
}

function okJson(payload: unknown) {
  return NextResponse.json(payload, {
    headers: {
      // API возвращает “гороскоп дня”: можно кэшировать на CDN/прокси.
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
    },
  });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sign = String(url.searchParams.get("sign") || "").toLowerCase();

    if (!allowedSigns.includes(sign as (typeof allowedSigns)[number])) {
      return NextResponse.json({ error: "invalid_sign" }, { status: 400 });
    }

    const res = await getHoroscope(sign);
    return okJson({ sign: res.sign, source: res.source, ...res.data, date: ymd() });
  } catch {
    const data = fallbackRu();
    return okJson({ sign: "unknown", source: "fallback", ...data, date: ymd() });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { sign?: string };
    const sign = String(body?.sign || "").toLowerCase();

    if (!allowedSigns.includes(sign as (typeof allowedSigns)[number])) {
      return NextResponse.json({ error: "invalid_sign" }, { status: 400 });
    }

    const res = await getHoroscope(sign);
    return okJson({ sign: res.sign, source: res.source, ...res.data, date: ymd() });
  } catch {
    const data = fallbackRu();
    return okJson({ sign: "unknown", source: "fallback", ...data, date: ymd() });
  }
}

