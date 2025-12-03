import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/posts/$postId')({
    component: RouteComponent,
    loader: async ({ params }) => {
        const post = await fetch(
            `https://jsonplaceholder.typicode.com/posts/${params.postId}`
        ).then((res) => res.json());
        return post;
    },
});

function RouteComponent() {
    const { post } = Route.useLoaderData();
    const { postId } = Route.useParams();
    return (
        <div>
            Hello {postId}! {JSON.stringify(post)}
        </div>
    );
}
