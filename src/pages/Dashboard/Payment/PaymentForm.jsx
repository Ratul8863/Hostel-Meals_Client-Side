import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useAuth from '../../../hooks/useAuth';
import { FaDollarSign, FaCreditCard, FaSpinner } from 'react-icons/fa';
import { useQuery } from '@tanstack/react-query';

const MySwal = withReactContent(Swal);

const PaymentForm = ({ theme }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { packageName } = useParams();
  const axiosSecure = useAxiosSecure();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [processing, setProcessing] = useState(false);

  // Fetch user info
  const { data: userInfo = {}, isLoading: userInfoLoading, isError: userInfoError } = useQuery({
    queryKey: ['user', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${user.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  // Set amount based on package
  useEffect(() => {
    if (packageName) {
      const price = packageName === 'silver' ? 9.99 : packageName === 'gold' ? 19.99 : 29.99;
      setAmount(price);
    }
  }, [packageName]);

  // Create Payment Intent
  useEffect(() => {
    if (amount > 0 && user?.email && !authLoading && userInfo?.membership !== packageName && !userInfoLoading) {
      axiosSecure
        .post('/create-payment-intent', { amountInCents: amount * 100, packageName })
        .then((res) => setClientSecret(res.data.clientSecret))
        .catch(() => setError('Failed to initialize payment. Please try again.'));
    }
  }, [amount, user?.email, axiosSecure, authLoading, packageName, userInfo, userInfoLoading]);

  // Already purchased alert
  useEffect(() => {
    if (userInfo?.membership === packageName) {
      MySwal.fire({
        icon: 'info',
        title: 'Already Purchased',
        text: `You already have the ${packageName} package.`,
        confirmButtonColor: '#3085d6',
      }).then(() => {
        window.scrollTo(0, 0);
        navigate('/membership');
      });
    }
  }, [userInfo?.membership, packageName, navigate]);

  // Handle payment submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    const card = elements.getElement(CardElement);
    if (!card) return;

    setProcessing(true);
    setError('');

    // Create payment method
    const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({ type: 'card', card });
    if (pmError) {
      setError(pmError.message);
      setProcessing(false);
      return;
    }

    // Confirm payment
    const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card,
        billing_details: { name: user?.displayName || 'Anonymous User', email: user?.email || 'anonymous@example.com' },
      },
    });

    setProcessing(false);

    if (confirmError) {
      setError(confirmError.message);
      return;
    }

    if (paymentIntent.status === 'succeeded') {
      const paymentData = {
        email: user?.email,
        packageName,
        amount,
        transactionId: paymentIntent.id,
        paymentMethod: paymentIntent.payment_method_types[0],
        paid_at: new Date().toISOString(),
      };

      try {
        await axiosSecure.post('/payments', paymentData);
        await axiosSecure.patch(`/users/${user.email}/membership`, { membership: packageName });

        MySwal.fire({
          icon: 'success',
          title: 'Payment Successful!',
          html: `<strong>Transaction ID:</strong> <code>${paymentIntent.id}</code><br/><p>Your membership has been updated!</p>`,
          timer: 3000,
          showConfirmButton: false,
        }).then(() => {
          window.scrollTo(0, 0);
          navigate('/dashboard/profile');
        });
      } catch {
        MySwal.fire({
          icon: 'error',
          title: 'Payment Recorded, but Error!',
          text: 'There was an issue updating your membership. Contact support.',
          html: `<strong>Transaction ID:</strong> <code>${paymentIntent.id}</code>`,
        }).then(() => {
          window.scrollTo(0, 0);
          navigate('/dashboard');
        });
      }
    } else {
      setError(`Payment failed: ${paymentIntent.status}`);
    }
  };

  if (authLoading || userInfoLoading || !user || userInfoError) {
    return (
      <div className="flex justify-center items-center py-16">
        <p className="text-xl text-gray-700 dark:text-gray-300">Loading payment form...</p>
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} py-16 max-w-7xl mx-auto px-4`}>
      <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-gray-800 dark:text-gray-100">
        Complete Your Payment
      </h2>

      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
        <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
          Pay for <span className="capitalize text-primary-dark dark:text-primary-light">{packageName}</span> Package
        </h3>

        <p className="text-xl text-gray-700 dark:text-gray-300 mb-6 flex items-center justify-center gap-3">
          <FaDollarSign className="text-green-600 text-2xl" />
          <span className="font-bold text-gray-800 dark:text-gray-100">Amount: ${amount.toFixed(2)}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 focus-within:ring-2 focus-within:ring-primary-light dark:focus-within:ring-primary-dark transition-colors duration-200">
            <label htmlFor="card-element" className="block text-gray-700 dark:text-gray-200 text-sm font-semibold mb-2">
              Card Details
            </label>
            <CardElement
              id="card-element"
              options={{
                style: {
                  base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } },
                  invalid: { color: '#9e2146' },
                },
              }}
            />
          </div>

          <button
            type="submit"
            className={`inline-flex items-center justify-center px-8 py-3 bg-primary-dark dark:bg-primary-light font-semibold rounded-lg hover:bg-primary-light dark:hover:bg-primary-dark transition-colors duration-200 text-lg shadow-md w-full ${
              !stripe || !elements || processing || !clientSecret ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={!stripe || !elements || processing || !clientSecret}
          >
            {processing ? (
              <>
                <FaSpinner className="animate-spin mr-3" /> Processing...
              </>
            ) : (
              <>
                <FaCreditCard className="mr-3" /> Pay ${amount.toFixed(2)}
              </>
            )}
          </button>

          {error && <p className="text-red-600 dark:text-red-400 text-center mt-4 text-sm font-medium">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
