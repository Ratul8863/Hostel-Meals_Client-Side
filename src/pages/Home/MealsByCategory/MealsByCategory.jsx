import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom'; // ✅ Corrected import
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { FaHeart, FaStar } from 'react-icons/fa';

const categories = ['Breakfast', 'Lunch', 'Dinner', 'All Meals'];

const MealsByCategory = () => {
  const axiosSecure = useAxiosSecure();
  const [selectedCategory, setSelectedCategory] = useState('All Meals');

  const { data = {}, isLoading } = useQuery({
    queryKey: ['meals', selectedCategory],
    queryFn: async () => {
      const categoryQuery = selectedCategory === 'All Meals' ? '' : `?category=${selectedCategory.toLowerCase()}`;
      const res = await axiosSecure.get(`/meals${categoryQuery}`);
      return res.data; // Expected shape: { meals: [], totalCount: number }
    }
  });

  const meals = data.meals || [];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4">
     
      
      <h2 className="text-4xl md:text-5xl font-extrabold mb-10 text-center text-gray-800">
        Explore Our Delicious Meals
      </h2>

      {/* Category Filter Buttons */}
      <div className="flex justify-center flex-wrap gap-x-6 gap-y-3 mb-12">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`
              px-6 py-2 rounded-full text-lg font-semibold transition-all duration-300
              ${selectedCategory === cat
                ? 'bg-gray-800 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
            `}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Meals Grid */}
      {
        isLoading ? (
          <p className="text-center text-gray-600 text-xl">Loading delicious meals...</p>
        ) : meals.length === 0 ? (
          <p className="text-center text-gray-600 text-xl">No meals found for this category.</p>
        ) : (
          <>
            <div data-aos="fade-left" className="grid  grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {meals.slice(0, 4).map(meal => (
                <div
                  key={meal._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl border border-gray-100"
                >
                  <figure className="relative h-60 w-full overflow-hidden">
                    <img
                      src={meal.image || 'https://placehold.co/600x400?text=Meal+Image'}
                      alt={meal.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </figure>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2  md:h-20">{meal.title}</h2>
                    <p className="text-gray-600 mb-4 text-base">{meal.description?.slice(0, 80)}...</p>

                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center text-yellow-500">
                                                <FaStar className="mr-1" />
                                                <span className="font-semibold text-gray-700">{ meal.rating.toFixed(1)}</span>
                                              </div>
                      <div className="flex items-center text-red-600">
                        <FaHeart className="mr-1" />
                        <span className="font-semibold text-gray-700">{meal.likes}</span>
                      </div>
                      {meal.price && (
                        <p className="text-xl font-bold text-primary-dark">
                          ${meal.price.toFixed(2)}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end mt-4">
                      <Link
                        to={`/meal/${meal._id}`}
                        onClick={() => window.scrollTo(0, 0)}
                        className="inline-block px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors duration-200 text-base"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ✅ View All Button */}
            <div className="text-center mt-12">
              <Link
                // to={`/meals?category=${selectedCategory.toLowerCase()}`}
                to={`/meals`}
                className="inline-block bg-gray-800 text-white  px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-900 transition duration-300"
              >
                {/* {selectedCategory === 'All Meals' ? 'Meals' : selectedCategory} */}
                View All Meals
              </Link>
            </div>
          </>
        )
      }
    </div>
  );
};

export default MealsByCategory;
