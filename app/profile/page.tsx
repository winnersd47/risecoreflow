export const dynamic = 'force-static';
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import db from '@/lib/db'
import { PLAN_PRICING } from '@/lib/plans'

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const dbUser = db.prepare('SELECT * FROM User WHERE id = ?').get(user.userId) as {
    id: string; email: string; username: string; plan: string
    planExpiresAt: string | null; referralCode: string; createdAt: string
  } | undefined

  if (!dbUser) redirect('/login')

  const isPro    = dbUser.plan === 'pro' || dbUser.plan === 'agency'
  const expiry   = dbUser.planExpiresAt ? new Date(dbUser.planExpiresAt) : null
  const isActive = expiry ? expiry > new Date() : false

  return (
    <main className="min-h-screen bg-[#07060d] text-[#ede8ff] p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Профиль</h1>

      {/* Основная информация */}
      <section className="bg-[#0d0b18] border border-[#1e1c38] rounded-xl p-5 mb-4">
        <h2 className="text-sm text-[#6b6885] uppercase tracking-wider mb-4">Аккаунт</h2>
        <div className="space-y-3">
          <Row label="Email"     value={dbUser.email} />
          <Row label="Имя"       value={dbUser.username} />
          <Row label="Участник с" value={new Date(dbUser.createdAt).toLocaleDateString('ru-RU')} />
        </div>
      </section>

      {/* Тарифный план */}
      <section className="bg-[#0d0b18] border border-[#1e1c38] rounded-xl p-5 mb-4">
        <h2 className="text-sm text-[#6b6885] uppercase tracking-wider mb-4">Подписка</h2>
        <div className="flex items-center justify-between">
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              isPro && isActive
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-[#1e1c38] text-[#6b6885]'
            }`}>
              {dbUser.plan.toUpperCase()}
            </span>
            {expiry && (
              <p className="text-xs text-[#6b6885] mt-1">
                {isActive
                  ? `Активна до ${expiry.toLocaleDateString('ru-RU')}`
                  : 'Подписка истекла'}
              </p>
            )}
          </div>
          {!isPro && (
            <a
              href="/projects"
              className="text-sm px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:opacity-90 transition"
            >
              Upgrade → Pro
            </a>
          )}
        </div>
      </section>

      {/* Реферальная программа */}
      <section className="bg-[#0d0b18] border border-[#1e1c38] rounded-xl p-5 mb-4">
        <h2 className="text-sm text-[#6b6885] uppercase tracking-wider mb-4">Реферальная программа</h2>
        <p className="text-sm text-[#6b6885] mb-3">
          Приглашай друзей — получай <span className="text-amber-400">+7 дней Pro</span> за каждого.
        </p>
        <ReferralCodeBlock code={dbUser.referralCode} />
        <a href="/profile/referrals" className="text-sm text-indigo-400 hover:underline mt-3 inline-block">
          Статистика рефералов →
        </a>
      </section>

      {/* Быстрые ссылки */}
      <section className="grid grid-cols-2 gap-3">
        <a href="/profile/billing"
           className="bg-[#0d0b18] border border-[#1e1c38] rounded-xl p-4 hover:border-amber-500/40 transition">
          <p className="font-medium">История платежей</p>
          <p className="text-xs text-[#6b6885] mt-1">Счета и транзакции</p>
        </a>
        <a href="/settings/ai"
           className="bg-[#0d0b18] border border-[#1e1c38] rounded-xl p-4 hover:border-indigo-500/40 transition">
          <p className="font-medium">AI настройки</p>
          <p className="text-xs text-[#6b6885] mt-1">Ключи API, провайдер</p>
        </a>
      </section>
    </main>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-[#1e1c38] last:border-0">
      <span className="text-sm text-[#6b6885]">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  )
}

function ReferralCodeBlock({ code }: { code: string }) {
  const link = `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/register?ref=${code}`
  return (
    <div className="bg-[#13112a] border border-[#1e1c38] rounded-lg p-3 font-mono text-sm">
      <p className="text-amber-400 text-xs mb-1">Ваша реферальная ссылка</p>
      <p className="text-[#ede8ff] break-all">{link}</p>
    </div>
  )
}
