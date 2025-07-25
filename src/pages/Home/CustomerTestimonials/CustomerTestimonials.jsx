import React from 'react'; // React is implicitly used by JSX, good to keep
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { FaQuoteLeft } from 'react-icons/fa'; // Importing a quote icon for testimonials

const CustomerTestimonials = () => {
  const axiosSecure = useAxiosSecure();

  const { data: reviews = [], isLoading, isError } = useQuery({ // Added isLoading and isError for better feedback
    queryKey: ['reviews'],
    queryFn: async () => {
      const res = await axiosSecure.get('/customer-testimonials');
      return res.data;
    },
  });
console.log(reviews)
  return (
    <div className="py-16 max-w-7xl mx-auto px-4"> {/* Consistent padding and max-width with other sections */}
      <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-gray-800"> {/* Consistent heading style */}
        What Our Happy Customers Say
      </h2>
      <p className="text-center text-lg md:text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
        Hear directly from our community about how Hostel Meals has transformed their dining experience.
      </p>

      {isLoading ? (
        <p className="text-center text-gray-600 text-xl">Loading testimonials...</p>
      ) : isError ? (
        <p className="text-center text-red-600 text-xl">Failed to load testimonials. Please try again later.</p>
      ) : reviews.length === 0 ? (
        <p className="text-center text-gray-600 text-xl">No testimonials available yet. Be the first to share your experience!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> {/* Responsive grid, similar to product cards */}
          {reviews.slice(0, 6).map((review) => ( // Limiting to 6 as per original code, consider a carousel for more
            <div
              key={review._id}
              className="bg-white rounded-xl shadow-lg p-8 transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl border border-gray-100 flex flex-col" // Polished card style
            >
              <FaQuoteLeft className="text-primary-light text-4xl mb-6 opacity-70" /> {/* Prominent quote icon */}
              <p className="text-gray-700 italic text-lg mb-6 flex-grow">"{review.review}"</p> {/* Larger, more readable quote */}

              <div className="flex items-center mt-auto"> {/* Aligned to bottom */}
                <img
                  src={review.userPhoto || `https://placehold.co/60x60/F0F0F0/888888?text=${review.userName ? review.userName.charAt(0) : 'U'}`} // Placeholder or initial if no photo
                  alt={review.userName || 'User'}
                  className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-gray-200" // Circular image, subtle border
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{review.userName || 'Anonymous User'}</h3> {/* Clear user name */}
                  {review.userEmail && <p className="text-gray-500 text-sm">{review.userEmail}</p>} {/* Subtle email */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerTestimonials;
