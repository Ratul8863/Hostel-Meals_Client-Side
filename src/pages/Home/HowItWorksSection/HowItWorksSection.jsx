import React from 'react';
import { UserPlus, Utensils, ThumbsUp, ArrowRight } from 'lucide-react';

const HowItWorksSection = () => {
  return (
    <div className="py-20 px-4 sm:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            How Our System Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            A simple guide to navigating the best hostel meal management platform.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="flex flex-col md:flex-row justify-center items-center md:space-x-12 space-y-8 md:space-y-0">
          {/* Step 1: Join Us */}
          <div className="flex flex-col items-center text-center max-w-xs p-6 rounded-xl transform transition duration-300 hover:scale-105">
            <div className="bg-indigo-600 p-4 rounded-full mb-4">
              <UserPlus className="text-white w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Join the Community
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Sign up to get your Bronze Badge and become part of our hostel dining community.
            </p>
          </div>

          <div className="hidden md:block">
            <ArrowRight className="text-gray-400 dark:text-gray-600 w-12 h-12" />
          </div>

          {/* Step 2: Explore & Request */}
          <div className="flex flex-col items-center text-center max-w-xs p-6 rounded-xl transform transition duration-300 hover:scale-105">
            <div className="bg-green-600 p-4 rounded-full mb-4">
              <Utensils className="text-white w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Explore & Request
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Browse the meal menu and upcoming dishes. Request your favorites with a premium subscription.
            </p>
          </div>

          <div className="hidden md:block">
            <ArrowRight className="text-gray-400 dark:text-gray-600 w-12 h-12" />
          </div>

          {/* Step 3: Review & Connect */}
          <div className="flex flex-col items-center text-center max-w-xs p-6 rounded-xl transform transition duration-300 hover:scale-105">
            <div className="bg-yellow-600 p-4 rounded-full mb-4">
              <ThumbsUp className="text-white w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Review & Connect
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Share your feedback by liking and reviewing meals to help improve the dining experience for everyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksSection;
