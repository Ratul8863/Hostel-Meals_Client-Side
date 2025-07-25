import React, { useEffect, useRef, useState } from 'react'; // Added useRef for potential future use, though not directly used in this version
import { useParams, useNavigate } from 'react-router-dom'; // Changed to react-router-dom for consistency
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2'; // Keeping Swal for now as it's a custom alert, not a browser alert
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { FaHeart, FaRegHeart, FaStar, FaUserCircle } from 'react-icons/fa'; // Icons for like, rating, and user placeholder

const MealDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [reviewText, setReviewText] = useState('');
  const [liked, setLiked] = useState(false); // Initial like status

  // Fetch meal details
  const { data: meal = {}, isLoading, isError } = useQuery({
    queryKey: ['meal', id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/meal/${id}`);
      return res.data;
    },
    enabled: !!id, // Only run query if ID is available
  });

  // Fetch reviews for the meal
  const { data: reviews = [], isLoading: reviewsLoading, isError: reviewsError } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/reviews/${id}`);
      return res.data;
    },
    enabled: !!id, // Only run query if ID is available
  });

  // Fetch user info to check membership status
  const { data: userInfo = {}, isLoading: userInfoLoading, isError: userInfoError } = useQuery({
    queryKey: ['user', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${user.email}`);
      return res.data;
    },
    enabled: !!user?.email, // Only run query if user email is available
  });

  // Update liked status when meal data or user changes
  useEffect(() => {
    if (meal && meal.likedBy?.includes(user?.email)) {
      setLiked(true);
    } else {
      setLiked(false);
    }
  }, [meal, user]);

  // Like/Unlike mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        Swal.fire({
          icon: 'warning',
          title: 'Login Required',
          text: 'Please log in to like/unlike meals.',
          confirmButtonText: 'Login',
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/login');
          }
        });
        return; // Prevent further execution if not logged in
      }
      return await axiosSecure.patch(`/meal/${id}/toggle-like`, { email: user.email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['meal', id]); // Invalidate meal query to refetch updated likes
      setLiked(prev => !prev); // Optimistically update UI
    },
    onError: (error) => {
      console.error("Error toggling like:", error);
      Swal.fire('Error', 'Failed to update like status.', 'error');
    }
  });

  // Handle meal request with membership check
  const handleRequest = async () => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please log in to request meals.',
        confirmButtonText: 'Login',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }

    const allowedMemberships = ['silver', 'gold', 'platinum'];
    const membership = userInfo.membership?.toLowerCase() || 'bronze'; // Ensure lowercase for comparison

    if (!allowedMemberships.includes(membership)) {
      Swal.fire({
        icon: 'warning',
        title: 'Subscription Required',
        text: 'You need a valid subscription (Silver, Gold, or Platinum) to request meals.',
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

      Swal.fire('Requested!', 'Meal request submitted successfully. Check your dashboard for status.', 'success');
    } catch (err) {
      console.error("Error submitting meal request:", err);
      Swal.fire('Error', 'Failed to submit meal request. Please try again.', 'error');
    }
  };

  // Submit review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please log in to submit a review.',
        confirmButtonText: 'Login',
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }
    if (!reviewText.trim()) {
      Swal.fire('Empty Review', 'Please write something before submitting.', 'warning');
      return;
    }

    try {
      await axiosSecure.post('/reviews', {
        mealId: id,
        mealTitle: meal.title,
        userName: user.displayName,
        userEmail: user.email,
        // likes: meal.likes, // Likes for the meal, not the review itself here
        review: reviewText,
        postTime: new Date().toISOString() // Add post time for the review
      });

      setReviewText('');
      Swal.fire('Thank you!', 'Your review has been submitted.', 'success');
      queryClient.invalidateQueries(['reviews', id]); // Invalidate reviews query to refetch
      queryClient.invalidateQueries(['meal', id]); // Also invalidate meal to update review count if applicable
    } catch (err) {
      console.error("Error submitting review:", err);
      Swal.fire('Error', 'Failed to submit review. Please try again.', 'error');
    }
  };

  // Loading and Error States
  if (isLoading || userInfoLoading) return <p className="text-center py-10 text-gray-600 text-xl">Loading meal details...</p>;
  if (isError || userInfoError) return <p className="text-center py-10 text-red-600 text-xl">Error loading meal details. Please try again later.</p>;

  // Destructure meal properties for easier use
  const {
    image,
    title,
    distributorName,
    description,
    ingredients,
    postTime,
    likes = 0, // Default to 0 if undefined
    rating = 'N/A', // Default to 'N/A' if undefined
  } = meal;

  // Format ingredients for display
  const formattedIngredients = Array.isArray(ingredients) ? ingredients.join(', ') : ingredients;

  return (
    <div className="py-16 max-w-6xl mx-auto px-4"> {/* Consistent padding and max-width */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-8 md:p-10"> {/* Main card container */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Meal Image */}
          <div className="md:w-1/2 flex justify-center items-center">
            <img
              src={image || 'https://placehold.co/800x600?text=Meal+Image'} // Placeholder for missing image
              alt={title}
              className="w-full h-72 md:h-96 object-cover rounded-lg shadow-md" // Larger, rounded image
            />
          </div>

          {/* Meal Details */}
          <div className="md:w-1/2 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4 leading-tight">{title}</h1>
            <p className="text-lg text-gray-700 mb-2">
              <strong className="font-semibold text-gray-800">Distributor:</strong> {distributorName || 'N/A'}
            </p>
            <p className="text-lg text-gray-700 mb-2">
              <strong className="font-semibold text-gray-800">Description:</strong> {description || 'No description provided.'}
            </p>
            <p className="text-lg text-gray-700 mb-2">
              <strong className="font-semibold text-gray-800">Ingredients:</strong> {formattedIngredients || 'Not specified.'}
            </p>
            <p className="text-lg text-gray-700 mb-2">
              <strong className="font-semibold text-gray-800">Posted On:</strong> {postTime ? new Date(postTime).toLocaleString() : 'Unknown'}
            </p>

            {/* Likes and Rating */}
            <div className="flex items-center gap-6 mt-4 mb-6">
              <div className="flex items-center text-gray-700 text-lg">
                <FaHeart className="text-red-500 mr-2" />
                <span className="font-semibold">{likes} Likes</span>
              </div>
              <div className="flex items-center text-yellow-500 text-lg">
                <FaStar className="mr-2" />
                <span className="font-semibold text-gray-700">{typeof rating === 'number' ? rating.toFixed(1) : rating} Rating</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button
                onClick={() => toggleLikeMutation.mutate()}
                className={`
                  inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200
                  ${liked
                    ? 'bg-red-500 text-white hover:bg-red-600' // Liked state
                    : 'bg-gray-800 text-white hover:bg-gray-900' // Not liked state
                  }
                `}
                disabled={toggleLikeMutation.isPending} // Disable button while mutation is running
              >
                {toggleLikeMutation.isPending ? 'Updating...' : (liked ? <><FaHeart className="mr-2" /> Unlike</> : <><FaRegHeart className="mr-2" /> Like</>)}
              </button>

              <button
                onClick={handleRequest}
                className="inline-flex items-center justify-center px-8 py-3 bg-gray-800  hover:bg-gray-900 text-white font-semibold rounded-lg hover:bg-primary-light transition-colors duration-200 text-lg" // Consistent button style
              >
                🍽️ Request Meal
              </button>
            </div>
          </div>
        </div>

        {/* Review Section */}
        <div className="mt-16 pt-8 border-t border-gray-100"> {/* Separator for reviews */}
          <h3 className="text-3xl font-bold text-gray-800 mb-8">Reviews ({reviews.length})</h3>

          {/* Review Submission Form */}
          <form onSubmit={handleReviewSubmit} className="mb-12 bg-gray-50 p-6 rounded-lg border border-gray-100">
            <h4 className="text-xl font-semibold text-gray-700 mb-4">Share Your Thoughts</h4>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write your review here..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200 resize-y" // Polished textarea
              rows={4}
            ></textarea>
            <button
              type="submit"
              className="inline-block px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors duration-200 text-base mt-4" // Consistent button style
              disabled={!user || handleReviewSubmit.isPending} // Disable if not logged in or submitting
            >
              Submit Review
            </button>
            {!user && <p className="text-sm text-red-500 mt-2">Please log in to submit a review.</p>}
          </form>

          {/* Display Existing Reviews */}
          {reviewsLoading ? (
            <p className="text-center text-gray-600">Loading reviews...</p>
          ) : reviewsError ? (
            <p className="text-center text-red-600">Failed to load reviews.</p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-gray-600 text-lg">No reviews yet. Be the first to share your experience!</p>
          ) : (
            <div className="space-y-6"> {/* Spacing between reviews */}
              {reviews.map((review) => (
                <div key={review._id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"> {/* Review card style */}
                  <div className="flex items-center mb-4">
                    <img
                      src={review.userPhoto || `https://placehold.co/48x48/F0F0F0/888888?text=${review.userName ? review.userName.charAt(0) : 'U'}`} // User photo or initial placeholder
                      alt={review.userName || 'User'}
                      className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-gray-200"
                    />
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">{review.userName || 'Anonymous User'}</p>
                      {review.postTime && (
                        <p className="text-sm text-gray-500">
                          {new Date(review.postTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 italic text-base">"{review.review}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MealDetail;
