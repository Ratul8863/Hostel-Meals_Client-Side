import React from 'react';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { Link } from 'react-router'; // Changed to react-router-dom for consistency
// import ProFastLogo from './ProFastLogo'; // Assuming you have a ProFastLogo component for your brand

const Footer = () => {
  return (
    // Footer section with a consistent dark background and ample padding
    <footer className="bg-gray-900 text-white px-4 pt-16 pb-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"> {/* Adjusted gap and grid for larger spacing */}
        {/* Brand/About Section */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          {/* You can replace this h2 with your ProFastLogo component if available */}
          <h2 className="text-3xl font-extrabold text-white mb-4">Hostel Meals</h2> 
          {/* <ProFastLogo className="text-white h-10 mb-4" /> */} {/* Example if you have a logo component */}
          <p className="mt-3 text-base text-gray-400 leading-relaxed">
            Discover the taste of freshness. Plan your meals, get recommendations, and share reviews! Your ultimate hostel meal companion.
          </p>
          <div className="flex gap-4 mt-6"> {/* Increased gap for social icons */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors duration-200 text-xl" // Polished icon style
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors duration-200 text-xl" // Polished icon style
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors duration-200 text-xl" // Polished icon style
              aria-label="LinkedIn"
            >
              <FaLinkedinIn />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="text-center md:text-left">
          <h3 className="text-xl font-semibold mb-6 text-white">Quick Links</h3> {/* Consistent heading style */}
          <ul className="space-y-3 text-base text-gray-400"> {/* Increased space-y for better readability */}
            <li><Link onClick={() => window.scrollTo(0, 0)} to="/" className="hover:text-white transition-colors duration-200">Home</Link></li>
            <li><Link onClick={() => window.scrollTo(0, 0)} to="/meals" className="hover:text-white transition-colors duration-200">Meals</Link></li>
            <li><Link onClick={() => window.scrollTo(0, 0)} to="/UpcomingMealsUser" className="hover:text-white transition-colors duration-200">Upcoming Meals</Link></li>
            <li><Link onClick={() => window.scrollTo(0, 0)} to="/dashboard" className="hover:text-white transition-colors duration-200">Dashboard</Link></li>
            <li><Link onClick={() => window.scrollTo(0, 0)} to="/about-us" className="hover:text-white transition-colors duration-200">About Us</Link></li> {/* Added a generic About Us link */}
          </ul>
        </div>

        {/* Categories */}
        <div className="text-center md:text-left">
          <h3 className="text-xl font-semibold mb-6 text-white">Popular Categories</h3> {/* Consistent heading style */}
          <ul className="space-y-3 text-base text-gray-400"> {/* Increased space-y */}
            <li><Link onClick={() => window.scrollTo(0, 0)} to="/meals?category=breakfast" className="hover:text-white transition-colors duration-200">Breakfast</Link></li>
            <li><Link onClick={() => window.scrollTo(0, 0)} to="/meals?category=lunch" className="hover:text-white transition-colors duration-200">Lunch</Link></li>
            <li><Link onClick={() => window.scrollTo(0, 0)} to="/meals?category=dinner" className="hover:text-white transition-colors duration-200">Dinner</Link></li>
            {/* <li><Link onClick={() => window.scrollTo(0, 0)} to="/meals?category=snacks" className="hover:text-white transition-colors duration-200">Snacks</Link></li> */}
          </ul>
        </div>

        {/* Newsletter */}
        <div className="text-center md:text-left">
          <h3 className="text-xl font-semibold mb-6 text-white">Stay Connected</h3> {/* More inviting heading */}
          <p className="text-base text-gray-400 mb-6">Subscribe to our newsletter for the latest meal updates, exclusive offers, and more!</p>
          <form className="flex flex-col gap-4"> {/* Increased gap for form elements */}
            <input
              type="email"
              placeholder="Your email address"
              className="px-5 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-light border border-gray-700 transition-colors duration-200" // Polished input style
            />
            <button
              type="submit"
              className="w-full px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors duration-200 text-lg border border-gray-700" // Button style consistent with other CTAs
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="text-center text-gray-500 mt-16 text-sm border-t border-gray-800 pt-8"> {/* Increased mt and pt */}
        &copy; {new Date().getFullYear()} MealMagic. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
