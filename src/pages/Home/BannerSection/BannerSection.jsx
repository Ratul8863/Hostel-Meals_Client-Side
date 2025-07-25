import React from 'react';

const BannerSection = () => {
  return (
    // The main hero section with a background image, full height, and dark overlay for text readability.
    // The background image is a placeholder and should be replaced with a high-quality relevant image.
    <div
      className="relative min-h-[80vh] flex items-center justify-center text-white p-4 overflow-hidden"
      style={{
        backgroundImage: 'url("https://placehold.co/1920x1080/000000/FFFFFF/png?text=Delicious+Hostel+Meals")', // Placeholder image
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Adds a parallax-like effect
      }}
    >
      {/* Dark overlay for better text contrast, similar to QUENX's hero section */}
      <div className="absolute inset-0 bg-black opacity-60"></div>

      {/* Hero content, centered and z-indexed above the overlay */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto px-4">
        {/* Main heading: large, bold, and attention-grabbing, similar to QUENX's "WALKING WITH PURPOSE." */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 leading-tight tracking-tight drop-shadow-lg">
          Welcome to Hostel Meals
        </h1>

        {/* Short description: clear and concise, providing context */}
        <p className="mb-8 text-lg md:text-xl max-w-2xl text-gray-200 drop-shadow-md">
          Find, review, and request your favorite hostel meals easily. Make your campus life delicious and hassle-free.
        </p>

        {/* Search input field and button */}
        <div className="flex flex-col sm:flex-row w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
          <input
            type="text"
            placeholder="Search for your next delicious meal..."
            className="flex-grow p-4 text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-light rounded-l-xl sm:rounded-l-xl sm:rounded-r-none transition-all duration-200"
            // The input is designed to be sleek, with focus ring for better UX
          />
          <button
            className="w-full sm:w-auto px-8 py-4 bg-gray-800 text-white font-semibold rounded-r-xl sm:rounded-r-xl sm:rounded-l-none hover:bg-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-700"
            // Button styling matches the "Join Us" button for consistency with the QUENX theme
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerSection;
