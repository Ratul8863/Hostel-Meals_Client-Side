import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FaSearch, FaUserShield, FaUserTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../hooks/useAxiosSecure";

const ITEMS_PER_PAGE = 10;

const MakeAdmin = () => {
    const axiosSecure = useAxiosSecure();
    const [emailQuery, setEmailQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const {
        data: users = [],
        refetch,
        isFetching,
    } = useQuery({
        queryKey: ["searchedUsers", emailQuery],
        queryFn: async () => {
            const res = await axiosSecure.get(
                emailQuery
                    ? `/users/search?email=${emailQuery}`
                    : `/users`
            );
            setCurrentPage(1); // Reset to first page on search
            return res.data;
        },
    });

    const { mutateAsync: updateRole } = useMutation({
        mutationFn: async ({ id, role }) =>
            await axiosSecure.patch(`/users/${id}/role`, { role }),
        onSuccess: () => refetch(),
    });

    const handleRoleChange = async (id, currentRole) => {
        const action = currentRole === "admin" ? "Remove admin" : "Make admin";
        const newRole = currentRole === "admin" ? "user" : "admin";

        const confirm = await Swal.fire({
            title: `${action}?`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "Cancel",
        });

        if (!confirm.isConfirmed) return;

        try {
            await updateRole({ id, role: newRole });
            Swal.fire("Success", `${action} successful`, "success");
        } catch (error) {
            Swal.fire("Error", "Failed to update user role", "error");
        }
    };

    // Pagination logic
    const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
    const paginatedUsers = users.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Make Admin</h2>

            <div className="flex gap-2 mb-6 items-center">
                <FaSearch />
                <input
                    type="text"
                    className="input input-bordered w-full max-w-md"
                    placeholder="Search user by email"
                    value={emailQuery}
                    onChange={(e) => setEmailQuery(e.target.value)}
                />
            </div>

            {isFetching && <p>Loading users...</p>}

            {!isFetching && users.length === 0 && emailQuery && (
                <p className="text-gray-500">No users found.</p>
            )}

            {!isFetching && paginatedUsers.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="table w-full table-zebra">
                        <thead>
                            <tr>
                                <th>Email</th>
                                <th>Name</th>
                                <th>Subscription</th>
                                <th>Created At</th>
                                <th>Role</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.map((u) => (
                                <tr key={u._id}>
                                    <td>{u.email}</td>
                                    <td>{u.name}</td>
                                    <td>
                                        <span className="badge badge-outline">
                                            {u.membership || "free"}
                                        </span>
                                    </td>
                                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <span
                                            className={`badge ${u.role === "admin" ? "badge-success" : "badge-ghost"}`}
                                        >
                                            {u.role || "user"}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            onClick={() => handleRoleChange(u._id, u.role || "user")}
                                            className={`btn btn-sm text-black ${u.role === "admin" ? "btn-error" : "btn-primary"}`}
                                        >
                                            {u.role === "admin" ? (
                                                <>
                                                    <FaUserTimes className="mr-1" />
                                                    Remove Admin
                                                </>
                                            ) : (
                                                <>
                                                    <FaUserShield className="mr-1" />
                                                    Make Admin
                                                </>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Footer */}
                    <div className="flex justify-center mt-4 gap-2">
                        <button
                            className="btn btn-sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                        >
                            Previous
                        </button>

                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                className={`btn btn-sm ${currentPage === i + 1 ? "btn-active" : ""}`}
                                onClick={() => setCurrentPage(i + 1)}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button
                            className="btn btn-sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MakeAdmin;
