import { relations } from 'drizzle-orm';
import { pgTable, text } from 'drizzle-orm/pg-core';

import { createSystemTableFields } from '@shared/lib/db/system-fields/factory';
import { user } from '@shared/schemas/db/auth';

export const post = pgTable('post', {
    ...createSystemTableFields(),
    title: text('title').notNull(),
    content: text('content').notNull(),
});

export const postRelations = relations(post, ({ one }) => ({
    user: one(user, {
        fields: [post.userId],
        references: [user.id],
    }),
}));
