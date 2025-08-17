import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { FaUtensils, FaHeart, FaStar, FaTimesCircle } from 'react-icons/fa';

const MySwal = withReactContent(Swal);
const ITEMS_PER_PAGE = 10;

const MyRequestedMeals = ({ theme }) => {
  const { user, loading: authLoading } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: requestedMeals = [], isLoading, isError, error } = useQuery({
    queryKey: ['my-requested-meals', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const res = await axiosSecure.get(`/mealRequests?email=${user.email}`);
      return res.data;
    },
    enabled: !!user?.email && !authLoading,
  });

  const sortedMeals = [...requestedMeals].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return 0;
  });

  const cancelMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/meal-requests/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-requested-meals', user?.email]);
      MySwal.fire({
        icon: 'success',
        title: 'Cancelled!',
        text: 'Your meal request has been cancelled successfully.',
        customClass: {
          confirmButton: 'bg-primary-dark text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors duration-200',
        },
        buttonsStyling: false,
      });
    },
    onError: () => {
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to cancel request. Please try again.',
        customClass: {
          confirmButton: 'bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200',
        },
        buttonsStyling: false,
      });
    },
  });

  const handleCancel = (id, mealTitle) => {
    MySwal.fire({
      title: `Cancel request for "${mealTitle}"?`,
      text: 'This will permanently remove your meal request. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: 'bg-red-600 text-white px-6 py-2 mr-4 rounded-lg hover:bg-red-700 transition-colors duration-200',
        cancelButton: 'bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200',
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) cancelMutation.mutate(id);
    });
  };

  const totalPages = Math.ceil(sortedMeals.length / ITEMS_PER_PAGE);
  const paginatedMeals = sortedMeals.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const goToPage = (page) => { if (page >= 1 && page <= totalPages) setCurrentPage(page); };

  if (authLoading || isLoading) {
    return <p className="text-center text-gray-600 dark:text-gray-300 text-xl py-10">Loading your requested meals...</p>;
  }
  if (isError) {
    return <p className="text-center text-red-600 dark:text-red-400 text-xl py-10">Error loading requested meals: {error.message}</p>;
  }

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} py-2 max-w-7xl mx-auto px-4`}>
      <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-gray-800 dark:text-gray-100">My Requested Meals</h2>
      <p className="text-center text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-16 max-w-3xl mx-auto">
        Track the status of your meal requests and manage them here.
      </p>

      {paginatedMeals.length === 0 ? (
        <p className="text-center text-gray-600 dark:text-gray-400 text-xl py-10">You haven't requested any meals yet.</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 p-6 md:p-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-lg">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <span className="flex items-center gap-2"><FaUtensils /> Meal Title</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <span className="flex items-center gap-2"><FaHeart /> Likes</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <span className="flex items-center gap-2"><FaStar /> Reviews</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedMeals.map((meal, index) => (
                  <tr key={meal._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200">{meal.mealTitle || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{meal.likes || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{meal.reviews_count || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                          ${meal.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-yellow-100'
                            : 'bg-green-100 text-green-700 dark:bg-green-600 dark:text-green-100'
                          }`}
                      >
                        {meal.status || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {meal.status === 'pending' ? (
                        <button
                          onClick={() => handleCancel(meal._id, meal.mealTitle)}
                          className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                          disabled={cancelMutation.isPending}
                        >
                          {cancelMutation.isPending ? 'Cancelling...' : <><FaTimesCircle className="mr-2" /> Cancel</>}
                        </button>
                      ) : (
                        <span className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 cursor-not-allowed">
                          Delivered
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200
                    ${currentPage === i + 1
                      ? "bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-800 shadow-md"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  onClick={() => goToPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyRequestedMeals;
