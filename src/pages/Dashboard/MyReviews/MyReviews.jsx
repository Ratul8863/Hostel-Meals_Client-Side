import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const MyReviews = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: reviews = [], refetch, isLoading } = useQuery({
    queryKey: ['my-reviews', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/reviews?email=${user.email}`);
      return res.data;
    },
  });

  const totalPages = Math.ceil(reviews.length / itemsPerPage);
  const paginatedReviews = reviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: 'This review will be permanently deleted!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it',
      cancelButtonColor: '#6b7280',
      confirmButtonColor: '#e11d48',
    });
    if (confirm.isConfirmed) {
      try {
        const res = await axiosSecure.delete(`/reviews/${id}`);
        if (res.data.deletedCount > 0) {
          Swal.fire({
            title: 'Deleted!',
            text: 'Review has been deleted.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
          });
          refetch();
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error', err.message || 'Failed to delete review', 'error');
      }
    }
  };

  const startEdit = (id, currentText) => {
    setEditId(id);
    setEditText(currentText);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditText('');
  };

  const saveEdit = async (id) => {
    if (!editText.trim())
      return Swal.fire('Error', 'Review cannot be empty.', 'warning');
    try {
      const res = await axiosSecure.patch(`/reviews/${id}`, { text: editText });
      if (res.data.modifiedCount > 0) {
        Swal.fire('Updated!', 'Review has been updated.', 'success');
        setEditId(null);
        setEditText('');
        refetch();
      }
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to update review', 'error');
    }
  };

  const handleViewMeal = (mealId) => {
    navigate(`/meal/${mealId}`);
  };

  return (
    <div className="overflow-x-auto bg-white shadow-lg rounded-xl p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">My Reviews</h2>

      <table className="table w-full border rounded-lg">
        <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
          <tr>
            <th className="py-3 px-4 text-left">#</th>
            <th className="py-3 px-4 text-left">Meal</th>
            <th className="py-3 px-4 text-left">Likes</th>
            <th className="py-3 px-4 text-left">Review</th>
            <th className="py-3 px-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="5" className="text-center py-6 text-gray-500">
                Loading...
              </td>
            </tr>
          ) : paginatedReviews.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-6 text-gray-500">
                No reviews found.
              </td>
            </tr>
          ) : (
            paginatedReviews.map((review, index) => (
              <tr key={review._id} className="hover:bg-gray-50">
                <td className="py-3 px-4">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td
                  className="py-3 px-4 max-w-[180px] truncate"
                  title={review.mealTitle}
                >
                  {review.mealTitle}
                </td>
                <td className="py-3 px-4">{review.likes || 0}</td>
                <td className="py-3 px-4 max-w-[300px]">
                  {editId === review._id ? (
                    <textarea
                      className="textarea textarea-bordered w-full min-h-[60px]"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                  ) : (
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {review.text}
                    </p>
                  )}
                </td>
                <td className="py-3 px-4 space-x-1">
                  {editId === review._id ? (
                    <>
                      <button
                        onClick={() => saveEdit(review._id)}
                        className="btn btn-xs btn-success"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="btn btn-xs btn-ghost border"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEdit(review._id, review.text)}
                        className="btn btn-xs btn-info"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="btn btn-xs btn-error"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => handleViewMeal(review.mealId)}
                        className="btn btn-xs btn-outline"
                      >
                        View
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
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
    </div>
  );
};

export default MyReviews;
