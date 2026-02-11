import React from 'react';
import { motion } from 'framer-motion';

interface JourneyPoint {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  completed?: boolean;
}

interface JourneyPathProps {
  points: JourneyPoint[];
  currentStep?: number;
}

const JourneyPath: React.FC<JourneyPathProps> = ({ points, currentStep = 0 }) => {
  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400 transform -translate-x-1/2"></div>
      
      <div className="space-y-8 pl-10">
        {points.map((point, index) => {
          const isCurrent = index === currentStep;
          const isCompleted = index < currentStep;
          const isFuture = index > currentStep;
          
          return (
            <motion.div
              key={point.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Timeline marker */}
              <div className="absolute -left-10 top-2 w-8 h-8 rounded-full flex items-center justify-center z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isCurrent 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 ring-4 ring-blue-500/30' 
                    : isCompleted 
                      ? 'bg-green-500' 
                      : 'bg-gray-300'
                }`}>
                  {isCompleted && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {isCurrent && !isCompleted && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                  {isFuture && !isCompleted && !isCurrent && (
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  )}
                </div>
                
                {/* Connecting line segment */}
                {index < points.length - 1 && (
                  <div className={`absolute top-8 left-1/2 w-0.5 h-16 -ml-0.5 ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                )}
              </div>
              
              {/* Content card */}
              <motion.div
                className={`p-4 rounded-xl border ${
                  isCurrent
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-lg'
                    : isCompleted
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200'
                }`}
                whileHover={{ y: -2 }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className={`font-semibold ${
                    isCurrent ? 'text-blue-700' : isCompleted ? 'text-green-700' : 'text-gray-700'
                  }`}>
                    {point.title}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isCurrent 
                      ? 'bg-blue-100 text-blue-700' 
                      : isCompleted 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                  }`}>
                    {point.date}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{point.location}</p>
                <p className="text-sm text-gray-700">{point.description}</p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default JourneyPath;