import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  FaSearch,
  FaCheck,
  FaUtensils,
  FaUserCircle,
  FaEnvelope,
} from "react-icons/fa";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const MySwal = withReactContent(Swal);
const ITEMS_PER_PAGE = 10;

const RequestedMeals = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const {
    isPending,
    data: meals = [],
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["requested-meals", debouncedSearch],
    queryFn: async () => {
      const res = await axiosSecure.get(
        `/meals/request?search=${debouncedSearch}`
      );
      return res.data;
    },
  });

  const handleServe = async (id, currentStatus, mealTitle, userName) => {
    if (currentStatus === "delivered") return;

    const confirmResult = await MySwal.fire({
      title: `Mark "${mealTitle}" as Delivered?`,
      text: `Are you sure you want to mark this meal for ${userName} as delivered?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Serve It!",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton:
          "bg-gray-800 dark:bg-gray-700 cursor-pointer text-white px-6 mr-4 py-2 rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors duration-200",
        cancelButton:
          "bg-gray-200 dark:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-200 px-6 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200",
      },
      buttonsStyling: false,
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await axiosSecure.patch(`/meals/${id}/status`, { status: "delivered" });
      await refetch();
      MySwal.fire({
        icon: "success",
        title: "Success!",
        text: "Meal marked as delivered.",
        customClass: {
          confirmButton:
            "bg-gray-800 dark:bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors duration-200",
        },
        buttonsStyling: false,
      });
    } catch (err) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update meal status. Please try again.",
        customClass: {
          confirmButton:
            "bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200",
        },
        buttonsStyling: false,
      });
    }
  };

  const sortedMeals = [...meals].sort((a, b) => {
    if (a.status === "delivered" && b.status !== "delivered") return 1;
    if (a.status !== "delivered" && b.status === "delivered") return -1;
    return 0;
  });

  const totalPages = Math.ceil(sortedMeals.length / ITEMS_PER_PAGE);

  const paginatedMeals = sortedMeals.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div className="py-2 max-w-7xl mx-auto px-4 text-gray-900 dark:text-white">
      <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center">
        Manage Requested Meals
      </h2>

      {/* Search Input */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 mb-8 border border-gray-200 dark:border-gray-700 flex items-center gap-4">
        <FaSearch className="text-gray-500 dark:text-gray-400 text-xl" />
        <input
          type="text"
          placeholder="Search by meal title, user name, or email..."
          className="flex-grow px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loading, Error, Empty States */}
      {isPending ? (
        <p className="text-center text-gray-600 dark:text-gray-400 text-xl py-10">
          Loading requested meals...
        </p>
      ) : isError ? (
        <p className="text-center text-red-600 text-xl py-10">
          Error loading requested meals: {error.message}
        </p>
      ) : sortedMeals.length === 0 && debouncedSearch ? (
        <p className="text-center text-gray-600 dark:text-gray-400 text-xl py-10">
          No requested meals found matching "{debouncedSearch}".
        </p>
      ) : sortedMeals.length === 0 && !debouncedSearch ? (
        <p className="text-center text-gray-600 dark:text-gray-400 text-xl py-10">
          No meal requests to display at the moment.
        </p>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 p-6 md:p-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <span className="flex items-center gap-2">
                      <FaUtensils /> Meal Title
                    </span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <span className="flex items-center gap-2">
                      <FaUserCircle /> User Name
                    </span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <span className="flex items-center gap-2">
                      <FaEnvelope /> User Email
                    </span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedMeals.map((meal, index) => (
                  <tr
                    key={meal._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {meal.mealTitle || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {meal.userName || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {meal.userEmail || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          meal.status === "delivered"
                            ? "bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200"
                            : "bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200"
                        }`}
                      >
                        {meal.status || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {meal.status !== "delivered" ? (
                        <button
                          className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-900 dark:hover:bg-gray-600"
                          onClick={() =>
                            handleServe(
                              meal._id,
                              meal.status,
                              meal.mealTitle,
                              meal.userName
                            )
                          }
                        >
                          <FaCheck className="mr-2" /> Serve
                        </button>
                      ) : (
                        <span className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 cursor-not-allowed">
                          Delivered
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <button
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    currentPage === i + 1
                      ? "bg-gray-800 dark:bg-gray-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                  onClick={() => goToPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
