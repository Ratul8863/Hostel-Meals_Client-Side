import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { FaUserShield } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useAuth from '../../../hooks/useAuth';

const MeetOurTeam = () => {
  const axiosSecure = useAxiosSecure();
  const { theme } = useAuth();

  const { data: admins = [], isLoading, isError } = useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const res = await axiosSecure.get('/users/admins');
      return res.data;
    },
  });

  return (
    <section className={`py-16 max-w-7xl mx-auto px-4 ${theme === 'dark' ? 'bg-[#0D1128] text-white' : 'bg-white text-gray-900'}`}>
      <h2 className={`text-4xl md:text-5xl font-extrabold mb-4 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
        Meet Our Dedicated Team
      </h2>
      <p className={`text-center text-lg md:text-xl mb-16 max-w-3xl mx-auto ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        Discover the passionate individuals who work tirelessly to bring you the best hostel meal experience.
      </p>

      {isLoading ? (
        <p className={`text-center text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Loading team members...</p>
      ) : isError ? (
        <p className="text-center text-red-600 text-xl">Failed to load team members. Please try again later.</p>
      ) : admins.length === 0 ? (
        <p className={`text-center text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>No team members to display at the moment.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {admins.map((admin) => (
            <div
              key={admin._id}
              className={`rounded-xl shadow-lg p-8 transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl border flex flex-col items-center text-center
                ${theme === 'dark' ? 'bg-[#1c1f3b] border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'}
              `}
            >
              <img
                src={admin.photoURL || `https://placehold.co/96x96/F0F0F0/888888?text=${admin.name ? admin.name.charAt(0) : 'A'}`}
                alt={admin.name || 'Admin'}
                className={`w-24 h-24 rounded-full object-cover mb-6 border-4 shadow-sm
                  ${theme === 'dark' ? 'border-gray-600' : 'border-gray-100'}
                `}
              />

              <h3 className={`text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                {admin.name || 'Unknown Admin'}
              </h3>

              {admin.email && (
                <p className={`text-base flex items-center gap-2 mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  <MdEmail className="text-gray-500" /> {admin.email}
                </p>
              )}

              <p className={`text-base flex items-center gap-2 mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <FaUserShield className={`${theme === 'dark' ? 'text-yellow-400' : 'text-primary-dark'}`} /> Role: <span className="font-semibold capitalize">{admin.role || 'N/A'}</span>
              </p>

              {admin.created_at && (
                <p className={`text-sm mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
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
