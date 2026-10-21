export const dynamic = 'force-static';
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export default function CookiesPage() {
  return (
    <div className="min-h-screen px-8 py-10" style={{ background: "#07060d" }}>
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-sm mb-8" style={{ color: "#6b6885" }}>
          <ArrowLeft className="w-4 h-4" /> Назад
        </Link>
        <h1 className="text-2xl font-bold mb-2" style={{ color: "#ede8ff" }}>Cookie Policy</h1>
        <p className="text-xs mb-8" style={{ color: "#6b6885" }}>Последнее обновление: 01.01.2025</p>
        <div className="space-y-6 text-sm">
          {[
            ["Что такое cookies", "Cookies — небольшие файлы, которые сохраняются в браузере для запоминания ваших предпочтений и состояния сессии."],
            ["Необходимые cookies", "rcf_token — токен аутентификации (HTTP-only, 7 дней). Без него сервис не работает. Не требует согласия."],
            ["Аналитические cookies", "Используются только с вашего согласия для понимания того, как пользователи взаимодействуют с сервисом. Данные анонимизированы."],
            ["Управление cookies", "Вы можете удалить cookies в настройках браузера. Удаление rcf_token приведёт к выходу из аккаунта."],
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
