import { useState, useEffect, useContext, useCallback } from 'react';
import { IPost } from "@/types/post";
import { feedService } from "../services/feed.service";

interface UsePostsResult {
  posts: IPost[] | null;
  loading: boolean;
  notFound: boolean;
  getPosts: () => Promise<IPost[]>;
  getUserPosts: (userId: string) => Promise<IPost[]>;
}

export function usePosts() : UsePostsResult{
  const [posts, setPosts] = useState<IPost[]>([]);
  const [post, setPost] = useState<IPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const getPosts = async (): Promise<IPost[]> => {
    setNotFound(false);
    setLoading(true);

    const postsResult = await feedService.getAllPosts();
    setLoading(false);

    if (postsResult.isSucceed && postsResult.value){
      setPosts(postsResult.value);
    }
    else{
      setNotFound(true);
      setPosts([]);
    }

    return posts;
  };

  const getUserPosts = async (userId: string): Promise<IPost[]> => {
    setNotFound(false);
    setLoading(true);

    const postsResult = await feedService.getPostsByUserId(userId);
    setLoading(false);

    if (postsResult.isSucceed && postsResult.value){
      setPosts(postsResult.value);
    }
    else{
      setNotFound(true);
      setPosts([]);
    }

    return posts;
  }

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setNotFound(false);
      setLoading(true);

      const postsResult = await feedService.getAllPosts();
      setLoading(false);

      if (!cancelled && postsResult.isSucceed && postsResult.value){
        setPosts(postsResult.value);
      }
      else {
          setPosts([]);
        setNotFound(true);
      }
    };

    load();
    return () => {cancelled = true;};
  }, []);

  return { posts, loading, notFound, getPosts, getUserPosts}
}
