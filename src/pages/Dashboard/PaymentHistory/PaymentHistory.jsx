import React, { useState } from 'react';
import useAuth from '../../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const formatDate = (iso) => new Date(iso).toLocaleString();

const ITEMS_PER_PAGE = 10;

const PaymentHistory = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [currentPage, setCurrentPage] = useState(1);

  const { isPending, data: payments = [] } = useQuery({
    queryKey: ['payments', user.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/payments?email=${user.email}`);
      return res.data;
    }
  });

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

  if (isPending) return '...loading';

  return (
    <div className="overflow-x-auto shadow-md rounded-xl px-2 md:px-4 pb-10">
      <h2 className="text-xl font-bold mb-4 text-center">💳 Payment History</h2>

      <table className="table table-zebra w-full">
        <thead className="bg-base-200 text-base font-semibold">
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Amount</th>
            <th>Transaction</th>
            <th>Paid At</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((p, index) => (
              <tr key={p.transactionId}>
                <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                <td title={p.packageName} className="truncate max-w-[120px]">{p.packageName}</td>
                <td className="font-semibold text-green-500">৳{p.amount}</td>
                <td className="font-mono text-sm truncate max-w-[140px]">
                  <span title={p.transactionId}>{p.transactionId.slice(0, 12)}...</span>
                </td>
                <td className="whitespace-nowrap">{formatDate(p.paid_at_string)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-gray-500 py-6">
                No payment history found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
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
  );
};

export default PaymentHistory;
