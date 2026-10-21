export const dynamic = 'force-static';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-8 py-10" style={{ background: "#07060d", color: "#ede8ff" }}>
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-8" style={{ color: "#6b6885" }}>
          <ArrowLeft className="w-4 h-4" /> Назад
        </Link>
        <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-xs mb-8" style={{ color: "#6b6885" }}>Последнее обновление: 01.01.2025</p>
        <div className="space-y-6 text-sm">
          {[
            ["Какие данные мы собираем", "Email, имя пользователя, данные об использовании сервиса (проекты, посты, задачи). Платёжные данные обрабатываются платёжными провайдерами и не хранятся на наших серверах."],
            ["Как мы используем данные", "Для предоставления функций сервиса, отправки уведомлений об аккаунте и (с вашего согласия) маркетинговых материалов. Данные используются для улучшения сервиса в агрегированном виде."],
            ["Передача данных третьим лицам", "Мы не продаём персональные данные. Данные могут передаваться только платёжным провайдерам (ЮKassa, CryptoCloud, Prodamus) в объёме, необходимом для обработки платежей."],
            ["Хранение данных", "Данные хранятся на серверах в РФ. При удалении аккаунта данные удаляются в течение 30 дней."],
            ["Ваши права", "Вы можете запросить копию своих данных, исправить или удалить их, написав на hello@risecoreflow.com."],
            ["Cookies", "Используем только необходимые cookies для аутентификации. Аналитические cookies — с вашего согласия."],
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
