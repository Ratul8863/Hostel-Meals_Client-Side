import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom'; // Ensure Link is from react-router-dom
import { FaStar } from 'react-icons/fa'; // For meal ratings
import { Helmet } from 'react-helmet-async';

const categories = ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Desserts']; // Extended categories for example

const MealsPage = () => {
  const axiosSecure = useAxiosSecure();
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); // Renamed to selectedCategory for consistency
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedCategory, setDebouncedCategory] = useState('');
  const [debouncedPriceRange, setDebouncedPriceRange] = useState(priceRange);

  // Debounce search, category, and price range to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms debounce
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCategory(selectedCategory);
    }, 500);
    return () => clearTimeout(handler);
  }, [selectedCategory]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 500);
    return () => clearTimeout(handler);
  }, [priceRange]);


  const fetchMeals = async ({ pageParam = 1 }) => {
    const res = await axiosSecure.get(`/meals`, {
      params: {
        page: pageParam,
        limit: 8, // Increased limit for better infinite scroll experience
        search: debouncedSearch,
        category: debouncedCategory,
        minPrice: debouncedPriceRange.min,
        maxPrice: debouncedPriceRange.max,
      },
    });
    return res.data; // response is { meals: [], totalCount: number }
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage, // To differentiate initial loading from fetching more
    isError,
  } = useInfiniteQuery({
    queryKey: ['meals', debouncedSearch, debouncedCategory, debouncedPriceRange],
    queryFn: fetchMeals,
    getNextPageParam: (lastPage, allPages) => {
      // Assuming lastPage.meals.length gives the number of meals in the *current* fetched page
      // And lastPage.totalCount gives the total number of meals available on the server for current filters
      const totalFetchedMeals = allPages.flatMap((page) => page.meals).length;
      if (totalFetchedMeals < lastPage.totalCount) {
        return allPages.length + 1; // Request next page
      }
      return undefined; // No more pages
    },
    initialPageParam: 1,
  });

  const meals = data?.pages.flatMap((page) => page.meals) || [];

  return (
    <div className="py-16 max-w-7xl mx-auto px-4"> {/* Consistent padding and max-width */}
 <Helmet>
              <title>Hostel Meals | Meals</title>
            </Helmet>

      <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-gray-800">
        All Delicious Meals
      </h2>

      <div className="flex flex-col lg:flex-row gap-8 mb-12">
        {/* Filter and Search Sidebar/Section */}
        <div className="lg:w-1/4 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Filter Meals</h3>

          {/* Search Input */}
          <div className="mb-6">
            <label htmlFor="search-input" className="block text-gray-700 text-sm font-medium mb-2">Search by Name</label>
            <input
              id="search-input"
              type="text"
              placeholder="e.g., Chicken Curry"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <label htmlFor="category-select" className="block text-gray-700 text-sm font-medium mb-2">Filter by Category</label>
            <select
              id="category-select"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-light appearance-none transition-colors duration-200"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">Filter by Price Range</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                className="w-1/2 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200"
                value={priceRange.min === 0 ? '' : priceRange.min} // Empty string for 0 to show placeholder
                onChange={(e) => setPriceRange((prev) => ({ ...prev, min: Number(e.target.value) || 0 }))}
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                className="w-1/2 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200"
                value={priceRange.max === 10000 ? '' : priceRange.max} // Empty string for default max
                onChange={(e) => setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) || 10000 }))}
              />
            </div>
          </div>
        </div>

        {/* Meals Display Area */}
        <div className="lg:w-3/4">
          {isLoading && !isFetchingNextPage ? ( // Show initial loading state
            <p className="text-center text-gray-600 text-xl">Loading delicious meals...</p>
          ) : isError ? (
            <p className="text-center text-red-600 text-xl">Failed to load meals. Please try again later.</p>
          ) : meals.length === 0 ? (
            <p className="text-center text-gray-600 text-xl">No meals found matching your criteria.</p>
          ) : (
            <InfiniteScroll
              dataLength={meals.length}
              next={fetchNextPage}
              hasMore={hasNextPage}
              loader={<h4 className="text-center my-8 text-gray-600">Loading more meals...</h4>}
              endMessage={
                <p className="text-center my-8 text-gray-500">
                  <b>You've seen all the meals!</b>
                </p>
              }
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" // Consistent grid styling
            >
              {meals.map((meal) => (
                <div
                  key={meal._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl border border-gray-100 flex flex-col" // Polished card style
                >
                  <figure className="relative h-60 w-full overflow-hidden">
                    <img
                      src={meal.image || 'https://placehold.co/600x400?text=Meal+Image'}
                      alt={meal.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </figure>
                  <div className="p-6 flex-grow flex flex-col"> {/* Added flex-grow and flex-col for consistent height */}
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{meal.title}</h2>
                    <p className="text-gray-600 mb-4 text-base flex-grow">{meal.description?.slice(0, 80)}...</p> {/* flex-grow for description */}

                    <div className="flex items-center justify-between mb-4">
                     
                        <div className="flex items-center text-yellow-500">
                          <FaStar className="mr-1" />
                          <span className="font-semibold text-gray-700">4.3</span>
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
                        className="inline-block px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors duration-200 text-base"
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
