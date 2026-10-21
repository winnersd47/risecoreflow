const Database = require("better-sqlite3");
const path = require("path");
const db = new Database(path.join(__dirname, "..", "dev.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS Experiment (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    name TEXT NOT NULL,
    hypothesis TEXT,
    type TEXT DEFAULT 'ab_test',
    status TEXT DEFAULT 'draft',
    primaryMetric TEXT,
    controlName TEXT DEFAULT 'Control',
    controlConversions INTEGER DEFAULT 0,
    controlVisitors INTEGER DEFAULT 0,
    variantName TEXT DEFAULT 'Variant A',
    variantConversions INTEGER DEFAULT 0,
    variantVisitors INTEGER DEFAULT 0,
    confidence REAL DEFAULT 0,
    winner TEXT DEFAULT 'running',
    startDate TEXT,
    endDate TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS Campaign (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    name TEXT NOT NULL,
    channel TEXT NOT NULL,
    status TEXT DEFAULT 'planned',
    budget REAL DEFAULT 0,
    spent REAL DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    revenue REAL DEFAULT 0,
    utmSource TEXT,
    utmMedium TEXT,
    utmCampaign TEXT,
    startDate TEXT,
    endDate TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS Competitor (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    name TEXT NOT NULL,
    url TEXT,
    positioning TEXT,
    pricing TEXT,
    strengths TEXT,
    weaknesses TEXT,
    ourAdvantages TEXT,
    targetAudience TEXT,
    threatLevel TEXT DEFAULT 'medium',
    notes TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS GrowthEntry (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    week INTEGER NOT NULL,
    newVisitors INTEGER,
    newSignups INTEGER,
    activatedUsers INTEGER,
    wau INTEGER,
    retentionRate REAL,
    mrr REAL,
    churnRate REAL,
    referrals INTEGER,
    viralCoefficient REAL,
    northStarValue REAL,
    northStarLabel TEXT,
    notes TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ICP (
    id TEXT PRIMARY KEY,
    projectId TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    role TEXT,
    companySize TEXT,
    industry TEXT,
    painPoints TEXT,
    goals TEXT,
    objections TEXT,
    messagingAngle TEXT,
    channels TEXT,
    score INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
`);

db.close();
console.log("✅ Migration v2 complete — 5 new tables created");
