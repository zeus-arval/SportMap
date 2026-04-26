'use client';

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  MoreHorizontal,
  MessageSquare,
  Flag,
} from 'lucide-react'
import {usePosts} from "@/hooks/use-posts";

export function FeedView() {
  const {posts, getPosts} = usePosts();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

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
          {posts?.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.1,
              }}
              className="bg-[#12121a] rounded-2xl overflow-hidden border border-white/5 relative w-full"
            >
              {/* Header */}
              <div className="p-4 flex items-center justify-between h-20">
                <div className="flex items-center">
                  <img
                    src='https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80' // Todo add image
                    alt='Profile name'
                    className="w-10 h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    {/* TODO: add profile */}
                    <p className="text-white font-medium text-sm">
                      Profile Name
                    </p>
                    <button className="flex items-center text-xs text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-2 py-0.5 rounded-full mt-0.5">
                      <MapPin size={10} className="mr-1" />
                      {/* TODO: add place name */}
                      <span>Location</span>
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setActiveMenuId(activeMenuId === post.id ? null : post.id)
                    }}
                    className="text-gray-400 hover:text-white p-2"
                  >
                    <MoreHorizontal size={20} />
                  </button>
  
                  {/* Dropdown Menu */}
                  {activeMenuId === post.id && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-[#1a1a24] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
                      {/*TODO: Implement self posts delete*/}
                      {/*{post.user.isMe && (*/}
                      {/*  <button*/}
                      {/*    onClick={() => deleteItem(post.id)}*/}
                      {/*    className="w-full px-4 py-3 text-left text-red-400 hover:bg-white/5 text-sm flex items-center"*/}
                      {/*  >*/}
                      {/*    <Trash2 size={14} className="mr-2" /> Delete*/}
                      {/*  </button>*/}
                      {/*)}*/}
                      <button
                        onClick={() => {
                          setActiveMenuId(null)
                        }}
                        className="w-full px-4 py-3 text-left text-gray-300 hover:bg-white/5 text-sm flex items-center"
                      >
                        <Flag size={14} className="mr-2" /> Report
                      </button>
                    </div>
                  )}
                </div>
              </div>
  
              {/* Content */}
              <div className="relative aspect-video bg-gray-800">
                <img
                  // TODO: Implement image assignment
                  // src={post.image}
                  src='https://images.unsplash.com/photo-1517836357463-c25dfe94c0de?w=600&q=80'
                  alt="Post content"
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 right-3 text-xs text-white/70 font-medium bg-black/40 px-2 py-1 rounded backdrop-blur-md">
                  {/* TODO: Implement time */}
                  {/*{post.time}*/}
                  2h ago
                </div>
              </div>
  
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    <button
                      // TODO: Implement like feature
                      // onClick={() => toggleLike(post.id)}
                      onClick={() => {}}
                      className="flex items-center text-white group"
                    >
                      <Heart
                        size={22}
                        className={`mr-1 transition-colors text-white group-hover:text-red-500`}
                        // className={`mr-1 transition-colors ${post.liked ? 'fill-red-500 text-red-500' : 'text-white group-hover:text-red-500'}`}
                      />
                      <span className="text-sm font-medium">16</span>
                      {/*<span className="text-sm font-medium">{post.likes}</span>*/}
                    </button>
                    <button className="flex items-center text-gray-400 hover:text-white transition-colors">
                      <MessageCircle size={22} className="mr-1" />
                      {/* TODO: Implement comments feature */}
                      {/*<span className="text-sm font-medium">{post.comments}</span>*/}
                      <span className="text-sm font-medium">20</span>
                    </button>
                  </div>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <Share2 size={22} />
                  </button>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  <span className="font-medium text-white mr-2">
                    {/* TODO: Implement personalization */}
                    {/*{post.user.name}*/}
                    John Doe
                  </span>
                  {post.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
