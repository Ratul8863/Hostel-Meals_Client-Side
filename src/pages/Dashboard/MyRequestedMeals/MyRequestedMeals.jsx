import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const MyRequestedMeals = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const { data: requestedMeals = [], refetch } = useQuery({
    queryKey: ['my-requested-meals', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/mealRequests?email=${user?.email}`);
      return res.data;
    },
  });

  console.log(requestedMeals)

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
    <div className="overflow-x-auto shadow-lg rounded-xl">
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
          {requestedMeals.map((meal, index) => (
            <tr key={meal._id}>
              <td>{index + 1}</td>
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
          ))}
          {requestedMeals.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center text-gray-500 py-6">
                No requested meals found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MyRequestedMeals;
