import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';

import { Link } from 'react-router';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const AllMeals = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState('');

  // Fetch meals from server
  const { data: meals = [], isLoading } = useQuery({
    queryKey: ['meals', sortBy],
    queryFn: async () => {
      const res = await axiosSecure.get(`/admin/meals?sort=${sortBy}`);
      return res.data;
    }
  });

  // Delete meal mutation
  const deleteMealMutation = useMutation({
    mutationFn: async (mealId) => {
      const res = await axiosSecure.delete(`/meals/${mealId}`);
      return res.data;
    },
    onSuccess: () => {
      Swal.fire('Deleted!', 'Meal deleted successfully.', 'success');
      queryClient.invalidateQueries(['meals']);
    },
    onError: () => {
      Swal.fire('Error', 'Failed to delete meal.', 'error');
    }
  });

  const handleDelete = (mealId) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This meal will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteMealMutation.mutate(mealId);
      }
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">All Meals</h2>

      <div className="mb-4 flex items-center gap-3">
        <label className="font-medium">Sort by:</label>
        <select
          className="select select-bordered"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="">Default</option>
          <option value="likes">Likes</option>
          <option value="reviews_count">Reviews Count</option>
        </select>
      </div>

      {
        isLoading ? <p>Loading meals...</p> :
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Likes</th>
                  <th>Reviews</th>
                  <th>Rating</th>
                  <th>Distributor</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {
                  meals.map((meal, index) => (
                    <tr key={meal._id}>
                      <td>{index + 1}</td>
                      <td>{meal.title}</td>
                      <td>{meal.likes}</td>
                      <td>{meal.reviews_count}</td>
                      <td>{meal.rating}</td>
                      <td>{meal.distributorName || 'N/A'}</td>
                      <td className="flex gap-2 flex-wrap">
                        <Link to={`/dashboard/viewMeal/${meal._id}`} className="btn btn-sm btn-info">View</Link>
                        <Link to={`/dashboard/updateMeal/${meal._id}`} className="btn btn-sm btn-warning">Update</Link>
                        <button onClick={() => handleDelete(meal._id)} className="btn btn-sm btn-error">Delete</button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
      }
    </div>
  );
};

export default AllMeals;
