import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaUserShield, FaUserCheck } from 'react-icons/fa'; // For role/membership icons
import { MdEmail } from 'react-icons/md'; // For email icon
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const MeetOurTeam = () => {
  const axiosSecure = useAxiosSecure();

  const { data: admins = [], isLoading, isError } = useQuery({ // Added isError for better feedback
    queryKey: ['admins'],
    queryFn: async () => {
      // IMPORTANT: Ensure this route exists and returns admin user data including name, email, role, membership, and photoURL
      const res = await axiosSecure.get('/users/admins');
      return res.data;
    },
  });

  return (
    <section className="py-16 max-w-7xl mx-auto px-4"> {/* Consistent padding and max-width */}
      <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-center text-gray-800"> {/* Consistent heading style */}
        Meet Our Dedicated Team
      </h2>
      <p className="text-center text-lg md:text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
        Discover the passionate individuals who work tirelessly to bring you the best hostel meal experience.
      </p>

      {isLoading ? (
        <p className="text-center text-gray-600 text-xl">Loading team members...</p>
      ) : isError ? (
        <p className="text-center text-red-600 text-xl">Failed to load team members. Please try again later.</p>
      ) : admins.length === 0 ? (
        <p className="text-center text-gray-600 text-xl">No team members to display at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"> {/* Responsive grid */}
          {admins.map((admin) => (
            <div
              key={admin._id}
              className="bg-white rounded-xl shadow-lg p-8 transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl border border-gray-100 flex flex-col items-center text-center" // Polished card style
            >
              {/* Profile Image / Placeholder */}
              <img
                src={admin.photoURL || `https://placehold.co/96x96/F0F0F0/888888?text=${admin.name ? admin.name.charAt(0) : 'A'}`} // Placeholder or initial if no photo
                alt={admin.name || 'Admin'}
                className="w-24 h-24 rounded-full object-cover mb-6 border-4 border-gray-100 shadow-sm" // Larger circular image with border
              />

              <h3 className="text-2xl font-bold text-gray-800 mb-2">{admin.name || 'Unknown Admin'}</h3> {/* Larger, bolder name */}
              
              {/* Email */}
              {admin.email && (
                <p className="text-base text-gray-600 flex items-center gap-2 mb-2">
                  <MdEmail className="text-gray-500" /> {admin.email}
                </p>
              )}

              {/* Role */}
              <p className="text-base text-gray-700 flex items-center gap-2 mb-2">
                <FaUserShield className="text-primary-dark" /> Role: <span className="font-semibold capitalize">{admin.role || 'N/A'}</span>
              </p>

              {/* Membership */}
              {/* <p className="text-base text-gray-700 flex items-center gap-2">
                <FaUserCheck className="text-green-500" /> Membership: <span className="font-semibold capitalize text-primary-dark">{admin.membership || 'Bronze'}</span>
              </p> */}

              {/* Joined Date */}
              {admin.created_at && (
                <p className="text-sm text-gray-500 mt-4">
                  Joined on {new Date(admin.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default MeetOurTeam;
