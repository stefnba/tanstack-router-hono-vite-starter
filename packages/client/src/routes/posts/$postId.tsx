import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { apiEndpoints } from '@/api';

export const Route = createFileRoute('/posts/$postId')({
    component: RouteComponent,
    loader: async ({ context: { queryClient }, params: { postId } }) => {
        await queryClient.ensureQueryData(apiEndpoints.posts.getOne({ param: { postId } }));

        return { postId };
    },
    pendingComponent: () => <div>Loading...</div>,
    errorComponent: () => <div>Error</div>,
});

function RouteComponent() {
    const { postId } = Route.useParams();
    const { data: post } = useSuspenseQuery(apiEndpoints.posts.getOne({ param: { postId } }));

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">{post.title}</h1>
            <p className="mt-2 text-gray-600">{post.content}</p>
            <div className="mt-4 text-sm text-gray-400">ID: {post.id}</div>
        </div>
    );
}
