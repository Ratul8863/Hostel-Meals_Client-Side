import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom'; // Changed to react-router-dom for consistency with modern React apps
import ProFastLogo from '../ProFastLogo/ProFastLogo'; // Assuming this is your logo component
import useAuth from '../../../hooks/useAuth'; // Assuming this is your authentication hook
import { FaBell } from 'react-icons/fa'; // Importing the bell icon

const Navbar = () => {
    const { user, logOut } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null); // Ref for detecting clicks outside the dropdown

    // Handles user logout
    const handleLogOut = () => {
        logOut()
            .then(() => console.log('Logged Out successfully'))
            .catch(error => console.error('Logout error:', error)); // Improved error logging
    };

    // Effect to handle clicks outside the dropdown to close it
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Base classes for NavLink for common styling, ensuring consistency
    const navLinkBaseClasses = "font-medium hover:text-gray-700 transition-colors duration-200 py-2 relative group";
    // Active classes for NavLink, creating a subtle underline like the QUENX theme
    const navLinkActiveClass = "text-primary font-semibold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-4/5 after:h-[2px] after:bg-primary after:rounded-full";

    // Navigation items for both desktop and mobile menus
    const navItems = (
        <>
            <li>
                <NavLink
                    to="/"
                    className={({ isActive }) => 
                        `${navLinkBaseClasses} ${isActive ? navLinkActiveClass : 'text-gray-500'}` // Default text color is a subtle grey
                    }
                >
                    Home
                    {/* Optional: Add a subtle hover underline like QUENX */}
                    <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-gray-500 transition-all duration-300 group-hover:w-4/5 group-hover:-translate-x-1/2"></span>
                </NavLink>
            </li>
            <li>
                <NavLink
                    to="/meals"
                    className={({ isActive }) => 
                        `${navLinkBaseClasses} ${isActive ? navLinkActiveClass : 'text-gray-500'}`
                    }
                >
                    Meals
                    <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-gray-500 transition-all duration-300 group-hover:w-4/5 group-hover:-translate-x-1/2"></span>
                </NavLink>
            </li>
            <li>
                <NavLink
                    to="/UpcomingMealsUser"
                    className={({ isActive }) => 
                        `${navLinkBaseClasses} ${isActive ? navLinkActiveClass : 'text-gray-500'}`
                    }
                >
                    Upcoming Meals
                    <span className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-gray-500 transition-all duration-300 group-hover:w-4/5 group-hover:-translate-x-1/2"></span>
                </NavLink>
            </li>
            {/* Bell icon, simplified from a 'btn' for a cleaner QUENX-like style */}
            <li>
                <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200" aria-label="Notifications">
                    <span className="relative">
                        <FaBell className="text-xl text-gray-600" />
                        {/* Smaller badge for notifications */}
                        <span className="absolute -top-1 -right-1.5 h-2 w-2 bg-red-500 rounded-full text-[8px] flex items-center justify-center"></span>
                    </span>
                </button>
            </li>
        </>
    );

    return (
        // Main Navbar container with a subtle shadow and bottom border for a clean separation
        // Added sticky, top-0, and z-50 for sticky behavior
        <div className="navbar bg-white shadow-sm px-6 py-3 border-b border-gray-100 sticky top-0 z-50">
            {/* Navbar Start Section (Logo and Mobile Dropdown) */}
            <div className="navbar-start">
                {/* Mobile Dropdown Menu (Hamburger Icon) */}
                <div className="dropdown lg:hidden">
                    <label tabIndex={0} className="btn btn-ghost p-2" aria-label="Open navigation menu">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </label>
                    <ul
                        tabIndex={0}
                        className="menu menu-sm dropdown-content mt-3 z-[5] p-2 shadow-lg bg-white rounded-box w-52"
                    >
                        {navItems}
                    </ul>
                </div>
                <ProFastLogo /> {/* Your brand logo component */}
            </div>

            {/* Navbar Center Section (Desktop Navigation Links) */}
            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 gap-x-8"> {/* Increased gap for more spacing between links */}
                    {navItems}
                </ul>
            </div>

            {/* Navbar End Section (Join Us / User Profile) */}
            <div className="navbar-end">
                {!user ? (
                    // "Join Us" button if user is not logged in
                    <Link 
                        to="/login" 
                        className="btn bg-gray-800 text-white hover:bg-gray-900 rounded-lg px-6 py-2 text-base font-medium transition-colors duration-200"
                    >
                        Join Us
                    </Link>
                ) : (
                    // User profile picture and dropdown if logged in
                    <div className="relative" ref={dropdownRef}>
                        <img
                            src={user.photoURL || 'https://via.placeholder.com/40/F0F0F0/888888?text=U'} // Placeholder image with initial
                            alt="Profile"
                            className="w-10 h-10 rounded-full cursor-pointer border-2 border-transparent transition-all duration-200 hover:border-primary-light" // Subtle border on hover
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        />
                        {dropdownOpen && (
                            // Dropdown menu for logged-in users
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-100 p-2 transform origin-top-right transition-all duration-200 scale-100 opacity-100">
                                <p className="font-semibold px-4 py-2 text-gray-800 border-b border-gray-100 mb-1">{user.displayName || 'User'}</p>
                                <Link
                                    to="/dashboard"
                                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors duration-200"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogOut();
                                        setDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
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
