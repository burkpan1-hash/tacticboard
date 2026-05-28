import { pgTable, text, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { user } from './auth-schema'

export { user, session, account, verification } from './auth-schema'

export const plays = pgTable('plays', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  data: jsonb('data').notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  shareToken: text('share_token').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Play = typeof plays.$inferSelect
export type NewPlay = typeof plays.$inferInsert
