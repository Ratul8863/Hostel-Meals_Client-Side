import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const MyRequestedMeals = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: requestedMeals = [], refetch, isLoading } = useQuery({
    queryKey: ['my-requested-meals', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/mealRequests?email=${user?.email}`);
      return res.data;
    },
  });

  const sortedMeals = [...requestedMeals].sort((a, b) => {
    if (a.status === 'pending' && b.status !== 'pending') return -1;
    if (a.status !== 'pending' && b.status === 'pending') return 1;
    return 0;
  });

  const totalPages = Math.ceil(sortedMeals.length / itemsPerPage);
  const paginatedMeals = sortedMeals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCancel = async (id) => {
    const confirm = await Swal.fire({
      title: 'Cancel Request?',
      text: 'This will remove your meal request.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it',
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#6b7280',
    });

    if (confirm.isConfirmed) {
      try {
        const res = await axiosSecure.delete(`/meal-requests/${id}`);
        if (res.data.deletedCount) {
          Swal.fire('Cancelled!', 'Meal request has been cancelled.', 'success');
          refetch();
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to cancel request.', 'error');
      }
    }
  };

  return (
    <div className="overflow-x-auto shadow-lg rounded-xl p-4">
      <h2 className="text-2xl font-bold mb-4">My Requested Meals</h2>

      <table className="table w-full table-zebra">
        <thead className="bg-base-200 text-base font-semibold">
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Likes</th>
            <th>Reviews</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="6" className="text-center py-6 text-gray-500">Loading...</td>
            </tr>
          ) : paginatedMeals.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center py-6 text-gray-500">No requested meals found.</td>
            </tr>
          ) : (
            paginatedMeals.map((meal, index) => (
              <tr key={meal._id}>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td>{meal.title}</td>
                <td>{meal.likes || 0}</td>
                <td>{meal.reviews_count || 0}</td>
                <td>
                  <span className={`badge ${meal.status === 'pending' ? 'badge-warning' : 'badge-success'}`}>
                    {meal.status}
                  </span>
                </td>
                <td>
                  {meal.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(meal._id)}
                      className="btn btn-xs btn-error"
                    >
                      Cancel
                    </button>
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

export default MyRequestedMeals;
