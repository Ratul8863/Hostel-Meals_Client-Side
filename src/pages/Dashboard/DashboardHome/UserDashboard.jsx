import React from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FaBook, FaStar, FaClock } from 'react-icons/fa'; // Import icons from react-icons

import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

// Define a more vibrant color palette and corresponding Tailwind classes
const VIBRANT_COLORS = ["#6A4C93", "#E3655B", "#F7C548", "#1A8FE3"];
const VIBRANT_TAILWIND_CLASSES = ["bg-[#6A4C93]", "bg-[#E3655B]", "bg-[#F7C548]", "bg-[#1A8FE3]"];

// Reusable StatCard component with Tailwind classes
const StatCard = ({ title, value, icon, colorClass }) => (
    <div className={`flex flex-col items-center justify-center p-6 text-white rounded-xl shadow-lg transition-transform transform hover:scale-105 ${colorClass}`}>
        <div className="text-4xl mb-2">{icon}</div>
        <h3 className="text-base font-medium mb-1">{title}</h3>
        <p className="text-4xl font-extrabold">{value}</p>
    </div>
);

// Reusable ReviewCard component with Tailwind classes
const ReviewCard = ({ review, date }) => (
    <li className="bg-white p-4 rounded-lg shadow-sm mb-3 border-l-4 border-[#F7C548]">
        <p className="font-semibold text-gray-800">"{review}"</p>
        <small className="text-gray-500 mt-1 block">
            Reviewed on: {new Date(date).toLocaleDateString()}
        </small>
    </li>
);

const UserDashboard = () => {
    const { user } = useAuth();
    const email = user?.email;
    const axiosSecure = useAxiosSecure();

    const { data: overview = {
        user: {},
        upcomingMeals: [],
        userReviews: [],
        totals: { bookedMeals: 0, reviews: 0, pendingRequests: 0 }
    }, isLoading: overviewLoading } = useQuery({
        queryKey: ["userOverview", email],
        queryFn: async () => (await axiosSecure.get(`/stats/user/overview?email=${email}`)).data,
        enabled: !!email,
        staleTime: 5 * 60 * 1000,
    });

    if (overviewLoading) return <p className="text-center py-10 text-gray-600">Loading...</p>;

    // Pie chart data
    const pieData = [
        { name: "Booked Meals", value: overview.totals.bookedMeals, icon: <FaBook /> },
        { name: "Reviews", value: overview.totals.reviews, icon: <FaStar /> },
        { name: "Pending Requests", value: overview.totals.pendingRequests, icon: <FaClock /> }
    ];

    // Upcoming meals for bar chart
    const barData = overview.upcomingMeals.map(meal => ({
        name: meal.mealTitle || meal.name,
        count: 1,
    }));

    return (
        <div className="p-6 md:p-10 dark:bg-[#0D1128] dark:text-white min-h-screen font-sans">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white text-center mb-6 md:mb-10">
                Welcome back, {overview.user.name || "User"}!
            </h1>

            {/* Stats Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {pieData.map((item, idx) => (
                    <StatCard
                        key={idx}
                        title={item.name}
                        value={item.value}
                        icon={item.icon}
                        colorClass={VIBRANT_TAILWIND_CLASSES[idx % VIBRANT_TAILWIND_CLASSES.length]}
                    />
                ))}
            </div>

            {/* Main Content Grid: Charts and Reviews */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Charts Section */}
                <div className="flex flex-col gap-8">
                    {/* Totals Pie Chart */}
                    <div className="dark:bg-[#0D1128] dark:border-1 bg-white  p-6 rounded-2xl shadow-md">
                        <h2 className="text-xl font-semibold text-center dark:text-white text-gray-700 mb-4">Your Stats at a Glance</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={VIBRANT_COLORS[index % VIBRANT_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Upcoming Meals Bar Chart */}
                    <div className="dark:bg-[#0D1128] bg-white dark:border-1 p-6 rounded-2xl shadow-md">
                        <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4"> Meals</h2>
                        {barData.length ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={barData}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#E3655B" barSize={40} radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-gray-500 dark:text-white py-10">You have no upcoming meals scheduled.</p>
                        )}
                    </div>
                </div>

                {/* Recent Reviews Section */}
                <div className="dark:bg-[#0D1128] bg-white dark:border-1 p-6 rounded-2xl shadow-md">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">What People Are Saying</h2>
                    {overview.userReviews.length ? (
                        <ul className="list-none p-0">
                            {overview.userReviews.map((review) => (
                                <ReviewCard
                                    key={review._id}
                                    review={review.review}
                                    date={review.createdAt}
                                />
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-gray-500 dark:text-white py-10">Looks like you haven't posted any reviews yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;