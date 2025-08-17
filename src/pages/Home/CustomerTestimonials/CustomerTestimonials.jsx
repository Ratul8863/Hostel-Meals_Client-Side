import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { FaQuoteLeft } from 'react-icons/fa';
import useAuth from '../../../hooks/useAuth';
import AOS from 'aos'; // AOS import করুন
import 'aos/dist/aos.css'; // AOS CSS import করুন

const CustomerTestimonials = () => {
  const axiosSecure = useAxiosSecure();
  const { user, theme } = useAuth();

  const { data: reviews = [], isLoading, isError } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const res = await axiosSecure.get('/customer-testimonials');
      return res.data;
    },
  });

  const { data: userInfo = {} } = useQuery({
    queryKey: ['user', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${user.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });


  useEffect(() => {
   
    AOS.refresh(); 
  }, [theme]); 

  return (
    <div className={`py-16 max-w-7xl mx-auto px-4 ${theme === 'dark' ? 'bg-[#0D1128] text-white' : 'bg-white text-gray-900'}`}>
      <h2 className={`text-4xl md:text-5xl font-extrabold mb-12 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        What Our Happy Customers Say
      </h2>
      <p className={`text-center text-lg md:text-xl mb-16 max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        Hear directly from our community about how Hostel Meals has transformed their dining experience.
      </p>

      {isLoading ? (
        <p className={`text-center text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading testimonials...</p>
      ) : isError ? (
        <p className="text-center text-red-600 text-xl">Failed to load testimonials. Please try again later.</p>
      ) : reviews.length === 0 ? (
        <p className={`text-center text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>No testimonials available yet. Be the first to share your experience!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.slice(0, 6).map((review) => (
            <div
              key={review._id}
              data-aos="flip-right"
              className={`rounded-xl shadow-lg p-8 transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl border flex flex-col
                ${theme === 'dark' ? 'bg-[#1c1f3b] border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'}
              `}
            >
              <FaQuoteLeft className={`text-4xl mb-6 opacity-70 ${theme === 'dark' ? 'text-yellow-400' : 'text-primary-light'}`} />
              <p className={`italic text-lg mb-6 flex-grow ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>"{review.review}"</p>

              <div className="flex items-center mt-auto">
                <img
                  src={review.photoURL || `https://placehold.co/60x60/F0F0F0/888888?text=${review.userName ? review.userName.charAt(0) : 'U'}`}
                  alt={review.userName || 'User'}
                  className={`w-14 h-14 rounded-full object-cover mr-4 border-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}
                />
                <div>
                  <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>{review.userName || 'Anonymous User'}</h3>
                  {review.userEmail && <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{review.userEmail}</p>}
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
