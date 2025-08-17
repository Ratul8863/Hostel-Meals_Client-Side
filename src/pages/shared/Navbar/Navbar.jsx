import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import ProFastLogo from "../ProFastLogo/ProFastLogo";
import useAuth from "../../../hooks/useAuth";
import { FaBell } from "react-icons/fa";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";

const Navbar = () => {
  const { user, logOut, theme, setTheme } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Logout handler
  const handleLogOut = () => {
    logOut()
      .then(() => console.log("Logged Out successfully"))
      .catch((error) => console.error("Logout error:", error));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle dark/light mode
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Shared nav link styles
  const navLinkBaseClasses =
    "font-medium transition-colors duration-200 py-2 relative group";
  const navLinkActiveClass =
    "text-primary font-semibold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-4/5 after:h-[2px] after:bg-primary after:rounded-full";

  // Navigation items
  const navItems = (
    <>
      <li>
        <NavLink
          to="/"
          onClick={() => window.scrollTo(0, 0)}
          className={({ isActive }) =>
            `${navLinkBaseClasses} ${
              isActive ? navLinkActiveClass : "text-gray-500 dark:text-gray-300"
            }`
          }
        >
          Home
          <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-gray-400 dark:bg-gray-500 transition-all duration-300 group-hover:w-4/5 group-hover:-translate-x-1/2"></span>
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/meals"
          onClick={() => window.scrollTo(0, 0)}
          className={({ isActive }) =>
            `${navLinkBaseClasses} ${
              isActive ? navLinkActiveClass : "text-gray-500 dark:text-gray-300"
            }`
          }
        >
          Meals
          <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-gray-400 dark:bg-gray-500 transition-all duration-300 group-hover:w-4/5 group-hover:-translate-x-1/2"></span>
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/UpcomingMealsUser"
          onClick={() => window.scrollTo(0, 0)}
          className={({ isActive }) =>
            `${navLinkBaseClasses} ${
              isActive ? navLinkActiveClass : "text-gray-500 dark:text-gray-300"
            }`
          }
        >
          Upcoming Meals
          <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-gray-400 dark:bg-gray-500 transition-all duration-300 group-hover:w-4/5 group-hover:-translate-x-1/2"></span>
        </NavLink>
      </li>
      {/* Notification Bell */}
      <li>
        <button
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label="Notifications"
        >
          <span className="relative">
            <FaBell className="text-xl text-gray-600 dark:text-gray-300" />
            <span className="absolute -top-1 -right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
          </span>
        </button>
      </li>
      {/* Theme Toggle for Mobile */}
      <li>
        <button
          onClick={toggleTheme}
          className="btn btn-circle btn-ghost md:hidden"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? (
            <MdOutlineLightMode size={20} />
          ) : (
            <MdOutlineDarkMode size={20} />
          )}
        </button>
      </li>
    </>
  );

  return (
    <div className="navbar bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 shadow-sm md:px-28 px-4 py-3 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50">
      {/* Left Section (Logo + Mobile Menu) */}
      <div className="navbar-start">
        <div className="dropdown lg:hidden">
          <label
            tabIndex={0}
            className="btn btn-ghost p-2"
            aria-label="Open navigation menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-gray-700 dark:text-gray-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[5] p-2 shadow-lg bg-white dark:bg-gray-800 rounded-box w-52"
          >
            {navItems}
          </ul>
        </div>
        <ProFastLogo />
      </div>

      {/* Center Section (Desktop Nav Links) */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-x-8">{navItems}</ul>
      </div>

      {/* Right Section (Theme Toggle + Auth) */}
      <div className="navbar-end flex gap-4">
        {/* Theme Toggle (Desktop) */}
        <button
          onClick={toggleTheme}
          className="btn btn-circle btn-ghost hidden md:flex"
          aria-label="Toggle Theme"
        >
          {theme === "dark" ? (
            <MdOutlineLightMode size={22} />
          ) : (
            <MdOutlineDarkMode size={22} />
          )}
        </button>

        {!user ? (
          <Link
            to="/login"
            className="btn bg-gray-800 dark:bg-primary text-white hover:bg-gray-900 dark:hover:bg-primary/80 rounded-lg px-6 py-2 text-base font-medium transition-colors duration-200"
          >
            Join Us
          </Link>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <img
              src={
                user.photoURL ||
                "https://via.placeholder.com/40/F0F0F0/888888?text=U"
              }
              alt="Profile"
              className="w-10 h-10 rounded-full cursor-pointer border-2 border-transparent transition-all duration-200 hover:border-primary"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-100 p-2">
                <p className="font-semibold px-4 py-2 text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 mb-1">
                  {user.displayName || "User"}
                </p>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-200"
                  onClick={() => setDropdownOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogOut();
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
