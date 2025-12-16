import { relations } from 'drizzle-orm';
import { pgTable, text } from 'drizzle-orm/pg-core';

import { user } from '@shared/features/auth/table';
import { createSystemTableFields } from '@shared/lib/db/system-fields/factory';

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
