import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const MealDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [reviewText, setReviewText] = useState('');
  const [liked, setLiked] = useState(false); // initial like status


  const { data: meal = {}, isLoading, isError } = useQuery({
    queryKey: ['meal', id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/meal/${id}`);
      return res.data;
    },
    enabled: !!id
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/reviews/${id}`);
      return res.data;
    },
    enabled: !!id
  });

  const { data: userInfo = {} } = useQuery({
    queryKey: ['user', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${user.email}`);
      return res.data;
    },
    enabled: !!user?.email
  });

  console.log(userInfo)
  // Like/Unlike mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        return Swal.fire('Login Required', 'Please log in to like/unlike meals.', 'warning');
      }
      return await axiosSecure.patch(`/meal/${id}/toggle-like`, { email: user.email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['meal', id]);
    }
  });


useEffect(() => {
  if (meal && meal.likedBy?.includes(user?.email)) {
    setLiked(true);
  } else {
    setLiked(false);
  }
}, [meal, user]);



  // Handle meal request with membership check
  const handleRequest = async () => {
    if (!user) {
      return Swal.fire('Login Required', 'Please log in to request meals.', 'warning');
    }

    const allowedMemberships = ['silver', 'gold', 'platinum'];
    const membership = userInfo.membership || 'bronze';

    if (!allowedMemberships.includes(membership.toLowerCase())) {
      Swal.fire({
        icon: 'warning',
        title: 'Subscription Required',
        text: 'You need a valid subscription to request meals.',
        confirmButtonText: 'View Membership Plans'
      }).then(result => {
        if (result.isConfirmed) {
          navigate('/membership');
        }
      });
      return;
    }

    try {
      await axiosSecure.post('/meal-request', {
        mealId: id,
        mealTitle: meal.title,
        userEmail: user.email,
        userName: user.displayName,
        status: 'pending'
      });

      Swal.fire('Requested!', 'Meal request submitted successfully.', 'success');
    } catch (err) {
      Swal.fire('Error', 'Failed to submit meal request.', 'error');
    }
  };

  // Submit review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      return Swal.fire('Login Required', 'Please log in to submit a review.', 'warning');
    }
    if (!reviewText.trim()) return;

    try {
      await axiosSecure.post('/reviews', {
        mealId: id,
        userName: user.displayName,
        userEmail: user.email,
        review: reviewText
      });

      setReviewText('');
      Swal.fire('Thank you!', 'Your review has been submitted.', 'success');
      queryClient.invalidateQueries(['reviews', id]);
    } catch {
      Swal.fire('Error', 'Failed to submit review.', 'error');
    }
  };

  if (isLoading) return <p className="text-center py-10">Loading...</p>;
  if (isError) return <p className="text-center py-10 text-red-500">Error loading meal details.</p>;

  const hasLiked = meal.likedBy?.includes(user?.email);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <img src={meal.image} alt={meal.title} className="w-full h-64 object-cover rounded-lg mb-4" />
      <h2 className="text-3xl font-bold">{meal.title}</h2>
      <p><strong>Distributor:</strong> {meal.distributorName}</p>
      <p><strong>Description:</strong> {meal.description}</p>
      <p><strong>Ingredients:</strong> {meal.ingredients}</p>
      <p><strong>Posted On:</strong> {meal.postTime ? new Date(meal.postTime).toLocaleString() : 'Unknown'}</p>
      <p><strong>Likes:</strong> {meal.likes || 0}</p>
      <p><strong>Rating:</strong> {meal.rating || 'N/A'}</p>

      <div className="flex gap-4 my-4">
        <button
          className={`btn ${hasLiked ? 'btn-outline' : 'btn-primary'}`}
          onClick={() => toggleLikeMutation.mutate()}
        >
          {hasLiked ? '👎 Unlike' : '👍 Like'}
        </button>

        <button
          className="btn btn-success"
          onClick={handleRequest}
        >
          🍽️ Request Meal
        </button>
      </div>

      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-2">Reviews ({reviews.length})</h3>

        <form onSubmit={handleReviewSubmit} className="mb-4">
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write your review..."
            className="textarea textarea-bordered w-full"
            rows={3}
          ></textarea>
          <button type="submit" className="btn btn-primary mt-2">
            Submit Review
          </button>
        </form>

        {reviews.map((review, index) => (
          <div key={index} className="border border-amber-100 rounded p-3 mb-2">
            <p className="font-semibold">{review.userName}</p>
            <p>{review.review}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealDetail;
