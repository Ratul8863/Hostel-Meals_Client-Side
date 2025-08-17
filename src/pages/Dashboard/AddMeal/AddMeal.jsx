import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { FaUtensils, FaDollarSign, FaListAlt, FaPencilAlt, FaImage, FaUser, FaEnvelope } from 'react-icons/fa';

const MySwal = withReactContent(Swal);

const AddMeal = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);

    const img_hosting_key = import.meta.env.VITE_image_upload_key;
    const img_hosting_url = `https://api.imgbb.com/1/upload?key=${img_hosting_key}`;

    // Watch image field to show preview
    const imageFile = watch("image");
    useEffect(() => {
        if (imageFile && imageFile.length > 0) {
            const file = imageFile[0];
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImagePreview(null);
        }
    }, [imageFile]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('image', data.image[0]);

            const imgRes = await fetch(img_hosting_url, { method: 'POST', body: formData });
            const imgData = await imgRes.json();

            if (!imgData.success) throw new Error(imgData.error?.message || "Image upload failed.");
            const mealImage = imgData.data.display_url;

            const price = parseFloat(data.price);
            if (isNaN(price)) throw new Error("Invalid price value.");

            const mealData = {
                title: data.title,
                category: data.category,
                ingredients: data.ingredients,
                description: data.description,
                price,
                image: mealImage,
                distributorName: user?.displayName,
                distributorEmail: user?.email,
                rating: 0,
                likes: 0,
                reviews_count: 0,
                postTime: new Date().toISOString(),
            };

            const res = await axiosSecure.post("/meals", mealData);
            if (res.data.insertedId) {
                MySwal.fire({
                    icon: "success",
                    title: "Meal Added!",
                    text: "Your new meal has been successfully added.",
                    customClass: {
                        confirmButton: 'bg-primary-dark text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors duration-200',
                    },
                    buttonsStyling: false,
                });
                reset();
                setImagePreview(null);
            } else {
                throw new Error(res.data.message || "Failed to add meal to database.");
            }

        } catch (error) {
            MySwal.fire({
                icon: "error",
                title: "Oops...",
                text: error.message || "Something went wrong. Please try again.",
                customClass: {
                    confirmButton: 'bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200',
                },
                buttonsStyling: false,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="py-2 max-w-4xl mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-gray-800 dark:text-gray-100">
                Add a New Meal
            </h2>

            <div className=" rounded-xl shadow-lg p-8 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Meal Title */}
                    <div>
                        <label htmlFor="title" className="text-sm font-semibold mb-2 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                            <FaUtensils /> Meal Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            placeholder="e.g., Chicken Biryani"
                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring focus:ring-primary-light dark:focus:ring-gray-400 transition-colors duration-300"
                            {...register("title", { required: "Meal title is required" })}
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                    </div>

                    {/* Category */}
                    <div>
                        <label htmlFor="category" className="text-sm font-semibold mb-2 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                            <FaListAlt /> Category
                        </label>
                        <select
                            id="category"
                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring focus:ring-primary-light dark:focus:ring-gray-400 transition-colors duration-300"
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

                    {/* Price */}
                    <div>
                        <label htmlFor="price" className="text-sm font-semibold mb-2 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                            <FaDollarSign /> Price ($)
                        </label>
                        <input
                            id="price"
                            type="number"
                            placeholder="e.g., 12.99"
                            step="0.01"
                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring focus:ring-primary-light dark:focus:ring-gray-400 transition-colors duration-300"
                            {...register("price", {
                                required: "Price is required",
                                min: { value: 0, message: "Price cannot be negative" },
                                pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Invalid price format" }
                            })}
                        />
                        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                    </div>

                    {/* Ingredients */}
                    <div>
                        <label htmlFor="ingredients" className="text-sm font-semibold mb-2 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                            <FaPencilAlt /> Ingredients
                        </label>
                        <textarea
                            id="ingredients"
                            placeholder="e.g., Chicken, Rice, Spices, Onions"
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring focus:ring-primary-light dark:focus:ring-gray-400 resize-y transition-colors duration-300"
                            {...register("ingredients", { required: "Ingredients are required" })}
                        ></textarea>
                        {errors.ingredients && <p className="text-red-500 text-sm mt-1">{errors.ingredients.message}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="text-sm font-semibold mb-2 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                            <FaPencilAlt /> Description
                        </label>
                        <textarea
                            id="description"
                            placeholder="A brief description of the meal..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring focus:ring-primary-light dark:focus:ring-gray-400 resize-y transition-colors duration-300"
                            {...register("description", { required: "Description is required" })}
                        ></textarea>
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label htmlFor="image" className="text-sm font-semibold mb-2 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                            <FaImage /> Meal Image
                        </label>
                        <input
                            id="image"
                            type="file"
                            accept="image/*"
                            className="w-full px-4 py-3 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-300 dark:border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-800 dark:file:bg-gray-200 file:text-white dark:file:text-gray-900 hover:file:bg-gray-700 dark:hover:file:bg-gray-300 transition-colors duration-300 cursor-pointer"
                            {...register("image", { required: "Meal image is required" })}
                        />
                        {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>}
                        {imagePreview && (
                            <div className="mt-4 flex justify-center">
                                <img src={imagePreview} alt="Meal Preview" className="max-h-48 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 object-cover" />
                            </div>
                        )}
                    </div>

                    {/* Distributor Name */}
                    <div>
                        <label htmlFor="distributorName" className="text-sm font-semibold mb-2 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                            <FaUser /> Distributor Name
                        </label>
                        <input
                            id="distributorName"
                            type="text"
                            value={user?.displayName || "N/A"}
                            readOnly
                            className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 cursor-not-allowed"
                        />
                    </div>

                    {/* Distributor Email */}
                    <div>
                        <label htmlFor="distributorEmail" className="text-sm font-semibold mb-2 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                            <FaEnvelope /> Distributor Email
                        </label>
                        <input
                            id="distributorEmail"
                            type="email"
                            value={user?.email || "N/A"}
                            readOnly
                            className="w-full px-4 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 cursor-not-allowed"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full px-8 py-3 font-semibold rounded-lg text-lg transition-colors duration-300 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 hover:bg-gray-900 dark:hover:bg-gray-300 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Adding Meal...' : 'Add Meal'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddMeal;