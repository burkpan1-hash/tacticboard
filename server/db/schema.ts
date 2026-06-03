import { pgTable, text, boolean, timestamp, jsonb, index } from 'drizzle-orm/pg-core'
import { user } from './auth-schema'

export { user, session, account, verification } from './auth-schema'

export const guestPlays = pgTable('guest_plays', {
  id: text('id').primaryKey(),
  shareToken: text('share_token').unique().notNull(),
  title: text('title').notNull(),
  data: jsonb('data').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type GuestPlay = typeof guestPlays.$inferSelect

export const plays = pgTable('plays', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  data: jsonb('data').notNull(),
  isPublic: boolean('is_public').default(false).notNull(),
  shareToken: text('share_token').unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('plays_user_id_idx').on(table.userId),
])

export type Play = typeof plays.$inferSelect
export type NewPlay = typeof plays.$inferInsert
