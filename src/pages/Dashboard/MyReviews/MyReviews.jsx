import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; // Added useMutation, useQueryClient
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'; // Import for custom Swal styling
import { useNavigate } from 'react-router-dom'; // Changed to react-router-dom for consistency
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { FaUtensils, FaHeart, FaStar, FaEdit, FaTrash, FaEye, FaSave, FaTimes, FaCalendarAlt, FaUserCircle } from 'react-icons/fa'; // Icons for table headers and actions

const MySwal = withReactContent(Swal); // Initialize SweetAlert with React content
const ITEMS_PER_PAGE = 10; // Consistent items per page

const MyReviews = () => {
  const { user, loading: authLoading } = useAuth(); // Get authLoading state
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient(); // Initialize queryClient
  const navigate = useNavigate();

  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch user's reviews
  const { data: reviews = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['my-reviews', user?.email],
    queryFn: async () => {
      if (!user?.email) return []; // Don't fetch if user email is not available
      const res = await axiosSecure.get(`/reviews?email=${user.email}`);
      return res.data;
    },
    enabled: !!user?.email && !authLoading, // Only fetch if user email is available and auth is not loading
  });

  // Sort reviews by postTime descending (most recent first)
  const sortedReviews = [...reviews].sort((a, b) => {
    const dateA = new Date(a.postTime || 0);
    const dateB = new Date(b.postTime || 0);
    return dateB - dateA;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedReviews.length / ITEMS_PER_PAGE);
  const paginatedReviews = sortedReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Mutation for deleting a review
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/reviews/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-reviews', user?.email]); // Invalidate to refetch updated list
      MySwal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Your review has been deleted successfully.',
        customClass: {
          confirmButton: 'bg-primary-dark text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors duration-200',
        },
        buttonsStyling: false,
      });
    },
    onError: (mutationError) => {
      console.error("Error deleting review:", mutationError);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete review. Please try again.',
        customClass: {
          confirmButton: 'bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200',
        },
        buttonsStyling: false,
      });
    },
  });

  // Mutation for updating a review
  const updateMutation = useMutation({
    mutationFn: async ({ id, text }) => {
      const res = await axiosSecure.patch(`/reviews/${id}`, { review: text }); // Ensure backend expects 'review' field
      return res.data;
    },
    onSuccess: () => {
      MySwal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Your review has been updated successfully.',
        customClass: {
          confirmButton: 'bg-primary-dark text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors duration-200',
        },
        buttonsStyling: false,
      });
      setEditId(null); // Exit edit mode
      setEditText(''); // Clear edit text
      queryClient.invalidateQueries(['my-reviews', user?.email]); // Refetch reviews
    },
    onError: (mutationError) => {
      console.error("Error updating review:", mutationError);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: mutationError.message || 'Failed to update review. Please try again.',
        customClass: {
          confirmButton: 'bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200',
        },
        buttonsStyling: false,
      });
    },
  });

  // Handle delete confirmation
  const handleDeleteClick = (id, mealTitle) => {
    MySwal.fire({
      title: `Delete review for "${mealTitle}"?`,
      text: 'This review will be permanently deleted. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: 'bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200',
        cancelButton: 'bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200',
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  const startEdit = (id, currentText) => {
    setEditId(id);
    setEditText(currentText);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditText('');
  };

  const saveEdit = (id) => {
    if (!editText.trim()) {
      MySwal.fire({
        icon: 'warning',
        title: 'Empty Review',
        text: 'Review cannot be empty. Please write something.',
        customClass: {
          confirmButton: 'bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors duration-200',
        },
        buttonsStyling: false,
      });
      return;
    }
    updateMutation.mutate({ id, text: editText });
  };

  const handleViewMeal = (mealId) => {
    navigate(`/meal/${mealId}`);
  };

  // Loading, Error, and Empty States
  if (authLoading || isLoading) {
    return <p className="text-center text-gray-600 text-xl py-10">Loading your reviews...</p>;
  }
  if (isError) {
    return <p className="text-center text-red-600 text-xl py-10">Error loading reviews: {error.message}</p>;
  }

  return (
    <div className="py-2 max-w-7xl mx-auto px-4"> {/* Consistent padding and max-width */}
      <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-gray-800">
        My Reviews
      </h2>
      <p className="text-center text-lg md:text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
        View and manage all the reviews you've submitted for meals.
      </p>

      {paginatedReviews.length === 0 ? (
        <p className="text-center text-gray-600 text-xl py-10">You haven't submitted any reviews yet.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-6 md:p-8"> {/* Polished card container for the table */}
          <div className="overflow-x-auto"> {/* Ensures table is scrollable on small screens */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="flex items-center gap-2"><FaUtensils /> Meal Title</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="flex items-center gap-2"><FaHeart /> Likes</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="flex items-center gap-2"><FaCalendarAlt /> Reviewed On</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Review
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedReviews.map((review, index) => (
                  <tr key={review._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {review.mealTitle || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {review.likes || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {review.postTime ? new Date(review.postTime).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                      {editId === review._id ? (
                        <textarea
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-light text-gray-800 transition-colors duration-200 resize-y min-h-[60px]"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                        />
                      ) : (
                        <p className="line-clamp-3" title={review.review}>
                          {review.review || 'No review text'}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex flex-col sm:flex-row gap-2"> {/* Responsive action buttons */}
                        {editId === review._id ? (
                          <>
                            <button
                              onClick={() => saveEdit(review._id)}
                              className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 bg-primary-dark text-white hover:bg-primary-light"
                              disabled={updateMutation.isPending}
                              title="Save Changes"
                            >
                              {updateMutation.isPending ? 'Saving...' : <><FaSave className="mr-1" /> Save</>}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300"
                              title="Cancel Edit"
                            >
                              <FaTimes className="mr-1" /> Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(review._id, review.review)}
                              className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 bg-yellow-500 text-white hover:bg-yellow-600"
                              title="Edit Review"
                            >
                              <FaEdit className="mr-1" /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(review._id, review.mealTitle)}
                              className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 bg-red-600 text-white hover:bg-red-700"
                              disabled={deleteMutation.isPending}
                              title="Delete Review"
                            >
                              {deleteMutation.isPending ? 'Deleting...' : <><FaTrash className="mr-1" /> Delete</>}
                            </button>
                            <button
                              onClick={() => handleViewMeal(review.mealId)}
                              className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300"
                              title="View Meal Details"
                            >
                              <FaEye className="mr-1" /> View Meal
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      ? "bg-gray-800 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  onClick={() => goToPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default MyReviews;
