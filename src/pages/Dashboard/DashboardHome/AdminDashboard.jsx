import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    FaUsers,
    FaChartBar,
    FaClock,
    FaListAlt,
    FaCheckCircle,
    FaUtensils,
    FaStar,
    FaCrown,
} from "react-icons/fa";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    BarChart,
    Bar,
} from "recharts";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import useAuth from "../../../hooks/useAuth";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

// Reusable StatCard component with improved animation and styling
function StatCard({ icon, title, value, accent = "from-primary to-secondary" }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
        >
            <div className={`h-2 bg-gradient-to-r ${accent}`} />
            <div className="p-6 flex items-center gap-4">
                <div
                    className={`text-4xl p-3 rounded-full text-base-100 bg-gradient-to-br ${accent} opacity-80`}
                >
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-base-content/70">{title}</p>
                    <p className="text-3xl font-extrabold text-primary-content">{value}</p>
                </div>
            </div>
        </motion.div>
    );
}

// Reusable ChartCard component to reduce repetition
function ChartCard({ children, title, badge, icon }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="card bg-base-100 shadow-xl p-6"
        >
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-primary-content">
                    {icon} {title}
                </h2>
                <span className="badge badge-outline">{badge}</span>
            </div>
            {children}
        </motion.div>
    );
}

export default function AdminOverview() {
    const { user } = useAuth();
    const email = user?.email;
    const axiosSecure = useAxiosSecure();

    const { data: mealCount = { count: 0 }, isLoading: mealCountLoading } =
        useQuery({
            queryKey: ["mealCount", email],
            queryFn: async () =>
                (await axiosSecure.get(`/meals/count?email=${email}`)).data,
            enabled: !!email,
            staleTime: 5 * 60 * 1000,
        });

    const { data: deliveredCount = { count: 0 }, isLoading: deliveredLoading } =
        useQuery({
            queryKey: ["deliveredCount", email],
            queryFn: async () =>
                (await axiosSecure.get(`/meals/delivered?email=${email}`)).data,
            enabled: !!email,
            staleTime: 5 * 60 * 1000,
        });
console.log(deliveredCount);
    const {
        data: overview = {
            categoryDistribution: [],
            trendLast30: [],
            topMeals: [],
            recentActivity: [],
            users: { total: 0, bronze: 0, silver: 0, gold: 0, platinum: 0 },
            totals: { reviews: 0, upcomingMeals: 0, pendingRequests: 0 },
        },
        isLoading: overviewLoading,
    } = useQuery({
        queryKey: ["adminOverview", email],
        queryFn: async () =>
            (await axiosSecure.get(`/stats/admin/overview?email=${email}`)).data,
        enabled: !!email,
        staleTime: 5 * 60 * 1000,
    });

    const pendingCount = overview?.totals?.pendingRequests || 0;
    const totalUsers = overview?.users?.total || 0;
    const totalReviews = overview?.totals?.reviews || 0;

    const pieData = useMemo(
        () => [
            { name: "Total Meals", value: mealCount.count },
            { name: "Delivered", value: deliveredCount.count },
            { name: "Pending", value: pendingCount },
        ],
        [mealCount.count, deliveredCount.count, pendingCount]
    );

    const barData = useMemo(
        () => overview.categoryDistribution || [],
        [overview]
    );
    const lineData = useMemo(() => overview.trendLast30 || [], [overview]);

    if (mealCountLoading || deliveredLoading || overviewLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    // Filter out any invalid or empty recent activity entries
    const validRecentActivity = (overview.recentActivity || []).filter(item => item && item.mealTitle && item.userEmail);

    return (
        <div className="p-4 md:p-8 space-y-8 bg-base-200 min-h-screen transition-colors duration-300">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-base-300"
            >
                <div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-primary-content tracking-tight">
                        Admin Dashboard ✨
                    </h1>
                    <p className="text-base-content/70 mt-1">
                        Welcome back, <span className="font-semibold">{user?.displayName || user?.email}</span> 👋. Here's a quick look at your food service.
                    </p>
                </div>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <StatCard
                    icon={<FaUtensils />}
                    title="Meals Added"
                    value={mealCount.count}
                    accent="from-sky-500 to-blue-500"
                />
                <StatCard
                    icon={<FaCheckCircle />}
                    title="Delivered"
                    value={deliveredCount.count}
                    accent="from-emerald-500 to-green-500"
                />
                <StatCard
                    icon={<FaClock />}
                    title="Pending"
                    value={pendingCount}
                    accent="from-amber-500 to-yellow-500"
                />
                <StatCard
                    icon={<FaUsers />}
                    title="Total Users"
                    value={totalUsers}
                    accent="from-fuchsia-500 to-purple-500"
                />
                <StatCard
                    icon={<FaStar />}
                    title="Total Reviews"
                    value={totalReviews}
                    accent="from-rose-500 to-red-500"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <ChartCard
                    title="Meals Breakdown"
                    badge="Last 30 days"
                    icon={<FaChartBar />}
                >
                    <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={110}
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {pieData.map((_, i) => (
                                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                {/* Bar Chart: Category Distribution */}
                <ChartCard
                    title="Meals by Category"
                    badge="Live"
                    icon={<FaListAlt />}
                >
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" name="Meals" fill="#3B82F6" barSize={25} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            {/* Line Chart: Trends */}
            <ChartCard
                title="Activity Trend (30 days)"
                badge="Daily"
                icon={<FaChartBar />}
            >
                <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="added"
                            name="Added"
                            stroke="#3B82F6"
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="delivered"
                            name="Delivered"
                            stroke="#10B981"
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </ChartCard>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Meals */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="p-6 flex items-center justify-between border-b border-base-200">
                        <h2 className="text-xl font-semibold flex items-center gap-2 text-primary-content">
                            <FaCrown /> Top Meals
                        </h2>
                        <span className="badge badge-outline">Top 5</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="table table-pin-rows">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Title</th>
                                    <th>Likes</th>
                                    <th>Reviews</th>
                                    <th>Rating</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(overview.topMeals || []).map((m, idx) => (
                                    <motion.tr
                                        key={m._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                                        className="hover:bg-base-200 transition-colors"
                                    >
                                        <td>{idx + 1}</td>
                                        <td className="font-medium">{m.title}</td>
                                        <td>{m.likes}</td>
                                        <td>{m.reviews_count}</td>
                                        <td>{m.rating?.toFixed?.(1) ?? 0}</td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="p-6 flex items-center justify-between border-b border-base-200">
                        <h2 className="text-xl font-semibold flex items-center gap-2 text-primary-content">
                            <FaListAlt /> Recent Activity
                        </h2>
                        <span className="badge badge-outline">Last 10</span>
                    </div>
                    <ul className="divide-y divide-base-300">
                        {validRecentActivity.map((r) => (
                            <motion.li
                                key={r._id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3 }}
                                className="p-4 flex items-center justify-between hover:bg-base-200 transition-colors"
                            >
                                <div>
                                    <p className="font-medium text-base-content">{r.mealTitle}</p>
                                    <p className="text-sm text-base-content/70">{r.userEmail}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`badge badge-sm ${r.status === "delivered"
                                            ? "badge-success"
                                            : r.status === "pending"
                                                ? "badge-warning"
                                                : "badge-ghost"
                                            }`}
                                    >
                                        {r.status}
                                    </span>
                                    {r.deliveredAt ? (
                                        <span className="text-xs text-base-content/60 hidden sm:block">
                                            {new Date(r.deliveredAt).toLocaleDateString()}
                                        </span>
                                    ) : null}
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}