import {IPost} from '@/types/post';
import type { ReactNode } from "react";
import { motion } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  Share2,
  MapPin,
  MoreHorizontal,
  MessageSquare,
  Flag,
} from 'lucide-react'

export interface IPostSectionProps {
  posts: IPost[] | null;
  activeMenuId: string | null;
  setActiveMenuId: (activeMenuId: string | null) => void;
}

export function PostsSection({posts, activeMenuId, setActiveMenuId} : IPostSectionProps) : ReactNode {
  if (posts === null || posts.length === 0){
    return (
      <div>
        There is no posts yet.
      </div>
    )
  }

  console.log('Appeared posts:', posts);

  return (
    <>
      {posts?.map((post, index) => (
        <motion.div
          key={index}
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
    </>)
}