import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';
import useAuth from '../../../hooks/useAuth';

const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts'];

const MealsPage = () => {
  const axiosSecure = useAxiosSecure();
  const { theme } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedCategory, setDebouncedCategory] = useState('');
  const [debouncedPriceRange, setDebouncedPriceRange] = useState(priceRange);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedCategory(selectedCategory), 500);
    return () => clearTimeout(handler);
  }, [selectedCategory]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedPriceRange(priceRange), 500);
    return () => clearTimeout(handler);
  }, [priceRange]);

  const fetchMeals = async ({ pageParam = 1 }) => {
    const res = await axiosSecure.get(`/meals`, {
      params: {
        page: pageParam,
        limit: 8,
        search: debouncedSearch,
        category: debouncedCategory,
        minPrice: debouncedPriceRange.min,
        maxPrice: debouncedPriceRange.max,
      },
    });
    return res.data;
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    isError,
  } = useInfiniteQuery({
    queryKey: ['meals', debouncedSearch, debouncedCategory, debouncedPriceRange],
    queryFn: fetchMeals,
    getNextPageParam: (lastPage, allPages) => {
      const totalFetchedMeals = allPages.flatMap((page) => page.meals).length;
      return totalFetchedMeals < lastPage.totalCount ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const meals = data?.pages.flatMap((page) => page.meals) || [];

  // --- THEME COLORS ---
  const colors = {
    bg: theme === 'dark' ? 'bg-[#0D1128]' : 'bg-gray-50',
    text: theme === 'dark' ? 'text-white' : 'text-gray-900',
    cardBg: theme === 'dark' ? 'bg-[#1c1f3b]' : 'bg-white',
    border: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    inputBg: theme === 'dark' ? 'bg-[#0D1128] text-white placeholder-gray-400 border-gray-700' : 'bg-white text-gray-800 placeholder-gray-500 border-gray-300',
    buttonBg: theme === 'dark' ? 'bg-primary-dark text-white hover:bg-primary-light' : 'bg-gray-800 text-white hover:bg-gray-900',
  };

  return (
    <div className={`py-16 max-w-7xl mx-auto px-4 ${colors.bg} ${colors.text}`}>
      <Helmet>
        <title>Hostel Meals | Meals</title>
      </Helmet>

      <h2 className={`text-4xl md:text-5xl font-extrabold mb-12 text-center ${colors.text}`}>
        All Delicious Meals
      </h2>

      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        {/* Filter Sidebar */}
        <div className={`lg:w-1/4 rounded-xl shadow-lg p-6 border ${colors.border} ${colors.cardBg}`}>
          <h3 className={`text-2xl font-bold mb-6 ${colors.text}`}>Filter Meals</h3>

          {/* Search Input */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Search by Name</label>
            <input
              type="text"
              placeholder="e.g., Chicken Curry"
              className={`w-full px-4 py-3 rounded-lg ring-2 ring-primary-light transition-colors duration-200 ${colors.inputBg}`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Filter by Category</label>
            <select
              className={`w-full px-4 py-3 rounded-lg ring-2 ring-primary-light appearance-none transition-colors duration-200 ${colors.inputBg}`}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${colors.text}`}>Filter by Price Range(from $1)</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                className={`w-1/2 px-4 py-3 rounded-lg ring-2 ring-primary-light transition-colors duration-200 ${colors.inputBg}`}
                value={priceRange.min === 0 ? '' : priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }))}
              />
              <span className={`text-gray-500 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>-</span>
              <input
                type="number"
                placeholder="Max"
                className={`w-1/2 px-4 py-3 rounded-lg ring-2 ring-primary-light transition-colors duration-200 ${colors.inputBg}`}
                value={priceRange.max === 10000 ? '' : priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) || 10000 }))}
              />
            </div>
          </div>
        </div>

        {/* Meals Grid */}
        <div className="lg:w-3/4">
          {isLoading && !isFetchingNextPage ? (
            <p className={`text-center text-xl ${colors.text}`}>Loading delicious meals...</p>
          ) : isError ? (
            <p className="text-center text-red-600 text-xl">Failed to load meals.</p>
          ) : meals.length === 0 ? (
            <p className={`text-center text-xl ${colors.text}`}>No meals found matching your criteria.</p>
          ) : (
            <InfiniteScroll
              dataLength={meals.length}
              next={fetchNextPage}
              hasMore={hasNextPage}
              loader={<h4 className={`text-center my-8 ${colors.text}`}>Loading more meals...</h4>}
              endMessage={
                <p className={`text-center my-8 ${colors.text}`}>
                  <b>You've seen all the meals!</b>
                </p>
              }
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {meals.map((meal) => (
                <div
                  key={meal._id}
                  className={`rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl border ${colors.border} ${colors.cardBg} flex flex-col`}
                >
                  <figure className="relative h-60 w-full overflow-hidden">
                    <img
                      src={meal.image || 'https://placehold.co/600x400?text=Meal+Image'}
                      alt={meal.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </figure>
                  <div className="p-6 flex-grow flex flex-col">
                    <h2 className={`text-2xl font-bold mb-2 ${colors.text}`}>{meal.title}</h2>
                    <p className={`mb-4 text-base flex-grow ${colors.text}`}>{meal.description?.slice(0, 80)}...</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-yellow-500">
                        <FaStar className="mr-1" />
                        <span className={`font-semibold ${colors.text}`}>4.3</span>
                      </div>
                      {meal.price && (
                        <p className="text-xl font-bold text-primary-dark">${meal.price.toFixed(2)}</p>
                      )}
                    </div>

                    <div className="flex justify-end mt-4">
                      <Link
                        to={`/meal/${meal._id}`}
                        onClick={() => window.scrollTo(0, 0)}
                      className="inline-block px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-gray-300 transition-colors duration-200 text-base"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </InfiniteScroll>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealsPage;
