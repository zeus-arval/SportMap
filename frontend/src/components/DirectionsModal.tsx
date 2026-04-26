import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';

interface DirectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  placeName: string;
}

export default function DirectionsModal({
  isOpen,
  onClose,
  lat,
  lng,
  placeName
}: DirectionsModalProps) {
  const encodedName = encodeURIComponent(placeName);
  
  const options = [
    {
      name: 'Google Maps',
      icon: <img src="/icons/google-maps.svg" alt="Google Maps" className="w-12 h-12 object-contain" />,
      url: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    },
    {
      name: 'Waze',
      icon: <img src="/icons/waze.svg" alt="Waze" className="w-12 h-12 object-contain" />,
      url: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
    }
  ];

  // Add Apple Maps if on iOS
  if (typeof window !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    options.push({
      name: 'Apple Maps',
      icon: <img src="/icons/apple-maps.svg" alt="Apple Maps" className="w-12 h-12 object-contain" />,
      url: `maps://maps.apple.com/?daddr=${lat},${lng}&q=${encodedName}`
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with higher z-index than PlaceDetailSheet */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 200,
              mass: 0.8
            }}
            className="fixed bottom-0 left-0 right-0 md:left-1/2 md:right-auto md:bottom-8 md:w-full md:max-w-md md:-translate-x-1/2 bg-[#1a1a24] rounded-t-3xl md:rounded-3xl border-t md:border border-white/10 z-[110] p-6 pb-10 md:pb-6 shadow-2xl"
          >
            <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-6" />
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Open with</h3>
              <button 
                onClick={onClose} 
                className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-3">
              {options.map((option) => (
                <a
                  key={option.name}
                  href={option.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex items-center p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group active:scale-[0.98]"
                >
                  <div className="flex-shrink-0 mr-4 transition-transform group-hover:scale-105">
                    {option.icon}
                  </div>
                  <span className="text-white font-semibold flex-1">{option.name}</span>
                  <ExternalLink size={16} className="text-gray-500 group-hover:text-gray-300" />
                </a>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
