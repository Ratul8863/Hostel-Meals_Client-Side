import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationCircle, FaHome, FaArrowLeft, FaGhost, FaBug } from 'react-icons/fa'; // Added more creative icons

const ErrorPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4 text-center">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-8 md:p-12 max-w-2xl w-full transform transition-all duration-300 hover:scale-[1.01] hover:shadow-xl">
        {/* Dynamic and creative error icon */}
        <div className="relative mb-8 mx-auto w-32 h-32 flex items-center justify-center">
          <FaExclamationCircle className="absolute text-red-500 text-9xl opacity-20 animate-pulse" />
          <FaGhost className="text-gray-700 text-6xl animate-bounce-slow" /> {/* A playful ghost for "page not found" */}
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-800 mb-4 leading-tight tracking-tight">
          Lost in the Matrix?
        </h1>
        <p className="text-2xl md:text-3xl text-gray-700 mb-6 font-semibold">
          Error 404: Page Not Found
        </p>
        <p className="text-lg text-gray-600 mb-10 max-w-prose mx-auto">
          It seems you've ventured into uncharted digital territory. The page you're looking for might have been moved, deleted, or perhaps it never existed in this dimension. Don't worry, we'll guide you back!
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-900 transition-colors duration-200 text-lg shadow-md transform hover:-translate-y-1"
          >
            <FaHome className="mr-3" /> Back to Safety (Homepage)
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors duration-200 text-lg shadow-md transform hover:-translate-y-1"
          >
            <FaArrowLeft className="mr-3" /> Retrace Your Steps
          </button>
        </div>

        <div className="mt-12 text-gray-500 text-sm flex items-center justify-center gap-2">
          <FaBug className="text-xl" />
          <span>If this persists, please contact support.</span>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
