"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, MapPin, MessageCircleMore, Send } from "lucide-react";
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

const MENU: MenuItem[] = [
  { key: "0", cat: "food", title: "Круасан с фасолью", desc: "Слоёная выпечка с фасолью.", img: "/menu/0.png" },
  { key: "1", cat: "dessert", title: "Сырники с вареньем и сметаной", desc: "Подаются с вареньем и сметаной.", img: "/menu/1.png" },
  {
    key: "2",
    cat: "food",
    title: "Поке с курицей",
    desc: "Паровой рис, куриная грудка, маринованная в соевом соусе и обжаренная в темпуре, бобы эдамаме, огурец, помидоры черри, зелёный лук, кунжут, соус сладкий чили.",
    img: "/menu/2.png",
  },
  { key: "3", cat: "food", title: "Цезарь с курицей", desc: "Салат айсберг, копчёное куриное филе, помидоры черри, фирменный соус Цезарь, гренки, сыр.", img: "/menu/3.png" },
  { key: "4", cat: "dessert", title: "Блины с вареньем", desc: "Классические блины с вареньем.", img: "/menu/4.png" },
  { key: "5", cat: "dessert", title: "Блины со сметаной", desc: "Классические блины со сметаной.", img: "/menu/5.png" },
  { key: "6", cat: "food", title: "Блины с форелью", desc: "Блины классические с форелью и творожным сыром.", img: "/menu/6.png" },
  { key: "7", cat: "food", title: "Каша овсяная", desc: "Подаётся с грецким орехом, голубикой и мёдом.", img: "/menu/7.png" },
  { key: "8", cat: "food", title: "Каша рисовая", desc: "Подаётся с вишнёвым вареньем и лепестками миндаля.", img: "/menu/8.png" },
  { key: "9", cat: "author", title: "Ореховый Сатурн", desc: "Раф с урбечем. Глубокий, структурный, с ореховой строгостью и внутренним теплом.", img: "/menu/9.png", isAstro: true },
  { key: "venus", cat: "author", title: "Сладкая сила Венеры", desc: "Малиновый латте. Нежный, уютный и чуть ностальгический.", img: "/menu/venus.png", isAstro: true },
  { key: "10", cat: "author", title: "Огненный Стрелец", desc: "Глинтвейн с пряностями. Теплый, щедрый и чуть дерзкий.", img: "/menu/10.png", isAstro: true },
  { key: "11", cat: "author", title: "Солнечный взрыв", desc: "Цитрусовый пунш. Яркий и бодрящий.", img: "/menu/11.png" },
  { key: "12", cat: "tea", title: "Луна в Деве", desc: "Чай яблоко-шалфей. Уют, аромат и спокойствие.", img: "/menu/12.png" },
  { key: "13", cat: "coffee", title: "Эспрессо", desc: "Классический крепкий кофе.", img: "/menu/13.png" },
  { key: "14", cat: "coffee", title: "Американо", desc: "Эспрессо с добавлением горячей воды.", img: "/menu/14.png" },
  { key: "15", cat: "coffee", title: "Капучино", desc: "Эспрессо с молочной пенкой.", img: "/menu/15.png" },
  { key: "16", cat: "coffee", title: "Латте", desc: "Кофе с большим количеством молока.", img: "/menu/16.png" },
  { key: "17", cat: "coffee", title: "Флэт уайт", desc: "Двойной эспрессо с микропенной молочной пенкой.", img: "/menu/17.png" },
  { key: "18", cat: "author", title: "Бамбл с апельсиновым соком", desc: "Эспрессо и апельсиновый сок со льдом.", img: "/menu/18.png" },
  { key: "19", cat: "coffee", title: "Раф Ваниль", desc: "Кофейный напиток со сливками и ванильным сиропом.", img: "/menu/19.png" },
  { key: "20", cat: "coffee", title: "Раф Прага", desc: "Авторский раф с шоколадом и сливками.", img: "/menu/20.png" },
  { key: "21", cat: "coffee", title: "Эспрессо-тоник", desc: "Эспрессо с тоником и льдом.", img: "/menu/21.png" },
  { key: "22", cat: "dessert", title: "Аффогато черничное", desc: "Мороженое с горячим эспрессо и черничным соусом.", img: "/menu/22.png" },
  { key: "23", cat: "dessert", title: "Какао", desc: "Горячий шоколадный напиток.", img: "/menu/23.png" },
  { key: "24", cat: "tea", title: "Матча-латте", desc: "Напиток на основе зелёного чая матча и молока.", img: "/menu/24.png" },
  { key: "25", cat: "dessert", title: "Бэйби Раф", desc: "Молочный напиток без кофе для детей.", img: "/menu/25.png" },
  { key: "26", cat: "dessert", title: "Молочный коктейль", desc: "Классический молочный коктейль.", img: "/menu/26.png" },
  { key: "27", cat: "tea", title: "Облепиховый", desc: "Сладкий чай с облепихой.", img: "/menu/27.png" },
  { key: "28", cat: "tea", title: "Манго-гречиха", desc: "Сладкий чай с манго и гречишным чаем.", img: "/menu/28.png" },
  { key: "29", cat: "dessert", title: "Крафтовое мороженое", desc: "Куки монстр / Малиновый чизкейк / Фисташка / Б-52 (18+) / Клубничная маргарита (18+).", img: "/menu/29.png" },
  { key: "30", cat: "tea", title: "Чай", desc: "Чёрный / Лесные ягоды / Молочный улун / Сенча / Липовый / Гречишный.", img: "/menu/30.png" },
];

const SIGNS = [
  "Сегодня вселенная говорит тихо: не спорь с собой — выбери одно важное «да» и закрепи его маленьким ритуалом. Кофе, одно предложение, одно сообщение. Остальное догонит.",
  "Знак на сегодня: то, что кажется «слишком простым», и есть твой правильный ход. Убери лишнее, оставь один вкус — и действуй.",
  "Ночное небо советует: не доказывай — показывай. Один маленький результат сегодня громче любых аргументов.",
  "Если внутри шумит — выбери тишину. Дай себе 10 минут без ленты и сообщений. Потом закажи кофе и реши одно дело, которое давно висит.",
  "Знак судьбы: встреча. Напиши человеку, о котором думаешь последние дни. Без повода. Поводом будет ты.",
  "Сатурн про дисциплину, а ты — про свободу. Соедини: поставь таймер на 25 минут и сделай то, что хочешь, но честно и до конца.",
  "Марс даёт искру: если хочется спорить — лучше создай. Нарисуй, набросай, напиши, собери. Энергия должна иметь форму.",
];

const ZODIAC = [
  "Овен",
  "Телец",
  "Близнецы",
  "Рак",
  "Лев",
  "Дева",
  "Весы",
  "Скорпион",
  "Стрелец",
  "Козерог",
  "Водолей",
  "Рыбы",
] as const;

const ZODIAC_EN: Record<(typeof ZODIAC)[number], string> = {
  Овен: "aries",
  Телец: "taurus",
  Близнецы: "gemini",
  Рак: "cancer",
  Лев: "leo",
  Дева: "virgo",
  Весы: "libra",
  Скорпион: "scorpio",
  Стрелец: "sagittarius",
  Козерог: "capricorn",
  Водолей: "aquarius",
  Рыбы: "pisces",
};

function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const ZODIAC_BASE: Record<(typeof ZODIAC)[number], string> = {
  Овен:
    "Овен — знак действия и импульса. Вы любите начинать, зажигать и вдохновлять. Важно давать себе паузы и не сгорать в первом же рывке.",
  Телец:
    "Телец — про стабильность и вкус к жизни. Уют, еда, красота и надёжность для вас не мелочи, а фундамент. Главное — не упрямиться там, где мир уже изменился.",
  Близнецы:
    "Близнецы — знак общения и любопытства. Вы быстро схватываете, переключаетесь, соединяете людей и идеи. Важно иногда замедляться, чтобы доводить начатое до конца.",
  Рак:
    "Рак — про дом, эмоциональную глубину и заботу. Вы тонко чувствуете атмосферу и людей. Важно не растворяться в чужих эмоциях и помнить про свои личные границы.",
  Лев:
    "Лев — знак самовыражения и внутреннего солнца. Вам важно светить, творить и получать признание. Главное — не путать внимание с настоящим тёплым отношением.",
  Дева:
    "Дева — про систему, детали и заботу через действие. Вы замечаете то, что другим кажется незаметным, и умеете доводить до ума. Важно не превращать критику в самокритику.",
  Весы:
    "Весы — знак баланса и партнёрства. Вы ищете гармонию в отношениях и красоту в деталях. Главное — не терять своё мнение, стараясь понравиться всем сразу.",
  Скорпион:
    "Скорпион — про глубину, трансформацию и честность с собой. Вы чувствуете подводные течения и не боитесь сложных тем. Важно не застревать в контроле и обидах.",
  Стрелец:
    "Стрелец — знак смысла, свободы и путешествий. Вам нужно видеть горизонт дальше и шире, чем сегодня. Главное — не убегать от важных дел в вечные планы «потом».",
  Козерог:
    "Козерог — про структуру, цель и зрелость. Вы умеете держать долгую дистанцию и строить надолго. Важно позволять себе отдых и маленькие радости по пути.",
  Водолей:
    "Водолей — знак свободы, идей и будущего. Вы мыслите нестандартно и тянетесь к людям «своего круга». Главное — не отрываться совсем от реальности и тела.",
  Рыбы:
    "Рыбы — про интуицию, творчество и тонкость чувств. Вы легко улавливаете настроение мира и людей. Важно находить опору в конкретных делах, чтобы мечты не растворялись.",
};

function pickNext(list: string[], last: number) {
  if (list.length <= 1) return { idx: 0, value: list[0] || "" };
  let idx = Math.floor(Math.random() * list.length);
  if (idx === last) idx = (idx + 1) % list.length;
  return { idx, value: list[idx] };
}

export default function Home() {
  const [signIdx, setSignIdx] = useState(-1);
  const sign = useMemo(() => (signIdx >= 0 ? SIGNS[signIdx] : SIGNS[0]), [signIdx]);
  const [zodiac, setZodiac] = useState<(typeof ZODIAC)[number]>("Овен");
  const todayKey = useMemo(() => dateKey(), []);
  const zodiacBaseText = useMemo(() => ZODIAC_BASE[zodiac], [zodiac]);

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
          {/* HERO */}
          <section className="relative mx-auto max-w-6xl px-4 pt-10 pb-16">
            <header className="flex items-center justify-between gap-3">
              <a href="#top" className="font-mono text-xl font-black tracking-tight">
                КОФЕ<span className="text-primary">•</span>РУМ
              </a>
              <nav className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <a href="#sign" className="rounded-full px-3 py-2 hover:text-foreground hover:bg-white/5 transition-colors transition-transform duration-200 hover:scale-[1.03]">
                  Знак
                </a>
                <a href="#about" className="rounded-full px-3 py-2 hover:text-foreground hover:bg-white/5 transition-colors transition-transform duration-200 hover:scale-[1.03]">
                  О нас
                </a>
                <Link
                  href="/menu/"
                  className="rounded-full px-4 py-2 bg-primary/25 text-foreground hover:bg-primary/35 transition-colors transition-transform duration-200 hover:scale-[1.03]"
                >
                  Меню
                </Link>
                <a href="#contacts" className="rounded-full px-3 py-2 hover:text-foreground hover:bg-white/5 transition-colors transition-transform duration-200 hover:scale-[1.03]">
                  Контакты
                </a>
              </nav>
            </header>

            <div className="mt-14 max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono uppercase tracking-wide text-muted-foreground">
                Кострома • Советская, 40/2 • кофе × звёзды
              </p>
              <h1 className="mt-5 text-4xl sm:text-6xl font-black tracking-tight">Кофе. Звёзды. Уют.</h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
                КОФЕРУМ — место силы для работы и отдыха. А к каждому кофе — персональная подсказка от вселенной.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#sign"
                  className="rounded-full bg-white/15 border border-white/25 px-5 py-3 font-semibold hover:bg-white/20 transition-colors transition-transform duration-200 hover:scale-[1.02] text-foreground"
                >
                  Получить знак судьбы
                </a>
                <Link
                  href="/menu/"
                  className="rounded-full bg-white/15 border border-white/25 px-5 py-3 font-semibold hover:bg-white/20 transition-colors transition-transform duration-200 hover:scale-[1.02] text-foreground"
                >
                  Смотреть меню
                </Link>
                <a
                  href="#contacts"
                  className="rounded-full bg-white/15 border border-white/25 px-5 py-3 font-semibold hover:bg-white/20 transition-colors transition-transform duration-200 hover:scale-[1.02] text-foreground"
                >
                  Как найти
                </a>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Чтобы посмотреть цены и позиции, нажмите <span className="text-foreground/90 font-semibold">«Смотреть меню →»</span> или пункт{" "}
                <span className="text-foreground/90 font-semibold">«Меню»</span> вверху.
              </p>
            </div>
          </section>

          {/* ABOUT */}
          <section id="about" className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="font-mono text-sm uppercase tracking-widest text-muted-foreground">О нас</h2>
            <h3 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight">Место силы на Советской, 40</h3>
            <p className="mt-6 text-muted-foreground leading-relaxed max-w-4xl">
              «КОФЕРУМ — это уютная кофейня для работы и отдыха, прекрасное место для встреч и общения в самом сердце
              Костромы. Мы варим ароматный кофе, печем свежайшие круассаны и создаем атмосферу, в которой хочется
              остаться. Но главное — мы единственная кофейня в городе, где к кофе подают персональные подсказки от
              вселенной. Здесь не просто пьют кофе — здесь получают знаки судьбы и заряжаются позитивом».
            </p>
          </section>

          {/* SIGN */}
          <section id="sign" className="mx-auto max-w-6xl px-4 pb-16">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <h2 className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Знаки судьбы</h2>
                  <h3 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight">Знак судьбы на сегодня</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = pickNext(SIGNS, signIdx);
                    setSignIdx(next.idx);
                  }}
                  className="rounded-2xl bg-primary text-primary-foreground px-5 py-3 font-semibold hover:opacity-90 transition-opacity transition-transform duration-200 hover:scale-[1.02]"
                >
                  Обновить знак
                </button>
              </div>
              <p className="mt-6 text-lg leading-relaxed text-foreground/90 max-w-4xl">{sign}</p>
              <div className="mt-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">Астролог КОФЕРУМ</div>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                  <div>
                    <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Ежедневный гороскоп</div>
                    <div className="mt-2 text-xl sm:text-2xl font-black tracking-tight">
                      {zodiac} • {todayKey}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                    {ZODIAC.map((z) => (
                      <button
                        key={z}
                        type="button"
                        onClick={() => setZodiac(z)}
                        className="relative overflow-hidden rounded-full border border-white/15 bg-white/5 px-3 py-2 text-[10px] sm:text-xs font-mono uppercase tracking-wide text-foreground/80 transition-colors transition-transform duration-300 hover:scale-[1.02] hover:bg-white/10"
                      >
                        {zodiac === z && (
                          <motion.div
                            layoutId="zodiac-liquid-pill"
                            transition={{
                              type: "spring",
                              stiffness: 140,
                              damping: 28,
                              mass: 0.7,
                            }}
                            className="absolute inset-0 rounded-full border border-white/40 bg-white/12 backdrop-blur-md shadow-[0_0_22px_rgba(255,255,255,0.25)_inset,0_0_26px_rgba(0,0,0,0.45)]"
                          >
                            <div className="pointer-events-none absolute -left-3 top-0 h-6 w-6 rounded-full bg-white/40 blur-[10px]" />
                            <div className="pointer-events-none absolute right-0 bottom-0 h-4 w-4 rounded-full bg-white/25 blur-[8px]" />
                          </motion.div>
                        )}
                        <span className="relative z-10">{z}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4 max-w-4xl h-[320px] sm:h-[300px] md:h-[280px] overflow-auto pr-2 space-y-3">
                  <p className="text-base leading-relaxed text-foreground/85">{zodiacBaseText}</p>
                </div>
              </div>
            </div>
          </section>

          {/* CONTACTS */}
          <section id="contacts" className="mx-auto max-w-6xl px-4 pb-14">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10">
              <h2 className="font-mono text-sm uppercase tracking-widest text-muted-foreground">Контакты</h2>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Адрес</div>
                  <div className="text-lg font-semibold">г. Кострома, ул. Советская, 40/2</div>
                  <a
                    href="https://yandex.ru/maps/?text=КОФЕРУМ%20Кострома%20Советская%2040%2F2"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-sm font-medium hover:bg-white/10 transition-colors transition-transform duration-200 hover:scale-[1.02]"
                  >
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>Открыть в Яндекс Картах</span>
                  </a>
                  <div className="mt-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">Телефон</div>
                  <a
                    className="inline-flex items-center gap-3 text-2xl font-black tracking-tight hover:opacity-80 transition-opacity transition-transform duration-200 hover:scale-[1.02]"
                    href="tel:+79109523610"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/25 border border-primary/40">
                      <Phone className="h-4 w-4 text-primary-foreground" />
                    </span>
                    <span>+7 (910) 952‑36‑10</span>
                  </a>
                </div>
                <div className="space-y-3">
                  <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Режим</div>
                  <div className="text-lg font-semibold">Пн–пт: 9:00 – 20:00</div>
                  <div className="text-lg font-semibold">Сб–вс: 10:00 – 21:00</div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 font-semibold hover:bg-white/10 transition-colors transition-transform duration-200 hover:scale-[1.02]"
                      href="https://vk.com/cofferoom44"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircleMore className="h-4 w-4 text-primary" />
                      vk.com/cofferoom44
                    </a>
                    <a
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 font-semibold hover:bg-white/10 transition-colors transition-transform duration-200 hover:scale-[1.02]"
                      href="https://t.me/cofferoom44"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Send className="h-4 w-4 text-primary" />
                      t.me/cofferoom44
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <footer className="mx-auto max-w-6xl px-4 pb-10 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Кострома, Советская, 40 © КОФЕРУМ 2026
          </footer>
        </div>
      </div>
    </InteractiveHero>
  );
}
