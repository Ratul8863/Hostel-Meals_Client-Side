import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const TopRatedMeals = () => {

    const axiosSecure = useAxiosSecure();
  const { data: meals = [], isLoading, error } = useQuery({
    queryKey: ['top-rated-meals'],
    queryFn: async () => {
      const res = await axiosSecure.get('/top-rated-meals');
      return res.data;
    }
  });

  if (isLoading) return <p>Loading top rated meals...</p>;
  if (error) return <p>Failed to load top meals!</p>;

  return (
    <div className="my-10">
      <h2 className="text-2xl font-bold text-center mb-6 text-lime-400">Top Rated Meals</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {meals.map((meal) => (
          <div key={meal._id} className="bg-[#1c1f3b] p-4 rounded-2xl shadow hover:shadow-lg transition">
            <img src={meal.image} alt={meal.title} className="w-full h-40 object-cover rounded-lg mb-3" />
            <h3 className="text-xl font-semibold text-white">{meal.title}</h3>
            <p className="text-gray-400">Category: {meal.category}</p>
            <p className="text-lime-400 font-semibold">Price: ${meal.price}</p>
            <p className="text-yellow-300">Likes: {meal.likes}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopRatedMeals;
