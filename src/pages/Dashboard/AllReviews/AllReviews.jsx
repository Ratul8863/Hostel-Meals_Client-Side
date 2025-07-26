import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom'; // Changed to react-router-dom for consistency
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'; // Import for custom Swal styling
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { FaUtensils, FaHeart, FaStar, FaTrash, FaEye, FaUserCircle, FaCalendarAlt } from 'react-icons/fa'; // Icons for table headers and actions

const MySwal = withReactContent(Swal); // Initialize SweetAlert with React content
const ITEMS_PER_PAGE = 10; // Consistent items per page

const AllReviews = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all reviews for admin
  const { data: reviews = [], isLoading, isError, error } = useQuery({
    queryKey: ['all-reviews-admin'], // Distinct query key for admin view
    queryFn: async () => {
      const res = await axiosSecure.get('/admin/reviews');
      return res.data;
    },
  });

  // Mutation for deleting a review
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/admin/reviews/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-reviews-admin']); // Invalidate to refetch updated list
      MySwal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Review deleted successfully.',
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

  // Handle delete confirmation
  const handleDelete = (id, mealTitle, userName) => {
    MySwal.fire({
      title: `Delete review for "${mealTitle}" by ${userName}?`,
      text: 'This review will be permanently deleted. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
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

  // Sort reviews by reviews_count descending (if reviews_count is part of review object)
  // Assuming 'reviews_count' here refers to the count of reviews on the meal,
  // not the review itself. If it's a field on the review, it should be adjusted.
  // For now, sorting by postTime to show most recent reviews first, as 'reviews_count' on a single review
  // doesn't typically make sense for sorting.
  const sortedReviews = [...reviews].sort((a, b) => {
    const dateA = new Date(a.postTime || 0); // Assuming 'postTime' exists on review object
    const dateB = new Date(b.postTime || 0);
    return dateB - dateA; // Sort descending by date
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

  // Loading, Error, and Empty States
  if (isLoading) {
    return <p className="text-center text-gray-600 text-xl py-10">Loading reviews...</p>;
  }
  if (isError) {
    return <p className="text-center text-red-600 text-xl py-10">Error loading reviews: {error.message}</p>;
  }




  const handleShowFullReview = (fullReview) => {
  MySwal.fire({
   
    text: fullReview,
    icon: 'info',
    confirmButtonText: 'Close',
    customClass: {
      popup: 'rounded-lg p-4',
      confirmButton: 'bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600',
    },
  });
};

console.log(paginatedReviews)
  return (
    <div className="py-16 max-w-7xl mx-auto px-4"> {/* Consistent padding and max-width */}
      <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-gray-800">
        Manage All Reviews
      </h2>
      <p className="text-center text-lg md:text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
        Oversee and manage all user-submitted reviews for meals.
      </p>

      {reviews.length === 0 ? (
        <p className="text-center text-gray-600 text-xl py-10">No reviews to display at the moment.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-6 md:p-8"> {/* Polished card container for the table */}
          <div className="overflow-x-auto"> {/* Ensures table is scrollable on small screens */}
            <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
  <tr>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">#</th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <span className="flex items-center gap-2"><FaUtensils /> Meal Title</span>
    </th>
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <span className="flex items-center gap-2"><FaUserCircle /> User Name</span>
    </th>
    
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
    
    {/* 👇 Added Likes */}
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <span className="flex items-center gap-2"><FaHeart className="text-red-500" /> Likes</span>
    </th>
    
    {/* 👇 Added Reviews Count */}
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      <span className="flex items-center gap-2"><FaStar className="text-yellow-500" /> Reviews Count</span>
    </th>

    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Actions</th>
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
                      {review.userName || 'N/A'}
                    </td>
                   
                    <td
  className="px-6 py-4 text-sm text-gray-700 max-w-xs cursor-pointer hover:text-blue-600 transition duration-200"
  title="Click to view full review"
  onClick={() => handleShowFullReview(review.review)}
>
  {review?.review?.length > 40 ? `${review.review.slice(0, 40)}...` : review.review || 'No review text'}
</td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
  {review.likes ?? 0}
</td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
  {review.reviews_count ?? 0}
</td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2">
                        <Link
                          to={`/meal/${review.mealId}`}
                          className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300"
                          title="View Meal Details"
                        >
                          <FaEye className="mr-1" /> View Meal
                        </Link>
                        <button
                          onClick={() => handleDelete(review._id, review.mealTitle, review.userName)}
                          className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 bg-red-600 text-white hover:bg-red-700"
                          disabled={deleteMutation.isPending}
                          title="Delete Review"
                        >
                          {deleteMutation.isPending ? 'Deleting...' : <><FaTrash className="mr-1" /> Delete</>}
                        </button>
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

export default AllReviews;
