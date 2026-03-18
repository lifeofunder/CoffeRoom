"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { RotateCw } from "lucide-react";
import { InteractiveHero } from "@/components/ui/interactive-hero-backgrounds";

type MenuCat = "all" | "food" | "coffee" | "author" | "tea" | "dessert";

type MenuItem = {
  key: string;
  cat: Exclude<MenuCat, "all">;
  title: string;
  desc: string;
  img: string;
  isAstro?: boolean;
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function withBasePath(p: string) {
  if (!p.startsWith("/")) return `${BASE_PATH}/${p}`;
  return `${BASE_PATH}${p}`;
}

const MENU: MenuItem[] = [
  { key: "0", cat: "food", title: "Круасан с фасолью", desc: "Слоёная выпечка с фасолью.", img: withBasePath("/menu/0.png") },
  { key: "1", cat: "dessert", title: "Сырники с вареньем и сметаной", desc: "Подаются с вареньем и сметаной.", img: withBasePath("/menu/1.png") },
  {
    key: "2",
    cat: "food",
    title: "Поке с курицей",
    desc: "Паровой рис, куриная грудка, маринованная в соевом соусе и обжаренная в темпуре, бобы эдамаме, огурец, помидоры черри, зелёный лук, кунжут, соус сладкий чили.",
    img: withBasePath("/menu/2.png"),
  },
  { key: "3", cat: "food", title: "Цезарь с курицей", desc: "Салат айсберг, копчёное куриное филе, помидоры черри, фирменный соус Цезарь, гренки, сыр.", img: withBasePath("/menu/3.png") },
  { key: "4", cat: "dessert", title: "Блины с вареньем", desc: "Классические блины с вареньем.", img: withBasePath("/menu/4.png") },
  { key: "5", cat: "dessert", title: "Блины со сметаной", desc: "Классические блины со сметаной.", img: withBasePath("/menu/5.png") },
  { key: "6", cat: "food", title: "Блины с форелью", desc: "Блины классические с форелью и творожным сыром.", img: withBasePath("/menu/6.png") },
  { key: "7", cat: "food", title: "Каша овсяная", desc: "Подаётся с грецким орехом, голубикой и мёдом.", img: withBasePath("/menu/7.png") },
  { key: "8", cat: "food", title: "Каша рисовая", desc: "Подаётся с вишнёвым вареньем и лепестками миндаля.", img: withBasePath("/menu/8.png") },
  { key: "9", cat: "author", title: "Ореховый Сатурн", desc: "Раф с урбечем. Глубокий, структурный, с ореховой строгостью и внутренним теплом.", img: withBasePath("/menu/9.png"), isAstro: true },
  { key: "venus", cat: "author", title: "Сладкая сила Венеры", desc: "Малиновый латте. Нежный, уютный и чуть ностальгический.", img: withBasePath("/menu/venus.png"), isAstro: true },
  { key: "10", cat: "author", title: "Огненный Стрелец", desc: "Глинтвейн с пряностями. Теплый, щедрый и чуть дерзкий.", img: withBasePath("/menu/10.png"), isAstro: true },
  { key: "11", cat: "author", title: "Солнечный взрыв", desc: "Цитрусовый пунш. Яркий и бодрящий.", img: withBasePath("/menu/11.png") },
  { key: "12", cat: "tea", title: "Луна в Деве", desc: "Чай яблоко-шалфей. Уют, аромат и спокойствие.", img: withBasePath("/menu/12.png") },
  { key: "13", cat: "coffee", title: "Эспрессо", desc: "Классический крепкий кофе.", img: withBasePath("/menu/13.png") },
  { key: "14", cat: "coffee", title: "Американо", desc: "Эспрессо с добавлением горячей воды.", img: withBasePath("/menu/14.png") },
  { key: "15", cat: "coffee", title: "Капучино", desc: "Эспрессо с молочной пенкой.", img: withBasePath("/menu/15.png") },
  { key: "16", cat: "coffee", title: "Латте", desc: "Кофе с большим количеством молока.", img: withBasePath("/menu/16.png") },
  { key: "17", cat: "coffee", title: "Флэт уайт", desc: "Двойной эспрессо с микропенной молочной пенкой.", img: withBasePath("/menu/17.png") },
  { key: "18", cat: "author", title: "Бамбл с апельсиновым соком", desc: "Эспрессо и апельсиновый сок со льдом.", img: withBasePath("/menu/18.png") },
  { key: "19", cat: "coffee", title: "Раф Ваниль", desc: "Кофейный напиток со сливками и ванильным сиропом.", img: withBasePath("/menu/19.png") },
  { key: "20", cat: "coffee", title: "Раф Прага", desc: "Авторский раф с шоколадом и сливками.", img: withBasePath("/menu/20.png") },
  { key: "21", cat: "coffee", title: "Эспрессо-тоник", desc: "Эспрессо с тоником и льдом.", img: withBasePath("/menu/21.png") },
  { key: "22", cat: "dessert", title: "Аффогато черничное", desc: "Мороженое с горячим эспрессо и черничным соусом.", img: withBasePath("/menu/22.png") },
  { key: "23", cat: "dessert", title: "Какао", desc: "Горячий шоколадный напиток.", img: withBasePath("/menu/23.png") },
  { key: "24", cat: "tea", title: "Матча-латте", desc: "Напиток на основе зелёного чая матча и молока.", img: withBasePath("/menu/24.png") },
  { key: "25", cat: "dessert", title: "Бэйби Раф", desc: "Молочный напиток без кофе для детей.", img: withBasePath("/menu/25.png") },
  { key: "26", cat: "dessert", title: "Молочный коктейль", desc: "Классический молочный коктейль.", img: withBasePath("/menu/26.png") },
  { key: "27", cat: "tea", title: "Облепиховый", desc: "Сладкий чай с облепихой.", img: withBasePath("/menu/27.png") },
  { key: "28", cat: "tea", title: "Манго-гречиха", desc: "Сладкий чай с манго и гречишным чаем.", img: withBasePath("/menu/28.png") },
  { key: "29", cat: "dessert", title: "Крафтовое мороженое", desc: "Куки монстр / Малиновый чизкейк / Фисташка / Б-52 (18+) / Клубничная маргарита (18+).", img: withBasePath("/menu/29.png") },
  { key: "30", cat: "tea", title: "Чай", desc: "Чёрный / Лесные ягоды / Молочный улун / Сенча / Липовый / Гречишный.", img: withBasePath("/menu/30.png") },
];

export default function MenuPage() {
  const [menuCat, setMenuCat] = useState<MenuCat>("all");
  const filtered = useMemo(() => (menuCat === "all" ? MENU : MENU.filter((m) => m.cat === menuCat)), [menuCat]);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  return (
    <InteractiveHero
      showChrome={false}
      className="min-h-screen text-foreground"
      ballpitConfig={{
        seed: 777,
        count: 72,
        collisions: false,
        gravity: 0.22,
        friction: 0.998,
        minSize: 0.55,
        maxSize: 1.05,
        lightIntensity: 3.2,
        maxVelocity: 0.08,
      }}
    >
      <div className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/75 via-background/90 to-background/95" />

        <div className="relative z-10">
          <header className="mx-auto max-w-6xl px-4 pt-10">
            <div className="flex items-center justify-between gap-3">
              <Link href="/" className="font-mono text-xl font-black tracking-tight">
                КОФЕ<span className="text-primary">•</span>РУМ
              </Link>
              <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="rounded-full px-3 py-2 hover:text-foreground hover:bg-white/5 transition-colors">
                  Главная
                </Link>
                <Link href="/#contacts" className="rounded-full px-3 py-2 hover:text-foreground hover:bg-white/5 transition-colors">
                  Контакты
                </Link>
              </nav>
            </div>
          </header>

          <section className="mx-auto max-w-6xl px-4 pt-10 pb-16">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-4xl font-black tracking-tight">Меню</h1>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  ["all", "Всё меню"],
                  ["food", "Завтраки и еда"],
                  ["coffee", "Кофе"],
                  ["author", "Авторские и сезонные"],
                  ["tea", "Чай"],
                  ["dessert", "Десерты"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMenuCat(key as MenuCat)}
                    className="relative overflow-hidden rounded-full border border-white/15 bg-white/5 px-3 py-2 text-xs font-mono uppercase tracking-wide text-foreground/80 transition-colors transition-transform duration-200 hover:scale-[1.03] hover:bg-white/10"
                  >
                    {menuCat === key && (
                      <motion.div
                        layoutId="menu-liquid-pill"
                        transition={{
                          type: "spring",
                          stiffness: 220,
                          damping: 26,
                          mass: 0.6,
                        }}
                        className="absolute inset-0 rounded-full border border-white/40 bg-white/14 backdrop-blur-md shadow-[0_0_18px_rgba(255,255,255,0.2)_inset,0_0_20px_rgba(0,0,0,0.4)]"
                      >
                        <div className="pointer-events-none absolute -left-2 top-0 h-4 w-4 rounded-full bg-white/40 blur-[9px]" />
                        <div className="pointer-events-none absolute right-0 bottom-0 h-3 w-3 rounded-full bg-white/25 blur-[7px]" />
                      </motion.div>
                    )}
                    <span className="relative z-10">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filtered.map((m) => (
                <article
                  key={m.key}
                  className="k-card rounded-2xl"
                  data-flipped={flipped[m.key] ? "true" : "false"}
                  role="button"
                  tabIndex={0}
                  aria-pressed={Boolean(flipped[m.key])}
                  onClick={() => setFlipped((prev) => ({ ...prev, [m.key]: !prev[m.key] }))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setFlipped((prev) => ({ ...prev, [m.key]: !prev[m.key] }));
                    }
                  }}
                >
                  <div className="k-card-inner relative min-h-[250px]">
                    {/* mobile hint: tap to flip */}
                    <div className="sm:hidden pointer-events-none absolute bottom-3 right-3 z-10">
                      <div className="inline-flex items-center justify-center rounded-full border border-white/15 bg-black/30 backdrop-blur px-3 py-2">
                        <RotateCw className="h-4 w-4 text-white/85" />
                      </div>
                    </div>
                    <div className="k-face absolute inset-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                      <div className="h-[170px] bg-black/10">
                        <img src={m.img} alt={m.title} className="h-full w-full object-cover" />
                      </div>
                      <div className="p-3">
                        <div className="font-mono text-xs uppercase tracking-wide text-muted-foreground">КОФЕРУМ</div>
                        <div className="mt-1 font-black tracking-tight">{m.title}</div>
                      </div>
                    </div>

                    <div className="k-face k-back absolute inset-0 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 via-white/5 to-white/10 backdrop-blur-md">
                      <div className="p-4">
                        <div className="font-black tracking-tight">{m.title}</div>
                        <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{m.desc}</div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <span className="opacity-80">КОФЕРУМ</span> • меню
          </footer>
        </div>
      </div>
    </InteractiveHero>
  );
}

