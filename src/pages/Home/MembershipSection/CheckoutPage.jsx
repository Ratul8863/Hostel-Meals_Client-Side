import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaDollarSign, FaCreditCard } from 'react-icons/fa';

const CheckoutPage = () => {
  const { packageName } = useParams();
  const navigate = useNavigate();

  // Determine price and display name
  let price = 0;
  let packageDisplayName = '';
  switch (packageName) {
    case 'silver':
      price = 9;
      packageDisplayName = 'Silver';
      break;
    case 'gold':
      price = 19;
      packageDisplayName = 'Gold';
      break;
    case 'platinum':
      price = 29;
      packageDisplayName = 'Platinum';
      break;
    default:
      price = 0;
      packageDisplayName = 'Unknown';
      break;
  }

  // Handle invalid package
  useEffect(() => {
    if (packageDisplayName === 'Unknown') {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Package',
        text: 'The membership package you selected does not exist.',
        confirmButtonColor: '#3085d6',
      }).then(() => {
        window.scrollTo(0, 0);
        navigate('/membership');
      });
    }
  }, [packageDisplayName, navigate]);

  const handleProceedToPay = () => {
    window.scrollTo(0, 0);
    navigate(`/dashboard/payment/membership/${packageName}`);
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4">
      <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-gray-800 dark:text-gray-100">
        Checkout for <span className="capitalize text-primary-dark dark:text-primary-light">{packageDisplayName}</span> Package
      </h2>

      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700 text-center">
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 flex items-center justify-center gap-3">
          <FaDollarSign className="text-green-600 text-2xl" />
          <span className="font-bold text-gray-800 dark:text-gray-100">Amount: ${price}</span>
        </p>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          You are about to subscribe to the {packageDisplayName} membership. Click below to proceed with the payment.
        </p>
        <button
          onClick={handleProceedToPay}
          className="inline-flex items-center justify-center px-8 py-3 bg-primary-dark dark:bg-primary-light border-2 font-semibold rounded-lg hover:bg-primary-light dark:hover:bg-primary-dark transition-colors duration-200 text-lg shadow-md"
        >
          <FaCreditCard className="mr-3" /> Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
