import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { TestClient, createHonoTestClient } from '@app/server/testing/test-client';
import {
    type TestAuthSetup,
    cleanupTestUser,
    setupTestAuth,
} from '@app/server/testing/utils/auth-setup';

describe('Post API Endpoints', () => {
    let auth: TestAuthSetup;
    let testClient: TestClient;

    beforeAll(async () => {
        auth = await setupTestAuth();
        testClient = createHonoTestClient();
    });

    afterAll(async () => {
        await cleanupTestUser(auth?.testUser);
    });

    describe('Authentication Tests', () => {
        it('should reject unauthenticated requests', async () => {
            const res = await testClient.api.posts.$get({ query: {} });
            expect(res.status).toBe(401);
        });

        it('should accept authenticated requests', async () => {
            const res = await testClient.api.posts.$get(
                { query: { page: 1, pageSize: 10 } },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(200);
            const posts = await res.json();
            expect(Array.isArray(posts)).toBe(true);
        });
    });

    describe('Post CRUD Operations', () => {
        let createdPostId: string;

        const newPost = {
            title: 'Integration Test Post',
            content: 'This post was created by an automated test',
        };
        it('should create a new post', async () => {
            const res = await testClient.api.posts.$post(
                { json: newPost },
                { headers: auth.authHeaders }
            );

            // Handle Hono RPC discriminated union response
            expect(res.status).toBe(201);
            if (res.status === 201) {
                const response = await res.json();
                expect(response.success).toBe(true);

                const post = response.data;
                createdPostId = post.id; // Capture ID immediately

                expect(post.title).toBe(newPost.title);
                expect(post.content).toBe(newPost.content);
                expect(post.id).toBeDefined();
                expect(post.userId).toBeDefined();
                expect(post.createdAt).toBeDefined();
                expect(post.updatedAt).toBeDefined();
            }
        });

        it('should retrieve a created post by ID', async () => {
            if (!createdPostId) return;

            const res = await testClient.api.posts[':id'].$get(
                { param: { id: createdPostId } },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(200);
            if (res.status === 200) {
                const post = await res.json();
                const postTitle = post.title;
                expect(post.id).toBe(createdPostId);
                expect(postTitle).toBe(newPost.title);
                expect(post.content).toBe(newPost.content);
            }
        });

        it('should update an existing post', async () => {
            if (!createdPostId) return;

            const updateData = { title: 'Updated Title' };

            const res = await testClient.api.posts[':id'].$patch(
                {
                    param: { id: createdPostId },
                    json: updateData,
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(201);
            if (res.status === 201) {
                const response = await res.json();
                const updated = response.data;

                expect(updated.title).toBe(updateData.title);
                expect(updated.content).toBe('This post was created by an automated test'); // Content preserved
            }
        });

        it('should delete a post', async () => {
            if (!createdPostId) return;

            const res = await testClient.api.posts[':id'].$delete(
                { param: { id: createdPostId } },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(201);
            if (res.status === 201) {
                const response = await res.json();
                expect(response.success).toBe(true);
            }

            // Verify it's gone
            const fetchRes = await testClient.api.posts[':id'].$get(
                { param: { id: createdPostId } },
                { headers: auth.authHeaders }
            );
            expect(fetchRes.status).toBe(404);
        });

        it('should return 404 for non-existent post', async () => {
            const res = await testClient.api.posts[':id'].$get(
                { param: { id: 'non-existent-id' } },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(404);
        });
    });

    describe('Input Validation', () => {
        it('should validate required fields', async () => {
            const res = await testClient.api.posts.$post(
                {
                    // @ts-expect-error - Missing title
                    json: { content: 'Content without title' },
                },
                { headers: auth.authHeaders }
            );

            expect(res.status).toBe(400);
        });

        it('should validate empty strings', async () => {
            const res = await testClient.api.posts.$post(
                {
                    json: { title: '', content: 'Content' },
                },
                { headers: auth.authHeaders }
            );

            // Zod schema usually enforces min(1) for strings or non-empty
            // If your schema allows empty strings, this test should expect 201.
            // Let's assume strict validation for now.
            expect(res.status).toBe(400);
        });
    });

    describe('Security - User Isolation', () => {
        let userBAuth: TestAuthSetup;
        let userAPostId: string;

        beforeAll(async () => {
            // User A (auth) already exists. Create User B.
            userBAuth = await setupTestAuth();

            // Create a post for User A
            const res = await testClient.api.posts.$post(
                { json: { title: 'User A Private Post', content: 'Secret' } },
                { headers: auth.authHeaders }
            );

            if (res.status === 201) {
                const body = await res.json();
                userAPostId = body.data.id;
            }
        });

        afterAll(async () => {
            await cleanupTestUser(userBAuth?.testUser);
        });

        it('should prevent User B from accessing User A posts list', async () => {
            const res = await testClient.api.posts.$get(
                { query: {} },
                { headers: userBAuth.authHeaders }
            );

            expect(res.status).toBe(200);
            if (res.status === 200) {
                const posts = await res.json();
                // User B should verify they don't see User A's post
                const userAPost = posts.find((p) => p.id === userAPostId);
                expect(userAPost).toBeUndefined();
            }
        });

        it('should prevent User B from accessing User A specific post', async () => {
            if (!userAPostId) return;

            const res = await testClient.api.posts[':id'].$get(
                { param: { id: userAPostId } },
                { headers: userBAuth.authHeaders }
            );

            // Should return 404 (Not Found) effectively masking existence
            expect(res.status).toBe(404);
        });

        it('should prevent User B from updating User A post', async () => {
            if (!userAPostId) return;

            const res = await testClient.api.posts[':id'].$patch(
                {
                    param: { id: userAPostId },
                    json: { title: 'Hacked Title' },
                },
                { headers: userBAuth.authHeaders }
            );

            expect(res.status).toBe(404);
        });

        it('should prevent User B from deleting User A post', async () => {
            if (!userAPostId) return;

            const res = await testClient.api.posts[':id'].$delete(
                { param: { id: userAPostId } },
                { headers: userBAuth.authHeaders }
            );

            expect(res.status).toBe(404);
        });
    });
});
