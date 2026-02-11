import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, MapPin, Calendar, Sparkles, ArrowRight, Quote } from 'lucide-react';

const travelQuotes = [
  {
    quote: "Travel is the only thing you buy that makes you richer.",
    author: "Anonymous"
  },
  {
    quote: "The world is a book, and those who do not travel read only one page.",
    author: "Saint Augustine"
  },
  {
    quote: "Life is either a daring adventure or nothing at all.",
    author: "Helen Keller"
  },
  {
    quote: "Travel makes one modest. You see what a tiny place you occupy in the world.",
    author: "Gustave Flaubert"
  },
  {
    quote: "The journey of a thousand miles begins with a single step.",
    author: "Lao Tzu"
  },
  {
    quote: "To travel is to discover that everyone is wrong about other countries.",
    author: "Aldous Huxley"
  },
  {
    quote: "We travel not to escape life, but for life not to escape us.",
    author: "Anonymous"
  },
  {
    quote: "Adventure is worthwhile in itself.",
    author: "Amelia Earhart"
  }
];

const features = [
  {
    icon: Compass,
    title: "Smart Planning",
    description: "AI-powered itinerary creation tailored to your preferences",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: MapPin,
    title: "Real-time Insights",
    description: "Live weather, events, and local recommendations",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Calendar,
    title: "Easy Scheduling",
    description: "Organize your days with our intuitive trip planner",
    color: "from-emerald-500 to-teal-500"
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    description: "Get instant answers to all your travel questions",
    color: "from-amber-500 to-orange-500"
  }
];

interface HomeProps {
  onStartPlanning: () => void;
}

const Home: React.FC<HomeProps> = ({ onStartPlanning }) => {
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % travelQuotes.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-120px)] overflow-hidden rounded-3xl w-full">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920"
        >
          <source 
            src="https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-beach-with-waves-1089-large.mp4" 
            type="video/mp4" 
          />
        </video>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center px-4 py-16 text-center">
        {/* Main Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-white/90 text-base font-medium">Your Journey Begins Here</span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight font-[family-name:var(--font-family-display)]">
            Discover Your Next
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400">
              Great Adventure
            </span>
          </h1>

          <p className="text-2xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Let our AI-powered travel assistant craft the perfect itinerary for your dream destination. 
            Experience personalized travel planning like never before.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onStartPlanning}
            className="group bg-white text-gray-900 px-8 py-5 rounded-2xl font-semibold text-xl shadow-2xl hover:shadow-white/25 transition-all flex items-center gap-3 mx-auto"
          >
            Start Planning Your Trip
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>

        {/* Quote Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16 w-full max-w-2xl mx-auto"
        >
          <div className="glass bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <Quote className="w-8 h-8 text-white/40 mb-4 mx-auto" />
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuote}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <p className="text-2xl md:text-3xl text-white font-medium italic mb-4">
                  "{travelQuotes[currentQuote].quote}"
                </p>
                <p className="text-white/60 text-base">
                  — {travelQuotes[currentQuote].author}
                </p>
              </motion.div>
            </AnimatePresence>
            
            {/* Quote Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {travelQuotes.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuote(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentQuote 
                      ? 'bg-white w-6' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 w-full px-4"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-3`}>
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-semibold text-base mb-1">{feature.title}</h3>
              <p className="text-white/60 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2"
        >
          <motion.div className="w-1.5 h-1.5 bg-white/60 rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Home;
