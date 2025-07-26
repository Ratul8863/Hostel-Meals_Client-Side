import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { useParams, useNavigate } from 'react-router-dom'; // Changed to react-router-dom
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'; // Import for custom Swal styling
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useAuth from '../../../hooks/useAuth';
import { FaDollarSign, FaCreditCard, FaSpinner } from 'react-icons/fa'; // Icons for price, card, and loading

const MySwal = withReactContent(Swal); // Initialize SweetAlert with React content

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { packageName } = useParams();
  const axiosSecure = useAxiosSecure();
  const { user, loading: authLoading } = useAuth(); // Get authLoading state
  const navigate = useNavigate();

  const [amount, setAmount] = useState(0);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [processing, setProcessing] = useState(false); // State for payment processing

  // Determine amount based on package name
  useEffect(() => {
    if (packageName) {
      const price = packageName === 'silver' ? 9.99 : packageName === 'gold' ? 19.99 : 29.99;
      setAmount(price);
    }
  }, [packageName]);

  // Create Payment Intent when amount is set and user is available
  useEffect(() => {
    if (amount > 0 && user?.email && !authLoading) {
      axiosSecure.post('/create-payment-intent', {
        amountInCents: amount * 100, // Stripe expects amount in cents
        packageName // Pass package name to backend for context
      })
        .then(res => {
          setClientSecret(res.data.clientSecret);
        })
        .catch(err => {
          console.error("Error creating payment intent:", err);
          setError("Failed to initialize payment. Please try again.");
        });
    }
  }, [amount, user?.email, axiosSecure, authLoading, packageName]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return; // Stripe.js has not yet loaded.
    }

    const card = elements.getElement(CardElement);

    if (card == null) {
      return; // CardElement not found
    }

    setProcessing(true); // Start processing

    // Create PaymentMethod
    const { error: createPaymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card,
    });

    if (createPaymentMethodError) {
      setError(createPaymentMethodError.message);
      setProcessing(false);
      return;
    }

    setError(''); // Clear previous errors
    console.log('Payment Method:', paymentMethod);

    // Confirm the payment with the client secret
    const { paymentIntent, error: confirmPaymentError } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card,
        billing_details: {
          name: user?.displayName || 'Anonymous User',
          email: user?.email || 'anonymous@example.com',
        },
      },
    });

    setProcessing(false); // End processing

    if (confirmPaymentError) {
      setError(confirmPaymentError.message);
      console.error("Payment confirmation error:", confirmPaymentError);
    } else {
      setError('');
      if (paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded!', paymentIntent);

        // Save payment information to your database
        const paymentData = {
          email: user?.email,
          packageName,
          amount: amount,
          transactionId: paymentIntent.id,
          paymentMethod: paymentIntent.payment_method_types[0], // Get the first payment method type
          paid_at: new Date().toISOString(), // Store payment timestamp
        };

        try {
          // Post payment data to your backend
          await axiosSecure.post('/payments', paymentData);

          // Update user's membership status if it's a package payment
          if (packageName) {
            await axiosSecure.patch(`/users/${user.email}/membership`, { membership: packageName });
          }

          // Show success message
          MySwal.fire({
            icon: 'success',
            title: 'Payment Successful!',
            html: `<strong>Transaction ID:</strong> <code>${paymentIntent.id}</code><br/>
                   <p class="mt-2">Your membership has been updated!</p>`,
            timer: 3000,
            showConfirmButton: false,
            customClass: {
              container: 'z-[9999]', // Ensure Swal is on top
              popup: 'rounded-xl shadow-lg',
              title: 'text-gray-800',
              htmlContainer: 'text-gray-700',
              confirmButton: 'bg-primary-dark text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors duration-200',
            },
            buttonsStyling: false,
          }).then(() => {
            // Navigate after Swal closes
            navigate('/dashboard/profile'); // Navigate to dashboard profile or home
          });

        } catch (dbError) {
          console.error("Error saving payment data or updating membership:", dbError);
          MySwal.fire({
            icon: 'error',
            title: 'Payment Recorded, but Error!',
            text: 'Payment was successful, but there was an issue updating your membership or recording details. Please contact support with your transaction ID.',
            html: `<strong>Transaction ID:</strong> <code>${paymentIntent.id}</code>`,
            customClass: {
              container: 'z-[9999]',
              popup: 'rounded-xl shadow-lg',
              title: 'text-gray-800',
              htmlContainer: 'text-gray-700',
              confirmButton: 'bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200',
            },
            buttonsStyling: false,
          });
          navigate('/dashboard'); // Navigate to dashboard even on partial error
        }
      } else {
        setError(`Payment failed: ${paymentIntent.status}`);
      }
    }
  };

  // Display loading state if auth is still loading or clientSecret is not ready
  if (authLoading || !user || !clientSecret) {
    return (
      <div className="flex justify-center items-center py-16">
        <p className="text-xl text-gray-700">Loading payment form...</p>
      </div>
    );
  }

  return (
    <div className="py-16 max-w-7xl mx-auto px-4"> {/* Consistent padding and max-width */}
      <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-gray-800">
        Complete Your Payment
      </h2>

      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-100"> {/* Polished card style */}
        <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Pay for <span className="capitalize text-primary-dark">{packageName}</span> Package
        </h3>

        <p className="text-xl text-gray-700 mb-6 flex items-center justify-center gap-3">
          <FaDollarSign className="text-green-600 text-2xl" />
          <span className="font-bold text-gray-800">Amount: ${amount.toFixed(2)}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border border-gray-300 rounded-lg p-4 focus-within:ring-2 focus-within:ring-primary-light transition-colors duration-200">
            <label htmlFor="card-element" className="block text-gray-700 text-sm font-semibold mb-2">
              Card Details
            </label>
            <CardElement
              id="card-element"
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
            />
          </div>

          <button
            type="submit"
            className={`inline-flex  border-b border-t-5 items-center justify-center px-8 py-3 bg-primary-dark  font-semibold rounded-lg hover:bg-primary-light transition-colors duration-200 text-lg shadow-md w-full
              ${!stripe || !elements || processing || !clientSecret ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={!stripe || !elements || processing || !clientSecret}
          >
            {processing ? (
              <><FaSpinner className="animate-spin mr-3" /> Processing...</>
            ) : (
              <><FaCreditCard className="mr-3" /> Pay ${amount.toFixed(2)}</>
            )}
          </button>

          {error && <p className="text-red-600 text-center mt-4 text-sm font-medium">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
