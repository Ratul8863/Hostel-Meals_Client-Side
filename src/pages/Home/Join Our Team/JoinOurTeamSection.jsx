import React from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaEdit, FaBullhorn } from 'react-icons/fa';

const JoinOurTeamSection = () => {
  return (
    <div className="py-16 px-4 sm:px-8 bg-gray-100 transition-colors duration-300">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
          Become a Team Member
        </h2>
        <p className="text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
          Help us build a better community for fellow hostellers. Contribute your skills, share your passion, and make a real impact on our platform's growth.
        </p>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Community Manager Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
            <FaUsers className="text-gray-800 text-5xl mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Community Manager</h3>
            <p className="text-gray-600">
              Welcome new members, answer questions, and foster a friendly and supportive environment for everyone.
            </p>
          </div>

          {/* Content Contributor Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
            <FaEdit className="text-gray-800 text-5xl mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Content Contributor</h3>
            <p className="text-gray-600">
              Help curate and feature the best meal photos and recipes, ensuring our content stays fresh and inspiring.
            </p>
          </div>

          {/* Platform Ambassador Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
            <FaBullhorn className="text-gray-800 text-5xl mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Platform Ambassador</h3>
            <p className="text-gray-600">
              Spread the word about our platform and help us grow by engaging with food lovers on social media and beyond.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          to="/apply-for-team"
          className="inline-block bg-gray-800 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-900 transition duration-300"
        >
          Learn More & Apply
        </Link>
      </div>
    </div>
  );
};

export default JoinOurTeamSection;
