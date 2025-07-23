import { useParams, useNavigate } from 'react-router';
import Swal from 'sweetalert2';

const CheckoutPage = () => {
  const { packageName } = useParams();
  const navigate = useNavigate();

  const price = packageName === 'silver' ? 9.99 : packageName === 'gold' ? 19.99 : 29.99;

  const handleProceedToPay = () => {
    navigate(`/dashboard/payment/membership/${packageName}`);
  };

  return (
    <div className="max-w-xl mx-auto py-10 text-center">
      <h2 className="text-3xl font-bold mb-4 capitalize">{packageName} Package Checkout</h2>
      <p className="mb-6 font-semibold">Amount: ${price}</p>
      <button onClick={handleProceedToPay} className="btn btn-success">
        Proceed to Payment
      </button>
    </div>
  );
};

export default CheckoutPage;
