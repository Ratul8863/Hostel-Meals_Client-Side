import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { Link } from 'react-router';

const AllMeals = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState('');
  const [editingMeal, setEditingMeal] = useState(null); // meal being edited

  const { data: meals = [], isLoading } = useQuery({
    queryKey: ['meals', sortBy],
    queryFn: async () => {
      const res = await axiosSecure.get(`/admin/meals?sort=${sortBy}`);
      return res.data;
    }
  });

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

  const updateMealMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosSecure.patch(`/meals/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      Swal.fire('Updated!', 'Meal updated successfully.', 'success');
      setEditingMeal(null);
      queryClient.invalidateQueries(['meals']);
    },
    onError: () => {
      Swal.fire('Error', 'Failed to update meal.', 'error');
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

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const updatedData = {
      title: form.title.value,
      price: parseFloat(form.price.value),
      description: form.description.value
    };
    updateMealMutation.mutate({ id: editingMeal._id, data: updatedData });
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
                        <Link to={`/meal/${meal._id}`} className="btn btn-sm btn-info">View</Link>
                        <button onClick={() => setEditingMeal(meal)} className="btn btn-sm btn-warning">Edit</button>
                        <button onClick={() => handleDelete(meal._id)} className="btn btn-sm btn-error">Delete</button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
      }

      {/* Modal */}
      {
        editingMeal &&
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md relative">
            <h3 className="text-xl font-semibold mb-4">Edit Meal</h3>
            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <input type="text" name="title" defaultValue={editingMeal.title} placeholder="Title" className="input input-bordered w-full" />
              <input type="number" name="price" defaultValue={editingMeal.price} placeholder="Price" className="input input-bordered w-full" />
              <textarea name="description" defaultValue={editingMeal.description} placeholder="Description" className="textarea textarea-bordered w-full" />
              <div className="flex justify-end gap-3">
                <button type="button" className="btn btn-outline" onClick={() => setEditingMeal(null)}>Cancel</button>
                <button type="submit" className="btn btn-success">Update</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  );
};

export default AllMeals;
