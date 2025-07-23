import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';

const UpcomingMealsUser = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // ✅ Get user info to check premium tier
  const { data: userInfo = {} } = useQuery({
    queryKey: ['user', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${user.email}`);
      return res.data;
    },
    enabled: !!user?.email
  });

  const isPremium = ['silver', 'gold', 'platinum'].includes(userInfo?.membership);

  // ✅ Load upcoming meals
  const { data: upcomingMeals = [], refetch } = useQuery({
    queryKey: ['upcoming-meals'],
    queryFn: async () => {
      const res = await axiosSecure.get('/upcoming-meals?sortBy=likes');
      return res.data;
    }
  });

  // ✅ Toggle like mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async ({ mealId }) => {
      if (!user) {
        return Swal.fire('Login Required', 'Please log in to like meals.', 'warning');
      }

      const res = await axiosSecure.patch(`/upmeal/${mealId}/toggle-like`, {
        email: user.email,
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['upcoming-meals']);
    }
  });

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">🍽️ Upcoming Meals</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingMeals.map((meal) => {
          const hasLiked = meal.likedBy?.includes(user?.email);

          return (
            <div key={meal._id} className="bg-base-100 shadow-xl rounded-lg overflow-hidden">
              <img src={meal.image} alt={meal.title} className="w-full h-48 object-cover" />
              <div className="p-4 space-y-2">
                <h3 className="text-xl font-bold">{meal.title}</h3>
                <p className="text-sm text-gray-500">Category: {meal.category}</p>
                <p className="text-gray-600 text-sm">{meal.description}</p>
                <p className="text-gray-700 text-sm">Ingredients: {meal.ingredients}</p>
                <p className="font-bold">Price: ${meal.price}</p>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">Likes: {meal.likes}</span>

                  {isPremium && (
                    <button
                      onClick={() =>
                        toggleLikeMutation.mutate({ mealId: meal._id })
                      }
                      className="btn btn-sm btn-outline flex items-center gap-1"
                    >
                      {hasLiked ? (
                        <>
                          <FaHeart className="text-red-500" /> Unlike
                        </>
                      ) : (
                        <>
                          <FaRegHeart className="text-gray-500" /> Like
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingMealsUser;
