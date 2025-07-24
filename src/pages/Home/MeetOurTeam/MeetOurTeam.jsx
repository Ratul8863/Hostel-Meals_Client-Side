import { useQuery } from '@tanstack/react-query';

import { FaUserShield, FaUserCheck } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const MeetOurTeam = () => {
  const axiosSecure = useAxiosSecure();

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const res = await axiosSecure.get('/users/admins'); // ⬅️ Create this route in your server
      return res.data;
    },
  });

  if (isLoading) return <p className="text-center text-xl">Loading Admins...</p>;

  return (
    <section className="py-12 px-4 md:px-8 bg-gray-50">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-indigo-600">Meet Our Admins</h2>
        <p className="text-gray-600 mb-10">The passionate team behind your daily meals</p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {admins.map((admin) => (
            <div key={admin._id} className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-indigo-100 mx-auto mb-4 text-indigo-600 text-3xl">
                <FaUserShield />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">{admin.name}</h3>
              <p className="text-sm text-gray-500 flex justify-center items-center gap-1"><MdEmail /> {admin.email}</p>
              <p className="text-sm mt-2 text-gray-600">Role: <span className="font-medium capitalize">{admin.role}</span></p>
              <p className="text-sm text-gray-600">Membership: <span className="capitalize text-indigo-500">{admin.membership || 'N/A'}</span></p>
              <p className="text-xs text-gray-400 mt-2">Joined on {new Date(admin.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MeetOurTeam;
