export const dynamic = "force-static"
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import db from '@/lib/db'
import { nanoid } from 'nanoid'

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let dbUser = db.prepare('SELECT referralCode FROM User WHERE id = ?').get(user.userId) as
    { referralCode: string | null } | undefined

  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Auto-generate if missing
  if (!dbUser.referralCode) {
    const code = nanoid(8).toUpperCase()
    db.prepare('UPDATE User SET referralCode = ? WHERE id = ?').run(code, user.userId)
    dbUser = { referralCode: code }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  return NextResponse.json({
    referral_code: dbUser.referralCode,
    share_link: `${appUrl}/register?ref=${dbUser.referralCode}`,
  })
}
