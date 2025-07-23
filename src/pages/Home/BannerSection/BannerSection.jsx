import React from 'react';

const BannerSection = () => {
  return (
    <div className="hero min-h-[80vh] bg-gradient-to-r from-[#0D1128] to-[#1c1f3b] text-white">
      <div className="hero-content flex-col text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Welcome to Hostel Meals
        </h1>
        <p className="mb-6 max-w-xl">
          Find, review, and request your favorite hostel meals easily. Make your campus life delicious and hassle-free.
        </p>
        <div className="flex justify-center">
          <input
            type="text"
            placeholder="Search meals..."
            className="input input-bordered rounded-l-md w-60 md:w-80 text-black"
          />
          <button className="btn btn-primary rounded-r-md">
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerSection;
