import React from 'react';
import { ChefHat, MessageCircle, Crown, ListTodo } from 'lucide-react';

const UserBenefits = () => {
  return (
    <div className="py-20 px-4 sm:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Why Our Hostel System Is Perfect For You
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our platform simplifies your hostel life, from managing meals to connecting with your peers.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Benefit 1: Meal Convenience */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex justify-center mb-4">
              <ListTodo className="text-indigo-600 w-16 h-16" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Stay Informed, Eat Well
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              View daily menus, check ingredients, and see upcoming meals all in one place. No more guesswork, just great food.
            </p>
          </div>

          {/* Benefit 2: Your Opinion Matters */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex justify-center mb-4">
              <MessageCircle className="text-indigo-600 w-16 h-16" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Share Your Voice
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your feedback is crucial. Post reviews and like meals to help shape the dining experience for everyone in the hostel.
            </p>
          </div>

          {/* Benefit 3: Premium Upgrades */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <div className="flex justify-center mb-4">
              <Crown className="text-indigo-600 w-16 h-16" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Unlock Exclusive Perks
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Upgrade your account to request specific meals, get priority access to new features, and enjoy a more personalized experience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBenefits;
