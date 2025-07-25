import React from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Changed to react-router-dom for consistency
import Swal from 'sweetalert2'; // For custom alerts (though not used directly in this version, good to keep)
import { FaDollarSign, FaCreditCard } from 'react-icons/fa'; // Icons for price and payment

const CheckoutPage = () => {
  const { packageName } = useParams();
  const navigate = useNavigate();

  // Determine price based on package name
  let price;
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
      price = 0; // Default or handle invalid package name
      packageDisplayName = 'Unknown';
      // Optionally redirect or show an error for invalid package names
      // Swal.fire('Error', 'Invalid membership package selected.', 'error');
      // navigate('/membership');
      break;
  }

  const handleProceedToPay = () => {
    // Navigate to the payment page with the package name
    navigate(`/dashboard/payment/membership/${packageName}`);
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4"> {/* Consistent padding and max-width */}
      <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-gray-800">
        Checkout for <span className="capitalize text-primary-dark">{packageDisplayName}</span> Package
      </h2>

      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center"> {/* Polished card style */}
        <p className="text-xl text-gray-700 mb-6 flex items-center justify-center gap-3">
          <FaDollarSign className="text-green-600 text-2xl" />
          <span className="font-bold text-gray-800">Amount: ${price}</span>
        </p>
        <p className="text-gray-600 mb-8">
          You are about to subscribe to the {packageDisplayName} membership. Click below to proceed with the payment.
        </p>
        <button
          onClick={handleProceedToPay}
          className="inline-flex items-center justify-center px-8 py-3 bg-primary-dark  border-2 font-semibold rounded-lg hover:bg-primary-light transition-colors duration-200 text-lg shadow-md"
        >
          <FaCreditCard className="mr-3" /> Proceed to Payment
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
