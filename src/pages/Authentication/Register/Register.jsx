import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '../../../hooks/useAuth';
import { Link, useLocation, useNavigate } from 'react-router';
import SocialLogin from '../SocialLogin/SocialLogin';
import axios from 'axios';
import useAxios from '../../../hooks/useAxios';
import Swal from 'sweetalert2';

const Register = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { createUser, updateUserProfile } = useAuth();
    const [profilePic, setProfilePic] = useState('');
    const axiosInstance = useAxios();
    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from?.pathname || '/';

    const onSubmit = async (data) => {
        try {
            const result = await createUser(data.email, data.password);
            console.log(result.user);

            // Save user info in DB
            const userInfo = {
                email: data.email,
                role: 'user',
                membership: 'Bronze',
                created_at: new Date().toISOString(),
                last_log_in: new Date().toISOString()
            };
            await axiosInstance.post('/users', userInfo);

            // Update Firebase profile
            const userProfile = {
                displayName: data.name,
                photoURL: profilePic,

            };
            await updateUserProfile(userProfile);

            Swal.fire({
                icon: 'success',
                title: 'Registration Successful!',
                timer: 1500,
                showConfirmButton: false
            });

            navigate(from, { replace: true });

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Oops!',
                text: error.message
            });
        }
    };

    const handleImageUpload = async (e) => {
        const image = e.target.files[0];
        const formData = new FormData();
        formData.append('image', image);

        try {
            const imagUploadUrl = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_upload_key}`;
            const res = await axios.post(imagUploadUrl, formData);
            setProfilePic(res.data.data.url);
        } catch (err) {
            console.error('Image upload failed:', err);
            Swal.fire({
                icon: 'error',
                title: 'Image upload failed!',
                text: 'Please try a smaller image or check your internet connection.',
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100 px-4">
            <div className="card w-full max-w-md shadow-xl bg-base-100">
                <div className="card-body">
                    <h2 className="text-3xl font-bold text-center mb-4">Create an Account</h2>
                    <form onSubmit={handleSubmit(onSubmit)}>

                        {/* Name */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Full Name</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Your Name"
                                className="input input-bordered"
                                {...register('name', { required: 'Name is required' })}
                            />
                            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                        </div>

                        {/* Profile Image */}
                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Profile Picture</span>
                            </label>
                            <input
                                type="file"
                                className="file-input file-input-bordered"
                                onChange={handleImageUpload}
                            />
                        </div>

                        {/* Email */}
                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                placeholder="Email"
                                className="input input-bordered"
                                {...register('email', { required: 'Email is required' })}
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div className="form-control mt-4">
                            <label className="label">
                                <span className="label-text">Password</span>
                            </label>
                            <input
                                type="password"
                                placeholder="Password"
                                className="input input-bordered"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 6, message: 'Minimum 6 characters required' }
                                })}
                            />
                            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                        </div>

                        {/* Submit */}
                        <div className="form-control mt-6">
                            <button className="btn btn-primary text-white">Register</button>
                        </div>
                    </form>

                    <p className="text-center text-sm mt-4">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-500 hover:underline">
                            Login here
                        </Link>
                    </p>

                    <div className="divider">OR</div>
                    <SocialLogin />
                </div>
            </div>
        </div>
    );
};

export default Register;
