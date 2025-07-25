import React, { useState } from 'react';
import { Link, NavLink } from 'react-router';
import ProFastLogo from '../ProFastLogo/ProFastLogo';
import useAuth from '../../../hooks/useAuth';
import { FaBell } from 'react-icons/fa';

const Navbar = () => {
    const { user, logOut } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const handleLogOut = () => {
        logOut()
            .then(() => console.log('Logged Out'))
            .catch(error => console.log(error));
    };

    const navItems = <>
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/meals">Meals</NavLink></li>
        <li><NavLink to="/UpcomingMealsUser">Upcoming Meals</NavLink></li>
        
    </>;

    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="navbar-start flex items-center gap-2">
                <ProFastLogo />
               
            </div>

            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    {navItems}
                    <li>
                        <button className="btn btn-ghost btn-circle">
                            <FaBell className="text-xl" />
                        </button>
                    </li>
                </ul>
            </div>

            <div className="navbar-end">
                {!user ? (
                    <Link to="/login" className="btn btn-primary text-black">Join Us</Link>
                ) : (
                    <div className="relative">
                        <img
                            src={user.photoURL || '/default-profile.png'}
                            alt="Profile"
                            className="w-10 h-10 rounded-full cursor-pointer"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                        />
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-base-100 rounded-box shadow z-10 p-2">
                                <p className="font-semibold px-2 py-1">{user.displayName || 'User'}</p>
                                <hr />
                                <Link
                                    to="/dashboard"
                                    className="block px-4 py-2 hover:bg-base-200 rounded"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogOut();
                                        setDropdownOpen(false);
                                    }}
                                    className="w-full text-left px-4 py-2 hover:bg-base-200 rounded"
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
