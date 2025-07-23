import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const MySwal = withReactContent(Swal);

const AddMeal = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);

    const img_hosting_key = import.meta.env.VITE_image_upload_key;
    const img_hosting_url = `https://api.imgbb.com/1/upload?key=${img_hosting_key}`;

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
            if (!imgData.success) throw new Error("Image upload failed");
            const mealImage = imgData.data.display_url;

            // Step 2: Build meal object
            const price = parseInt(data.price);
            const mealData = {
                title: data.title,
                category: data.category,
                ingredients: data.ingredients,
                description: data.description,
                price,
                image: mealImage,
                addedBy: user?.email,
                distributorName: user?.displayName,
                
                postTime: new Date().toISOString(),
            };

            // Step 3: Save meal to database
            const res = await axiosSecure.post("/meals", mealData);
            if (res.data.insertedId) {
                MySwal.fire("Success!", "Meal added successfully", "success");
                reset();
            }

        } catch (error) {
            MySwal.fire("Error", error.message || "Something went wrong", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-base-200 p-6 rounded-xl shadow-md mt-6">
            <h2 className="text-2xl font-bold mb-4 text-center">Add a New Meal</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Title */}
                <div>
                    <label className="label">Meal Title</label>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        {...register("title", { required: true })}
                    />
                    {errors.title && <p className="text-red-500 text-sm">Meal title is required</p>}
                </div>

                {/* Category */}
                <div>
                    <label className="label">Category</label>
                    <select
                        {...register("category", { required: true })}
                        className="select select-bordered w-full"
                    >
                        <option value="">Select Category</option>
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                    </select>
                    {errors.category && <p className="text-red-500 text-sm">Category is required</p>}
                </div>

                {/* Price */}
                <div>
                    <label className="label">Price</label>
                    <input
                        type="number"
                        className="input input-bordered w-full"
                        step="0.01"
                        {...register("price", { required: true })}
                    />
                    {errors.price && <p className="text-red-500 text-sm">Price is required</p>}
                </div>

                {/* Ingredients */}
                <div>
                    <label className="label">Ingredients</label>
                    <textarea
                        className="textarea textarea-bordered w-full"
                        {...register("ingredients", { required: true })}
                    ></textarea>
                    {errors.ingredients && <p className="text-red-500 text-sm">Ingredients are required</p>}
                </div>

                {/* Description */}
                <div>
                    <label className="label">Description</label>
                    <textarea
                        className="textarea textarea-bordered w-full"
                        {...register("description", { required: true })}
                    ></textarea>
                    {errors.description && <p className="text-red-500 text-sm">Description is required</p>}
                </div>

                {/* Image Upload */}
                <div>
                    <label className="label">Meal Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        className="file-input file-input-bordered w-full"
                        {...register("image", { required: true })}
                    />
                    {errors.image && <p className="text-red-500 text-sm">Image is required</p>}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className={`btn w-full ${loading ? 'btn-disabled' : 'btn-primary'}`}
                    disabled={loading}
                >
                    {loading ? 'Adding Meal...' : 'Add Meal'}
                </button>
            </form>
        </div>
    );
};

export default AddMeal;
