import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import useAuth from '../../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { FaMoneyBillWave, FaCalendarAlt, FaCreditCard, FaClipboard, FaEye } from 'react-icons/fa';

// Helper function to format date/time
const formatDate = (iso) => {
  if (!iso) return 'N/A';
  try {
    const date = new Date(iso);
    // Check if the date is valid before formatting
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    // console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

const ITEMS_PER_PAGE = 8; // Consistent items per page

const PaymentHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedId, setExpandedId] = useState(null); // State to toggle full transaction ID display
  const [copied, setCopied] = useState(false); // State for copy feedback
  const popoverRef = useRef(null); // Ref for the popover element

  // Effect to handle clicks outside the popover
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setExpandedId(null); // Close the popover
      }
    };

    if (expandedId) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup the event listener on component unmount or when expandedId becomes null
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedId]); // Re-run effect when expandedId changes

  const { isPending, data: payments = [], isError, error } = useQuery({
    queryKey: ['payments', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const res = await axiosSecure.get(`/payments?email=${user.email}`);
      // Sort payments by paid_at_string (most recent first)
      return res.data.sort((a, b) => new Date(b.paid_at_string) - new Date(a.paid_at_string));
    },
    enabled: !!user?.email && !authLoading,
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
    // console.error("Error fetching payments:", error);
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

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setExpandedId(null); // Close popover after copying
    }, 1500);
  };

  return (
    <div className="py-16 max-w-7xl mx-auto px-4">
      <h2 className="text-4xl md:text-5xl font-extrabold mb-12 text-center text-gray-800">
        Your Payment History
      </h2>
      <p className="text-center text-lg md:text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
        Review all your past transactions and membership upgrades here.
      </p>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 p-6 md:p-8">
        <div className="overflow-x-auto">
          {paginatedData.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
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
                  <tr key={p.transactionId} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                      {p.packageName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      ${p.amount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700 relative">
                      {p.transactionId ? (
                        <div
                          className="cursor-pointer text-blue-600 hover:underline flex items-center gap-1"
                          onClick={() => setExpandedId(p.transactionId === expandedId ? null : p.transactionId)}
                        >
                          <span>{p.transactionId.slice(0, 10)}...</span>
                          <FaEye className="text-xs text-gray-500" />
                        </div>
                      ) : 'N/A'}

                      {expandedId === p.transactionId && (
                        <div
                          ref={popoverRef} // Attach ref to the popover div
                          className="absolute -top-1 mt-2 left-1/2 -translate-x-1/2 z-10 bg-white shadow-xl border border-gray-200 rounded-lg p-3 w-64 md:w-72 text-center"
                        >
                          <p className="text-xs font-mono break-all text-gray-800 mb-2">{p.transactionId}</p>
                          <button
                            onClick={() => handleCopy(p.transactionId)}
                            className="text-xs text-blue-600 hover:underline focus:outline-none inline-flex items-center gap-1"
                          >
                            {copied ? 'Copied!' : <><FaClipboard className="mr-1" /> Copy ID</>}
                          </button>
                        </div>
                      )}
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
                    ? "bg-gray-800 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
