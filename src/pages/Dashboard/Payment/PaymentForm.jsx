import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useParams, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useAuth from '../../../hooks/useAuth';

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const {  packageName } = useParams();
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (packageName) {
      const price = packageName === 'silver' ? 9.99 : packageName === 'gold' ? 19.99 : 29.99;
      setAmount(price);
    }
    // For parcel payment, fetch parcel cost if needed
  }, [packageName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const card = elements.getElement(CardElement);

    if (!card) {
            return;
        }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card,
    });

    if (error) {
      setError(error.message);
      return;
    }

     setError('');
            console.log('payment method', paymentMethod);
    const res = await axiosSecure.post('/create-payment-intent', {
      amountInCents: amount * 100,
      packageName
    });

    const clientSecret = res.data.clientSecret;

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
        billing_details: { name: user.displayName, email: user.email },
      },
    });

    if (result.error) {
      setError(result.error.message);
    } else {
      setError('');
                if (result.paymentIntent.status === 'succeeded') {
                    console.log('Payment succeeded!');
                }
      const transactionId = result.paymentIntent.id;

     const paymentData = {
  email: user.email,
  packageName, 
  amount,
  transactionId,
  paymentMethod: result.paymentIntent.payment_method_types,
};
await axiosSecure.post('/payments', paymentData);


      // if (packageName) {
      //   await axiosSecure.patch(`/users/${user.email}/membership`, { membership: packageName });
      // }

      await Swal.fire({
        icon: 'success',
        title: 'Payment Successful!',
        html: `<strong>Transaction ID:</strong> <code>${transactionId}</code>`,
        timer: 2500,
        showConfirmButton: false,
      });

      navigate(packageName ? '/' : '/dashboard/myParcels');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md    bg-white p-6 rounded shadow">
      <CardElement className="border p-2 mb-4 rounded" />
      <button disabled={!stripe} className="btn btn-primary w-full">
        Pay ${amount}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
};

export default PaymentForm;
