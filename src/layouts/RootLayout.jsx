import React from 'react';
import { Outlet } from 'react-router-dom'; // Changed to react-router-dom for consistency
import Navbar from '../pages/shared/Navbar/Navbar'; // Assuming correct path
import Footer from '../pages/shared/Footer/Footer'; // Assuming correct path

const RootLayout = () => {
    return (
        // Main container for the entire application layout.
        // `min-h-screen` ensures the footer sticks to the bottom on shorter pages.
        // `flex flex-col` enables vertical stacking and allows `flex-grow` on content.
        <div className="flex flex-col min-h-screen  font-inter"> {/* Added a light background and Inter font */}
            {/* Navbar component, already polished to QUENX theme */}
            <Navbar />

            {/* Main content area, takes up available space to push footer down */}
            {/* Added consistent vertical padding for content sections */}
            <main className="flex-grow">
                <Outlet />
            </main>

            {/* Footer component, already polished to QUENX theme */}
            <Footer />
        </div>
    );
};

export default RootLayout;
