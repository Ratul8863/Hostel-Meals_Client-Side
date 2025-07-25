import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { Link } from 'react-router-dom'; // Changed to react-router-dom for consistency
import { FaSort, FaEye, FaEdit, FaTrash, FaHeart, FaStar, FaUtensils, FaUserCircle, FaDollarSign, FaTimes, FaPencilAlt } from 'react-icons/fa'; // Icons for table headers and actions

const MySwal = withReactContent(Swal);
const ITEMS_PER_PAGE = 8; // Consistent items per page

const AllMeals = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState('');
  const [editingMeal, setEditingMeal] = useState(null); // State to hold meal being edited
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch all meals with sorting
  const { data: meals = [], isLoading, isError, error } = useQuery({
    queryKey: ['adminMeals', sortBy],
    queryFn: async () => {
      const res = await axiosSecure.get(`/admin/meals?sort=${sortBy}`); // Ensure your backend supports this sort parameter
      return res.data;
    },
  });

  // Mutation for deleting a meal
  const deleteMealMutation = useMutation({
    mutationFn: async (mealId) => {
      const res = await axiosSecure.delete(`/meals/${mealId}`);
      return res.data;
    },
    onSuccess: () => {
      MySwal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Meal deleted successfully.',
        customClass: {
          confirmButton: 'bg-primary-dark text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors duration-200',
        },
        buttonsStyling: false,
      });
      queryClient.invalidateQueries(['adminMeals']); // Invalidate to refetch updated list
    },
    onError: (mutationError) => {
      console.error("Error deleting meal:", mutationError);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to delete meal. Please try again.',
        customClass: {
          confirmButton: 'bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200',
        },
        buttonsStyling: false,
      });
    },
  });

  // Mutation for updating a meal
  const updateMealMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosSecure.patch(`/meals/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      MySwal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Meal updated successfully.',
        customClass: {
          confirmButton: 'bg-primary-dark text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors duration-200',
        },
        buttonsStyling: false,
      });
      setEditingMeal(null); // Close modal
      queryClient.invalidateQueries(['adminMeals']); // Invalidate to refetch updated list
    },
    onError: (mutationError) => {
      console.error("Error updating meal:", mutationError);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update meal. Please try again.',
        customClass: {
          confirmButton: 'bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200',
        },
        buttonsStyling: false,
      });
    },
  });

  // Handle delete confirmation
  const handleDelete = (mealId, mealTitle) => {
    MySwal.fire({
      title: `Delete "${mealTitle}"?`,
      text: 'This meal will be permanently deleted. This action cannot be undone.',
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
        deleteMealMutation.mutate(mealId);
      }
    });
  };

  // Handle update form submission from modal
  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const updatedData = {
      title: form.title.value,
      price: parseFloat(form.price.value),
      description: form.description.value,
      // You might want to add more fields here if they are editable
    };

    // Basic validation for price
    if (isNaN(updatedData.price) || updatedData.price < 0) {
      MySwal.fire('Invalid Price', 'Please enter a valid positive number for price.', 'error');
      return;
    }
    
    updateMealMutation.mutate({ id: editingMeal._id, data: updatedData });
  };

  // Pagination logic
  const totalPages = Math.ceil(meals.length / ITEMS_PER_PAGE);
  const paginatedMeals = meals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="py-2 max-w-7xl mx-auto px-4"> {/* Consistent padding and max-width */}
      <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-gray-800">
        Manage All Meals
      </h2>

      {/* Sort By Section */}
      <div className="flex items-center gap-4 mb-8 justify-end"> {/* Aligned to right */}
        <label htmlFor="sort-select" className="text-gray-700 text-lg font-semibold">
          <FaSort className="inline-block mr-2" /> Sort by:
        </label>
        <select
          id="sort-select"
          className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-light appearance-none transition-colors duration-200"
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setCurrentPage(1); // Reset page on sort change
          }}
        >
          <option value="">Default</option>
          <option value="likes">Likes</option>
          <option value="reviews_count">Reviews Count</option>
        </select>
      </div>

      {/* Meals Table */}
      {isLoading ? (
        <p className="text-center text-gray-600 text-xl py-10">Loading meals...</p>
      ) : isError ? (
        <p className="text-center text-red-600 text-xl py-10">Error loading meals: {error.message}</p>
      ) : meals.length === 0 ? (
        <p className="text-center text-gray-600 text-xl py-10">No meals available to manage.</p>
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
                    <span className="flex items-center gap-2"><FaUtensils /> Title</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="flex items-center gap-2"><FaHeart /> Likes</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="flex items-center gap-2"><FaStar /> Reviews</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="flex items-center gap-2"><FaStar /> Rating</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="flex items-center gap-2"><FaUserCircle /> Distributor</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedMeals.map((meal, index) => (
                  <tr key={meal._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {meal.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {meal.likes || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {meal.reviews_count || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {typeof meal.rating === 'number' ? meal.rating.toFixed(1) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {meal.distributorName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex gap-2">
                        <Link
                          to={`/meal/${meal._id}`}
                          className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300"
                          title="View Details"
                        >
                          <FaEye className="mr-1" /> View
                        </Link>
                        <button
                          onClick={() => setEditingMeal(meal)}
                          className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 bg-yellow-500 text-white hover:bg-yellow-600"
                          title="Edit Meal"
                        >
                          <FaEdit className="mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(meal._id, meal.title)}
                          className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 bg-red-600 text-white hover:bg-red-700"
                          disabled={deleteMealMutation.isPending}
                          title="Delete Meal"
                        >
                          {deleteMealMutation.isPending ? 'Deleting...' : <><FaTrash className="mr-1" /> Delete</>}
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
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Edit Meal Modal */}
      {editingMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative transform transition-all duration-300 scale-100 opacity-100">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Edit Meal: {editingMeal.title}</h3>
            
            {/* Close Button */}
            <button
              onClick={() => setEditingMeal(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors duration-200"
              title="Close"
            >
              <FaTimes className="text-2xl" />
            </button>

            <form onSubmit={handleUpdateSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="edit-title" className=" text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                    <FaUtensils /> Meal Title
                </label>
                <input
                  id="edit-title"
                  type="text"
                  name="title"
                  defaultValue={editingMeal.title}
                  placeholder="Meal Title"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200"
                  required
                />
              </div>

              {/* Price */}
              <div>
                <label htmlFor="edit-price" className=" text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                    <FaDollarSign /> Price ($)
                </label>
                <input
                  id="edit-price"
                  type="number"
                  name="price"
                  defaultValue={editingMeal.price}
                  placeholder="Price"
                  step="0.01"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="edit-description" className=" text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                    <FaPencilAlt /> Description
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingMeal.description}
                  placeholder="Description"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200 resize-y"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                  onClick={() => setEditingMeal(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors duration-200"
                  disabled={updateMealMutation.isPending}
                >
                  {updateMealMutation.isPending ? 'Updating...' : 'Update Meal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllMeals;
