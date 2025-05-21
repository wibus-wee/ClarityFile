import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import * as schema from '../db/schema'
import fs from 'fs'
import { app } from 'electron'
import path from 'path'

const dbPath = import.meta.env.DEV ? 'local.db' : path.join(app.getPath('userData'), 'data.db')

fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const sqlite = new Database(dbPath)

export const db = drizzle(sqlite, { schema })

export const runMigrate = async () => {
  migrate(db, {
    migrationsFolder: path.join(__dirname, '../../drizzle')
  })
}
