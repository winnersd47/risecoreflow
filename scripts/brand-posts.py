"""
brand-posts.py — Генератор постов для личного бренда AIGrowth

Реализует контент-систему из гайда «Создание личного бренда» (Христосенко, Части 1–3):
  - 80% экспертиза: кейсы, лайфхаки, FAQ, мифы, аналитика, разборы
  - 20% личное: закулисье, ошибки, «как я сам использую»
  - Серийный контент: максимальный прогрев

Использование:
  python -X utf8 scripts/brand-posts.py list              — все типы постов
  python -X utf8 scripts/brand-posts.py show <key>        — показать пост
  python -X utf8 scripts/brand-posts.py next              — следующий по ротации
  python -X utf8 scripts/brand-posts.py week              — план на неделю
  python -X utf8 scripts/brand-posts.py publish <key>     — опубликовать в TG/VK
  python -X utf8 scripts/brand-posts.py publish next      — опубликовать следующий по ротации
"""

import sys
import os
import json
import time
from pathlib import Path
from datetime import datetime, timezone

sys.stdout.reconfigure(encoding="utf-8")

HERE = Path(__file__).parent
ROOT = HERE.parent
STATE_FILE = HERE / "brand-posts-state.json"

# ─── Загрузка env ─────────────────────────────────────────────────────────────
def _load_env() -> dict:
    ev = {}
    for env_file in [ROOT / "tg-bot" / ".env", ROOT / ".env"]:
        if env_file.exists():
            for line in env_file.read_text(encoding="utf-8").splitlines():
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, _, v = line.partition("=")
                ev.setdefault(k.strip(), v.strip().strip('"'))
    return ev

ENV = _load_env()
BOT_TOKEN = ENV.get("BOT_TOKEN", "")
OMF_CHANNEL = ENV.get("OMF_CHANNEL_PROFILES_ID", "")
WEF_CHANNEL = ENV.get("WEF_CHANNEL_SIGNALS_ID", "")
AIGC_GROUP  = ENV.get("GROUP_AIGC_ID", "")


# ─── Библиотека постов (8 типов × несколько вариантов = 80/20 формула) ────────
#
# Структура каждого поста:
#   key:      уникальный ID
#   type:     категория (expert / personal / serial)
#   ratio:    expert=80% | personal=20%
#   channel:  omf | wef | any
#   title:    заголовок для навигации
#   text:     готовый пост (HTML-разметка для Telegram)
#   tags:     хэштеги
#
POSTS = [

    # ══════════════════════════════════════════════════════
    # ЭКСПЕРТИЗА — КЕЙСЫ С ЦИФРАМИ (максимальный прогрев)
    # ══════════════════════════════════════════════════════

    {
        "key": "case_standup",
        "type": "case", "ratio": "expert", "channel": "omf",
        "title": "Кейс: стендап с 45 до 8 минут",
        "text": (
            "Стандартный стендап команды из 6 человек — 45 минут.\n\n"
            "Проблема не в людях. Проблема в том, что каждый:\n"
            "• открывает Jira/Linear/Notion вручную\n"
            "• пересказывает вчерашний день по памяти\n"
            "• узнаёт о блокерах только на встрече\n\n"
            "Что поменяли с OmniMindFlow:\n"
            "• AI собирает саммари по каждому участнику перед встречей (2 мин)\n"
            "• блокеры всплывают автоматически за 30 мин до стендапа\n"
            "• встреча превращается в 8-минутное подтверждение, не пересказ\n\n"
            "<b>Результат: 45 → 8 минут. Ежедневно. Для каждого члена команды.</b>\n\n"
            "Это не магия. Это настроенный рабочий процесс.\n"
            "→ omnimindflow.com"
        ),
        "tags": "#repost #aigc #omnimindflow #автоматизация #кейс",
    },

    {
        "key": "case_routine_98",
        "type": "case", "ratio": "expert", "channel": "omf",
        "title": "Кейс: 98 минут рутины каждый день",
        "text": (
            "Мы замерили. Средний профессионал тратит 98 минут в день на рутину.\n\n"
            "Из чего состоят эти 98 минут:\n"
            "• 35 мин — ручной сбор статусов из разных источников\n"
            "• 25 мин — написание апдейтов вручную\n"
            "• 20 мин — переключение между инструментами\n"
            "• 18 мин — поиск информации, которая «где-то была»\n\n"
            "Итого 98 минут. Каждый день. 365 дней в году.\n\n"
            "Это 595 часов в год. Или <b>74 рабочих дня.</b>\n\n"
            "Всё это автоматизируется. Полностью.\n"
            "→ omnimindflow.com"
        ),
        "tags": "#repost #aigc #omnimindflow #продуктивность",
    },

    {
        "key": "case_wef_signal",
        "type": "case", "ratio": "expert", "channel": "wef",
        "title": "Кейс: как WEF Score 87% отфильтровал ложный сигнал",
        "text": (
            "Сигнал пришёл в понедельник утром: BUY BTCUSDT 67,200.\n\n"
            "Что сделал бы большинство:\n"
            "• Проверил пару индикаторов\n"
            "• Поверил каналу\n"
            "• Вошёл\n\n"
            "Что сделал WinExtraFlow за 2 секунды:\n"
            "• Win Rate провайдера за 30 дней: 58% (норма, но не сильно)\n"
            "• Risk/Reward по сигналу: 1:1.1 (слабо)\n"
            "• Режим рынка: боковик (64% уверенности)\n"
            "• Sharpe провайдера: 1.1 (средне)\n\n"
            "<b>WEF Score: 49%. Сигнал отклонён.</b>\n\n"
            "Через 6 часов цена упала на 4.2%.\n\n"
            "Не угадал. Система посчитала.\n"
            "→ winextraflow.com\n\n"
            "<i>Не является инвестиционной рекомендацией.</i>"
        ),
        "tags": "#repost #aigc #winextraflow #трейдинг #кейс",
    },

    # ══════════════════════════════════════════════════════
    # ЭКСПЕРТИЗА — ЛАЙФХАКИ И ИНСТРУМЕНТЫ
    # ══════════════════════════════════════════════════════

    {
        "key": "tip_morning_routine",
        "type": "tip", "ratio": "expert", "channel": "omf",
        "title": "Лайфхак: утренний брифинг за 3 минуты",
        "text": (
            "Утро фаундера без AI OS:\n"
            "09:00 — открыл Slack, 47 сообщений\n"
            "09:30 — разобрал срочное, потерял фокус\n"
            "10:00 — открыл задачи, не помнит приоритеты\n"
            "10:30 — первая реальная работа\n\n"
            "Утро с OmniMindFlow:\n"
            "08:45 — AI-брифинг за 3 минуты:\n"
            "  • Flow Score: 74 (выше нормы)\n"
            "  • 2 критических алерта\n"
            "  • 3 сообщения, требующих ответа до полудня\n"
            "  • 7 задач на сегодня, первые 2 по AI-приоритету\n\n"
            "08:48 — начал работать.\n\n"
            "<b>Правило: утро должно начинаться с решений, не со сбора информации.</b>"
        ),
        "tags": "#repost #aigc #omnimindflow #продуктивность #лайфхак",
    },

    {
        "key": "tip_wef_score",
        "type": "tip", "ratio": "expert", "channel": "wef",
        "title": "Лайфхак: как читать WEF Score",
        "text": (
            "WEF Score — это не «купить» или «не купить».\n"
            "Это вероятность того, что сигнал качественный.\n\n"
            "Шкала:\n"
            "• 0–40 — слабый сигнал. Высокий риск. Лучше пропустить.\n"
            "• 41–60 — средний. Входить только при сильном personal bias.\n"
            "• 61–80 — хороший. Стоит рассмотреть с учётом размера позиции.\n"
            "• 81–100 — сильный. Провайдер с историей, R/R чистый, режим подходит.\n\n"
            "Что НЕ значит Score 90%:\n"
            "• это не гарантия прибыли\n"
            "• это не «входи без стопа»\n"
            "• это не замена вашему риск-менеджменту\n\n"
            "<b>Score 90% значит: 9 из 10 факторов говорят «да».</b>\n"
            "Финальное решение — всегда за вами.\n\n"
            "<i>Не является инвестиционной рекомендацией.</i>"
        ),
        "tags": "#repost #aigc #winextraflow #трейдинг #обучение",
    },

    # ══════════════════════════════════════════════════════
    # ЭКСПЕРТИЗА — РАЗВЕНЧИВАНИЕ МИФОВ
    # ══════════════════════════════════════════════════════

    {
        "key": "myth_ai_replace",
        "type": "myth", "ratio": "expert", "channel": "omf",
        "title": "Миф: AI заменит разработчиков",
        "text": (
            "«AI скоро заменит разработчиков».\n\n"
            "Нет.\n\n"
            "AI заменит разработчиков, которые:\n"
            "• пишут бойлерплейт вручную\n"
            "• не умеют формулировать задачу\n"
            "• отказываются учиться работать с AI\n\n"
            "AI не заменит разработчиков, которые:\n"
            "• умеют поставить правильный вопрос\n"
            "• проверяют и рефакторят то, что генерирует AI\n"
            "• понимают архитектуру глубже, чем любая модель\n\n"
            "<b>Правда: AI — это 10× умножитель для тех, кто умеет им пользоваться.</b>\n\n"
            "OmniMindFlow строится именно для таких людей.\n"
            "→ omnimindflow.com"
        ),
        "tags": "#repost #aigc #omnimindflow #AI #разработка",
    },

    {
        "key": "myth_trading_bot",
        "type": "myth", "ratio": "expert", "channel": "wef",
        "title": "Миф: торговый бот делает деньги сам",
        "text": (
            "«Куплю бот — он сам заработает».\n\n"
            "Разберём по шагам:\n\n"
            "1. Бот без риск-менеджмента = бот без стопа.\n"
            "   Без стопа один слив убирает 10 прибыльных сделок.\n\n"
            "2. Бот без понимания режима рынка сливается в боковике.\n"
            "   Трендовые стратегии на флете = минус каждый день.\n\n"
            "3. Бот без проверки провайдера — лотерея.\n"
            "   Win Rate 60% на 10 сделках ≠ Win Rate 60% на 300.\n\n"
            "<b>Правда: автоматизация усиливает вашу стратегию. Не заменяет её.</b>\n\n"
            "WEF Score считает то, что вы не успеваете проверить вручную.\n"
            "Решение — за вами.\n\n"
            "<i>Не является инвестиционной рекомендацией.</i>"
        ),
        "tags": "#repost #aigc #winextraflow #трейдинг #мифы",
    },

    # ══════════════════════════════════════════════════════
    # ЭКСПЕРТИЗА — FAQ
    # ══════════════════════════════════════════════════════

    {
        "key": "faq_omf_start",
        "type": "faq", "ratio": "expert", "channel": "omf",
        "title": "FAQ: с чего начать с OmniMindFlow",
        "text": (
            "Частый вопрос: «С чего начать?»\n\n"
            "Шаг 1. Выберите профиль под вашу роль:\n"
            "• Developer — code review, стендапы, PR-management\n"
            "• PM — гипотезы, velocity, приоритизация\n"
            "• Founder — брифинг, инвесторы, 1:1, метрики\n\n"
            "Шаг 2. Подключите источники, которые уже используете:\n"
            "Jira, Linear, Notion, GitHub, Slack — стандартные интеграции.\n\n"
            "Шаг 3. Дайте AI 3 дня на сбор паттернов.\n"
            "Первый персонализированный брифинг — уже на 4-й день.\n\n"
            "Шаг 4. Следите за Flow Score.\n"
            "Ниже 50 — система покажет, где теряется время.\n\n"
            "<b>Первые 7 дней — бесплатно, без ограничений.</b>\n"
            "→ omnimindflow.com"
        ),
        "tags": "#repost #aigc #omnimindflow #FAQ",
    },

    {
        "key": "faq_wef_providers",
        "type": "faq", "ratio": "expert", "channel": "wef",
        "title": "FAQ: как выбрать провайдера в WEF",
        "text": (
            "«Как выбрать провайдера сигналов в WEF?»\n\n"
            "Смотрите в порядке приоритета:\n\n"
            "1. <b>Win Rate за 90+ дней</b> — не 10 сделок, а минимум 50.\n"
            "   Норма: 55–70%. Выше 75% на длинной истории — изучить подробнее.\n\n"
            "2. <b>Sharpe Ratio ≥ 1.5</b> — доходность с учётом риска.\n"
            "   Если Sharpe ниже 1 — слишком много риска на единицу прибыли.\n\n"
            "3. <b>Max Drawdown ≤ 25%</b> — максимальная просадка.\n"
            "   Если просадка 40%+, вы не выдержите психологически.\n\n"
            "4. <b>Signal Frequency</b> — 3–7 сигналов в неделю оптимально.\n"
            "   Меньше — мало данных для оценки. Больше — рыночный шум.\n\n"
            "<b>WEF Score автоматически взвешивает все 9 факторов за 2 секунды.</b>\n\n"
            "<i>Не является инвестиционной рекомендацией.</i>"
        ),
        "tags": "#repost #aigc #winextraflow #трейдинг #FAQ",
    },

    # ══════════════════════════════════════════════════════
    # ЭКСПЕРТИЗА — АНАЛИТИКА И МНЕНИЕ
    # ══════════════════════════════════════════════════════

    {
        "key": "opinion_ai_tools",
        "type": "opinion", "ratio": "expert", "channel": "omf",
        "title": "Мнение: AI-инструменты перегружают, а не помогают",
        "text": (
            "Парадокс AI-инструментов 2024–2025:\n\n"
            "Их стало слишком много. Каждый требует:\n"
            "• Отдельный аккаунт\n"
            "• Отдельный промпт-контекст\n"
            "• Отдельный workflow\n\n"
            "В итоге: вместо автоматизации — переключение между 12 вкладками.\n\n"
            "Это и есть причина, по которой мы строим AI OS, а не AI-инструмент.\n\n"
            "OS — это то, что работает под всем остальным.\n"
            "Вы не думаете об OS. Вы думаете о задаче.\n\n"
            "<b>OmniMindFlow — не ещё один AI-инструмент.\n"
            "Это место, куда сходятся все остальные.</b>\n\n"
            "→ omnimindflow.com"
        ),
        "tags": "#repost #aigc #omnimindflow #AI #мнение",
    },

    {
        "key": "opinion_copy_trading",
        "type": "opinion", "ratio": "expert", "channel": "wef",
        "title": "Мнение: copy trading — инструмент, а не пассивный доход",
        "text": (
            "Copy trading — это не «включил и забыл».\n\n"
            "Это инструмент, который требует:\n\n"
            "1. Выбора правильного провайдера (WEF Score ≥ 70)\n"
            "2. Настройки размера позиции (не 100% от депо)\n"
            "3. Периодического ревью (раз в 2–4 недели)\n"
            "4. Готовности отключить, если стратегия провайдера изменилась\n\n"
            "Что происходит без этого:\n"
            "• Выбираете по лучшим последним результатам (ошибка выжившего)\n"
            "• Не ограничиваете размер → один слив провайдера = ваш слив\n"
            "• Не отслеживаете → провайдер меняет стратегию, вы не замечаете\n\n"
            "<b>Copy trading усиливает вашу систему. Не заменяет её.</b>\n\n"
            "<i>Не является инвестиционной рекомендацией.</i>"
        ),
        "tags": "#repost #aigc #winextraflow #копитрейдинг #мнение",
    },

    # ══════════════════════════════════════════════════════
    # ЭКСПЕРТИЗА — СЕРИЙНЫЙ КОНТЕНТ (максимальный прогрев)
    # ══════════════════════════════════════════════════════

    {
        "key": "serial_mistake_1",
        "type": "serial", "ratio": "expert", "channel": "omf",
        "title": "Серия «Ошибка №1»: автоматизировали не то",
        "text": (
            "Ошибка №1 при внедрении AI в рабочий процесс:\n\n"
            "<b>Автоматизировать то, что нужно было просто удалить.</b>\n\n"
            "Классический сценарий:\n"
            "Команда проводит 2-часовое совещание по статусу.\n"
            "Решение: внедрить AI-агента, который собирает статусы автоматически.\n"
            "Результат: совещание сократилось до 1 часа.\n\n"
            "Правильное решение:\n"
            "Статусное совещание не нужно вообще.\n"
            "AI-агент собирает статусы → публикует асинхронно → команда читает в своё время.\n"
            "Встреча: только для принятия решений.\n\n"
            "<b>Правило: перед автоматизацией — задай вопрос «нужно ли это вообще?»</b>\n\n"
            "Ошибка №2 — в следующем посте."
        ),
        "tags": "#repost #aigc #omnimindflow #ошибки #автоматизация",
    },

    {
        "key": "serial_mistake_2",
        "type": "serial", "ratio": "expert", "channel": "omf",
        "title": "Серия «Ошибка №2»: слишком много интеграций сразу",
        "text": (
            "Ошибка №2 при внедрении AI OS:\n\n"
            "<b>Подключить всё сразу.</b>\n\n"
            "Jira + Notion + Slack + GitHub + Calendar + CRM + Email...\n"
            "В первую неделю.\n\n"
            "Что происходит:\n"
            "• AI получает слишком много сигналов\n"
            "• Брифинг превращается в список из 40 пунктов\n"
            "• Фокус теряется\n"
            "• Возвращаетесь к старому\n\n"
            "Правильный порядок:\n"
            "1. Подключите только 2–3 источника, которые уже используете каждый день\n"
            "2. Дайте AI неделю на паттерны\n"
            "3. Добавляйте по одному новому источнику раз в 2 недели\n\n"
            "<b>AI OS работает как мышцы: нагружать нужно постепенно.</b>\n\n"
            "Ошибка №3 — в следующем посте."
        ),
        "tags": "#repost #aigc #omnimindflow #ошибки #автоматизация",
    },

    # ══════════════════════════════════════════════════════
    # ЛИЧНОЕ — 20% (закулисье, ошибки, «как я сам»)
    # ══════════════════════════════════════════════════════

    {
        "key": "personal_behind_scenes",
        "type": "personal", "ratio": "personal", "channel": "omf",
        "title": "Закулисье: как выглядит работа над OmniMindFlow",
        "text": (
            "Строю OmniMindFlow. Вот как выглядит типичный день:\n\n"
            "07:00 — AI-брифинг: что произошло ночью, какие задачи горят\n"
            "08:00 — работа над фичей (2 часа глубокого фокуса)\n"
            "10:00 — созвон с командой: 8 минут, только решения\n"
            "10:10 — ответы на письма (AI черновики — я правлю)\n"
            "11:00 — продуктовые решения, метрики\n"
            "13:00 — переговоры / партнёры\n"
            "15:00 — снова разработка\n"
            "17:00 — контент для канала\n\n"
            "Что отличает этот день от того, что было год назад:\n"
            "AI убрал из него 2+ часа сбора информации.\n"
            "Эти 2 часа теперь идут на создание.\n\n"
            "<b>Строю продукт, которым сам пользуюсь каждый день.</b>"
        ),
        "tags": "#repost #aigc #omnimindflow #закулисье",
    },

    {
        "key": "personal_failure",
        "type": "personal", "ratio": "personal", "channel": "any",
        "title": "Личное: провал и разворот",
        "text": (
            "Честно о провале.\n\n"
            "Три месяца назад запустил функцию, которую никто не использовал.\n\n"
            "Потратили: 6 недель разработки, $4,000 инфраструктуры.\n"
            "Пользователей за первый месяц: 3.\n\n"
            "Что пошло не так:\n"
            "• Строили то, что казалось «очевидно нужным»\n"
            "• Не разговаривали с пользователями ДО разработки\n"
            "• Влюбились в идею, а не в проблему\n\n"
            "Что сделали:\n"
            "• Отключили функцию\n"
            "• Провели 20 интервью с реальными пользователями\n"
            "• Переосмыслили приоритеты\n\n"
            "<b>Провал — это данные. Самые дорогие данные.</b>\n\n"
            "Следующая итерация — лучше."
        ),
        "tags": "#repost #aigc #стартап #ошибки #личное",
    },

    {
        "key": "personal_how_i_use",
        "type": "personal", "ratio": "personal", "channel": "wef",
        "title": "Личное: как я сам использую WinExtraFlow",
        "text": (
            "Строю WinExtraFlow — и сам им пользуюсь.\n\n"
            "Мой реальный workflow:\n\n"
            "08:30 — WEF дашборд: режим рынка, топ сигналы дня\n"
            "08:35 — фильтр: только Score ≥ 65, R/R ≥ 1.5\n"
            "08:40 — 2–3 сигнала в работе, остальное отложено\n"
            "09:00 — выставил позиции, TP/SL по рекомендациям WEF\n"
            "Конец дня — ревью: что сработало, что нет\n\n"
            "На что трачу больше времени:\n"
            "• Ревью провайдеров (раз в 2 недели)\n"
            "• Корректировка размера позиций под текущий режим\n\n"
            "На что трачу меньше:\n"
            "• Ручной анализ каждого сигнала — убрал полностью\n\n"
            "<b>Продукт, которым не пользуешься сам — не продукт.</b>\n\n"
            "<i>Не является инвестиционной рекомендацией.</i>"
        ),
        "tags": "#repost #aigc #winextraflow #личное",
    },

    # ══════════════════════════════════════════════════════
    # СТОРИТЕЛЛИНГ
    # ══════════════════════════════════════════════════════

    {
        "key": "story_why_omf",
        "type": "story", "ratio": "expert", "channel": "omf",
        "title": "История: почему появился OmniMindFlow",
        "text": (
            "История одного совещания.\n\n"
            "Встреча на 45 минут. 6 человек. Тема: статус спринта.\n\n"
            "Весь первый час (да, вышли за рамки) — люди вспоминали.\n"
            "Что делали вчера. Что заблокировано. Что ждёт ревью.\n\n"
            "Всё это было в Jira, Linear, GitHub, Notion.\n"
            "Но никто не собрал это перед встречей.\n"
            "Потому что это занимает 20–30 минут.\n"
            "И никто не хочет делать это вручную.\n\n"
            "В конце встречи я подумал:\n"
            "«Это должен делать AI. За 2 минуты. До начала встречи.»\n\n"
            "Так появился OmniMindFlow.\n\n"
            "<b>Иногда лучший продукт рождается из самого раздражающего совещания.</b>"
        ),
        "tags": "#repost #aigc #omnimindflow #история #стартап",
    },

    # ══════════════════════════════════════════════════════
    # СОЦИАЛЬНОЕ ДОКАЗАТЕЛЬСТВО
    # ══════════════════════════════════════════════════════

    {
        "key": "proof_testimonial_omf",
        "type": "proof", "ratio": "expert", "channel": "omf",
        "title": "Отзыв: тимлид о стендапе",
        "text": (
            "«Два месяца назад наш стендап занимал 40 минут.\n"
            "Сейчас — 7. Каждый приходит уже с саммари в голове,\n"
            "потому что OmniMindFlow отправил его за 5 минут до встречи.\n"
            "Мы больше не вспоминаем. Мы только решаем.»\n\n"
            "— Senior Engineering Manager, финтех-стартап\n\n"
            "Это не исключение. Это паттерн.\n\n"
            "Средняя экономия у команд, которые внедрили OMF:\n"
            "• Стендап: -70% времени\n"
            "• Code review turnaround: -40%\n"
            "• «Потерял где-то» — исчезает полностью\n\n"
            "→ omnimindflow.com"
        ),
        "tags": "#repost #aigc #omnimindflow #отзывы",
    },
]


# ─── Стратегия ротации 80/20 ─────────────────────────────────────────────────
WEEKLY_PLAN = [
    ("Пн", ["case", "serial"]),         # экспертиза — кейс
    ("Вт", ["tip", "faq"]),             # лайфхак / FAQ
    ("Ср", ["myth", "opinion"]),        # миф / мнение
    ("Чт", ["tip", "case"]),            # инструмент / кейс
    ("Пт", ["personal"]),               # личное (20%)
    ("Сб", ["faq", "myth"]),            # FAQ или миф
    ("Вс", ["opinion", "story"]),       # аналитика / история
]

CHANNEL_LABELS = {"omf": "OmniMindFlow", "wef": "WinExtraFlow", "any": "Любой"}


# ─── State (ротация) ─────────────────────────────────────────────────────────
def load_state() -> dict:
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text(encoding="utf-8-sig"))
        except Exception:
            pass
    return {"published": [], "last_key": None}

def save_state(s: dict):
    STATE_FILE.write_text(json.dumps(s, ensure_ascii=False, indent=2), encoding="utf-8")


# ─── Helpers ─────────────────────────────────────────────────────────────────
def find_post(key: str) -> dict | None:
    return next((p for p in POSTS if p["key"] == key), None)

def next_post(state: dict) -> dict | None:
    published = set(state.get("published", []))
    for post in POSTS:
        if post["key"] not in published:
            return post
    # Full cycle — reset rotation
    state["published"] = []
    return POSTS[0]

def format_post(post: dict, verbose: bool = True) -> str:
    lines = []
    if verbose:
        lines.append(f"[{post['key']}] {post['title']}")
        lines.append(f"Тип: {post['type']} | Канал: {CHANNEL_LABELS.get(post['channel'], post['channel'])} | Доля: {post['ratio']}")
        lines.append("")
    lines.append(post["text"])
    lines.append("")
    lines.append(post["tags"])
    return "\n".join(lines)


# ─── Публикация ──────────────────────────────────────────────────────────────
def publish_to_telegram(post: dict, channel_id: str) -> dict:
    import urllib.request
    if not BOT_TOKEN or not channel_id:
        raise RuntimeError("BOT_TOKEN или channel_id не настроены в .env")
    text = post["text"] + "\n\n" + post["tags"]
    payload = json.dumps({
        "chat_id": channel_id,
        "text": text[:4096],
        "parse_mode": "HTML",
        "disable_web_page_preview": True,
    }).encode("utf-8")
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage",
        data=payload,
        headers={"Content-Type": "application/json; charset=utf-8"},
    )
    import ssl
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
        return json.loads(resp.read())


def resolve_channel(post: dict) -> tuple[str, str]:
    """Returns (channel_id, channel_label)."""
    if post["channel"] == "wef":
        return WEF_CHANNEL, "WEF Signals"
    elif post["channel"] == "omf":
        return OMF_CHANNEL, "OMF Profiles"
    else:  # any → default OMF
        return OMF_CHANNEL, "OMF Profiles"


# ─── CLI ─────────────────────────────────────────────────────────────────────
def cmd_list():
    print(f"{'KEY':<30} {'ТИП':<10} {'КАНАЛ':<8} {'ДОЛЯ':<10} НАЗВАНИЕ")
    print("-" * 80)
    for p in POSTS:
        print(f"{p['key']:<30} {p['type']:<10} {p['channel']:<8} {p['ratio']:<10} {p['title']}")

def cmd_show(key: str):
    post = find_post(key)
    if not post:
        print(f"Пост '{key}' не найден. Используй: python brand-posts.py list")
        sys.exit(1)
    print(format_post(post))

def cmd_next():
    state = load_state()
    post = next_post(state)
    if not post:
        print("Все посты опубликованы. Ротация будет сброшена при следующем запуске.")
        return
    print(format_post(post))
    print(f"\n→ Опубликовать: python brand-posts.py publish {post['key']}")

def cmd_week():
    state = load_state()
    published = set(state.get("published", []))
    by_type = {}
    for p in POSTS:
        by_type.setdefault(p["type"], []).append(p)

    print("═══ План на неделю (80/20 формула) ═══\n")
    for day, types in WEEKLY_PLAN:
        candidates = []
        for t in types:
            for p in by_type.get(t, []):
                if p["key"] not in published:
                    candidates.append(p)
                    break
        if candidates:
            p = candidates[0]
            print(f"{day}: [{p['type']}] {p['title']}")
            print(f"   Канал: {CHANNEL_LABELS.get(p['channel'], p['channel'])} | Key: {p['key']}")
            print(f"   Команда: python brand-posts.py publish {p['key']}")
        else:
            print(f"{day}: нет неопубликованных постов типа {types}")
        print()

def cmd_publish(key: str):
    if key == "next":
        state = load_state()
        post = next_post(state)
        if not post:
            print("Нет постов для публикации.")
            return
    else:
        post = find_post(key)
        if not post:
            print(f"Пост '{key}' не найден.")
            sys.exit(1)
        state = load_state()

    channel_id, channel_label = resolve_channel(post)
    print(f"Публикую [{post['key']}] → {channel_label}…", end=" ", flush=True)

    try:
        result = publish_to_telegram(post, channel_id)
        msg_id = result.get("result", {}).get("message_id", "?")
        print(f"OK (message_id={msg_id})")

        # Update state
        published = state.get("published", [])
        if post["key"] not in published:
            published.append(post["key"])
        state["published"] = published
        state["last_key"] = post["key"]
        state["last_published_at"] = datetime.now(timezone.utc).isoformat()
        save_state(state)
        print(f"Состояние обновлено → {STATE_FILE.name}")
    except Exception as e:
        print(f"ОШИБКА: {e}")
        sys.exit(1)


def main():
    args = sys.argv[1:]
    if not args or args[0] == "list":
        cmd_list()
    elif args[0] == "show" and len(args) >= 2:
        cmd_show(args[1])
    elif args[0] == "next":
        cmd_next()
    elif args[0] == "week":
        cmd_week()
    elif args[0] == "publish" and len(args) >= 2:
        cmd_publish(args[1])
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
