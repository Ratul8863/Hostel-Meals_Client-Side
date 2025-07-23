import React, { useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { useInfiniteQuery } from '@tanstack/react-query';

const MealsPage = () => {
  const axiosSecure = useAxiosSecure();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });

  const fetchMeals = async ({ pageParam = 1 }) => {
    const res = await axiosSecure.get(`/meals`, {
      params: {
        page: pageParam,
        limit: 6,
        search,
        category,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
      },
    });
    return res.data;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['meals', search, category, priceRange],
    queryFn: fetchMeals,
    getNextPageParam: (lastPage, allPages) => {
      const hasMore = lastPage.meals.length === 6;
      return hasMore ? allPages.length + 1 : undefined;
    },
  });

  const meals = data?.pages.flatMap((page) => page.meals) || [];

  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search meals..."
          className="input input-bordered"
          onChange={(e) => {
            setSearch(e.target.value);
            refetch();
          }}
        />

        <select
          className="select select-bordered"
          onChange={(e) => {
            setCategory(e.target.value);
            refetch();
          }}
        >
          <option value="">All Categories</option>
          <option value="Breakfast">Breakfast</option>
          <option value="Lunch">Lunch</option>
          <option value="Dinner">Dinner</option>
        </select>

        <input
          type="number"
          placeholder="Min Price"
          className="input input-bordered w-24"
          onChange={(e) => {
            setPriceRange((prev) => ({ ...prev, min: Number(e.target.value) }));
            refetch();
          }}
        />

        <input
          type="number"
          placeholder="Max Price"
          className="input input-bordered w-24"
          onChange={(e) => {
            setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) }));
            refetch();
          }}
        />
      </div>

      {isLoading ? (
        <p className="text-center">Loading meals...</p>
      ) : (
        <InfiniteScroll
          dataLength={meals.length}
          next={fetchNextPage}
          hasMore={!!hasNextPage}
          loader={<h4 className="text-center my-4">Loading more...</h4>}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {meals.map((meal) => (
              <div key={meal._id} className="card shadow-lg p-4 bg-white">
                <img src={meal.image} className="rounded mb-2" />
                <h2 className="font-bold text-xl">{meal.title}</h2>
                <p>Category: {meal.category}</p>
                <p className="text-sm text-gray-600">{meal.description}</p>
                <p>Price: ৳{meal.price}</p>
                <p className="text-xs text-gray-400">
                  Posted on: {new Date(meal.postTime).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </InfiniteScroll>
      )}
    </div>
  );
};

export default MealsPage;
