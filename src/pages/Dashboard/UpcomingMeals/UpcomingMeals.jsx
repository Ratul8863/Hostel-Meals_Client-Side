import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useAuth from '../../../hooks/useAuth';

const MySwal = withReactContent(Swal);

const UpcomingMeals = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [publishingId, setPublishingId] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Load upcoming meals
  const { data: upcomingMeals = [], refetch } = useQuery({
    queryKey: ['upcoming-meals'],
    queryFn: async () => {
      const res = await axiosSecure.get('/upcoming-meals?sortBy=likes');
      return res.data;
    }
  });

  // Add a new upcoming meal
  const onSubmit = async (data) => {
    setAdding(true);
    try {
      const img_hosting_key = import.meta.env.VITE_image_upload_key;
      const img_hosting_url = `https://api.imgbb.com/1/upload?key=${img_hosting_key}`;

      // Upload image
      const formData = new FormData();
      formData.append('image', data.image[0]);
      const imgRes = await fetch(img_hosting_url, { method: 'POST', body: formData });
      const imgData = await imgRes.json();
      if (!imgData.success) throw new Error('Image upload failed');
      const imageUrl = imgData.data.display_url;

      const price = parseInt(data.price);

      const meal = {
        title: data.title,
        category: data.category,
        ingredients: data.ingredients,
        description: data.description,
        price,
         likes: 0,
        image: imageUrl,
        addedBy: user?.email,
        distributorName: user?.displayName,
        postTime: new Date().toISOString(),
      };

      const res = await axiosSecure.post('/upcoming-meals', meal);
      if (res.data.insertedId) {
        Swal.fire('Success', 'Meal added to upcoming meals', 'success');
        setIsModalOpen(false);
        reset();
        refetch();
      }
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to add meal', 'error');
    } finally {
      setAdding(false);
    }
  };

  // Publish meal to main collection
 const handlePublish = async (meal) => {
  setPublishingId(meal._id);
  try {
    const res = await axiosSecure.post('/publish-meal', meal);
    if (res.data.insertedId) {
      // ✅ Delete from upcoming-meals after successful publish
      await axiosSecure.delete(`/upcoming-meals/${meal._id}`);
      Swal.fire('Published!', 'Meal published to All Meals', 'success');
      refetch();
    }
  } catch (err) {
    Swal.fire('Error', err.message || 'Failed to publish meal', 'error');
  } finally {
    setPublishingId(null);
  }
};


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">🍽️ Upcoming Meals</h2>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-success">
          ➕ Add Upcoming Meal
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead className="bg-base-200">
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>Title</th>
              <th>Category</th>
              <th>Likes</th>
              <th>Added By</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {upcomingMeals.map((meal, index) => (
              <tr key={meal._id}>
                <td>{index + 1}</td>
                <td><img src={meal.image} className="w-16 h-16 rounded" alt={meal.title} /></td>
                <td>{meal.title}</td>
                <td>{meal.category}</td>
                <td>{meal.likes}</td>
                <td>{meal.addedBy}</td>
                <td>
                  <button
                    onClick={() => handlePublish(meal)}
                    className="btn btn-primary btn-sm"
                    disabled={publishingId === meal._id}
                  >
                    {publishingId === meal._id ? 'Publishing...' : 'Publish'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-xl relative">
            <h3 className="text-xl font-bold mb-4">➕ Add Upcoming Meal</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <input {...register('title', { required: true })} placeholder="Title" className="input input-bordered w-full" />
              <input
                type="number"
                className="input input-bordered w-full"
                placeholder="Price"
                step="1"
                {...register("price", { required: true })}
              />
              <select {...register('category', { required: true })} className="select select-bordered w-full">
                <option value="">Select Category</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
              </select>
              <textarea {...register('description', { required: true })} placeholder="Description" className="textarea textarea-bordered w-full" />
              <textarea {...register('ingredients', { required: true })} placeholder="Ingredients (comma separated)" className="textarea textarea-bordered w-full" />
              <input type="file" {...register('image', { required: true })} className="file-input file-input-bordered w-full" />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-success" disabled={adding}>
                  {adding ? 'Adding...' : 'Add Meal'}
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
