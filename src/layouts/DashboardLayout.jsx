import React, { useRef } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import ProFastLogo from '../pages/shared/ProFastLogo/ProFastLogo';
import { 
    FaHome, FaBoxOpen, FaMoneyCheckAlt, FaUserEdit, FaSearchLocation, 
    FaUserCheck, FaUserClock, FaUserShield, FaTasks, FaWallet, FaUtensils, 
    FaClipboardList, FaFileInvoiceDollar, FaChartLine, FaMotorcycle, FaCheckCircle 
} from 'react-icons/fa';
import { MdOutlineLightMode, MdOutlineDarkMode } from 'react-icons/md';
import useUserRole from '../hooks/useUserRole';
import useAuth from '../hooks/useAuth';
import { Helmet } from 'react-helmet-async';

const DashboardLayout = () => {
    const { role, roleLoading } = useUserRole();
    const { user, theme, setTheme } = useAuth(); // Added theme & setTheme
    const drawerCheckboxRef = useRef(null);

    const closeDrawer = () => {
        if (drawerCheckboxRef.current) drawerCheckboxRef.current.checked = false;
    };

    const sidebarNavLinkClasses = ({ isActive }) =>
        `flex items-center px-4 py-3 rounded-lg text-lg transition-colors duration-200 mb-2
        ${isActive
            ? 'bg-primary-dark text-white font-semibold shadow-md'
            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`;

    const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

    if (roleLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <p className="text-xl text-gray-700">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className={`drawer lg:drawer-open ${theme === 'dark' ? 'dark' : ''}`}>
            <Helmet>
                <title>Hostel Meals | Dashboard</title>
            </Helmet>
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" ref={drawerCheckboxRef} />

            {/* Main Content */}
            <div className={`drawer-content flex flex-col min-h-screen ${theme === 'dark' ? 'bg-[#0D1128] text-white' : 'bg-gray-100 text-gray-900'}`}>
                {/* Mobile Navbar */}
                <div className={`navbar shadow-sm border-b w-full lg:hidden px-4 py-3 ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex-none">
                        <label htmlFor="my-drawer-2" aria-label="open sidebar" className="btn btn-ghost p-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={`inline-block h-6 w-6 stroke-current ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                        </label>
                    </div>
                    <div className="flex-1 px-2 text-xl font-semibold">Dashboard</div>

                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="btn btn-circle btn-ghost"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? <MdOutlineLightMode size={20} /> : <MdOutlineDarkMode size={20} />}
                    </button>
                </div>

                {/* Page Content */}
                <div className="p-6 md:p-8 lg:p-10 flex-grow">
                    <Outlet />
                </div>
            </div>

            {/* Sidebar */}
            <div className={`drawer-side ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-800 text-white'}`}>
                <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
                <ul className="menu min-h-full w-80 p-6 flex flex-col">
                    {/* Logo */}
                    <li className="mb-8 mt-4 px-4">
                        <ProFastLogo className="text-white h-10" />
                    </li>

                    {/* Theme toggle inside sidebar for desktop */}
                    <li className="mb-4 flex justify-center">
                        <button
                            onClick={toggleTheme}
                            className="btn btn-circle btn-ghost"
                            aria-label="Toggle Theme"
                        >
                            {theme === 'dark' ? <MdOutlineLightMode size={22} /> : <MdOutlineDarkMode size={22} />}
                        </button>
                    </li>

                    {/* Common Links */}
                    <li>
                        <NavLink to="/dashboard" className={sidebarNavLinkClasses} onClick={closeDrawer}>
                            <FaUserEdit className="inline-block mr-3 text-xl" />
                            My Profile
                        </NavLink>
                    </li>

                    {/* User Links */}
                    {!roleLoading && role === 'user' && (
                        <>
                            <li>
                                <NavLink to="/dashboard/my-meal-request" className={sidebarNavLinkClasses} onClick={closeDrawer}>
                                    <FaClipboardList className="inline-block mr-3 text-xl" />
                                    My Requested Meals
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard/my-meal-reviews" className={sidebarNavLinkClasses} onClick={closeDrawer}>
                                    <FaTasks className="inline-block mr-3 text-xl" />
                                    My Reviews
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard/paymentHistory" className={sidebarNavLinkClasses} onClick={closeDrawer}>
                                    <FaFileInvoiceDollar className="inline-block mr-3 text-xl" />
                                    Payment History
                                </NavLink>
                            </li>
                        </>
                    )}

                    {/* Admin Links */}
                    {!roleLoading && role === 'admin' && (
                        <>
                            <li>
                                <NavLink to="/dashboard/makeAdmin" className={sidebarNavLinkClasses} onClick={closeDrawer}>
                                    <FaUserShield className="inline-block mr-3 text-xl" />
                                    Manage Users
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard/add-meal" className={sidebarNavLinkClasses} onClick={closeDrawer}>
                                    <FaUtensils className="inline-block mr-3 text-xl" />
                                    Add Meal
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard/all-meals" className={sidebarNavLinkClasses} onClick={closeDrawer}>
                                    <FaBoxOpen className="inline-block mr-3 text-xl" />
                                    All Meals
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard/pending-meals" className={sidebarNavLinkClasses} onClick={closeDrawer}>
                                    <FaMotorcycle className="inline-block mr-3 text-xl" />
                                    Serve Meals
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard/upcoming-meals" className={sidebarNavLinkClasses} onClick={closeDrawer}>
                                    <FaUserClock className="inline-block mr-3 text-xl" />
                                    Upcoming Meals 
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard/all-reviews" className={sidebarNavLinkClasses} onClick={closeDrawer}>
                                    <FaCheckCircle className="inline-block mr-3 text-xl" />
                                    All Reviews 
                                </NavLink>
                            </li>
                        </>
                    )}

                    <div className="divider my-8 border-t border-gray-700"></div>

                    {/* Back to Home */}
                    <li>
                        <NavLink to="/" className={sidebarNavLinkClasses} onClick={closeDrawer}>
                            <FaHome className="inline-block mr-3 text-xl" />
                            Back to Home
                        </NavLink>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default DashboardLayout;
