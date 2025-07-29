import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import useAxios from '../../../hooks/useAxios';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import SocialLogin from '../SocialLogin/SocialLogin';
import { motion } from 'framer-motion';
import {
  FaUser, FaEnvelope, FaLock, FaUserPlus, FaSpinner, FaImage
} from 'react-icons/fa';

const MySwal = withReactContent(Swal);

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { createUser, updateUserProfile } = useAuth();
  const [profilePic, setProfilePic] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const axiosInstance = useAxios();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const imageFile = watch('profileImage');
  useEffect(() => {
    if (imageFile?.length) {
      const file = imageFile[0];
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  }, [imageFile]);

  const handleImageUpload = async (e) => {
    const image = e.target.files[0];
    if (!image) {
      setProfilePic(''); // Clear profile pic if no file selected
      setImagePreview(null); // Clear preview
      return;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (image.size > MAX_SIZE) {
      MySwal.fire({
        icon: 'error',
        title: 'Image Too Large!',
        text: 'Max file size is 5MB. Please select a smaller image.',
        customClass: {
          confirmButton: 'bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200',
        },
        buttonsStyling: false,
      });
      e.target.value = null; // Clear the input field
      setProfilePic('');
      setImagePreview(null);
      return;
    }

    const formData = new FormData();
    formData.append('image', image);
    setImageUploading(true);
    setProfilePic(''); // Clear previous URL while uploading

    try {
      const url = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_upload_key}`;
      const res = await axios.post(url, formData);
      if (res.data.success) {
        setProfilePic(res.data.data.url);
        MySwal.fire({
          icon: 'success',
          title: 'Image Uploaded!',
          text: 'Profile picture uploaded successfully.',
          showConfirmButton: false,
          timer: 1500,
          customClass: {
            container: 'z-[9999]',
            popup: 'rounded-xl shadow-lg',
            title: 'text-gray-800',
            htmlContainer: 'text-gray-700',
          },
          buttonsStyling: false,
        });
      } else {
        throw new Error(res.data.error?.message || 'Image upload failed.');
      }
    } catch (err) {
      // console.error('Upload error:', err);
      MySwal.fire({
        icon: 'error',
        title: 'Upload failed',
        text: err.message || 'Try again or use a smaller image.',
        customClass: {
          confirmButton: 'bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200',
        },
        buttonsStyling: false,
      });
      setProfilePic('');
      setImagePreview(null);
    } finally {
      setImageUploading(false);
    }
  };

  const onSubmit = async (data) => {
    if (imageUploading) {
      MySwal.fire({
        icon: 'info',
        title: 'Please wait...',
        text: 'Profile picture is still uploading. Please wait for it to finish.',
        customClass: {
          confirmButton: 'bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200',
        },
        buttonsStyling: false,
      });
      return;
    }

    if (!profilePic) {
      MySwal.fire({
        icon: 'warning',
        title: 'Profile Image Required',
        text: 'Please upload a profile picture before registering.',
        customClass: {
          confirmButton: 'bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors duration-200',
        },
        buttonsStyling: false,
      });
      return;
    }

    try {
      const userCred = await createUser(data.email, data.password);
      await updateUserProfile({ displayName: data.name, photoURL: profilePic });

      const userInfo = {
        name: data.name,
        email: data.email,
        photoURL: profilePic,
        role: 'user',
        membership: 'Bronze',
        created_at: new Date().toISOString(),
        last_log_in: new Date().toISOString()
      };

      await axiosInstance.post('/users', userInfo);

      MySwal.fire({
        icon: 'success',
        title: 'Welcome!',
        text: `Account created for ${data.name}.`,
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          container: 'z-[9999]',
          popup: 'rounded-xl shadow-lg',
          title: 'text-gray-800',
          htmlContainer: 'text-gray-700',
        },
        buttonsStyling: false,
      });

      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      let msg = 'An unexpected error occurred during registration.';
      if (err.code === 'auth/email-already-in-use') msg = 'This email address is already in use.';
      else if (err.code === 'auth/weak-password') msg = 'Password is too weak. Please use a stronger password.';
      else if (err.code === 'auth/invalid-email') msg = 'The email address is not valid.';
      MySwal.fire({
        icon: 'error',
        title: 'Registration Failed!',
        text: msg,
        customClass: {
          container: 'z-[9999]',
          popup: 'rounded-xl shadow-lg',
          title: 'text-gray-800',
          htmlContainer: 'text-gray-700',
          confirmButton: 'bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200',
        },
        buttonsStyling: false,
      });
    }
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4" // Consistent background
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 max-w-md w-full p-8 md:p-10 space-y-6"> {/* Polished card style */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-8 leading-tight">
          Create an Account
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6"> {/* Increased space-y for better spacing */}

          {/* Name */}
          <div>
            <label htmlFor="name" className=" text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
              <FaUser className="text-primary-dark" /> Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200"
              {...register("name", { required: 'Name is required' })}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className=" text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
              <FaEnvelope className="text-primary-dark" /> Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="example@mail.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200"
              {...register("email", { required: 'Email is required' })}
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
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200"
              {...register("password", {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters long' },
                pattern: {
                  value: /(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z])/,
                  message: 'Password must have at least one uppercase letter, one lowercase letter, one number, and one special character.'
                }
              })}
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>

          {/* Profile Image */}
          <div>
            <label htmlFor="profileImage" className=" text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
              <FaImage className="text-primary-dark" /> Profile Picture
            </label>
            <input
              id="profileImage"
              type="file"
              accept="image/*"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-white hover:file:bg-primary-dark transition-colors duration-200 cursor-pointer"
              {...register("profileImage", { required: 'Profile picture is required' })}
              onChange={handleImageUpload}
            />
            {errors.profileImage && <p className="text-red-500 text-sm mt-1">{errors.profileImage.message}</p>}
            {imageUploading && (
              <p className="text-blue-500 text-sm mt-2 flex items-center gap-2">
                <FaSpinner className="animate-spin" /> Uploading image...
              </p>
            )}
            {imagePreview && !imageUploading && (
              <div className="mt-4 flex justify-center">
                <img src={imagePreview} alt="Profile Preview" className="w-24 h-24 rounded-full object-cover border-2 border-primary-light shadow-md" />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full inline-flex items-center justify-center px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors duration-200 text-lg shadow-md
                ${imageUploading || !profilePic ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={imageUploading || !profilePic}
            >
              {imageUploading ? <><FaSpinner className="animate-spin mr-3" /> Uploading Image...</> : <><FaUserPlus className="mr-3" /> Register</>}
            </button>
          </div>
        </form>

        <p className="text-center text-gray-600 mt-8 text-base">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-dark hover:underline font-semibold transition-colors duration-200">
            Login here
          </Link>
        </p>

        {/* Social Login */}
        <div className="relative flex items-center py-8">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-500 font-medium">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
        <SocialLogin />
      </div>
    </motion.div>
  );
};

export default Register;
