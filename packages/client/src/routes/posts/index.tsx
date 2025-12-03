import { apiClient } from '@/lib/api/client';
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, Link } from '@tanstack/react-router';

const postsQueryOptions = queryOptions({
    queryKey: ['posts'],
    queryFn: async () => {
        // simulate a slow request
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const res = await apiClient.posts.$get();

        if (!res.ok) {
            throw new Error('Failed to fetch posts');
        }

        return res.json();
    },
});

export const Route = createFileRoute('/posts/')({
    component: RouteComponent,
    loader: ({ context: { queryClient } }) => {
        return queryClient.ensureQueryData(postsQueryOptions);
    },
    pendingComponent: () => <div>Loading...</div>,
    errorComponent: () => <div>Error</div>,
});

function RouteComponent() {
    const postsQuery = useSuspenseQuery(postsQueryOptions);
    const posts = postsQuery.data;
    return (
        <div className="space-y-2 p-4">
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
