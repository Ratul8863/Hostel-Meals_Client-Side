import React from 'react';
import { useNavigate } from 'react-router'; // Changed to react-router-dom for consistency
import { FaCheckCircle } from 'react-icons/fa'; // Importing a checkmark icon for features
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../../hooks/useAuth';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const MembershipSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
const axiosSecure = useAxiosSecure();

  // Define package details with example features
  const packages = [
    {
      name: 'Silver',
      price: 9.99,
      features: [
        'Access to basic meal plans',
        '5 meal requests per month',
        'Standard support',
        'Basic review features'
      ],
      description: 'Perfect for casual users looking for convenience.'
    },
    {
      name: 'Gold',
      price: 19.99,
      features: [
        'Access to all meal plans',
        '15 meal requests per month',
        'Priority support',
        'Advanced review features',
        'Early access to upcoming meals'
      ],
      description: 'Ideal for regular users who want more options.'
    },
    {
      name: 'Platinum',
      price: 29.99,
      features: [
        'Unlimited meal requests',
        'Exclusive premium meal plans',
        '24/7 dedicated support',
        'Full review capabilities',
        'VIP access to events & new features',
        'Personalized meal recommendations'
      ],
      description: 'The ultimate experience for dedicated foodies.'
    },
  ];

const {
    data: userInfo = {},
    isLoading: userInfoLoading,
    isError: userInfoError,
  } = useQuery({
    queryKey: ['user', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${user.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

const handleChoose = (packageName) => {
    if (packageName.toLowerCase() === userInfo?.membership ) {
      Swal.fire({
        icon: 'info',
        title: 'Already Purchased',
        text: `You already have the ${packageName} package.`,
        confirmButtonColor: '#3085d6',
      })
      
    } else {
       window.scrollTo(0, 0);
      navigate(`/checkout/${packageName.toLowerCase()}`);
    }
  };
  
// console.log(packages)
  return (
    <div className="py-16 max-w-7xl mx-auto px-4"> {/* Increased padding and max-width for more breathing room */}
      <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-gray-800"> {/* Larger, bolder heading */}
        Unlock Premium Meal Experiences
      </h2>
      <p className="text-center text-lg md:text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
        Choose the perfect plan to enhance your hostel meal journey. Each package offers unique benefits designed to make your life easier and more delicious.
      </p>

      <div data-aos="zoom-in-up" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> {/* Responsive grid */}
        {packages.map(pkg => (
          <div
            key={pkg.name}
            className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl border border-gray-100 flex flex-col" // Polished card style
          >
            <div className="p-8 flex flex-col items-center text-center"> {/* Increased padding inside card body */}
              <h3 className="text-3xl font-bold capitalize text-gray-800 mb-2">{pkg.name} Package</h3> {/* Larger, bolder title */}
              <p className="text-gray-600 mb-6">{pkg.description}</p>
              <p className="text-5xl font-extrabold text-primary-dark mb-6"> {/* Prominent price */}
                ${pkg.price.toFixed(2)}
                <span className="text-lg font-medium text-gray-500">/month</span>
              </p>
              <ul className="text-left w-full space-y-3 mb-8"> {/* Feature list */}
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-gray-700">
                    <FaCheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" /> {/* Checkmark icon */}
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleChoose(pkg.name)}
                className="mt-auto inline-block w-full px-8 py-4 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors duration-200 text-lg"
              >
                Choose {pkg.name}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembershipSection;
