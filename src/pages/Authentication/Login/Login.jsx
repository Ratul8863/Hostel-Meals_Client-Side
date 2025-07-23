import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router';
import SocialLogin from '../SocialLogin/SocialLogin';
import useAuth from '../../../hooks/useAuth';
import Swal from 'sweetalert2';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { signIn } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from?.pathname || '/';

    const onSubmit = (data) => {
        signIn(data.email, data.password)
            .then((result) => {
                Swal.fire({
                    icon: 'success',
                    title: 'Login Successful!',
                    showConfirmButton: false,
                    timer: 1500
                });
                navigate(from, { replace: true });
            })
            .catch((error) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: error.message,
                });
            });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 px-4">
            <div className="card w-full max-w-md shadow-xl bg-base-100">
                <div className="card-body">
                    <h2 className="text-3xl font-bold text-center mb-4">Login to Your Account</h2>
                    <form onSubmit={handleSubmit(onSubmit)}>

                        {/* Email */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="input input-bordered"
                                {...register('email', { required: 'Email is required' })}
                            />
                            {errors.email && <p className="text-red-500 mt-1 text-sm">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <input
                                type="password"
                                placeholder="Enter your password"
                                className="input input-bordered"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'Minimum 6 characters required' }
                                })}
                            />
                            {errors.password && <p className="text-red-500 mt-1 text-sm">{errors.password.message}</p>}
                        </div>

                        <div className="text-sm text-right mt-2">
                            <a href="#" className="text-blue-500 hover:underline">Forgot Password?</a>
                        </div>

                        {/* Submit Button */}
                        <div className="form-control mt-6">
                            <button className="btn btn-primary text-white">Login</button>
                        </div>
                    </form>

                    <p className="text-sm text-center mt-4">
                        New to this website?{" "}
                        <Link to="/register" state={{ from }} className="text-blue-500 hover:underline">
                            Register here
                        </Link>
                    </p>

                    {/* Social Login */}
                    <div className="divider">OR</div>
                    <SocialLogin />
                </div>
            </div>
        </div>
    );
};

export default Login;
