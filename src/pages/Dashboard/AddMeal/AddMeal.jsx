import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { FaUtensils, FaDollarSign, FaListAlt, FaPencilAlt, FaImage, FaUser, FaEnvelope } from 'react-icons/fa'; // Icons for form fields

const MySwal = withReactContent(Swal);

const AddMeal = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null); // State for image preview

    // Environment variable for image hosting key (ensure it's correctly configured)
    const img_hosting_key = import.meta.env.VITE_image_upload_key;
    const img_hosting_url = `https://api.imgbb.com/1/upload?key=${img_hosting_key}`;

    // Watch image field to show preview
    const imageFile = watch("image");
    React.useEffect(() => {
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
            // Step 1: Upload image to ImgBB
            const formData = new FormData();
            formData.append('image', data.image[0]);
            
            const imgRes = await fetch(img_hosting_url, {
                method: 'POST',
                body: formData
            });
            const imgData = await imgRes.json();

            if (!imgData.success) {
                throw new Error(imgData.error?.message || "Image upload failed. Please try again.");
            }
            const mealImage = imgData.data.display_url;

            // Step 2: Build meal object
            const price = parseFloat(data.price); // Use parseFloat for price
            if (isNaN(price)) {
                throw new Error("Invalid price value.");
            }

            const mealData = {
                title: data.title,
                category: data.category,
                ingredients: data.ingredients,
                description: data.description,
                price: price,
                image: mealImage,
                distributorName: user?.displayName, // Readonly from user
                distributorEmail: user?.email,     // Readonly from user
                rating: 0, // Initial rating
                likes: 0,  // Initial likes
                reviews_count: 0, // Initial reviews count
                postTime: new Date().toISOString(), // Current time for posting
            };

            // Step 3: Save meal to database
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
                reset(); // Reset form fields
                setImagePreview(null); // Clear image preview
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
        <div className="py-2 max-w-4xl mx-auto px-4"> {/* Consistent padding and max-width */}
            <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-gray-800">
                Add a New Meal
            </h2>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100"> {/* Polished card container for the form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6"> {/* Increased space-y for better spacing */}
                    {/* Meal Title */}
                    <div>
                        <label htmlFor="title" className=" text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                            <FaUtensils /> Meal Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            placeholder="e.g., Chicken Biryani"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200"
                            {...register("title", { required: "Meal title is required" })}
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                    </div>

                    {/* Category */}
                    <div>
                        <label htmlFor="category" className=" text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                            <FaListAlt /> Category
                        </label>
                        <select
                            id="category"
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

                    {/* Price */}
                    <div>
                        <label htmlFor="price" className=" text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                            <FaDollarSign /> Price ($)
                        </label>
                        <input
                            id="price"
                            type="number"
                            placeholder="e.g., 12.99"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200"
                            step="0.01"
                            {...register("price", {
                                required: "Price is required",
                                min: { value: 0, message: "Price cannot be negative" },
                                pattern: { value: /^\d+(\.\d{1,2})?$/, message: "Invalid price format" } // Allows up to 2 decimal places
                            })}
                        />
                        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                    </div>

                    {/* Ingredients */}
                    <div>
                        <label htmlFor="ingredients" className=" text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                            <FaPencilAlt /> Ingredients (comma-separated)
                        </label>
                        <textarea
                            id="ingredients"
                            placeholder="e.g., Chicken, Rice, Spices, Onions"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200 resize-y"
                            rows={3}
                            {...register("ingredients", { required: "Ingredients are required" })}
                        ></textarea>
                        {errors.ingredients && <p className="text-red-500 text-sm mt-1">{errors.ingredients.message}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className=" text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                            <FaPencilAlt /> Description
                        </label>
                        <textarea
                            id="description"
                            placeholder="A brief description of the meal..."
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200 resize-y"
                            rows={4}
                            {...register("description", { required: "Description is required" })}
                        ></textarea>
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label htmlFor="image" className=" text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                            <FaImage /> Meal Image
                        </label>
                        <input
                            id="image"
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

                    {/* Distributor Name (Readonly) */}
                    <div>
                        <label htmlFor="distributorName" className=" text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                            <FaUser /> Distributor Name
                        </label>
                        <input
                            id="distributorName"
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                            placeholder={user?.displayName || "N/A"}
                            readOnly
                        />
                    </div>

                    {/* Distributor Email (Readonly) */}
                    <div>
                        <label htmlFor="distributorEmail" className=" text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                            <FaEnvelope /> Distributor Email
                        </label>
                        <input
                            id="distributorEmail"
                            type="email"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-100 text-gray-600 cursor-not-allowed"
                            placeholder={user?.email || "N/A"}
                            readOnly
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`w-full px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors duration-200 text-lg
                            ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Adding Meal...' : 'Add Meal'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddMeal;
