import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Changed to react-router-dom
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'; // Import for custom Swal styling
import useAuth from '../../../hooks/useAuth';
import SocialLogin from '../SocialLogin/SocialLogin'; // Assuming correct path to SocialLogin
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa'; // Icons for email, password, and login button

const MySwal = withReactContent(Swal); // Initialize SweetAlert with React content

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { signIn } = useAuth(); // Assuming signIn handles Firebase email/password login
    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from?.pathname || '/';

    const onSubmit = (data) => {
        signIn(data.email, data.password)
            .then((result) => {
                MySwal.fire({
                    icon: 'success',
                    title: 'Login Successful!',
                    text: `Welcome back, ${result.user.displayName || result.user.email}!`,
                    showConfirmButton: false,
                    timer: 1800, // Slightly longer timer
                    customClass: {
                        container: 'z-[9999]', // Ensure Swal is on top
                        popup: 'rounded-xl shadow-lg',
                        title: 'text-gray-800',
                        htmlContainer: 'text-gray-700',
                    },
                    buttonsStyling: false,
                });
                navigate(from, { replace: true }); // Navigate to intended page or home
            })
            .catch((error) => {
                let errorMessage = 'An unexpected error occurred.';
                if (error.code) {
                    switch (error.code) {
                        case 'auth/user-not-found':
                        case 'auth/wrong-password':
                            errorMessage = 'Invalid email or password. Please try again.';
                            break;
                        case 'auth/invalid-email':
                            errorMessage = 'The email address is not valid.';
                            break;
                        case 'auth/too-many-requests':
                            errorMessage = 'Too many login attempts. Please try again later.';
                            break;
                        default:
                            errorMessage = error.message;
                    }
                }
                MySwal.fire({
                    icon: 'error',
                    title: 'Login Failed!',
                    text: errorMessage,
                    customClass: {
                        container: 'z-[9999]',
                        popup: 'rounded-xl shadow-lg',
                        title: 'text-gray-800',
                        htmlContainer: 'text-gray-700',
                        confirmButton: 'bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200',
                    },
                    buttonsStyling: false,
                });
            });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4"> {/* Lighter, more subtle gradient background */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 w-full max-w-md p-8 md:p-10"> {/* Polished card style */}
                <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-8 leading-tight">
                    Login to Your Account
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6"> {/* Increased space-y for better spacing */}

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className=" text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                            <FaEnvelope className="text-primary-dark" /> Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200"
                            {...register('email', { required: 'Email is required' })}
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className=" text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
                            <FaLock className="text-primary-dark" /> Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: { value: 6, message: 'Password must be at least 6 characters long' }
                            })}
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                    </div>

                    <div className="text-sm text-right">
                        <a href="#" className="text-primary-dark hover:underline font-medium transition-colors duration-200">Forgot Password?</a>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2"> {/* Added padding top */}
                        <button
                            type="submit"
                            className="w-full inline-flex items-center justify-center px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors duration-200 text-lg shadow-md"
                        >
                            <FaSignInAlt className="mr-3" /> Login
                        </button>
                    </div>
                </form>

                <p className="text-center text-gray-600 mt-8 text-base">
                    New to this website?{" "}
                    <Link to="/register" state={{ from }} className="text-primary-dark hover:underline font-semibold transition-colors duration-200">
                        Register here
                    </Link>
                </p>

                {/* Social Login */}
                <div className="relative flex items-center py-8"> {/* Increased padding */}
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-500 font-medium">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>
                <SocialLogin /> {/* Assuming SocialLogin component is styled internally or will be polished separately */}
            </div>
        </div>
    );
};

export default Login;
