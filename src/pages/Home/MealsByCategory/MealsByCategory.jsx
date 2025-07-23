import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const categories = ['Breakfast', 'Lunch', 'Dinner', 'All Meals'];

const MealsByCategory = () => {
  const axiosSecure = useAxiosSecure();
  const [selectedCategory, setSelectedCategory] = useState('All Meals');

  const { data = {}, isLoading } = useQuery({
  queryKey: ['meals', selectedCategory],
  queryFn: async () => {
    const categoryQuery = selectedCategory === 'All Meals' ? '' : `?category=${selectedCategory.toLowerCase()}`;
    const res = await axiosSecure.get(`/meals${categoryQuery}`);
    return res.data;  // response is { meals: [], totalCount: number }
  }
});

const meals = data.meals || [];

  console.log(meals)

  return (
    <div className="py-10 max-w-6xl mx-auto px-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Meals By Category</h2>

      {/* Tab Buttons */}
      <div className="flex justify-center flex-wrap gap-4 mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Meals Cards */}
      {
        isLoading ? <p className="text-center">Loading meals...</p> :
        <div className="grid md:grid-cols-3 gap-6">
          {meals.slice(0, 3).map(meal => (
            <div key={meal._id} className="card bg-base-100 shadow-xl">
              <figure><img src={meal.image} alt={meal.title} className="h-48 w-full object-cover" /></figure>
              <div className="card-body">
                <h2 className="card-title">{meal.title}</h2>
                <p>{meal.description?.slice(0, 60)}...</p>
                {/* Optional fields */}
                {/* <p>Rating: {meal.rating || 'N/A'}</p>
                <p>Price: ${meal.price || 'N/A'}</p> */}

                <div className="card-actions justify-end">
                  <Link to={`/meal/${meal._id}`} className="btn btn-sm btn-primary">
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
};

export default MealsByCategory;
