import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

import { user } from '@shared/schemas/db/auth';

export const post = pgTable('post', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    userId: text('user_id')
        .references(() => user.id, { onDelete: 'cascade' })
        .notNull(),
});

export const postRelations = relations(post, ({ one }) => ({
    user: one(user, {
        fields: [post.userId],
        references: [user.id],
    }),
}));
