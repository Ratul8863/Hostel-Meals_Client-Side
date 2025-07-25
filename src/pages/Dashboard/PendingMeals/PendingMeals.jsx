import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content"; // Import for custom Swal styling
import { FaSearch, FaCheck, FaUtensils, FaUserCircle, FaEnvelope, FaClipboardList } from "react-icons/fa"; // Icons for search, check, table headers
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const MySwal = withReactContent(Swal); // Initialize SweetAlert with React content
const ITEMS_PER_PAGE = 8; // Consistent items per page

const RequestedMeals = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); // For debounced search
  const [currentPage, setCurrentPage] = useState(1);
  const axiosSecure = useAxiosSecure();

  // Debounce the search input to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // Reset to first page on new search query
    }, 500); // 500ms debounce
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch requested meals, refetch on debounced search change
  const { isPending, data: meals = [], isError, error, refetch } = useQuery({
    queryKey: ["requested-meals", debouncedSearch],
    queryFn: async () => {
      const res = await axiosSecure.get(`/meals/request?search=${debouncedSearch}`);
      return res.data;
    },
  });

  const handleServe = async (id, currentStatus, mealTitle, userName) => {
    if (currentStatus === "delivered") return; // Prevent serving already delivered meals

    const confirmResult = await MySwal.fire({
      title: `Mark "${mealTitle}" as Delivered?`,
      text: `Are you sure you want to mark this meal for ${userName} as delivered?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Serve It!",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: 'bg-primary-dark text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors duration-200',
        cancelButton: 'bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200',
      },
      buttonsStyling: false, // Disable default SweetAlert styling
    });

    if (!confirmResult.isConfirmed) return;

    try {
      await axiosSecure.patch(`/meals/${id}/status`, {
        status: "delivered",
      });
      await refetch(); // Refetch data to update the table
      MySwal.fire({
        icon: "success",
        title: "Success!",
        text: "Meal marked as delivered.",
        customClass: {
          confirmButton: 'bg-primary-dark text-white px-6 py-2 rounded-lg hover:bg-primary-light transition-colors duration-200',
        },
        buttonsStyling: false,
      });
    } catch (err) {
      console.error("Error updating meal status:", err);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update meal status. Please try again.",
        customClass: {
          confirmButton: 'bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200',
        },
        buttonsStyling: false,
      });
    }
  };

  // Sort meals: pending (not delivered) first
  // This sort is done client-side as per previous instructions to avoid needing backend indexes for sorting.
  const sortedMeals = [...meals].sort((a, b) => {
    if (a.status === "delivered" && b.status !== "delivered") return 1; // Delivered goes last
    if (a.status !== "delivered" && b.status === "delivered") return -1; // Pending goes first
    return 0; // Maintain original order for same status
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
    <div className="py-2 max-w-7xl mx-auto px-4"> {/* Consistent padding and max-width */}
      <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-gray-800">
        Manage Requested Meals
      </h2>

      {/* Search Input */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100 flex items-center gap-4">
        <FaSearch className="text-gray-500 text-xl" />
        <input
          type="text"
          placeholder="Search by meal title, user name, or email..."
          className="flex-grow px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light text-gray-800 transition-colors duration-200"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Loading, Error, and Empty States */}
      {isPending ? (
        <p className="text-center text-gray-600 text-xl py-10">Loading requested meals...</p>
      ) : isError ? (
        <p className="text-center text-red-600 text-xl py-10">Error loading requested meals: {error.message}</p>
      ) : sortedMeals.length === 0 && debouncedSearch ? (
        <p className="text-center text-gray-600 text-xl py-10">No requested meals found matching "{debouncedSearch}".</p>
      ) : sortedMeals.length === 0 && !debouncedSearch ? (
        <p className="text-center text-gray-600 text-xl py-10">No meal requests to display at the moment.</p>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-6 md:p-8"> {/* Polished card container for the table */}
          <div className="overflow-x-auto"> {/* Ensures table is scrollable on small screens */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="flex items-center gap-2"><FaUtensils /> Meal Title</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="flex items-center gap-2"><FaUserCircle /> User Name</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="flex items-center gap-2"><FaEnvelope /> User Email</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedMeals.map((meal, index) => (
                  <tr key={meal._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {meal.mealTitle || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {meal.userName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {meal.userEmail || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize
                          ${meal.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                          }`}
                      >
                        {meal.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {meal.status !== "delivered" ? (
                        <button
                          className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 bg-primary-dark  hover:bg-primary-light"
                          onClick={() => handleServe(meal._id, meal.status, meal.mealTitle, meal.userName)}
                          title="Mark as Delivered"
                        >
                          <FaCheck className="mr-2" /> Serve
                        </button>
                      ) : (
                        <span className="inline-flex items-center px-4 py-2 rounded-lg font-semibold text-sm text-gray-500 bg-gray-100 cursor-not-allowed">
                          Delivered
                        </span>
                      )}
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
                onClick={() => goToPage(currentPage - 1)}
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
                  onClick={() => goToPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
