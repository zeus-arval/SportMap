'use client';

import React, { useState, useEffect } from 'react'
import {PostsSection} from './PostsSection';
import {usePosts} from "@/hooks/use-posts";
import {IPost} from '@/types/post';
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  MoreHorizontal,
  MessageSquare,
  Flag,
} from 'lucide-react'

const placeholderPosts: IPost[] =[
  {content: 'New PR on deadlifts today! 💪 The energy at Urban Iron is unmatched.', title: 'New PR on deadlifts today! 💪 The energy at Urban Iron is unmatched.', createdAt: '', placeId: '', status: 0, authorId: '', id: ''},
  {content: '3v3 tournament winners! 🏀 What a game.', title: '3v3 tournament winners! 🏀 What a game.', createdAt: '', placeId: '', status: 0, authorId: '', id: ''},
  {content: 'Morning 10k done. The sunrise was worth the early wake up. 🏃‍♂️', title: 'Morning 10k done. The sunrise was worth the early wake up. 🏃‍♂️', createdAt: '', placeId: '', status: 0, authorId: '', id: ''}
]

export function FeedView() {
  const {posts, getPosts} = usePosts();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const previewPosts = posts === null || posts.length === 0 ? placeholderPosts : posts;

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <div
      className="h-full bg-[#0a0a0f] overflow-y-auto pb-24 pt-12 flex justify-center"
      onClick={() => setActiveMenuId(null)}
    >
      <div className='flex justify-center-safe flex-col md:w-2/3'>
        <div className="flex justify-between items-center mb-6 md:mx-1">
          <h1 className="text-2xl font-bold text-white">Activity Feed</h1>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {}}
              className="w-10 h-10 rounded-full bg-[#12121a] border border-white/10 flex items-center justify-center text-white hover:bg-white/5 transition-colors relative"
            >
              <MessageSquare size={20} />
              <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#12121a]" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 p-[2px]">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-[#0a0a0f]"
              />
            </div>
          </div>
        </div>
  
        <div className="space-y-6 flex items-center flex-col">
          <PostsSection posts={previewPosts} activeMenuId={activeMenuId} setActiveMenuId={setActiveMenuId}/>
        </div>
      </div>
    </div>
  )
}
