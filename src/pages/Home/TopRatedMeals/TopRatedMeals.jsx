import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Heart, Star } from 'lucide-react'; // Using lucide-react for a modern icon set
import useAxiosSecure from '../../../hooks/useAxiosSecure'; // Using the secure axios instance

const TopRatedMeals = () => {
  const axiosSecure = useAxiosSecure();
  
  const { data: meals = [], isLoading, error } = useQuery({
    queryKey: ['top-rated-meals'],
    queryFn: async () => {
      // NOTE: Using the axiosSecure instance for the API call
      const res = await axiosSecure.get('/top-rated-meals');
      return res.data;
    }
  });

  // Loading state with a custom spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-10 w-10 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="ml-4 text-gray-600">Loading top rated meals...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-center text-red-500 font-semibold">
          Failed to load top meals. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="py-16 px-4 sm:px-8 bg-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-4">
          Top Rated Meals
        </h2>
        <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Discover the community's favorite meals, ranked by likes and ratings from our members.
        </p>

        {/* Meal cards grid with better spacing and hover effects */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {meals.map((meal) => (
            <div 
              key={meal._id} 
              className="bg-white rounded-xl p-6 shadow-md border border-gray-200
                         hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300
                         flex flex-col h-full"
            >
              <img 
                src={meal.image} 
                alt={meal.title} 
                className="w-full h-48 object-cover rounded-lg mb-4" 
              />
              <div className="flex flex-col flex-grow">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">{meal.title}</h3>
                <p className="text-sm text-gray-500 mb-1">
                  Category: <span className="font-medium text-gray-700">{meal.category}</span>
                </p>
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-200">
                  <div className="flex items-center text-green-600 font-bold text-xl">
                    <span>${meal.price}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-500">
                    <span className="flex items-center">
                      <Heart className="w-5 h-5 text-red-500 mr-1" />
                      {meal.likes}
                    </span>
                    <span className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-500 mr-1" />
                      {meal.rating || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopRatedMeals;
