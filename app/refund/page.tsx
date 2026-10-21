export const dynamic = 'force-static';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export default function RefundPage() {
  return (
    <div className="min-h-screen px-8 py-10" style={{ background: "#07060d" }}>
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-8" style={{ color: "#6b6885" }}>
          <ArrowLeft className="w-4 h-4" /> Назад
        </Link>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "#ede8ff" }}>Политика возврата</h1>
        <p className="text-xs mb-8" style={{ color: "#6b6885" }}>Последнее обновление: 01.01.2025</p>
        <div className="space-y-6 text-sm">
          {[
            ["14-дневная гарантия возврата", "Если вы оплатили Pro или Agency план и не удовлетворены сервисом, мы вернём полную стоимость в течение 14 дней с момента оплаты — без вопросов."],
            ["Как запросить возврат", "Напишите на hello@risecoreflow.com с темой «Возврат» и укажите email аккаунта. Обрабатываем в течение 24 часов в рабочие дни."],
            ["Сроки зачисления", "Карты РФ/СБП — 3-5 рабочих дней. Международные карты — 5-10 рабочих дней. Крипто — 1-3 рабочих дня."],
            ["Исключения", "Возврат не предоставляется если прошло более 14 дней с момента оплаты или если аккаунт был заблокирован за нарушение Terms of Service."],
          ].map(([title, text]) => (
            <div key={title as string}>
              <h2 className="font-semibold mb-2" style={{ color: "#f59e0b" }}>{title as string}</h2>
              <p style={{ color: "#6b6885" }}>{text as string}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
