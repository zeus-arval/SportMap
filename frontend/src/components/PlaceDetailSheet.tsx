import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Flag, MessageSquare, Clock } from 'lucide-react';
import { formatRelativeTime } from '@/lib/date-utils';
import { feedService } from '@/services/feed.service';
import type { PostDto } from '@/types/post';
import type { PlaceDto } from '@/types/place';

interface PlaceDetailSheetProps {
  place: PlaceDto | null;
  onClose: () => void;
  onReport: () => void;
}

export default function PlaceDetailSheet({
  place,
  onClose,
  onReport
}: PlaceDetailSheetProps) {
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  // Initial fetch
  useEffect(() => {
    if (place?.id) {
      setIsLoadingPosts(true);
      
      const loadData = async () => {
        const [postsResult, latestUpdateResult] = await Promise.all([
          feedService.getByPlaceId(place.id!),
          feedService.getLatestUpdate(place.id!)
        ]);
        
        if (postsResult.value) {
          setPosts(postsResult.value);
        }
        if (latestUpdateResult.value) {
          setLastUpdate(latestUpdateResult.value);
        }
        setIsLoadingPosts(false);
      };

      loadData();
    } else {
      setPosts([]);
      setLastUpdate(null);
    }
  }, [place?.id]);

  // Polling for updates
  useEffect(() => {
    if (!place?.id) return;

    const pollInterval = setInterval(async () => {
      const result = await feedService.getLatestUpdate(place.id!);
      
      // Only refresh posts if the latest update timestamp changed
      if (result.value && result.value !== lastUpdate) {
        const postsResult = await feedService.getByPlaceId(place.id!);
        if (postsResult.value) {
          setPosts(postsResult.value);
          setLastUpdate(result.value);
        }
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(pollInterval);
  }, [place?.id, lastUpdate]);

  if (!place) return null;

  // Get image URL - prioritize place.image.url, fallback to a default
  const imageUrl = place.image?.url || 
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80';

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40"
        />

        {/* Bottom Sheet */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{
            type: 'spring',
            damping: 35,
            stiffness: 300,
            mass: 0.8
          }}
          className="absolute bottom-0 left-0 right-0 bg-[#12121a] rounded-t-3xl border-t border-white/10 z-50 max-h-[85vh] overflow-y-auto"
        >
            {/* Handle */}
            <div className="sticky top-0 bg-[#12121a] z-20 pt-4 pb-2 rounded-t-3xl">
              <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto" />
            </div>

            {/* Cover Image */}
            <div className="relative h-48 w-full">
              <img
                src={imageUrl}
                alt={place.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#12121a] to-transparent" />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
              >
                <X size={20} />
              </button>
              <button
                onClick={onReport}
                className="absolute top-4 left-4 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-black/60 transition-colors"
              >
                <Flag size={20} />
              </button>
            </div>

            <div className="px-6 pb-8 -mt-12 relative z-10">
              {/* Header Info */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {place.name}
                  </h2>
                  <div className="flex items-center text-gray-400 text-sm mb-2">
                    <MapPin size={14} className="mr-1 text-blue-400" />
                    <span>
                      {place.address || 'Tallinn, Estonia'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {place.placeType && (
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-xs text-gray-300">
                        {place.placeType.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed mb-8">
                {place.description ||
                  'A popular spot for locals. Great facilities and friendly community. Open 24/7 for members.'}
              </p>

              {/* Actions Grid */}
              <div className="flex gap-3 mb-8">
                <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-sm shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] transition-all active:scale-[0.98]">
                  Check In Now
                </button>
                <div className="flex-1 flex gap-2">
                  <button className="flex-1 py-3 rounded-xl bg-[#12121a] border border-white/10 text-white font-semibold text-sm hover:bg-white/5 transition-colors">
                    Add to Favorites
                  </button>
                </div>
              </div>

              {/* Place Feed placeholder */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Recent Activity
                </h3>
                {isLoadingPosts ? (
                  <div className="flex justify-center py-4">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : posts.length > 0 ? (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div key={post.id} className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold mr-3">
                            {post.title.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{post.title}</p>
                            <div className="flex items-center text-gray-500 text-xs">
                              <Clock size={10} className="mr-1" />
                              <span>{formatRelativeTime(post.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm">{post.content}</p>
                        <div className="mt-3 flex items-center text-gray-500 text-xs">
                          <MessageSquare size={12} className="mr-1" />
                          <span>Reply</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">
                    No recent activity at this location.
                  </div>
                )}
              </div>
            </div>
        </motion.div>

      </>
    </AnimatePresence>
  );
}