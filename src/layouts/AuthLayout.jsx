import React from 'react';
import { Outlet, Link } from 'react-router-dom'; 
import login from "../assets/Lottie/Login.json" 
import ProFastLogo from '../pages/shared/ProFastLogo/ProFastLogo'; 
import Lottie from 'lottie-react';
import useAuth from '../hooks/useAuth';
import ProFastLogo2 from '../pages/shared/ProFastLogo/ProFastLogo2';

const AuthLayout = () => {
      const { theme } = useAuth();
    return (
        // Main container for the authentication layout
        // Ensures full viewport height, centers content, and applies a subtle gradient background
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br  from-gray-50 to-gray-100 py-16 px-4 font-inter">
            
            {/* Logo positioned at the top-left, visible across the layout */}
            <div className="absolute top-0 left-0 p-8 z-10 w-full max-w-7xl mx-auto">
                <Link to="/"> {/* Link logo back to home page */}
                    <ProFastLogo2 className={`h-10 `} /> {/* Ensure ProFastLogo accepts className for styling */}
                </Link>
            </div>

            {/* Hero content section, responsive layout for image and form */}
            <div className="flex flex-col lg:flex-row-reverse items-center justify-center w-full max-w-6xl mx-auto gap-12">
                
                {/* Image section - hidden on small screens, displayed on large screens */}
                <div className="flex-1 hidden lg:flex justify-center items-center p-4">
                    <Lottie
  animationData={login}
  loop={true}
  autoplay={true}
//   style={{ width: 300, height: 300 }}
/>
                </div>

                {/* Outlet for nested routes (Login, Register forms) */}
                <div className="flex-1 w-full">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
