import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';
import { Helmet } from 'react-helmet-async';

const MySwal = withReactContent(Swal);

const MealDetail = ({ theme }) => {
  const { id } = useParams();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [reviewText, setReviewText] = useState('');
  const [liked, setLiked] = useState(false);

  // Fetch meal details
  const { data: meal = {}, isLoading, isError } = useQuery({
    queryKey: ['meal', id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/meal/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Fetch reviews
  const { data: reviews = [], isLoading: reviewsLoading, isError: reviewsError } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/reviews/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  // Fetch user info
  const { data: userInfo = {}, isLoading: userInfoLoading, isError: userInfoError } = useQuery({
    queryKey: ['user', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${user.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  // Update liked status
  useEffect(() => {
    setLiked(meal?.likedBy?.includes(user?.email));
  }, [meal, user]);

  // Like/Unlike mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not logged in');
      return axiosSecure.patch(`/meal/${id}/toggle-like`, { email: user.email });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['meal', id]);
      setLiked(prev => !prev);
    },
    onError: (error) => {
      if (error.message === 'Not logged in') {
        MySwal.fire({
          icon: 'warning',
          title: 'Login Required',
          text: 'Please log in to like/unlike meals.',
          confirmButtonText: 'Login',
          customClass: { confirmButton: 'px-6 py-2 rounded-lg hover:bg-primary-light transition-colors duration-200' },
        }).then((result) => {
          if (result.isConfirmed) {
            window.scrollTo(0, 0);
            navigate('/login');
          }
        });
      } else {
        MySwal.fire('Error', 'Failed to update like status.', 'error');
      }
    }
  });

  // Handle meal request
  const handleRequest = async () => {
    if (!user) {
      MySwal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please log in to request meals.',
        confirmButtonText: 'Login',
        customClass: { confirmButton: 'bg-primary-dark text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors duration-200' },
      }).then(result => {
        if (result.isConfirmed) { window.scrollTo(0,0); navigate('/login'); }
      });
      return;
    }

    const allowedMemberships = ['silver', 'gold', 'platinum'];
    const membership = userInfo.membership?.toLowerCase() || 'bronze';
    if (!allowedMemberships.includes(membership)) {
      MySwal.fire({
        icon: 'warning',
        title: 'Subscription Required',
        text: 'You need Silver, Gold, or Platinum membership to request meals.',
        confirmButtonText: 'View Membership Plans',
        customClass: { confirmButton: 'bg-primary-dark text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors duration-200' },
      }).then(result => {
        if (result.isConfirmed) { window.scrollTo(0,0); navigate('/membership'); }
      });
      return;
    }

    try {
      await axiosSecure.post('/meal-request', {
        mealId: id,
        mealTitle: meal.title,
        userEmail: user.email,
        userName: user.displayName,
        status: 'pending',
        requestTime: new Date()
      });
      MySwal.fire('Requested!', 'Meal request submitted successfully.', 'success');
    } catch {
      MySwal.fire('Error', 'Failed to submit meal request.', 'error');
    }
  };

  // Submit review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      MySwal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please log in to submit a review.',
        confirmButtonText: 'Login',
        customClass: { confirmButton: 'bg-primary-dark text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors duration-200' },
      }).then(result => {
        if (result.isConfirmed) { window.scrollTo(0,0); navigate('/login'); }
      });
      return;
    }

    if (!reviewText.trim()) {
      MySwal.fire('Empty Review', 'Please write something before submitting.', 'warning');
      return;
    }

    try {
      await axiosSecure.post('/reviews', {
        mealId: id,
        mealTitle: meal.title,
        userName: user.displayName,
        userEmail: user.email,
        photoURL: user.photoURL,
        review: reviewText,
        postTime: new Date().toISOString()
      });
      setReviewText('');
      MySwal.fire('Thank you!', 'Your review has been submitted.', 'success');
      queryClient.invalidateQueries(['reviews', id]);
      queryClient.invalidateQueries(['meal', id]);
    } catch {
      MySwal.fire('Error', 'Failed to submit review.', 'error');
    }
  };

  if (isLoading || userInfoLoading) return <p className="text-center py-10 text-gray-600 dark:text-gray-300 text-xl">Loading meal details...</p>;
  if (isError || userInfoError) return <p className="text-center py-10 text-red-600 dark:text-red-400 text-xl">Error loading meal details.</p>;

  const {
    image,
    title,
    distributorName,
    description,
    ingredients,
    price,
    postTime,
    likes = 0,
    rating,
  } = meal;

  const formattedIngredients = Array.isArray(ingredients) ? ingredients.join(', ') : ingredients;

  return (
    <div className={`${theme==='dark'?'dark':''} py-16 max-w-6xl mx-auto px-4`}>
      <Helmet>
        <title>Hostel Meals | Meal Details</title>
      </Helmet>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 p-8 md:p-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Meal Image */}
          <div className="md:w-1/2 flex justify-center items-center">
            <img
              src={image || 'https://placehold.co/800x600/F0F0F0/888888?text=Meal+Image'}
              alt={title}
              className="w-full h-72 md:h-96 object-cover rounded-lg shadow-md"
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x600/F0F0F0/888888?text=Image+Error'; }}
            />
          </div>

          {/* Meal Details */}
          <div className="md:w-1/2 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-gray-100 mb-4 leading-tight">{title}</h1>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
              <strong className="font-semibold text-gray-800 dark:text-gray-100">Distributor:</strong> {distributorName || 'N/A'}
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
              <strong className="font-semibold text-gray-800 dark:text-gray-100">Description:</strong> {description || 'No description provided.'}
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
              <strong className="font-semibold text-gray-800 dark:text-gray-100">Ingredients:</strong> {formattedIngredients || 'Not specified.'}
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
              <strong className="font-semibold text-gray-800 dark:text-gray-100">Posted On:</strong> {postTime ? new Date(postTime).toLocaleString() : 'Unknown'}
            </p>

            {/* Likes and Rating */}
            <div className="flex items-center gap-6 mt-4 mb-6">
              <div className="flex items-center text-gray-700 dark:text-gray-300 text-lg">
                <FaHeart className="text-red-500 mr-2" />
                <span className="font-semibold">{likes} Likes</span>
              </div>
              <div className="flex items-center text-yellow-500 text-lg">
                <FaStar className="mr-2" />
                <span className="font-semibold text-gray-700 dark:text-gray-100">{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
              </div>
              <div>
                <p className="text-xl font-bold text-primary-dark dark:text-primary-light">${meal.price.toFixed(2)}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <button
                onClick={() => toggleLikeMutation.mutate()}
                className={`inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200
                  ${liked ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-800 text-white hover:bg-gray-900'}
                `}
                disabled={toggleLikeMutation.isPending}
              >
                {toggleLikeMutation.isPending ? 'Updating...' : (liked ? <><FaHeart className="mr-2" /> Unlike</> : <><FaRegHeart className="mr-2" /> Like</>)}
              </button>

              <button
                onClick={handleRequest}
                className="inline-flex items-center justify-center px-8 py-3 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg hover:bg-primary-light transition-colors duration-200 text-lg"
              >
                🍽️ Request Meal
              </button>
            </div>
          </div>
        </div>

        {/* Review Section */}
        <div className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-700">
          <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8">Reviews ({reviews.length})</h3>

          {/* Review Form */}
          <form onSubmit={handleReviewSubmit} className="mb-12 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-gray-100 dark:border-gray-600">
            <h4 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Share Your Thoughts</h4>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Write your review here..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark text-gray-800 dark:text-gray-100 transition-colors duration-200 resize-y"
              rows={4}
            ></textarea>
            <button
              type="submit"
              className="inline-block px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors duration-200 text-base mt-4"
              disabled={!user || reviewsLoading}
            >
              Submit Review
            </button>
            {!user && <p className="text-sm text-red-500 mt-2">Please log in to submit a review.</p>}
          </form>

          {/* Reviews List */}
          {reviewsLoading ? (
            <p className="text-center text-gray-600 dark:text-gray-300">Loading reviews...</p>
          ) : reviewsError ? (
            <p className="text-center text-red-600 dark:text-red-400">Failed to load reviews.</p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-300 text-lg">No reviews yet. Be the first to share your experience!</p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white dark:bg-gray-700 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-600">
                  <div className="flex items-center mb-4">
                    <img
                      src={review.photoURL || `https://placehold.co/48x48/F0F0F0/888888?text=${review.userName ? review.userName.charAt(0) : 'U'}`}
                      alt={review.userName || 'User'}
                      className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-gray-200 dark:border-gray-500"
                      onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/48x48/F0F0F0/888888?text=${review.userName ? review.userName.charAt(0) : 'U'}`; }}
                    />
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100 text-lg">{review.userName || 'Anonymous User'}</p>
                      {review.postTime && (
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                          {new Date(review.postTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-200 italic text-base">"{review.review}"</p>
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
