import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useAuth from '../../../hooks/useAuth';
import { FaPlus, FaImage, FaUtensils, FaDollarSign, FaListAlt, FaPencilAlt, FaUser, FaHeart, FaCalendarAlt, FaCheckCircle, FaTimes } from 'react-icons/fa';

const MySwal = withReactContent(Swal);
const ITEMS_PER_PAGE = 8;

const UpcomingMeals = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [publishingId, setPublishingId] = useState(null); // State to track the ID of the meal being published

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  const imageFile = watch("image");
  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  }, [imageFile]);

  const { data: upcomingMeals = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['upcoming-meals-admin'],
    queryFn: async () => {
      const res = await axiosSecure.get('/upcoming-meals?sortBy=likes');
      return res.data;
    },
  });

  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(upcomingMeals.length / ITEMS_PER_PAGE);
  const paginatedMeals = upcomingMeals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const addUpcomingMealMutation = useMutation({
    mutationFn: async (mealData) => {
      const img_hosting_key = import.meta.env.VITE_image_upload_key;
      const img_hosting_url = `https://api.imgbb.com/1/upload?key=${img_hosting_key}`;

      const formData = new FormData();
      formData.append('image', mealData.image[0]);
      const imgRes = await fetch(img_hosting_url, { method: 'POST', body: formData });
      const imgData = await imgRes.json();
      if (!imgData.success) throw new Error(imgData.error?.message || "Image upload failed");
      const imageUrl = imgData.data.display_url;

      const price = parseFloat(mealData.price);
      if (isNaN(price)) throw new Error("Invalid price value.");

      const newMeal = {
        title: mealData.title,
        category: mealData.category,
        ingredients: mealData.ingredients,
        description: mealData.description,
        price: price,
        likes: 0,
        image: imageUrl,
        addedBy: user?.email,
        distributorName: user?.displayName,
        postTime: new Date().toISOString(),
      };

      const res = await axiosSecure.post('/upcoming-meals', newMeal);
      return res.data;
    },
    onSuccess: () => {
      MySwal.fire({
        icon: 'success',
        title: 'Added!',
        text: 'Meal added to upcoming meals successfully.',
        customClass: {
          confirmButton: 'bg-primary-dark text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors duration-200',
        },
        buttonsStyling: false,
      });
      setIsModalOpen(false);
      reset();
      setImagePreview(null);
      queryClient.invalidateQueries(['upcoming-meals-admin']);
    },
    onError: (mutationError) => {
      console.error("Error adding upcoming meal:", mutationError);
      MySwal.fire({
        icon: 'error',
        title: 'Oops...',
        text: mutationError.message || 'Failed to add meal to upcoming. Please try again.',
        customClass: {
          confirmButton: 'bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200',
        },
        buttonsStyling: false,
      });
    },
  });

  const publishMealMutation = useMutation({
    mutationFn: async (mealToPublish) => {
      const mainMealData = {
        ...mealToPublish,
        rating: 0,
        reviews_count: 0,
        postTime: new Date().toISOString(),
      };
      delete mainMealData._id;

      const publishRes = await axiosSecure.post('/meals', mainMealData);
      if (!publishRes.data.insertedId) {
        throw new Error("Failed to add meal to main collection.");
      }

      const deleteRes = await axiosSecure.delete(`/upcoming-meals/${mealToPublish._id}`);
      if (deleteRes.status !== 200) {
        throw new Error("Failed to remove meal from upcoming meals after publishing.");
      }
      return publishRes.data;
    },
    onSuccess: () => {
      MySwal.fire({
        icon: 'success',
        title: 'Published!',
        text: 'Meal published to All Meals successfully and removed from upcoming.',
        customClass: {
          confirmButton: 'bg-primary-dark text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors duration-200',
        },
        buttonsStyling: false,
      });
      queryClient.invalidateQueries(['upcoming-meals-admin']);
      queryClient.invalidateQueries(['adminMeals']);
    },
    onError: (mutationError) => {
      console.error("Error publishing meal:", mutationError);
      MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: mutationError.message || 'Failed to publish meal. Please try again.',
        customClass: {
          confirmButton: 'bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200',
        },
        buttonsStyling: false,
      });
    },
    onSettled: () => {
      setPublishingId(null); // Clear publishingId regardless of success or failure
    }
  });

  const handleAddMealSubmit = (data) => {
    addUpcomingMealMutation.mutate(data);
  };

  const handlePublishClick = (meal) => {
    MySwal.fire({
      title: `Publish "${meal.title}"?`,
      text: "This meal will be moved to 'All Meals' and removed from 'Upcoming Meals'.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Publish!",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: 'bg-green-600 text-white px-6 py-2 mr-4 rounded-lg hover:bg-primary-light transition-colors duration-200',
        cancelButton: 'bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200',
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        setPublishingId(meal._id); // Set the ID of the meal being published
        publishMealMutation.mutate(meal);
      }
    });
  };

  if (isLoading) {
    return <p className="text-center text-gray-600 text-xl py-10">Loading upcoming meals...</p>;
  }
  if (isError) {
    return <p className="text-center text-red-600 text-xl py-10">Error loading upcoming meals: {error.message}</p>;
  }

  return (
    <div className="py-16 max-w-7xl mx-auto px-4">
      <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-gray-800">
        Manage Upcoming Meals
      </h2>
      <p className="text-center text-lg md:text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
        Oversee meals planned for future publication. Publish them to make them available to all users.
      </p>

      <div className="flex justify-end items-center mb-8">
        <button
          onClick={() => { setIsModalOpen(true); reset(); setImagePreview(null); }}
          className="inline-flex items-center px-6 cursor-pointer py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-primary-light transition-colors duration-200 text-base shadow-md"
        >
          <FaPlus className="mr-2" /> Add Upcoming Meal
        </button>
      </div>

      {upcomingMeals.length === 0 ? (
        <p className="text-center text-gray-600 text-xl py-10">No upcoming meals to display at the moment.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-6 md:p-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="flex items-center gap-2"><FaUtensils /> Title</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="flex items-center gap-2"><FaListAlt /> Category</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="flex items-center gap-2"><FaHeart /> Likes</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="flex items-center gap-2"><FaUser /> Added By</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedMeals.map((meal, index) => (
                  <tr key={meal._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className=" py-4 whitespace-nowrap">
                      <img src={meal.image || 'https://placehold.co/64x64?text=Meal'} className="w-16 h-16 object-cover rounded-lg border border-gray-200" alt={meal.title} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {meal.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                      {meal.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {meal.likes || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {meal.distributorName || meal.addedBy || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handlePublishClick(meal)}
                        className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 bg-gray-700 text-white hover:bg-gray-900"
                        disabled={publishingId === meal._id || publishMealMutation.isPending} // Disable only the current publishing button
                      >
                        {publishingId === meal._id ? 'Publishing...' : <><FaCheckCircle className="mr-2" /> Publish</>}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages >= 1 && (
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg relative transform transition-all duration-300 scale-100 opacity-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add New Upcoming Meal</h3>

            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors duration-200"
              title="Close"
            >
              <FaTimes className="text-2xl" />
            </button>

            <form onSubmit={handleSubmit(handleAddMealSubmit)} className="space-y-6">
              <div>
                <label htmlFor="modal-title" className=" text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                  <FaUtensils /> Meal Title
                </label>
                <input
                  id="modal-title"
                  type="text"
                  placeholder="e.g., Spicy Lentil Soup"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200"
                  {...register("title", { required: "Meal title is required" })}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label htmlFor="modal-category" className=" text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                  <FaListAlt /> Category
                </label>
                <select
                  id="modal-category"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-light appearance-none transition-colors duration-200"
                  {...register("category", { required: "Category is required" })}
                >
                  <option value="">Select Category</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Desserts">Desserts</option>
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <label htmlFor="modal-price" className=" text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                  <FaDollarSign /> Price ($)
                </label>
                <input
                  id="modal-price"
                  type="number"
                  placeholder="e.g., 8.50"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200"
                  step="0.01"
                  {...register("price", {
                    required: "Price is required",
                    min: { value: 0, message: "Price cannot be negative" },
                    pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Invalid price format" }
                  })}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
              </div>

              <div>
                <label htmlFor="modal-ingredients" className=" text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                  <FaPencilAlt /> Ingredients (comma-separated)
                </label>
                <textarea
                  id="modal-ingredients"
                  placeholder="e.g., Lentils, Carrots, Spinach, Garlic"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200 resize-y"
                  rows={3}
                  {...register("ingredients", { required: "Ingredients are required" })}
                ></textarea>
                {errors.ingredients && <p className="text-red-500 text-sm mt-1">{errors.ingredients.message}</p>}
              </div>

              <div>
                <label htmlFor="modal-description" className=" text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                  <FaPencilAlt /> Description
                </label>
                <textarea
                  id="modal-description"
                  placeholder="A hearty and nutritious soup..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200 resize-y"
                  rows={4}
                  {...register("description", { required: "Description is required" })}
                ></textarea>
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label htmlFor="modal-image" className=" text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                  <FaImage /> Meal Image
                </label>
                <input
                  id="modal-image"
                  type="file"
                  accept="image/*"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-white hover:file:bg-primary-dark transition-colors duration-200 cursor-pointer"
                  {...register("image", { required: "Meal image is required" })}
                />
                {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>}
                {imagePreview && (
                  <div className="mt-4 flex justify-center">
                    <img src={imagePreview} alt="Meal Preview" className="max-h-48 rounded-lg shadow-md border border-gray-200 object-cover" />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors duration-200
                    ${addUpcomingMealMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={addUpcomingMealMutation.isPending}
                >
                  {addUpcomingMealMutation.isPending ? 'Adding Meal...' : 'Add Meal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpcomingMeals;
