export const dynamic = "force-static"
import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/db'

// YooKassa шлёт вебхук без HMAC — проверяй по IP: 185.71.76.0/27, 185.71.77.0/27
// В продакшене добавь IP-фильтрацию через Nginx/middleware

export async function POST(req: NextRequest) {
  const body = await req.json()

  const event     = body.event as string
  const paymentId = body.object?.id as string
  const metadata  = body.object?.metadata as Record<string, string> | undefined

  if (!paymentId || !metadata?.userId || !metadata?.plan) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  if (event === 'payment.succeeded') {
    await handlePaymentSuccess(paymentId, metadata.userId, metadata.plan, body.object?.amount?.value)
  }

  if (event === 'payment.canceled') {
    await handlePaymentFailed(paymentId, metadata.userId)
  }

  return NextResponse.json({ ok: true })
}

async function handlePaymentSuccess(
  paymentId: string,
  userId: string,
  plan: string,
  amountStr?: string,
) {
  const amount = parseFloat(amountStr ?? '0')

  // Записать платёж
  db.prepare(`
    INSERT OR REPLACE INTO Payment (id, userId, gateway, plan, amount, currency, status, txId, updatedAt)
    VALUES (lower(hex(randomblob(16))), ?, 'yookassa', ?, ?, 'RUB', 'paid', ?, CURRENT_TIMESTAMP)
  `).run(userId, plan, amount, paymentId)

  // Вычислить дату окончания плана
  const planName  = plan.replace(/_monthly|_annual/, '')
  const isAnnual  = plan.includes('annual')
  const daysToAdd = isAnnual ? 365 : 30

  const user = db.prepare('SELECT planExpiresAt FROM User WHERE id = ?').get(userId) as
    { planExpiresAt: string | null } | undefined

  const base    = user?.planExpiresAt && new Date(user.planExpiresAt) > new Date()
    ? new Date(user.planExpiresAt)
    : new Date()
  const expires = new Date(base)
  expires.setDate(expires.getDate() + daysToAdd)

  db.prepare(`
    UPDATE User SET plan = ?, planExpiresAt = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?
  `).run(planName, expires.toISOString(), userId)

  // Уведомление
  db.prepare(`
    INSERT INTO Notification (id, userId, type, title, message, createdAt)
    VALUES (lower(hex(randomblob(16))), ?, 'success', 'Подписка активирована',
            'Ваш план ' || ? || ' активирован до ' || ?, CURRENT_TIMESTAMP)
  `).run(userId, planName, expires.toLocaleDateString('ru-RU'))
}

async function handlePaymentFailed(paymentId: string, userId: string) {
  db.prepare(`
    INSERT OR REPLACE INTO Payment (id, userId, gateway, plan, amount, currency, status, txId, updatedAt)
    VALUES (lower(hex(randomblob(16))), ?, 'yookassa', 'unknown', 0, 'RUB', 'failed', ?, CURRENT_TIMESTAMP)
  `).run(userId, paymentId)
}
