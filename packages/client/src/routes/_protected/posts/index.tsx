import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import React from 'react';
import { z } from 'zod';

import { postContract } from '@app/shared/features/post';

import { AsyncBoundary } from '@app/client/components/async-boundary';
import { useAppForm } from '@app/client/components/form';
import { Button } from '@app/client/components/ui/button';
import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemTitle,
} from '@app/client/components/ui/item';
import { postApiEndpoints } from '@app/client/features/post/api';
import { notification } from '@app/client/lib/notification';

export const Route = createFileRoute('/_protected/posts/')({
    validateSearch: zodValidator(postContract.getMany.endpoint.query),
    component: RouteComponent,
    loaderDeps: ({ search }) => search,
    loader: ({ context: { queryClient }, deps: { page, pageSize } }) => {
        const options = {
            page,
            pageSize,
        };

        queryClient.prefetchQuery(
            postApiEndpoints.getMany({
                query: options,
            })
        );
        // Return the options so the component doesn't have to rebuild them
        return { options };
    },
    pendingComponent: () => <div>Loading...</div>,
});

const PostList = () => {
    const { options } = Route.useLoaderData();
    const postsQuery = useSuspenseQuery(postApiEndpoints.getMany({ query: options }));
    const deletePostMutation = useMutation(
        postApiEndpoints.deleteById({
            errorHandlers: {
                default: (error) => {
                    notification.error(error.error.message);
                },
            },
            onSuccess: () => {
                notification.success('Post deleted successfully');
            },
        })
    );
    const posts = postsQuery.data ?? [];

    return (
        <div className="space-y-2 max-w-2xl">
            {posts.map((post) => (
                <Item asChild variant="outline" key={post.id}>
                    <Link to={`/posts/$postId`} params={{ postId: post.id }}>
                        <ItemContent>
                            <ItemTitle>{post.title}</ItemTitle>
                            <ItemDescription>{post.content}</ItemDescription>
                        </ItemContent>
                        <ItemActions>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    deletePostMutation.mutate({ param: { id: post.id } });
                                }}
                            >
                                Delete
                            </Button>
                        </ItemActions>
                    </Link>
                </Item>
            ))}
        </div>
    );
};

function RouteComponent() {
    const navigate = Route.useNavigate();

    const createPostMutation = useMutation(
        postApiEndpoints.create({
            errorHandlers: {
                default: (error) => {
                    notification.error(error.error.message);
                },
            },
            onSuccess: () => {
                notification.success('Post created successfully');
                // notification.info('This is an info notification');
                // notification.warning('This is a warning notification');
                // notification.error('This is an error notification');
            },
        })
    );

    const { Input, Form, SubmitButton, form } = useAppForm({
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
                        // alert('Post created successfully');
                        form.reset();
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
            <h1 className="text-lg font-medium">Posts</h1>
            <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate({ search: { pageSize: 2 } })}>
                    Show 2 posts
                </Button>
                <Button variant="outline" onClick={() => navigate({ search: { pageSize: 5 } })}>
                    Show 5 posts
                </Button>
            </div>
            <AsyncBoundary resourceName="Posts">
                <PostList />
            </AsyncBoundary>
        </div>
    );
}
