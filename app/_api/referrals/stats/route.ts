export const dynamic = "force-static"
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import db from '@/lib/db'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const referrals = db.prepare(
    'SELECT level, rewardDays, status FROM Referral WHERE referrerId = ?'
  ).all(user.userId) as { level: number; rewardDays: number; status: string }[]

  const l1 = referrals.filter(r => r.level === 1).length
  const l2 = referrals.filter(r => r.level === 2).length
  const earnedDays = referrals
    .filter(r => r.status === 'credited')
    .reduce((s, r) => s + r.rewardDays, 0)

  const dbUser = db.prepare('SELECT referralCode FROM User WHERE id = ?').get(user.userId) as
    { referralCode: string } | undefined

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  return NextResponse.json({
    referral_code: dbUser?.referralCode ?? null,
    share_link: `${appUrl}/register?ref=${dbUser?.referralCode ?? ''}`,
    level1_count: l1,
    level2_count: l2,
    total_referrals: l1 + l2,
    earned_days: earnedDays,
  })
}
