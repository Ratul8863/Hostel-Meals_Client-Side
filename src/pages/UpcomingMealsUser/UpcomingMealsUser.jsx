import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaHeart, FaRegHeart } from 'react-icons/fa'; // Icons for liked/unliked states
import Swal from 'sweetalert2'; // For custom alerts
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom'; // For navigation to login/membership
import { Helmet } from 'react-helmet-async';

const UpcomingMealsUser = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const navigate = useNavigate();
const [likingMealId, setLikingMealId] = useState(null);

  // ✅ Get user info to check premium tier
  const { data: userInfo = {}, isLoading: userInfoLoading, isError: userInfoError } = useQuery({
    queryKey: ['user', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${user.email}`);
      return res.data;
    },
    enabled: !!user?.email, // Only fetch if user email is available
  });

  const isPremium = ['silver', 'gold', 'platinum'].includes(userInfo?.membership?.toLowerCase());

  // ✅ Load upcoming meals
  const { data: upcomingMeals = [], isLoading, isError } = useQuery({
    queryKey: ['upcoming-meals'],
    queryFn: async () => {
      // Assuming the server can handle sortBy=likes for upcoming meals
      const res = await axiosSecure.get('/upcoming-meals?sortBy=likes');
      return res.data;
    },
  });

  // ✅ Toggle like mutation
  const toggleLikeMutation = useMutation({
  mutationFn: async ({ mealId }) => {
    setLikingMealId(mealId); // set current processing meal ID

    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please log in to like meals.',
        confirmButtonText: 'Login',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      throw new Error('Login Required');
    }

    if (!isPremium) {
      Swal.fire({
        icon: 'warning',
        title: 'Premium Feature',
        text: 'Only Silver, Gold, or Platinum members can like upcoming meals.',
        confirmButtonText: 'View Membership Plans',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/membership');
        }
      });
      throw new Error('Premium Membership Required');
    }

    const res = await axiosSecure.patch(`/upmeal/${mealId}/toggle-like`, {
      email: user.email,
    });
    return res.data;
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['upcoming-meals']);
  },
  onError: (error) => {
    if (!error.message.includes('Login Required') && !error.message.includes('Premium')) {
      Swal.fire('Error', 'Failed to update like status.', 'error');
    }
  },
  onSettled: () => {
    setLikingMealId(null); // reset loading state after success or failure
  }
});


  // Loading and Error States
  if (isLoading || userInfoLoading) return <p className="text-center py-10 text-gray-600 text-xl">Loading upcoming meals...</p>;
  if (isError || userInfoError) return <p className="text-center py-10 text-red-600 text-xl">Error loading upcoming meals. Please try again later.</p>;

  return (
    <div className="py-16 max-w-7xl mx-auto px-4"> {/* Consistent padding and max-width */}
     <Helmet>
              <title>Hostel Meals | Upcoming Meals</title>
            </Helmet>
      <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-gray-800">
        Discover Upcoming Meals
      </h2>
      <p className="text-center text-lg md:text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
        Get a sneak peek at meals coming soon! Premium members can like their favorites to help them get published.
      </p>

      {upcomingMeals.length === 0 ? (
        <p className="text-center text-gray-600 text-xl">No upcoming meals to display at the moment. Check back later!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"> {/* Responsive grid */}
          {upcomingMeals.map((meal) => {
            const hasLiked = meal.likedBy?.includes(user?.email);

            return (
              <div
                key={meal._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl border border-gray-100 flex flex-col" // Polished card style
              >
                <figure className="relative h-60 w-full overflow-hidden">
                  <img
                    src={meal.image || 'https://placehold.co/600x400?text=Upcoming+Meal'} // Placeholder for missing image
                    alt={meal.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" // Subtle zoom on image hover
                  />
                </figure>
                <div className="p-6 flex-grow flex flex-col"> {/* Added flex-grow and flex-col for consistent height */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{meal.title}</h3>
                  <p className="text-gray-600 mb-2 text-base">Category: <span className="font-medium capitalize">{meal.category}</span></p>
                  <p className="text-gray-600 mb-4 text-base flex-grow">{meal.description?.slice(0, 80)}...</p> {/* Flex-grow for description */}
                  <p className="font-bold text-xl text-primary-dark mb-4">Price: ${meal.price?.toFixed(2) || 'N/A'}</p>

                  <div className="flex justify-between items-center mt-auto">
                     {/* Aligned to bottom */}
                    <span className="text-lg text-gray-700 font-semibold">
                      <div className='flex gap-1'>
                        <FaHeart></FaHeart>
                      {meal.likes || 0} Likes
                      </div>
                    </span>

                    {/* Like Button for Premium Users */}
                    <button
  onClick={() => toggleLikeMutation.mutate({ mealId: meal._id })}
  className={`
    inline-flex items-center justify-center px-6 py-2 rounded-lg font-semibold text-base transition-colors duration-200
    ${hasLiked
      ? 'bg-red-500 text-white hover:bg-red-600'
      : 'bg-gray-800 text-white hover:bg-gray-900'}
    ${!isPremium && user ? 'opacity-50 cursor-not-allowed' : ''}
  `}
  disabled={likingMealId === meal._id || (!isPremium && user)}
  title={!user ? "Login to like" : (!isPremium ? "Upgrade to like" : "")}
>
  {likingMealId === meal._id ? 'Processing...' : (
    hasLiked ? (
      <><FaHeart className="mr-2" /> Unlike</>
    ) : (
      <><FaRegHeart className="mr-2" /> Like</>
    )
  )}
</button>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UpcomingMealsUser;
