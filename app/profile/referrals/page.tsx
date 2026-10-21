export const dynamic = 'force-static';
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import db from '@/lib/db'

interface Referral {
  id: string
  referredId: string
  level: number
  rewardDays: number
  status: string
  createdAt: string
}

interface ReferredUser {
  username: string
  email: string
}

export default async function ReferralsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const dbUser = db.prepare('SELECT referralCode, planExpiresAt FROM User WHERE id = ?').get(user.userId) as
    { referralCode: string; planExpiresAt: string | null } | undefined

  if (!dbUser) redirect('/login')

  const referrals = db.prepare(
    'SELECT * FROM Referral WHERE referrerId = ? ORDER BY createdAt DESC'
  ).all(user.userId) as Referral[]

  const totalDays = referrals
    .filter(r => r.status === 'credited')
    .reduce((sum, r) => sum + r.rewardDays, 0)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const refLink = `${appUrl}/register?ref=${dbUser.referralCode}`

  return (
    <main className="min-h-screen bg-[#07060d] text-[#ede8ff] p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <a href="/profile" className="text-[#6b6885] hover:text-[#ede8ff] text-sm">← Профиль</a>
        <h1 className="text-2xl font-bold">Рефералы</h1>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="Всего рефералов" value={String(referrals.length)} />
        <StatCard label="Дней Pro заработано" value={String(totalDays)} accent />
        <StatCard
          label="Подписка до"
          value={dbUser.planExpiresAt
            ? new Date(dbUser.planExpiresAt).toLocaleDateString('ru-RU')
            : '—'}
        />
      </div>

      {/* Реферальная ссылка */}
      <section className="bg-[#0d0b18] border border-[#1e1c38] rounded-xl p-5 mb-6">
        <h2 className="text-sm text-[#6b6885] uppercase tracking-wider mb-3">Ваша ссылка</h2>
        <div className="bg-[#13112a] border border-[#1e1c38] rounded-lg p-3 font-mono text-sm break-all mb-3">
          {refLink}
        </div>
        <p className="text-xs text-[#6b6885]">
          За каждого приглашённого — <span className="text-amber-400">+7 дней Pro</span> вам сразу после регистрации
        </p>
      </section>

      {/* Список рефералов */}
      <section className="bg-[#0d0b18] border border-[#1e1c38] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#1e1c38]">
          <h2 className="font-medium">История рефералов</h2>
        </div>
        {referrals.length === 0 ? (
          <div className="p-8 text-center text-[#6b6885]">
            <p>Пока никто не зарегистрировался по вашей ссылке</p>
            <p className="text-xs mt-2">Поделитесь ссылкой выше и получите +7 дней Pro</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[#6b6885] text-xs uppercase border-b border-[#1e1c38]">
                <th className="text-left p-4">Дата</th>
                <th className="text-left p-4">Уровень</th>
                <th className="text-right p-4">Бонус</th>
                <th className="text-right p-4">Статус</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map(r => (
                <tr key={r.id} className="border-b border-[#1e1c38] last:border-0 hover:bg-[#13112a] transition">
                  <td className="p-4 text-[#6b6885]">
                    {new Date(r.createdAt).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="p-4">Уровень {r.level}</td>
                  <td className="p-4 text-right text-amber-400">+{r.rewardDays} дн.</td>
                  <td className="p-4 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      r.status === 'credited'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {r.status === 'credited' ? 'Начислено' : 'Ожидание'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </main>
  )
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-[#0d0b18] border border-[#1e1c38] rounded-xl p-4 text-center">
      <p className={`text-2xl font-bold ${accent ? 'text-amber-400' : ''}`}>{value}</p>
      <p className="text-xs text-[#6b6885] mt-1">{label}</p>
    </div>
  )
}
