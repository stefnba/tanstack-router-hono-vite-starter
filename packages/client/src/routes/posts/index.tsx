import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Link, createFileRoute, useSearch } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { z } from 'zod';

import { apiEndpoints } from '@/api';
import { useAppForm } from '@/components/form';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/posts/')({
    validateSearch: zodValidator(
        z
            .object({
                page: z.coerce.number(),
                limit: z.coerce.number(),
            })
            .partial()
            .optional()
    ),
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
    // errorComponent: () => <div>Error</div>,
});

function RouteComponent() {
    const { options } = Route.useLoaderData();
    const postsQuery = useSuspenseQuery(apiEndpoints.posts.getMany({ query: options }));

    const search = useSearch({ from: Route.id });

    const navigate = Route.useNavigate();
    const posts = postsQuery.data ?? [];

    const createPostMutation = useMutation(apiEndpoints.posts.create);

    const { Input, Form, SubmitButton } = useAppForm({
        schema: z.object({
            title: z.string().min(1),
            content: z.string().min(1),
        }),
        defaultValues: {
            title: '',
            content: '',
        },
        onSubmit: async ({ value }) => {
            createPostMutation.mutate(
                { json: value },
                {
                    onSuccess: () => {
                        alert('Post created successfully');
                    },
                    onError: (error) => {
                        console.error('Create post error:', error);
                    },
                }
            );
        },
    });

    return (
        <div className="space-y-2 p-4">
            <h1 className="text-lg font-medium">Create Post</h1>
            <Form className="max-w-md flex gap-2 items-end my-10">
                <Input name="title" label="Title" required />
                <Input name="content" label="Content" required />
                <SubmitButton className="">Create Post</SubmitButton>
            </Form>
            <h1 className="text-lg font-medium">Test Backend API Calls with Posts</h1>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate({ search: { limit: 2 } })}>
                    Show 2 posts
                </Button>
                <Button variant="outline" onClick={() => navigate({ search: { limit: 5 } })}>
                    Show 5 posts
                </Button>
            </div>
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
