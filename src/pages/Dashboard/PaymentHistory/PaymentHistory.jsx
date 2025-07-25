import React, { useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { FaMoneyBillWave, FaCalendarAlt, FaCreditCard } from 'react-icons/fa'; // Icons for table headers

// Helper function to format date/time
const formatDate = (iso) => {
  if (!iso) return 'N/A';
  try {
    return new Date(iso).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

const ITEMS_PER_PAGE = 8; // Slightly increased items per page for a fuller view

const PaymentHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [currentPage, setCurrentPage] = useState(1);

  const { isPending, data: payments = [], isError, error } = useQuery({
    queryKey: ['payments', user?.email], // Ensure queryKey depends on user.email
    queryFn: async () => {
      if (!user?.email) return []; // Don't fetch if user email is not available
      const res = await axiosSecure.get(`/payments?email=${user.email}`);
      // Assuming payments are sorted by date on the server or can be sorted here if needed
      return res.data;
    },
    enabled: !!user?.email && !authLoading, // Only fetch if user email is available and auth is not loading
  });

  // Handle loading states
  if (authLoading || isPending) {
    return (
      <div className="flex justify-center items-center py-16">
        <p className="text-xl text-gray-700">Loading payment history...</p>
      </div>
    );
  }

  // Handle error states
  if (isError) {
    console.error("Error fetching payments:", error);
    return (
      <div className="flex justify-center items-center py-16">
        <p className="text-xl text-red-600">Failed to load payment history. Please try again later.</p>
      </div>
    );
  }

  const totalPages = Math.ceil(payments.length / ITEMS_PER_PAGE);
  const paginatedData = payments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4"> {/* Consistent padding and max-width */}
      <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-gray-800">
        Your Payment History
      </h2>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-6 md:p-8"> {/* Polished card container for the table */}
        <div className="overflow-x-auto"> {/* Ensures table is scrollable on small screens */}
          {paginatedData.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200"> {/* Full width table */}
              <thead className="bg-gray-50"> {/* Lighter header background */}
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
                    #
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="flex items-center gap-2"><FaMoneyBillWave /> Package</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="flex items-center gap-2"><FaMoneyBillWave /> Amount</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="flex items-center gap-2"><FaCreditCard /> Transaction ID</span>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
                    <span className="flex items-center gap-2"><FaCalendarAlt /> Paid At</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((p, index) => (
                  <tr key={p.transactionId} className="hover:bg-gray-50 transition-colors duration-150"> {/* Subtle hover effect */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                      {p.packageName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600"> {/* Stronger green for amount */}
                      ${p.amount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                      <span title={p.transactionId}>{p.transactionId ? `${p.transactionId.slice(0, 10)}...` : 'N/A'}</span> {/* Shorter slice for better fit */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(p.paid_at_string)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-10 text-gray-600 text-lg">
              No payment history found yet.
              <p className="mt-2">Upgrade your membership to see your transactions here!</p>
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages >= 1 && (
          <div className="flex justify-center items-center mt-8 space-x-2">
            <button
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200
                  ${currentPage === i + 1
                    ? "bg-gray-800 text-white shadow-md" // Active button style
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200" // Inactive button style
                  }`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistory;
