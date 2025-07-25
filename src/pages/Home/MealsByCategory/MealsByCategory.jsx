import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router'; // Changed to react-router-dom for consistency
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { FaStar } from 'react-icons/fa'; // Importing a star icon for ratings

const categories = ['Breakfast', 'Lunch', 'Dinner', 'All Meals'];

const MealsByCategory = () => {
  const axiosSecure = useAxiosSecure();
  const [selectedCategory, setSelectedCategory] = useState('All Meals');

  const { data = {}, isLoading } = useQuery({
    queryKey: ['meals', selectedCategory],
    queryFn: async () => {
      const categoryQuery = selectedCategory === 'All Meals' ? '' : `?category=${selectedCategory.toLowerCase()}`;
      const res = await axiosSecure.get(`/meals${categoryQuery}`);
      return res.data; // response is { meals: [], totalCount: number }
    }
  });

  const meals = data.meals || [];

  console.log(meals);

  return (
    <div className="py-16 max-w-7xl mx-auto px-4"> {/* Increased padding and max-width for more breathing room */}
      <h2 className="text-4xl md:text-5xl font-extrabold mb-10 text-center text-gray-800"> {/* Larger, bolder heading */}
        Explore Our Delicious Meals
      </h2>

      {/* Tab Buttons - Polished to match QUENX's clean navigation style */}
      <div className="flex justify-center flex-wrap gap-x-6 gap-y-3 mb-12"> {/* Increased gap for better spacing */}
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`
              px-6 py-2 rounded-full text-lg font-semibold transition-all duration-300
              ${selectedCategory === cat
                ? 'bg-gray-800 text-white shadow-md' // Active state: dark background, white text, subtle shadow
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200' // Inactive state: light background, subtle hover
              }
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Meals Cards Grid */}
      {
        isLoading ? (
          <p className="text-center text-gray-600 text-xl">Loading delicious meals...</p>
        ) : meals.length === 0 ? (
          <p className="text-center text-gray-600 text-xl">No meals found for this category.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"> {/* Responsive grid with more columns on large screens */}
            {/* Using slice(0, 3) as per original code, but typically you'd show all or implement infinite scroll here */}
            {meals.slice(0, 4).map(meal => (
              <div
                key={meal._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl border border-gray-100" // Polished card style
              >
                <figure className="relative h-60 w-full overflow-hidden"> {/* Increased image height */}
                  <img
                    src={meal.image || 'https://placehold.co/600x400?text=Meal+Image'} // Placeholder for missing image
                    alt={meal.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" // Subtle zoom on image hover
                  />
                </figure>
                <div className="p-6"> {/* Increased padding inside card body */}
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{meal.title}</h2> {/* Larger, bolder title */}
                  <p className="text-gray-600 mb-4 text-base">{meal.description?.slice(0, 80)}...</p> {/* More description text */}

                  {/* Rating and Price - now uncommented and styled */}
                  <div className="flex items-center justify-between mb-4">
                    {meal.rating && (
                      <div className="flex items-center text-yellow-500">
                        <FaStar className="mr-1" />
                        <span className="font-semibold text-gray-700">{meal.rating.toFixed(1)}</span> {/* Display rating with one decimal */}
                      </div>
                    )}
                    {meal.price && (
                      <p className="text-xl font-bold text-primary-dark"> {/* Price in a distinct color */}
                        ${meal.price.toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end mt-4"> {/* Aligned button to the right */}
                    <Link
                      to={`/meal/${meal._id}`}
                      className="inline-block px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors duration-200 text-base" // Button style consistent with "Join Us"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }
    </div>
  );
};

export default MealsByCategory;
