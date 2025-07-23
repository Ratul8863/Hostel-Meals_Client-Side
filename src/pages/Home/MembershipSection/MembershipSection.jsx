import React from 'react';
import { useNavigate } from 'react-router';

const MembershipSection = () => {
  const navigate = useNavigate();

  const packages = [
    { name: 'silver', price: 9.99 },
    { name: 'gold', price: 19.99 },
    { name: 'platinum', price: 29.99 },
  ];

  return (
    <div className="py-10 max-w-6xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-6">Upgrade Your Membership</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <div
            key={pkg.name}
            className="card bg-base-100 shadow-xl p-6 cursor-pointer hover:scale-105 transition"
            onClick={() => navigate(`/checkout/${pkg.name}`)}
          >
            <h3 className="text-xl font-bold capitalize">{pkg.name} Package</h3>
            <p className="my-4 font-semibold">${pkg.price}</p>
            <button className="btn btn-primary">Choose {pkg.name}</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembershipSection;
