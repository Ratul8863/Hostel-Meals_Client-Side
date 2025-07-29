import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FaSearch, FaUserShield, FaUserTimes, FaCalendarAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const ITEMS_PER_PAGE = 10;

const MakeAdmin = () => {
    const axiosSecure = useAxiosSecure();
    const [searchEmail, setSearchEmail] = useState("");
    const [debouncedEmailQuery, setDebouncedEmailQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [updatingUserId, setUpdatingUserId] = useState(null); // New state to track the user ID being updated

    // Debounce the search input to avoid excessive API calls
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedEmailQuery(searchEmail);
            setCurrentPage(1); // Reset to first page on new search query
        }, 500);
        return () => clearTimeout(handler);
    }, [searchEmail]);

    const {
        data: users = [],
        refetch,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["allUsers", debouncedEmailQuery],
        queryFn: async () => {
            const res = await axiosSecure.get(
                debouncedEmailQuery
                    ? `/users/search?q=${debouncedEmailQuery}`
                    : `/users`
            );
            return res.data;
        },
    });

    const { mutateAsync: updateRole } = useMutation({
        mutationFn: async ({ id, role }) =>
            await axiosSecure.patch(`/users/${id}/role`, { role }),
        onSuccess: () => {
            refetch();
            Swal.fire("Success", `User role updated successfully!`, "success");
        },
        onError: (mutationError) => {
            console.error("Failed to update user role:", mutationError);
            Swal.fire("Error", "Failed to update user role. Please try again.", "error");
        },
        onSettled: () => {
            setUpdatingUserId(null); // Clear the updating user ID regardless of success or failure
        }
    });

    const handleRoleChange = async (id, currentRole, userName) => {
        const action = currentRole === "admin" ? "Remove Admin" : "Make Admin";
        const newRole = currentRole === "admin" ? "user" : "admin";

        const confirmResult = await Swal.fire({
            title: `${action} for ${userName || 'this user'}?`,
            text: `Are you sure you want to ${action.toLowerCase()}? This action cannot be undone.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, do it!",
            cancelButtonText: "Cancel",
            customClass: {
                confirmButton: 'bg-red-600 cursor-pointer text-white px-6 mr-4 py-2 rounded-lg hover:bg-primary-light transition-colors duration-200',
                cancelButton: 'bg-gray-300 cursor-pointer text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200',
            },
            buttonsStyling: false,
        });

        if (!confirmResult.isConfirmed) return;

        try {
            setUpdatingUserId(id); // Set the ID of the user being updated
            await updateRole({ id, role: newRole });
        } catch (error) {
            // Error handling is done in the mutation's onError callback
        }
    };

    // Pagination logic
    const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
    const paginatedUsers = users.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="py-2 max-w-7xl mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-gray-800">
                Manage Users
            </h2>

            {/* Search Input */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100 flex items-center gap-4">
                <FaSearch className="text-gray-500 text-xl" />
                <input
                    type="text"
                    className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200"
                    placeholder="Search users by email or name..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                />
            </div>

            {/* Loading, Error, and Empty States */}
            {isLoading ? (
                <p className="text-center text-gray-600 text-xl py-10">Loading users...</p>
            ) : isError ? (
                <p className="text-center text-red-600 text-xl py-10">Failed to load users: {error.message}</p>
            ) : users.length === 0 && debouncedEmailQuery ? (
                <p className="text-center text-gray-600 text-xl py-10">No users found matching "{debouncedEmailQuery}".</p>
            ) : users.length === 0 && !debouncedEmailQuery ? (
                <p className="text-center text-gray-600 text-xl py-10">No users to display.</p>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-6 md:p-8">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                                        #
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Subscription
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <span className="flex items-center gap-2"><FaCalendarAlt /> Joined On</span>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {paginatedUsers.map((u, index) => (
                                    <tr key={u._id} className="hover:bg-gray-50 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                            {u.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {u.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                                                ${u.membership === 'silver' ? 'bg-gray-200 text-gray-700' :
                                                  u.membership === 'gold' ? 'bg-yellow-100 text-yellow-700' :
                                                  u.membership === 'platinum' ? 'bg-blue-100 text-blue-700' :
                                                  'bg-gray-100 text-gray-500'
                                                }`}
                                            >
                                                {u.membership || "Bronze"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                                                    ${u.role === "admin" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}
                                                `}
                                            >
                                                {u.role || "user"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleRoleChange(u._id, u.role || "user", u.name || u.email)}
                                                className={`inline-flex items-center cursor-pointer px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200
                                                    ${u.role === "admin"
                                                        ? "bg-red-600 text-white hover:bg-red-700"
                                                        : "bg-gray-800 text-white hover:bg-gray-900"
                                                    }`}
                                                disabled={updatingUserId === u._id} // Disable only the current updating button
                                            >
                                                {updatingUserId === u._id ? 'Updating...' : (u.role === "admin" ? (
                                                    <>
                                                        <FaUserTimes className="mr-2" />
                                                        Remove Admin
                                                    </>
                                                ) : (
                                                    <>
                                                        <FaUserShield className="mr-2" />
                                                        Make Admin
                                                    </>
                                                ))}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages >= 1 && (
                        <div className="flex justify-center items-center mt-8 space-x-2">
                            <button
                                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((prev) => prev - 1)}
                            >
                                Previous
                            </button>

                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200
                                        ${currentPage === i + 1
                                            ? "bg-gray-800 text-white shadow-md"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                    onClick={() => setCurrentPage(i + 1)}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((prev) => prev + 1)}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MakeAdmin;
