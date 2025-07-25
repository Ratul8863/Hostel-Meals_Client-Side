import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Link } from 'react-router';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const ITEMS_PER_PAGE = 10;

const AllReviews = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['all-reviews'],
    queryFn: async () => {
      const res = await axiosSecure.get('/admin/reviews');
      return res.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/admin/reviews/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['all-reviews']);
      Swal.fire('Deleted!', 'Review deleted successfully.', 'success');
    },
    onError: () => {
      Swal.fire('Error', 'Failed to delete review.', 'error');
    }
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This review will be deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMutation.mutate(id);
      }
    });
  };

  // Sort reviews by reviews_count descending
  const sortedReviews = [...reviews].sort((a, b) => (b.reviews_count || 0) - (a.reviews_count || 0));

  // Pagination calculations
  const totalPages = Math.ceil(sortedReviews.length / ITEMS_PER_PAGE);
  const paginatedReviews = sortedReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">All Reviews</h2>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Meal Title</th>
                  <th>Likes</th>
                  <th>Reviews Count</th>
                  <th>Review</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReviews.length > 0 ? (
                  paginatedReviews.map((review, index) => (
                    <tr key={review._id}>
                      <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                      <td>{review.mealTitle}</td>
                      <td>{review.likes || 0}</td>
                      <td>{review.reviews_count || 0}</td>
                      <td>{review.review}</td>
                      <td className="flex gap-2 flex-wrap">
                        <Link to={`/meal/${review.mealId}`} className="btn btn-sm btn-info">View Meal</Link>
                        <button onClick={() => handleDelete(review._id)} className="btn btn-sm btn-error">Delete</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4">No reviews found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <button
                className="btn btn-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`btn btn-sm ${currentPage === i + 1 ? "btn-active" : ""}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="btn btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllReviews;
