export const dynamic = 'force-static';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export default function TermsPage() {
  return (
    <div className="min-h-screen px-8 py-10" style={{ background: "#07060d", color: "#ede8ff" }}>
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-8" style={{ color: "#6b6885" }}>
          <ArrowLeft className="w-4 h-4" /> Назад
        </Link>
        <h1 className="text-2xl font-bold mb-2">Terms of Service</h1>
        <p className="text-xs mb-8" style={{ color: "#6b6885" }}>Последнее обновление: 01.01.2025</p>
        <div className="space-y-6 text-sm" style={{ color: "#ede8ff", lineHeight: "1.7" }}>
          {[
            ["1. Использование сервиса", "RiseCoreFlow предоставляет инструменты для управления маркетингом. Вы соглашаетесь использовать сервис только в законных целях. Запрещено использование для рассылки спама, нарушения прав третьих лиц и иных незаконных действий."],
            ["2. Аккаунт", "Вы несёте ответственность за безопасность своего аккаунта и всех действий, совершённых под вашими учётными данными. При обнаружении несанкционированного доступа немедленно сообщите нам."],
            ["3. Тарифы и оплата", "Бесплатный план предоставляется без ограничений по времени. Pro и Agency планы оплачиваются ежемесячно или ежегодно. Возврат средств осуществляется в течение 14 дней с момента оплаты при обращении в поддержку."],
            ["4. Данные", "Ваши данные хранятся на защищённых серверах. Мы не продаём и не передаём персональные данные третьим лицам без вашего согласия. Подробнее — в Privacy Policy."],
            ["5. Ограничение ответственности", "Сервис предоставляется «как есть». Мы не несём ответственности за косвенные убытки, упущенную выгоду или потерю данных."],
            ["6. Изменения", "Мы можем обновлять Terms of Service. Об изменениях уведомляем по email за 14 дней."],
          ].map(([title, text]) => (
            <div key={title as string}>
              <h2 className="font-semibold mb-2" style={{ color: "#f59e0b" }}>{title as string}</h2>
              <p style={{ color: "#6b6885" }}>{text as string}</p>
            </div>
          ))}
          <p className="text-xs pt-4" style={{ color: "#3d3a5c", borderTop: "1px solid #1e1c38" }}>
            По вопросам: hello@risecoreflow.com
          </p>
        </div>
      </div>
    </div>
  );
}
