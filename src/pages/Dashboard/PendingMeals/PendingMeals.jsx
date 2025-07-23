import { useState } from "react";
import Swal from "sweetalert2";
import { FaCheck } from "react-icons/fa";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useQuery } from "@tanstack/react-query";

const RequestedMeals = () => {
  const [search, setSearch] = useState("");
  const axiosSecure = useAxiosSecure();

  const { isPending, data: meals = [], refetch } = useQuery({
    queryKey: ["requested-meals", search],
    queryFn: async () => {
      const res = await axiosSecure.get(`/meals/request?search=${search}`);
      return res.data;
    },
  });

  const handleServe = async (id) => {
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
              {meals.map((meal) => (
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
                        onClick={() => handleServe(meal._id)}
                      >
                        <FaCheck /> Serve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {meals.length === 0 && <p className="text-center mt-4">No meals found.</p>}
        </div>
      )}
    </div>
  );
};

export default RequestedMeals;
