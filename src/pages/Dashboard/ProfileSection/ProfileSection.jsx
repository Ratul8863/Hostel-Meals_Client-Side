import React from 'react';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { FaUserCircle, FaCrown, FaUtensils, FaUserShield } from 'react-icons/fa'; // Icons for user, membership, meals, admin

const ProfileSection = () => {
  const { user, loading: authLoading } = useAuth(); // Get authLoading state
  const { email, displayName, photoURL } = user || {};
  const axiosSecure = useAxiosSecure();

  // Fetch user info (role and membership)
  const { data: userInfo = {}, isLoading: userInfoLoading, isError: userInfoError } = useQuery({
    queryKey: ['userInfo', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${user.email}`);
      return res.data;
    },
    enabled: !!user?.email && !authLoading, // Only fetch if user email is available and auth is not loading
  });

  const isAdmin = userInfo?.role === 'admin';
console.log('hii',email)
  // Fetch meal count for admins
  const { data: mealCountData = { count: 0 }, isLoading: mealCountLoading, isError: mealCountError } = useQuery({
    queryKey: ['mealCount', email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/meals/count?email=${email}`); // Ensure this endpoint returns { count: number }
      return res.data;
    },
    enabled: isAdmin && !!email && !userInfoLoading, // Only fetch if user is admin and email is available and userInfo is loaded
  });

  // Handle loading and error states
  if (authLoading || userInfoLoading || (isAdmin && mealCountLoading)) {
    return (
      <div className="flex justify-center items-center py-16">
        <p className="text-xl text-gray-700">Loading profile...</p>
      </div>
    );
  }

  if (userInfoError || (isAdmin && mealCountError)) {
    return (
      <div className="flex justify-center items-center py-16">
        <p className="text-xl text-red-600">Error loading profile data.</p>
      </div>
    );
  }
console.log('hii',email)
  console.log(userInfo)
  console.log(mealCountData)

  return (
    <div className="py-16 max-w-2xl mx-auto px-4"> {/* Consistent padding and max-width */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 flex flex-col items-center text-center"> {/* Polished card style */}
        {/* Profile Image */}
        <img
          src={userInfo.photoURL || `https://placehold.co/120x120/F0F0F0/888888?text=${displayName ? displayName.charAt(0) : 'U'}`} // Placeholder with initial
          alt={displayName || 'User Profile'}
          className="w-32 h-32 rounded-full border-4 border-primary-light object-cover shadow-md mb-6" // Larger, more prominent image
        />

        {/* User Name */}
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{displayName || 'User Name'}</h2>
        {/* User Email */}
        <p className="text-base text-gray-600 mb-4">{email || 'user@example.com'}</p>

        {/* Role/Membership Tag */}
        <span
          className={`px-5 py-2 rounded-full text-sm font-semibold tracking-wide uppercase mb-6 shadow-sm
            ${isAdmin
              ? "bg-red-100 text-red-700 border border-red-300" // Admin tag style
              : "bg-yellow-100 text-yellow-700 border border-yellow-300" // User/Membership tag style
            }
          `}
        >
          {isAdmin ? (
            <span className="flex items-center gap-2">
              <FaUserShield className="text-red-500" /> Admin
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <FaCrown className="text-yellow-600" /> {userInfo?.membership || "Bronze"} Member
            </span>
          )}
        </span>

        {/* Role-based Extra Info */}
        <div className="text-lg text-gray-700 flex items-center gap-3">
          {isAdmin ? (
            <>
              <FaUtensils className="text-primary-dark text-xl" />
              Total Meals Added: <span className="font-bold text-primary-dark">{mealCountData.count}</span>
            </>
          ) : (
            <>
              <FaCrown className="text-yellow-600 text-xl" />
              Membership Level: <span className="font-bold text-primary-dark capitalize">{userInfo?.membership || "Bronze"}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
