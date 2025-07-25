import React from 'react';
import { NavLink, Outlet } from 'react-router-dom'; // Changed to react-router-dom for consistency
import ProFastLogo from '../pages/shared/ProFastLogo/ProFastLogo'; // Assuming correct path to your logo
import { FaHome, FaBoxOpen, FaMoneyCheckAlt, FaUserEdit, FaSearchLocation, FaUserCheck, FaUserClock, FaUserShield, FaTasks, FaWallet, FaUtensils, FaClipboardList, FaFileInvoiceDollar, FaChartLine, FaMotorcycle, FaCheckCircle } from 'react-icons/fa'; // More specific icons for dashboard items
import useUserRole from '../hooks/useUserRole'; // Your custom hook for user role

const DashboardLayout = () => {
    const { role, roleLoading } = useUserRole();

    // Base classes for NavLink items in the sidebar
    const sidebarNavLinkClasses = ({ isActive }) =>
        `flex items-center px-4 py-3 rounded-lg text-lg transition-colors duration-200 mb-2
        ${isActive
            ? 'bg-primary-dark text-white font-semibold shadow-md' // Active state: dark primary background, white text
            : 'text-gray-300 hover:bg-gray-700 hover:text-white' // Inactive state: lighter text, subtle hover
        }`;

    if (roleLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <p className="text-xl text-gray-700">Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="drawer lg:drawer-open">
            <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

            {/* Main Content Area */}
            <div className="drawer-content flex flex-col bg-gray-100 min-h-screen"> {/* Light background for content */}
                {/* Mobile Navbar */}
                <div className="navbar bg-white shadow-sm border-b border-gray-100 w-full lg:hidden px-4 py-3"> {/* Matches main Navbar style */}
                    <div className="flex-none">
                        <label htmlFor="my-drawer-2" aria-label="open sidebar" className="btn btn-ghost p-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                className="inline-block h-6 w-6 stroke-current text-gray-700"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                ></path>
                            </svg>
                        </label>
                    </div>
                    <div className="flex-1 px-2 text-xl font-semibold text-gray-800">Dashboard</div>
                </div>

                {/* Page content from Outlet */}
                <div className="p-6 md:p-8 lg:p-10 flex-grow"> {/* Consistent padding for content */}
                    <Outlet />
                </div>
            </div>

            {/* Sidebar */}
            <div className="drawer-side">
                <label htmlFor="my-drawer-2" aria-label="close sidebar" className="drawer-overlay"></label>
                <ul className="menu bg-gray-800 text-white min-h-full w-80 p-6 flex flex-col"> {/* Dark sidebar, increased padding */}
                    {/* Logo Section */}
                    <li className="mb-8 mt-4 px-4">
                        <ProFastLogo className="text-white h-10" /> {/* Ensure ProFastLogo accepts className for styling */}
                    </li>

                    {/* Common Dashboard Links */}
                    {/* <li>
                        <NavLink to="/dashboard" className={sidebarNavLinkClasses}>
                            <FaHome className="inline-block mr-3 text-xl" />
                            My Profile
                        </NavLink>
                    </li> */}
                    <li>
                        <NavLink to="/dashboard" className={sidebarNavLinkClasses}>
                            <FaUserEdit className="inline-block mr-3 text-xl" />
                            My Profile
                        </NavLink>
                    </li>
                    

                    {/* User Specific Links */}
                    {!roleLoading && role === 'user' && (
                        <>
                            <li>
                                <NavLink to="/dashboard/my-meal-request" className={sidebarNavLinkClasses}>
                                    <FaClipboardList className="inline-block mr-3 text-xl" /> {/* More specific icon */}
                                    My Requested Meals
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard/my-meal-reviews" className={sidebarNavLinkClasses}>
                                    <FaTasks className="inline-block mr-3 text-xl" /> {/* More specific icon */}
                                    My Reviews
                                </NavLink>
                            </li>
                            <li>
                        <NavLink to="/dashboard/paymentHistory" className={sidebarNavLinkClasses}>
                            <FaFileInvoiceDollar className="inline-block mr-3 text-xl" /> {/* More specific icon */}
                            Payment History
                        </NavLink>
                    </li>
                        </>
                    )}

                    {/* Admin Specific Links */}
                    {!roleLoading && role === 'admin' && (
                        <>
                            <li>
                                <NavLink to="/dashboard/makeAdmin" className={sidebarNavLinkClasses}> {/* Renamed route for clarity */}
                                    <FaUserShield className="inline-block mr-3 text-xl" />
                                    Manage Users
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard/add-meal" className={sidebarNavLinkClasses}>
                                    <FaUtensils className="inline-block mr-3 text-xl" />
                                    Add Meal
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard/all-meals" className={sidebarNavLinkClasses}>
                                    <FaBoxOpen className="inline-block mr-3 text-xl" /> {/* More specific icon */}
                                    All Meals
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard/pending-meals" className={sidebarNavLinkClasses}> {/* Renamed route for clarity */}
                                    <FaMotorcycle className="inline-block mr-3 text-xl" /> {/* Delivery icon */}
                                    Serve Meals
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard/upcoming-meals" className={sidebarNavLinkClasses}> {/* Distinct route for admin upcoming meals */}
                                    <FaUserClock className="inline-block mr-3 text-xl" />
                                    Upcoming Meals 
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/dashboard/all-reviews" className={sidebarNavLinkClasses}> {/* Distinct route for admin all reviews */}
                                    <FaCheckCircle className="inline-block mr-3 text-xl" />
                                    All Reviews 
                                </NavLink>
                            </li>
                            {/* Example of another admin link */}
                            {/* <li>
                                <NavLink to="/dashboard/admin-stats" className={sidebarNavLinkClasses}>
                                    <FaChartLine className="inline-block mr-3 text-xl" />
                                    Admin Statistics
                                </NavLink>
                            </li> */}
                        </>
                    )}

                    {/* Separator */}
                    <div className="divider my-8 border-t border-gray-700"></div> {/* Stylish divider */}

                    {/* Back to Home Link */}
                    <li>
                        <NavLink to="/" className={sidebarNavLinkClasses}>
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
