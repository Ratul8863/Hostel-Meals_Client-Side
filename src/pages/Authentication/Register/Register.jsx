import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import useAuth from '../../../hooks/useAuth';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Changed to react-router-dom
import SocialLogin from '../SocialLogin/SocialLogin'; // Assuming correct path to SocialLogin
import axios from 'axios';
import useAxios from '../../../hooks/useAxios'; // Assuming useAxios is for public requests
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content'; // Import for custom Swal styling
import { FaUser, FaImage, FaEnvelope, FaLock, FaUserPlus, FaSpinner } from 'react-icons/fa'; // Icons for form fields and loading

const MySwal = withReactContent(Swal); // Initialize SweetAlert with React content

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const { createUser, updateUserProfile } = useAuth(); // Assuming createUser handles Firebase registration
  const [profilePic, setProfilePic] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null); // State for image preview
  const axiosInstance = useAxios(); // Use useAxios for public routes (e.g., saving user info)
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/';

  // Watch image field to show preview
  const imageFile = watch("profileImage"); // Assuming the input name for image is 'profileImage'
  React.useEffect(() => {
    if (imageFile && imageFile.length > 0) {
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

    // Basic file size validation (e.g., max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    if (image.size > MAX_FILE_SIZE) {
      MySwal.fire({
        icon: 'error',
        title: 'Image Too Large!',
        text: 'Please select an image smaller than 5MB.',
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
      const uploadUrl = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_upload_key}`;
      const res = await axios.post(uploadUrl, formData);
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
      console.error('Image upload failed:', err);
      MySwal.fire({
        icon: 'error',
        title: 'Image Upload Failed!',
        text: err.message || 'Try a smaller image or check your internet connection.',
        customClass: {
          confirmButton: 'bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200',
        },
        buttonsStyling: false,
      });
      setProfilePic(''); // Ensure profilePic is empty on failure
      setImagePreview(null); // Clear preview on failure
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
      // 1. Create user in Firebase Auth
      const result = await createUser(data.email, data.password);
      const firebaseUser = result.user; // Get the user object from Firebase

      // 2. Update Firebase user profile with name and photoURL
      await updateUserProfile({
        displayName: data.name,
        photoURL: profilePic,
      });

      // 3. Save user info to your database (using useAxios for public endpoint)
      const userInfo = {
        email: data.email,
        name: data.name,
        role: 'user', // Default role for new registrations
        photoURL: profilePic,
        membership: 'Bronze', // Default membership level
        created_at: new Date().toISOString(),
        last_log_in: new Date().toISOString() // Set initial login time
      };

      await axiosInstance.post('/users', userInfo); // Use axiosInstance for non-secure routes if needed, or axiosSecure if it's a secure route

      // 4. Show success message
      MySwal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: `Welcome, ${data.name}! Your account has been created.`,
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

      // 5. Navigate to intended page or home
      navigate(from, { replace: true });

    } catch (error) {
      console.error("Registration error:", error);
      let errorMessage = 'An unexpected error occurred during registration.';
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email address is already in use.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password is too weak. Please use a stronger password.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'The email address is not valid.';
            break;
          default:
            errorMessage = error.message;
        }
      }
      MySwal.fire({
        icon: 'error',
        title: 'Registration Failed!',
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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4"> {/* Lighter, more subtle gradient background */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 w-full max-w-md p-8 md:p-10"> {/* Polished card style */}
        <h2 className="text-4xl md:text-5xl font-extrabold text-center text-gray-800 mb-8 leading-tight">
          Create an Account
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6"> {/* Increased space-y for better spacing */}

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
              <FaUser className="text-primary-dark" /> Full Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          {/* Profile Image */}
          <div>
            <label htmlFor="profileImage" className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
              <FaImage className="text-primary-dark" /> Profile Picture
            </label>
            <input
              id="profileImage"
              type="file"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-light file:text-white hover:file:bg-primary-dark transition-colors duration-200 cursor-pointer"
              onChange={handleImageUpload}
              accept="image/*"
              {...register('profileImage', { required: 'Profile picture is required' })} // Added register for validation
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

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
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
            <label htmlFor="password" className="block text-gray-700 text-sm font-semibold mb-2 flex items-center gap-2">
              <FaLock className="text-primary-dark" /> Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Create a password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200"
              {...register('password', {
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

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full inline-flex items-center justify-center px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors duration-200 text-lg shadow-md
                ${imageUploading || !profilePic ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={imageUploading || !profilePic} // Disable if image is uploading or not selected
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
    </div>
  );
};

export default Register;
