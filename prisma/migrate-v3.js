/**
 * RiseCoreFlow — migrate-v3.js
 * Создаёт таблицы User, Notification, Payment, Referral, UserAchievement
 * Запуск: node prisma/migrate-v3.js
 */

const Database = require('better-sqlite3')
const path = require('path')

const DB_PATH = process.env.DATABASE_URL?.replace('file:', '') ?? './prisma/dev.db'
const db = new Database(path.resolve(DB_PATH))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

const migrations = db.transaction(() => {

  // ──────────────────────────────────────────────
  // 1. Users
  // ──────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS User (
      id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      email          TEXT UNIQUE NOT NULL,
      username       TEXT UNIQUE NOT NULL,
      passwordHash   TEXT NOT NULL,
      plan           TEXT NOT NULL DEFAULT 'free',
      planExpiresAt  DATETIME,
      referralCode   TEXT UNIQUE NOT NULL,
      referredBy     TEXT,
      createdAt      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.exec(`CREATE INDEX IF NOT EXISTS idx_user_email        ON User(email)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_user_referralCode ON User(referralCode)`)

  // ──────────────────────────────────────────────
  // 2. Notifications
  // ──────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS Notification (
      id        TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      userId    TEXT NOT NULL REFERENCES User(id) ON DELETE CASCADE,
      type      TEXT NOT NULL DEFAULT 'info',
      title     TEXT NOT NULL,
      message   TEXT NOT NULL,
      isRead    INTEGER NOT NULL DEFAULT 0,
      actionUrl TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.exec(`CREATE INDEX IF NOT EXISTS idx_notification_userId ON Notification(userId)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_notification_isRead ON Notification(isRead)`)

  // ──────────────────────────────────────────────
  // 3. Payments
  // ──────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS Payment (
      id        TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      userId    TEXT NOT NULL REFERENCES User(id) ON DELETE CASCADE,
      gateway   TEXT NOT NULL,
      plan      TEXT NOT NULL,
      amount    REAL NOT NULL,
      currency  TEXT NOT NULL DEFAULT 'RUB',
      status    TEXT NOT NULL DEFAULT 'pending',
      txId      TEXT,
      metadata  TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.exec(`CREATE INDEX IF NOT EXISTS idx_payment_userId ON Payment(userId)`)
  db.exec(`CREATE INDEX IF NOT EXISTS idx_payment_txId   ON Payment(txId)`)

  // ──────────────────────────────────────────────
  // 4. Referrals
  // ──────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS Referral (
      id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      referrerId  TEXT NOT NULL REFERENCES User(id) ON DELETE CASCADE,
      referredId  TEXT NOT NULL UNIQUE REFERENCES User(id) ON DELETE CASCADE,
      level       INTEGER NOT NULL DEFAULT 1,
      rewardDays  INTEGER NOT NULL DEFAULT 7,
      status      TEXT NOT NULL DEFAULT 'pending',
      createdAt   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.exec(`CREATE INDEX IF NOT EXISTS idx_referral_referrerId ON Referral(referrerId)`)

  // ──────────────────────────────────────────────
  // 5. UserAchievements (геймификация)
  // ──────────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS UserAchievement (
      userId         TEXT NOT NULL REFERENCES User(id) ON DELETE CASCADE,
      achievementKey TEXT NOT NULL,
      unlockedAt     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (userId, achievementKey)
    )
  `)

  console.log('✅ migrate-v3: таблицы User, Notification, Payment, Referral, UserAchievement созданы')
})

try {
  migrations()
} catch (err) {
  if (err.message?.includes('already exists')) {
    console.log('ℹ️  migrate-v3: таблицы уже существуют, пропускаем')
  } else {
    console.error('❌ migrate-v3 ошибка:', err.message)
    process.exit(1)
  }
} finally {
  db.close()
}
