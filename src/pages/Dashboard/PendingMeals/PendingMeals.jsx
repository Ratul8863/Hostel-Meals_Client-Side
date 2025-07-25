import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { FaCheck } from "react-icons/fa";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const ITEMS_PER_PAGE = 10;

const RequestedMeals = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const axiosSecure = useAxiosSecure();

  // Fetch meals, refetch on search change
  const { isPending, data: meals = [], refetch } = useQuery({
    queryKey: ["requested-meals", search],
    queryFn: async () => {
      const res = await axiosSecure.get(`/meals/request?search=${search}`);
      return res.data;
    },
  });

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const handleServe = async (id, currentStatus) => {
    if (currentStatus === "delivered") return;

    const confirm = await Swal.fire({
      title: "Mark as Delivered?",
      text: "This will mark the meal as delivered.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Serve",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axiosSecure.patch(`/meals/${id}/status`, {
        status: "delivered",
      });
      await refetch();
      Swal.fire("Success", "Meal marked as delivered.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update meal status", "error");
    }
  };

  // Sort meals: pending (not delivered) first
  const sortedMeals = [...meals].sort((a, b) => {
    if (a.status === b.status) return 0;
    if (a.status === "delivered") return 1; // delivered goes last
    return -1; // pending or other status goes first
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedMeals.length / ITEMS_PER_PAGE);

  // Slice for current page
  const paginatedMeals = sortedMeals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Requested Meals</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="input input-bordered w-full max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isPending ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Meal Title</th>
                <th>User Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Serve</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMeals.length > 0 ? (
                paginatedMeals.map((meal) => (
                  <tr key={meal._id}>
                    <td>{meal.mealTitle}</td>
                    <td>{meal.userName}</td>
                    <td>{meal.userEmail}</td>
                    <td>
                      <span
                        className={`badge ${
                          meal.status === "delivered"
                            ? "badge-success"
                            : "badge-warning"
                        }`}
                      >
                        {meal.status}
                      </span>
                    </td>
                    <td>
                      {meal.status !== "delivered" && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleServe(meal._id, meal.status)}
                        >
                          <FaCheck /> Serve
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4">
                    No meals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              <button
                className="btn btn-sm"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`btn btn-sm ${
                    currentPage === i + 1 ? "btn-active" : ""
                  }`}
                  onClick={() => goToPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="btn btn-sm"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
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

export default RequestedMeals;
