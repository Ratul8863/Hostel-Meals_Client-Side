// CustomerTestimonials.jsx
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';


const CustomerTestimonials = () => {

const axiosSecure = useAxiosSecure();

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews'],
    queryFn: async () => {
      const res = await axiosSecure.get('/customer-testimonials');
      return res.data;
    },
  });

  return (
    <div className="my-12 px-4 lg:px-20">
      <h2 className="text-3xl font-bold text-center mb-6 text-lime-400">What Our Customers Say</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.slice(0, 6).map((review) => (
          <div
            key={review._id}
            className="bg-[#1c1f3b] rounded-2xl shadow-lg p-6 hover:shadow-lime-400/30 transition duration-300 border border-white/10"
          >
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white">{review.userName}</h3>
              <p className="text-gray-400 text-sm">{review.userEmail}</p>
            </div>
            <p className="text-gray-300 italic">"{review.review}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomerTestimonials;
