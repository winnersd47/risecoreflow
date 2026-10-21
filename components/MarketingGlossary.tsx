"use client";
import { useState } from "react";
import { BookOpen, X, Search } from "lucide-react";

const TERMS = [
  // Аналитика
  { cat: "Аналитика", term: "ROMI", full: "Return on Marketing Investment", def: "Коэффициент возврата вложений в маркетинг. Показывает, сколько рублей выручки принёс каждый вложенный рубль.", formula: "ROMI = (Выручка − Затраты) / Затраты × 100%", example: "Вложил 100к → получил 400к. ROMI = 300%" },
  { cat: "Аналитика", term: "ERR", full: "Engagement Rate by Reach", def: "Доля подписчиков, которые взаимодействуют с постом (лайки + комменты + пересылки). Показатель живости аудитории.", formula: "ERR = Реакции / Охват × 100%", example: "5 000 охват, 250 реакций → ERR = 5%" },
  { cat: "Аналитика", term: "CPF / CPL", full: "Cost Per Follower / Cost Per Lead", def: "Стоимость привлечения одного подписчика (CPF) или лида (CPL). Главный метрик эффективности рекламы.", formula: "CPF = Бюджет / Количество новых подписчиков", example: "10 000 ₽ на рекламу, 80 подписчиков → CPF = 125 ₽" },
  { cat: "Аналитика", term: "CTR", full: "Click-Through Rate", def: "Процент людей, которые кликнули на ссылку из тех, кто её увидел. Показывает привлекательность призыва к действию.", formula: "CTR = Клики / Показы × 100%", example: "1 000 показов, 30 кликов → CTR = 3%" },
  { cat: "Аналитика", term: "Конверсия", full: "Conversion Rate", def: "Доля людей, которые совершили целевое действие (купили, оставили заявку, подписались) из всех, кто увидел предложение.", formula: "CR = Целевые действия / Посетители × 100%", example: "100 подписчиков прочитали оффер, 5 купили → CR = 5%" },
  // Контент
  { cat: "Контент", term: "Хук", def: "Первые 1–2 строки поста, которые заставляют читателя открыть его полностью. 80% успеха поста определяется хуком.", example: "«Год назад я работал 12 часов и зарабатывал 80к. Вот что изменилось.»", tip: "Хук должен вызывать любопытство, боль или обещание результата" },
  { cat: "Контент", term: "CTA", full: "Call To Action", def: "Призыв к действию в конце поста. Говорит читателю что сделать дальше: подписаться, написать, купить.", example: "«Напиши СТАРТ — расскажу как» или «Подпишись, чтобы не пропустить»" },
  { cat: "Контент", term: "Прогрев", def: "Серия постов, которая последовательно подводит аудиторию к покупке: история → боль → польза → кейс → оффер.", tip: "Без прогрева аудитория не готова к покупке — холодный оффер конвертирует в 2–5 раз хуже" },
  { cat: "Контент", term: "Оффер", def: "Конкретное торговое предложение: что, для кого, по какой цене, с каким результатом и дедлайном.", example: "«3 занятия по настройке рекламы за 15 000 ₽. Осталось 2 места. Результат — первые заявки за 7 дней.»" },
  { cat: "Контент", term: "Лид-магнит", def: "Бесплатный полезный материал (чек-лист, гайд, шаблон), который человек получает в обмен на контакт или подписку.", example: "«Подпишись и получи чек-лист: 10 ошибок в рекламе, которые сливают бюджет»" },
  { cat: "Контент", term: "UGC", full: "User Generated Content", def: "Контент, созданный пользователями о твоём продукте: отзывы, скриншоты переписок, кейсы клиентов.", tip: "UGC вызывает больше доверия чем авторский контент — люди доверяют людям" },
  // Трафик
  { cat: "Трафик", term: "Посев (seeding)", def: "Размещение рекламных постов сразу в большом количестве каналов одновременно. Даёт эффект «везде вижу» и снижает CPF в 3–5 раз.", example: "Разместить рекламу в 30–50 тематических каналах одновременно через Telega.in" },
  { cat: "Трафик", term: "Взаимопиар (ВП)", def: "Бесплатное взаимное упоминание двух каналов схожей тематики и размера. Оба автора рекомендуют друг друга подписчикам.", tip: "Выбирай каналы с близкой аудиторией, но не прямых конкурентов" },
  { cat: "Трафик", term: "Комментинг", def: "Написание экспертных комментариев в чужих каналах и группах для привлечения подписчиков. Бесплатный метод.", example: "20–30 комментариев в день в каналах с твоей аудиторией → 20–50 новых подписчиков в неделю" },
  { cat: "Трафик", term: "Органика", def: "Подписчики, которые нашли тебя сами — через поиск, репосты, рекомендации. Самый дешёвый и качественный трафик.", tip: "Органика растёт от качественного контента и активности в комьюнити" },
  { cat: "Трафик", term: "CPM", full: "Cost Per Mille", def: "Стоимость 1 000 показов рекламы. Используется в Telegram Ads и таргетированной рекламе.", formula: "CPM = Бюджет / Показы × 1 000", example: "500 ₽ за 10 000 показов → CPM = 50 ₽" },
  // Воронка
  { cat: "Воронка", term: "Воронка продаж", def: "Путь клиента от первого касания до покупки. В Telegram: незнакомец → подписчик → читатель → лид → покупатель.", tip: "На каждом этапе часть людей «уходит» — задача маркетинга уменьшить потери" },
  { cat: "Воронка", term: "BoFu / ToFu", full: "Bottom / Top of Funnel", def: "ToFu — верх воронки (холодная аудитория, максимальный охват). BoFu — низ воронки (горячие лиды, готовые купить).", example: "ToFu-пост: «5 ошибок в рекламе» | BoFu-пост: «Записаться на консультацию»" },
  { cat: "Воронка", term: "Касание", def: "Любое взаимодействие потенциального клиента с тобой или твоим контентом. Продажа происходит в среднем после 7–12 касаний.", tip: "Чем больше ценности даёшь до продажи — тем выше конверсия в покупку" },
  // Продукт
  { cat: "Продукт", term: "Средний чек", def: "Средняя сумма одной покупки. Ключевой параметр в расчёте ROMI и юнит-экономики.", formula: "Средний чек = Выручка / Количество продаж" },
  { cat: "Продукт", term: "LTV", full: "Lifetime Value", def: "Сколько денег клиент приносит за всё время сотрудничества с тобой, а не за одну покупку.", tip: "Высокий LTV позволяет тратить больше на привлечение клиентов" },
  { cat: "Продукт", term: "Юнит-экономика", def: "Соотношение стоимости привлечения клиента (CPL) к его ценности (LTV). Показывает, выгодно ли масштабировать бизнес.", formula: "LTV / CPL > 3 — бизнес масштабируется", tip: "Если LTV/CPL < 1, ты тратишь больше на привлечение, чем зарабатываешь" },
];

const CATS = ["Все", ...Array.from(new Set(TERMS.map(t => t.cat)))];

export function MarketingGlossary() {
  const [open, setOpen]     = useState(false);
  const [q, setQ]           = useState("");
  const [cat, setCat]       = useState("Все");
  const [expanded, setExp]  = useState<string | null>(null);

  const filtered = TERMS.filter(t =>
    (cat === "Все" || t.cat === cat) &&
    (q === "" || t.term.toLowerCase().includes(q.toLowerCase()) || t.def.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <>
      <button onClick={() => setOpen(true)}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", padding: "6px 8px", borderRadius: 8, width: "100%", transition: "background 0.15s" }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#13112a"}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "none"}>
        <BookOpen style={{ width: 14, height: 14, color: "#4b5563", flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: "#4b5563" }}>Глоссарий маркетинга</span>
      </button>

      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99990, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
          {/* Backdrop */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(7,6,13,0.85)", backdropFilter: "blur(4px)" }} onClick={() => setOpen(false)} />

          {/* Modal */}
          <div style={{ position: "relative", width: "min(720px, 94vw)", maxHeight: "85vh", background: "#0d0b18", border: "1px solid #1e1c38", borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,0.7)" }}>

            {/* Header */}
            <div style={{ padding: "20px 24px 0", borderBottom: "1px solid #1e1c38" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <BookOpen style={{ color: "#818cf8", width: 18, height: 18 }} />
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: "#ede8ff" }}>Глоссарий маркетинга</h2>
                </div>
                <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8 }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#1e1c38"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "none"}>
                  <X style={{ width: 16, height: 16, color: "#6b7280" }} />
                </button>
              </div>

              {/* Search */}
              <div style={{ position: "relative", marginBottom: 14 }}>
                <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#4b5563" }} />
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Поиск термина..."
                  style={{ width: "100%", background: "#07060d", border: "1px solid #374151", borderRadius: 8, padding: "8px 12px 8px 36px", color: "#ede8ff", fontSize: 13, boxSizing: "border-box" }} />
              </div>

              {/* Category filter */}
              <div style={{ display: "flex", gap: 6, paddingBottom: 14, flexWrap: "wrap" }}>
                {CATS.map(c => (
                  <button key={c} onClick={() => setCat(c)}
                    style={{ padding: "3px 12px", borderRadius: 6, fontSize: 12, fontWeight: cat === c ? 600 : 400, cursor: "pointer", border: "1px solid", transition: "all 0.15s",
                      background: cat === c ? "#6366f120" : "none",
                      borderColor: cat === c ? "#6366f140" : "#374151",
                      color: cat === c ? "#818cf8" : "#6b7280" }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Terms list */}
            <div style={{ overflowY: "auto", padding: "12px 16px" }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#374151", fontSize: 13 }}>Ничего не найдено</div>
              ) : (
                filtered.map(t => {
                  const isOpen = expanded === t.term;
                  return (
                    <div key={t.term} style={{ borderRadius: 10, overflow: "hidden", marginBottom: 8, border: "1px solid " + (isOpen ? "#6366f130" : "#1e1c38") }}>
                      <button onClick={() => setExp(isOpen ? null : t.term)}
                        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: isOpen ? "#13112a" : "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#ede8ff" }}>{t.term}</span>
                          {t.full && <span style={{ fontSize: 11, color: "#4b5563" }}>{t.full}</span>}
                          <span style={{ fontSize: 10, padding: "1px 8px", borderRadius: 4, background: "#6366f115", color: "#6366f1", border: "1px solid #6366f125" }}>{t.cat}</span>
                        </div>
                        <span style={{ fontSize: 16, color: "#4b5563", transform: isOpen ? "rotate(45deg)" : "none", transition: "transform 0.15s" }}>+</span>
                      </button>
                      {isOpen && (
                        <div style={{ padding: "0 16px 14px", background: "#13112a" }}>
                          <p style={{ fontSize: 13, color: "#9ca3af", lineHeight: 1.65, margin: "0 0 10px" }}>{t.def}</p>
                          {t.formula && (
                            <div style={{ background: "#07060d", borderRadius: 8, padding: "8px 12px", marginBottom: 10, fontFamily: "monospace" }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", marginBottom: 4, letterSpacing: "0.05em" }}>ФОРМУЛА</div>
                              <div style={{ fontSize: 12, color: "#fbbf24" }}>{t.formula}</div>
                            </div>
                          )}
                          {t.example && (
                            <div style={{ background: "#07060d", borderRadius: 8, padding: "8px 12px", marginBottom: (t as any).tip ? 10 : 0, borderLeft: "2px solid #6366f1" }}>
                              <div style={{ fontSize: 10, fontWeight: 700, color: "#6366f1", marginBottom: 4, letterSpacing: "0.05em" }}>ПРИМЕР</div>
                              <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.55 }}>{t.example}</div>
                            </div>
                          )}
                          {(t as any).tip && (
                            <div style={{ marginTop: 10, fontSize: 12, color: "#f59e0b", lineHeight: 1.55 }}>💡 {(t as any).tip}</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div style={{ padding: "10px 24px", borderTop: "1px solid #1e1c38", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "#374151" }}>{filtered.length} из {TERMS.length} терминов</span>
              <span style={{ fontSize: 11, color: "#374151" }}>Кликни на термин чтобы развернуть</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
