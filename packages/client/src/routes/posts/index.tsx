import { useSuspenseQuery } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { apiEndpoints } from '@/api';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/posts/')({
    validateSearch: z
        .object({
            page: z.coerce.number().optional(),
            limit: z.coerce.number().optional(),
        })
        .partial()
        .optional(),
    component: RouteComponent,
    loaderDeps: ({ search }) => ({ page: search?.page, limit: search?.limit }),
    loader: async ({ context: { queryClient }, deps: { page, limit } }) => {
        const options = {
            page: page?.toString(),
            limit: limit?.toString(),
        };
        // Ensure data is fetched/cached
        await queryClient.ensureQueryData(
            apiEndpoints.posts.getMany({
                query: options,
            })
        );
        // Return the options so the component doesn't have to rebuild them
        return { options };
    },
    pendingComponent: () => <div>Loading...</div>,
    errorComponent: () => <div>Error</div>,
});

function RouteComponent() {
    const { options } = Route.useLoaderData();
    const postsQuery = useSuspenseQuery(apiEndpoints.posts.getMany({ query: options }));

    const navigate = Route.useNavigate();
    const posts = postsQuery.data ?? [];

    return (
        <div className="space-y-2 p-4">
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate({ search: { limit: '2' } })}>
                    Show 2 posts
                </Button>
                <Button variant="outline" onClick={() => navigate({ search: { limit: '5' } })}>
                    Show 5 posts
                </Button>
            </div>
            <h1 className="text-lg font-medium">Test Backend API Calls with Posts</h1>
            {posts.slice(0, 10).map((post) => (
                <div className="border p-2 rounded-md" key={post.id}>
                    <Link
                        className="text-blue-500 hover:underline"
                        to={`/posts/$postId`}
                        params={{ postId: post.id.toString() }}
                    >
                        {post.title}
                    </Link>
                    <p className="text-sm text-gray-500">{post.content}</p>
                </div>
            ))}
        </div>
    );
}
