import { useQuery } from '@tanstack/react-query';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const ProfileSection = () => {
  const { user } = useAuth();
  const { email, displayName, photoURL } = user || {};
 const axiosSecure = useAxiosSecure();
  

 const { data: userInfo = {} } = useQuery({
    queryKey: ['user', user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/${user.email}`);
      return res.data;
    },
    enabled: !!user?.email
  });



console.log(userInfo)
  const isAdmin = userInfo?.role === 'admin';

  const { data: mealCountData = { count: 0 } } = useQuery({
    queryKey: ['mealCount', email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/meals/count/${email}`);
      return res.data;
    },
    enabled: isAdmin,
  });

  console.log(mealCountData)

  return (
    <div className="max-w-md mx-auto p-6 rounded-xl bg-[#1c1f3b] shadow-lg text-white mt-10">
      <div className="flex flex-col items-center gap-4">
        <img
          src={photoURL}
          alt="User"
          className="w-28 h-28 rounded-full border-4 border-lime-400 object-cover"
        />
        <h2 className="text-2xl font-bold">{displayName}</h2>
        <p className="text-sm text-gray-300">{email}</p>

        {/* Role Tag */}
        <span className={`px-4 py-1 rounded-full text-sm uppercase font-semibold tracking-wide
          ${isAdmin ? "border-red-400 text-red-300 bg-red-950" : "border-yellow-400 text-yellow-300 bg-yellow-950"}
        `}>
          {isAdmin ? "Admin" : userInfo?.membership || "User"}
        </span>

        {/* Role-based Extra Info */}
        {isAdmin ? (
          <p className="mt-4 text-lg">
            Total Meals Added: <span className="font-bold text-lime-400">{mealCountData.count}</span>
          </p>
        ) : (
          <p className="mt-4 text-lg">
            Membership Level: <span className="font-bold text-lime-400 capitalize">{userInfo?.membership || "Free"}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;
