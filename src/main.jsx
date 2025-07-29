import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // Assuming this imports your Tailwind CSS output
import { RouterProvider } from "react-router-dom"; // Changed to react-router-dom for consistency
import { router } from './router/router.jsx';

import 'aos/dist/aos.css'; // AOS CSS for animations

import AuthProvider from './contexts/AuthContext/AuthProvider.jsx'; // Your Auth context provider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // React Query for data fetching
import { HelmetProvider } from 'react-helmet-async';
import Aos from 'aos';

// Initialize AOS (Animate On Scroll) library for scroll animations
Aos.init({
  duration: 800, // Animation duration in milliseconds
  once: true,    // Whether animation should happen only once - while scrolling down
});

// Create a client for React Query
const queryClient = new QueryClient();

// Render the React application into the 'root' element in index.html
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* The main application wrapper.
      Global font (font-inter) and max-width (max-w-7xl mx-auto) are now handled by RootLayout.
      This ensures consistency and avoids redundant styling.
    */}
    <div> 
      <QueryClientProvider client={queryClient}>
         <HelmetProvider>
 <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>

         </HelmetProvider>
       
      </QueryClientProvider>
    </div>
  </StrictMode>,
);
