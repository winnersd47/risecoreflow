export const dynamic = "force-static"
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/plan-guard'

const YOOKASSA_SHOP_ID   = process.env.YOOKASSA_SHOP_ID   ?? ''
const YOOKASSA_SECRET    = process.env.YOOKASSA_SECRET_KEY ?? ''
const CRYPTOCLOUD_KEY    = process.env.CRYPTOCLOUD_API_KEY ?? ''
const CRYPTOCLOUD_SHOP   = process.env.CRYPTOCLOUD_SHOP_ID ?? ''
const APP_URL            = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3050'

const PLAN_PRICES: Record<string, number> = {
  pro_monthly:    2990,
  pro_annual:     23880,
  agency_monthly: 9990,
  agency_annual:  95880,
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req)
  if (!user) {
    return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
  }

  const { gateway, plan } = await req.json()
  const amount = PLAN_PRICES[plan]
  if (!amount) {
    return NextResponse.json({ error: 'Неверный тариф' }, { status: 400 })
  }

  try {
    if (gateway === 'yookassa') {
      return await createYooKassa(user.userId, plan, amount)
    }
    if (gateway === 'cryptocloud') {
      return await createCryptoCloud(user.userId, plan, amount)
    }
    return NextResponse.json({ error: 'Неизвестный шлюз' }, { status: 400 })
  } catch (err) {
    console.error('[payments/create]', err)
    return NextResponse.json({ error: 'Ошибка создания платежа' }, { status: 500 })
  }
}

async function createYooKassa(userId: string, plan: string, amount: number) {
  const idempotencyKey = crypto.randomUUID()
  const res = await fetch('https://api.yookassa.ru/v2/payments', {
    method: 'POST',
    headers: {
      'Content-Type':    'application/json',
      'Idempotence-Key': idempotencyKey,
      'Authorization':   'Basic ' + btoa(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET}`),
    },
    body: JSON.stringify({
      amount:       { value: amount.toFixed(2), currency: 'RUB' },
      confirmation: { type: 'redirect', return_url: `${APP_URL}/payment/success?plan=${plan}` },
      capture:      true,
      description:  `RiseCoreFlow — ${plan}`,
      metadata:     { userId, plan },
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(JSON.stringify(err))
  }

  const data = await res.json()
  return NextResponse.json({
    paymentId:  data.id,
    paymentUrl: data.confirmation?.confirmation_url,
  })
}

async function createCryptoCloud(userId: string, plan: string, amount: number) {
  const res = await fetch('https://api.cryptocloud.plus/v2/invoice/create', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Token ${CRYPTOCLOUD_KEY}`,
    },
    body: JSON.stringify({
      shop_id:  CRYPTOCLOUD_SHOP,
      amount,
      currency: 'RUB',
      order_id: `${userId}_${plan}_${Date.now()}`,
    }),
  })

  if (!res.ok) throw new Error('CryptoCloud error')
  const data = await res.json()
  return NextResponse.json({
    paymentId:  data.result?.uuid,
    paymentUrl: data.result?.link,
  })
}
