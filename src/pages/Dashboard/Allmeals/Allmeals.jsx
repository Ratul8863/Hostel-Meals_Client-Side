import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { Link } from 'react-router-dom';
import { FaSort, FaEye, FaEdit, FaTrash, FaHeart, FaStar, FaUtensils, FaUserCircle, FaDollarSign, FaTimes, FaPencilAlt, FaImage, FaListAlt } from 'react-icons/fa';

const MySwal = withReactContent(Swal);
const ITEMS_PER_PAGE = 10;

const AllMeals = ({ theme }) => {
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [sortBy, setSortBy] = useState('');
    const [editingMeal, setEditingMeal] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Fetch all meals with sorting
    const { data: meals = [], isLoading, isError, error } = useQuery({
        queryKey: ['adminMeals', sortBy],
        queryFn: async () => {
            const res = await axiosSecure.get(`/admin/meals?sort=${sortBy}`);
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
            queryClient.invalidateQueries(['adminMeals']);
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
        onSettled: () => {
            setDeletingId(null);
        }
    });

    // Mutation for updating a meal
    const updateMealMutation = useMutation({
        mutationFn: async ({ id, data }) => {
            let imageUrl = data.image;
            if (data.newImage && data.newImage[0]) {
                const img_hosting_key = import.meta.env.VITE_image_upload_key;
                const img_hosting_url = `https://api.imgbb.com/1/upload?key=${img_hosting_key}`;
                const formData = new FormData();
                formData.append('image', data.newImage[0]);
                const imgRes = await fetch(img_hosting_url, { method: 'POST', body: formData });
                const imgData = await imgRes.json();
                if (!imgData.success) throw new Error(imgData.error?.message || "Image upload failed for update");
                imageUrl = imgData.data.display_url;
            }

            const updatedMealData = {
                title: data.title,
                price: parseFloat(data.price),
                description: data.description,
                category: data.category,
                ingredients: data.ingredients,
                image: imageUrl,
            };

            const res = await axiosSecure.patch(`/meals/${id}`, updatedMealData);
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
            setEditingMeal(null);
            setImageFile(null);
            setImagePreview(null);
            queryClient.invalidateQueries(['adminMeals']);
        },
        onError: (mutationError) => {
            console.error("Error updating meal:", mutationError);
            MySwal.fire({
                icon: 'error',
                title: 'Error',
                text: mutationError.message || 'Failed to update meal. Please try again.',
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
                confirmButton: 'bg-red-600 text-white px-6 py-2 rounded-lg mr-4 hover:bg-red-700 transition-colors duration-200',
                cancelButton: 'bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200',
            },
            buttonsStyling: false,
        }).then((result) => {
            if (result.isConfirmed) {
                setDeletingId(mealId);
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
            category: form.category.value,
            ingredients: form.ingredients.value,
            image: editingMeal.image,
            newImage: imageFile,
        };

        if (isNaN(updatedData.price) || updatedData.price < 0) {
            MySwal.fire('Invalid Price', 'Please enter a valid positive number for price.', 'error');
            return;
        }

        updateMealMutation.mutate({ id: editingMeal._id, data: updatedData });
    };

    // Set up editing meal and image preview when edit button is clicked
    const startEditing = (meal) => {
        setEditingMeal(meal);
        setImagePreview(meal.image);
        setImageFile(null);
    };

    // Handle image change in edit modal
    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImageFile(null);
            setImagePreview(editingMeal.image);
        }
    };

    // Pagination logic
    const totalPages = Math.ceil(meals.length / ITEMS_PER_PAGE);
    const paginatedMeals = meals.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className={`py-16 max-w-7xl mx-auto px-4 ${theme === 'dark' ? 'dark' : ''}`}>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-gray-800 dark:text-gray-100">
                Manage All Meals
            </h2>
            <p className="text-center text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-16 max-w-3xl mx-auto">
                Oversee and manage all meals available on the platform. Edit details or remove meals as needed.
            </p>

            {/* Sort By Section */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 justify-end">
                <label htmlFor="sort-select" className="text-gray-700 dark:text-gray-300 text-lg font-semibold flex items-center gap-2">
                    <FaSort className="text-primary-dark" /> Sort by:
                </label>
                <select
                    id="sort-select"
                    className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-light appearance-none transition-colors duration-200 w-full sm:w-auto"
                    value={sortBy}
                    onChange={(e) => {
                        setSortBy(e.target.value);
                        setCurrentPage(1);
                    }}
                >
                    <option value="">Default</option>
                    <option value="likes">Likes</option>
                    <option value="reviews_count">Reviews Count</option>
                </select>
            </div>

            {/* Meals Table */}
            {isLoading ? (
                <p className="text-center text-gray-600 dark:text-gray-400 text-xl py-10">Loading meals...</p>
            ) : isError ? (
                <p className="text-center text-red-600 text-xl py-10">Error loading meals: {error.message}</p>
            ) : meals.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400 text-xl py-10">No meals available to manage.</p>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 p-6 md:p-8">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tl-lg">
                                        #
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        Image
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        <span className="flex items-center justify-center gap-2"><FaUtensils /> Title</span>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        <span className="flex items-center justify-center gap-2"><FaListAlt /> Category</span>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        <span className="flex items-center justify-center gap-2"><FaDollarSign /> Price</span>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        <span className="flex items-center justify-center gap-2"><FaHeart /> Likes</span>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        <span className="flex items-center justify-center gap-2"><FaStar /> Reviews</span>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        <span className="flex items-center justify-center gap-2"><FaStar /> Rating</span>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                        <span className="flex items-center justify-center gap-2"><FaUserCircle /> Distributor</span>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider rounded-tr-lg">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedMeals.map((meal, index) => (
                                    <tr key={meal._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200 text-center">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                        </td>
                                        <td className=" py-4 whitespace-nowrap flex justify-center">
                                            <img src={meal.image || 'https://placehold.co/64x64/F0F0F0/888888?text=Meal'} className="w-20 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600" alt={meal.title} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 text-center">
                                            {meal.title}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 capitalize text-center">
                                            {meal.category}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-center">
                                            ${typeof meal.price === 'number' ? meal.price.toFixed(2) : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-center">
                                            {meal.likes || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-center">
                                            {meal.reviews_count || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-center">
                                            {meal.rating || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 text-center">
                                            {meal.distributorName || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                                <Link
                                                    to={`/meal/${meal._id}`}
                                                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                                                    title="View Details"
                                                >
                                                    <FaEye className="mr-1" /> View
                                                </Link>
                                                <button
                                                    onClick={() => startEditing(meal)}
                                                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 bg-yellow-500 text-white hover:bg-yellow-600"
                                                    title="Edit Meal"
                                                >
                                                    <FaEdit className="mr-1" /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(meal._id, meal.title)}
                                                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 bg-red-600 text-white hover:bg-red-700"
                                                    disabled={deletingId === meal._id}
                                                    title="Delete Meal"
                                                >
                                                    {deletingId === meal._id ? 'Deleting...' : <><FaTrash className="mr-1" /> Delete</>}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages >= 1 && (
                        <div className="flex justify-center items-center mt-8 space-x-2">
                            <button
                                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                            ? "bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-800 shadow-md"
                                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        }`}
                                    onClick={() => setCurrentPage(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full max-w-lg relative transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Edit Meal: {editingMeal.title}</h3>

                        {/* Close Button */}
                        <button
                            onClick={() => setEditingMeal(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
                            title="Close"
                        >
                            <FaTimes className="text-2xl" />
                        </button>

                        <form onSubmit={handleUpdateSubmit} className="space-y-6">
                            {/* Title */}
                            <div>
                                <label htmlFor="edit-title" className=" text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                                    <FaUtensils /> Meal Title
                                </label>
                                <input
                                    id="edit-title"
                                    type="text"
                                    name="title"
                                    defaultValue={editingMeal.title}
                                    placeholder="Meal Title"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 dark:text-gray-200 transition-colors duration-200"
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label htmlFor="edit-category" className=" text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                                    <FaListAlt /> Category
                                </label>
                                <select
                                    id="edit-category"
                                    name="category"
                                    defaultValue={editingMeal.category}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-light appearance-none transition-colors duration-200"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="Breakfast">Breakfast</option>
                                    <option value="Lunch">Lunch</option>
                                    <option value="Dinner">Dinner</option>
                                    <option value="Snacks">Snacks</option>
                                    <option value="Desserts">Desserts</option>
                                </select>
                            </div>

                            {/* Price */}
                            <div>
                                <label htmlFor="edit-price" className=" text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                                    <FaDollarSign /> Price ($)
                                </label>
                                <input
                                    id="edit-price"
                                    type="number"
                                    name="price"
                                    defaultValue={editingMeal.price}
                                    placeholder="Price"
                                    step="0.01"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 dark:text-gray-200 transition-colors duration-200"
                                    required
                                />
                            </div>

                            {/* Ingredients */}
                            <div>
                                <label htmlFor="edit-ingredients" className=" text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                                    <FaPencilAlt /> Ingredients (comma-separated)
                                </label>
                                <textarea
                                    id="edit-ingredients"
                                    name="ingredients"
                                    defaultValue={editingMeal.ingredients}
                                    placeholder="Ingredients (comma separated)"
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 dark:text-gray-200 transition-colors duration-200 resize-y"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label htmlFor="edit-description" className=" text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                                    <FaPencilAlt /> Description
                                </label>
                                <textarea
                                    id="edit-description"
                                    name="description"
                                    defaultValue={editingMeal.description}
                                    placeholder="Description"
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 dark:text-gray-200 transition-colors duration-200 resize-y"
                                    required
                                />
                            </div>

                            {/* Image Upload for Edit */}
                            <div>
                                <label htmlFor="edit-image" className=" text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2 flex items-center gap-2">
                                    <FaImage /> Meal Image (Optional: Upload new image)
                                </label>
                                <input
                                    id="edit-image"
                                    type="file"
                                    accept="image/*"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-white hover:file:bg-primary-dark transition-colors duration-200 cursor-pointer"
                                    onChange={handleEditImageChange}
                                />
                                {imagePreview && (
                                    <div className="mt-4 flex justify-center">
                                        <img src={imagePreview} alt="Meal Preview" className="max-h-48 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 object-cover" />
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    className="px-6 py-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                                    onClick={() => setEditingMeal(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-800 font-semibold rounded-lg hover:bg-gray-900 dark:hover:bg-gray-200 transition-colors duration-200"
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