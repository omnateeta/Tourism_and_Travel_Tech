import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Camera, X, ChevronLeft, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { useTrip } from '../context/TripContext';
import { imagesAPI } from '../services/api';

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    full: string;
  };
  alt_description: string;
  description: string;
  user: {
    name: string;
  };
}

const DestinationShowcase: React.FC = () => {
  const { preferences } = useTrip();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [destinationName, setDestinationName] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (preferences.destination) {
      setDestinationName(preferences.destination);
      fetchImages(preferences.destination);
    }
  }, [preferences.destination]);

  const fetchImages = async (destination: string) => {
    setLoading(true);
    try {
      // Fetch images from backend API
      const response = await imagesAPI.getDestinationImages(destination, 8);
      setImages(response.data.images);
    } catch (err) {
      console.error('Error fetching images:', err);
      // Fallback to source.unsplash.com if API fails
      const fallbackImages = getFallbackImages(destination);
      setImages(fallbackImages);
    } finally {
      setLoading(false);
    }
  };

  const getFallbackImages = (query: string): UnsplashImage[] => {
    // Fallback using Lorem Picsum (reliable placeholder service)
    const fallbackImageIds = [
      '10', '28', '29', '54', '76', '101', '103', '104', 
      '106', '110', '130', '152', '164', '177', '192', '200'
    ];
    
    return fallbackImageIds.slice(0, 8).map((id, index) => ({
      id: `fallback-${query}-${index}`,
      urls: {
        regular: `https://picsum.photos/seed/${query}${id}/800/600`,
        full: `https://picsum.photos/seed/${query}${id}/1600/1200`,
        small: `https://picsum.photos/seed/${query}${id}/400/300`
      },
      alt_description: `${query} travel photo`,
      description: `Beautiful view of ${query}`,
      user: {
        name: 'Travel Gallery',
        link: 'https://unsplash.com'
      },
      location: query
    }));
  };

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + images.length) % images.length);
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage === null) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, images.length]);

  if (!preferences.destination) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8 text-center"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-primary-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Discover Your Destination</h3>
        <p className="text-gray-500">Enter a destination in the Trip Planner to see real-time beautiful images of your next adventure!</p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl">
                <Camera className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {destinationName}
                </h3>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Real-time photos from around the world
                </p>
              </div>
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-primary-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            )}
          </div>
        </div>

        {/* Image Grid */}
        <div className="p-6">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`bg-gray-200 animate-pulse rounded-xl ${
                    i === 0 ? 'col-span-2 row-span-2 aspect-video' : 'aspect-square'
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {images.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.03, zIndex: 10 }}
                  className={`relative overflow-hidden rounded-xl cursor-pointer group ${
                    index === 0 ? 'col-span-2 row-span-2' : ''
                  }`}
                  style={{ aspectRatio: index === 0 ? '16/10' : '1/1' }}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={image.urls.regular}
                    alt={image.alt_description || `${destinationName} view`}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm font-medium line-clamp-2">
                      {image.description || `Beautiful ${destinationName}`}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && images[selectedImage] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setSelectedImage(null)}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10 backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation */}
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image */}
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="max-w-6xl max-h-[85vh] w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[selectedImage].urls.full}
                alt={images[selectedImage].alt_description || `${destinationName} view`}
                className="w-full h-full object-contain rounded-lg shadow-2xl"
              />
              <div className="mt-4 text-center">
                <p className="text-white text-lg font-medium">
                  {images[selectedImage].description || `${destinationName}`}
                </p>
                <p className="text-white/60 text-sm mt-1">
                  {selectedImage + 1} / {images.length}
                </p>
              </div>
            </motion.div>

            {/* Thumbnails */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={(e) => { e.stopPropagation(); setSelectedImage(index); }}
                  className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all ${
                    index === selectedImage 
                      ? 'ring-2 ring-white scale-110' 
                      : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  <img
                    src={img.urls.regular}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DestinationShowcase;
