import React, { useEffect } from 'react';
import PostSkeleton from "../skeletons/PostSkeleton";
import Post from './Post';
import { useQuery } from '@tanstack/react-query';

const Posts = ({ feedtype, username, userid }) => {
    const getpostendpoint = () => {
        switch (feedtype) {
            case "forYou":
                return "api/posts/all";
            case "following":
                return "api/posts/following";
            case "posts":
                return `/api/posts/user/${username}`; // Corrected: Added leading slash
            case "likes":
                return `/api/posts/likes/${userid}`;   // Corrected: Added leading slash
            default:
                return "api/posts/all";
        }
    };

    const post_endpoint = getpostendpoint();

    const { data: posts, isLoading, refetch, isRefetching } = useQuery({
        queryKey: ["posts", feedtype, username, userid], // Include feedtype, username and userid in the queryKey
        queryFn: async () => {
            try {
                const res = await fetch(post_endpoint);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Something Went wrong");
                return data;
            } catch (error) {
                throw new Error(error);
            }
        },
    });

    useEffect(() => {
        refetch();
    }, [feedtype, username, userid, refetch]); // Add feedtype, username, userid and refetch as dependencies

    return (
        <>
            {(isLoading || isRefetching) && (
                <div className='flex flex-col justify-center'>
                    <PostSkeleton />
                    <PostSkeleton />
                    <PostSkeleton />
                </div>
            )}
            {!isLoading && !isRefetching && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
            {!isLoading && !isRefetching && posts && (
                <div>
                    {posts.map((post) => (
                        <Post key={post._id} post={post} />
                    ))}
                </div>
            )}
        </>
    );
};

export default Posts;
