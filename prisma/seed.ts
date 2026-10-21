import { createClient } from "@libsql/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../app/generated/prisma/client";

const DB_URL = "file:C:/Users/v.serdyuk/Desktop/AI-OS/marketing-platform/prisma/dev.db";
const libsql = createClient({ url: DB_URL });
const adapter = new PrismaLibSql(libsql);
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("Seeding OmniMindFlow Wave 1...");

  const project = await prisma.project.create({
    data: {
      name: "OmniMindFlow",
      description: "AI-операционная система для профессионалов. 20 профилей, tier-система Free → Professional → Enterprise.",
      channel: "@OmniMindFlow",
      chatUrl: "https://t.me/OmniMindFlow_chat",
      botUrl: "@OmniMindFlowBot",
      siteUrl: "omnimindflow.com",
      wave: "Wave 1",
    },
  });

  // Posts
  await prisma.post.createMany({
    data: [
      { projectId: project.id, day: 1, title: "Манифест — зачем создали OmniMindFlow", profile: "all", type: "education", status: "ready", cta: "omnimindflow.com" },
      { projectId: project.id, day: 3, title: "Developer — AI code review за 30 сек", profile: "developer", type: "education", status: "ready", cta: "omnimindflow.com/profile/developer" },
      { projectId: project.id, day: 5, title: "Опрос — сколько времени тратишь на рутину", profile: "all", type: "community", status: "ready", cta: "" },
      { projectId: project.id, day: 7, title: "Founder — почему основатели горят в операционке", profile: "founder", type: "education", status: "ready", cta: "omnimindflow.com/profile/founder" },
      { projectId: project.id, day: 9, title: "PM — почему roadmap всегда врёт", profile: "pm", type: "education", status: "ready", cta: "omnimindflow.com/profile/product-manager" },
      { projectId: project.id, day: 11, title: "Developer — sprint velocity до/после", profile: "developer", type: "proof", status: "draft", cta: "omnimindflow.com/profile/developer" },
      { projectId: project.id, day: 12, title: "Итог опроса — данные + решение", profile: "all", type: "proof", status: "ready", cta: "" },
      { projectId: project.id, day: 14, title: "Founder — Founder OS демо", profile: "founder", type: "proof", status: "ready", cta: "omnimindflow.com/profile/founder" },
      { projectId: project.id, day: 16, title: "PM — голосование что убивает продуктивность", profile: "pm", type: "community", status: "draft", cta: "" },
      { projectId: project.id, day: 18, title: "Developer — 5 автоматизаций за 10 минут", profile: "developer", type: "education", status: "draft", cta: "omnimindflow.com/profile/developer" },
      { projectId: project.id, day: 21, title: "Комьюнити — первые пользователи", profile: "all", type: "community", status: "draft", cta: "" },
      { projectId: project.id, day: 23, title: "Founder — квест Series A Ready", profile: "founder", type: "education", status: "draft", cta: "omnimindflow.com/profile/founder" },
      { projectId: project.id, day: 25, title: "PM — discovery sprint без хаоса", profile: "pm", type: "education", status: "draft", cta: "omnimindflow.com/profile/product-manager" },
      { projectId: project.id, day: 28, title: "Финальный оффер — 7 дней бесплатно", profile: "all", type: "proof", status: "ready", cta: "omnimindflow.com" },
    ],
  });

  // Tasks
  await prisma.task.createMany({
    data: [
      { projectId: project.id, subject: "Написать пост День 11 — Developer: sprint velocity до/после", description: "Образовательный пост. Тип: Доказательство. Конкретные цифры velocity до и после.", category: "content", status: "pending", priority: 1 },
      { projectId: project.id, subject: "Написать пост День 16 — PM: голосование что убивает продуктивность", description: "Комьюнити-пост. Telegram-опрос с вариантами.", category: "content", status: "pending", priority: 2 },
      { projectId: project.id, subject: "Написать пост День 18 — Developer: 5 автоматизаций за 10 минут", description: "Образовательный пост. Список 5 автоматизаций с временем экономии.", category: "content", status: "pending", priority: 3 },
      { projectId: project.id, subject: "Написать пост День 21 — Комьюнити: первые пользователи", description: "Пост с результатами первых пользователей. Места [РЕАЛЬНЫЕ ДАННЫЕ] — пометить.", category: "content", status: "pending", priority: 4 },
      { projectId: project.id, subject: "Написать пост День 23 — Founder: квест Series A Ready", description: "Раскрыть квест Series A Ready: шаги, что получает Founder.", category: "content", status: "pending", priority: 5 },
      { projectId: project.id, subject: "Написать пост День 25 — PM: discovery sprint без хаоса", description: "Структурировать discovery sprint через платформу.", category: "content", status: "pending", priority: 6 },
      { projectId: project.id, subject: "Написать онбординг-цепочку после регистрации (3 сообщения × 3 профиля)", description: "Бот-сообщения после успешной регистрации для Developer, Founder, PM.", category: "bot", status: "pending", priority: 1 },
      { projectId: project.id, subject: "Составить тех. спецификацию бота для разработчика", description: "Хендлеры, структура БД пользователей, логика таймеров, метрики конверсий.", category: "bot", status: "pending", priority: 2 },
      { projectId: project.id, subject: "Разработать стратегию запуска на ProductHunt", description: "День запуска, Hunter pitch, tagline варианты, первый комментарий. Цель: Top 5.", category: "growth", status: "pending", priority: 1 },
      { projectId: project.id, subject: "Написать скрипты аутрича для dev-комьюнити", description: "GitHub, Habr, dev-чаты Telegram. 5–7 вариантов нативных упоминаний.", category: "growth", status: "pending", priority: 2 },
      { projectId: project.id, subject: "Написать скрипты аутрича для стартап- и VC-комьюнити", description: "Стартап-чаты, Indie Hackers, ProductHunt discussions.", category: "growth", status: "pending", priority: 3 },
      { projectId: project.id, subject: "Написать скрипты аутрича для PM-комьюнити", description: "ProductSense, PM-чаты, r/productmanagement.", category: "growth", status: "pending", priority: 4 },
      { projectId: project.id, subject: "Составить список каналов для ВП + написать питчи", description: "15–20 Telegram-каналов. 3 варианта питча под разный тип канала.", category: "growth", status: "pending", priority: 5 },
      { projectId: project.id, subject: "Адаптировать контент для LinkedIn (3 поста, EN)", description: "Адаптация 3 постов под LinkedIn-формат. Один на каждый профиль.", category: "multiplatform", status: "pending", priority: 1 },
      { projectId: project.id, subject: "Написать Twitter/X тред для каждого профиля", description: "3 треда на EN. 8–10 твитов, первый = hook, последний = CTA.", category: "multiplatform", status: "pending", priority: 2 },
      { projectId: project.id, subject: "Написать Show HN пост для Hacker News", description: "Технический, честный пост. Акцент на Developer-аудиторию HN.", category: "multiplatform", status: "pending", priority: 3 },
      { projectId: project.id, subject: "Создать A/B варианты хуков для постов День 1 и День 3", description: "По 2 варианта первых двух строк. Метрика: просмотры и клики.", category: "analytics", status: "pending", priority: 1 },
      { projectId: project.id, subject: "Создать шаблон weekly review метрик канала", description: "Таблица: подписчики, ERR, топ-постов, CTA, бот-конверсии. Каждый понедельник.", category: "analytics", status: "pending", priority: 2 },
      { projectId: project.id, subject: "Написать landing page copy для Developer / PM / Founder", description: "H1, буллеты с болями, секция «Что получаешь», цена, CTA. RU + EN.", category: "conversion", status: "pending", priority: 1 },
      { projectId: project.id, subject: "Написать email-цепочку после регистрации (3 письма × 3 профиля)", description: "Письмо 1 сразу, Письмо 2 Day 3, Письмо 3 Day 6 с оффером годового плана.", category: "conversion", status: "pending", priority: 2 },
    ],
  });

  console.log(`Created project: ${project.name} (${project.id})`);
  console.log("14 posts and 20 tasks created.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
