import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { Link } from 'react-router';

const Footer = () => {
  return (
    <footer className="bg-[#0D1128] text-white px-6 pt-12 pb-6 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-lime-400">MealMagic</h2>
          <p className="mt-3 text-sm text-gray-400">
            Discover the taste of freshness. Plan your meals, get recommendations, and share reviews!
          </p>
          <div className="flex gap-4 mt-4">
            <a href="#" className="hover:text-lime-400"><FaFacebookF /></a>
            <a href="#" className="hover:text-lime-400"><FaInstagram /></a>
            <a href="#" className="hover:text-lime-400"><FaLinkedinIn /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-lime-300">Quick Links</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/" className="hover:text-lime-400">Home</Link></li>
            <li><Link to="/meals" className="hover:text-lime-400">Meals</Link></li>
            <li><Link to="/dashboard" className="hover:text-lime-400">Dashboard</Link></li>
            <li><Link to="/contact" className="hover:text-lime-400">Contact</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-lime-300">Popular Categories</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link to="/meals?category=Breakfast" className="hover:text-lime-400">Breakfast</Link></li>
            <li><Link to="/meals?category=Lunch" className="hover:text-lime-400">Lunch</Link></li>
            <li><Link to="/meals?category=Dinner" className="hover:text-lime-400">Dinner</Link></li>
            <li><Link to="/meals?category=Snacks" className="hover:text-lime-400">Snacks</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-lime-300">Newsletter</h3>
          <p className="text-sm text-gray-400 mb-4">Subscribe to get our latest updates and meal offers.</p>
          <form className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Your email"
              className="px-3 py-2 rounded bg-[#1c1f3b] text-white focus:outline-none focus:ring-2 focus:ring-lime-400"
            />
            <button
              type="submit"
              className="bg-lime-500 hover:bg-lime-600 text-black font-semibold py-2 rounded"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="text-center text-gray-500 mt-10 text-sm border-t border-gray-700 pt-4">
        &copy; {new Date().getFullYear()} MealMagic. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
