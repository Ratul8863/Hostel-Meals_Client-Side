import React, { useState } from 'react';
import { Users, Edit, Megaphone } from 'lucide-react'; // Using lucide-react as a robust alternative

const ApplyPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Application Submitted:', formData);
    // In a real application, you would send this data to a backend.
    setIsSubmitted(true);
  };

  return (
    <div className="py-16 px-4 sm:px-8 bg-gray-100 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">
            Join Our Team
          </h2>
          <p className="text-lg text-gray-600">
            Ready to make a difference? Learn more about our open roles and submit your application below.
          </p>
        </div>

        {/* Roles Details Section */}
        <div className="mb-12 space-y-12">
          {/* Community Manager */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
            <Users className="text-gray-800 w-16 h-16 flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Community Manager</h3>
              <p className="text-gray-600 mb-4">
                As a Community Manager, you will be the heart of our platform, ensuring a positive and engaging experience for all users. Your main responsibilities include:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Welcoming and onboarding new members.</li>
                <li>Answering questions and providing support.</li>
                <li>Moderating discussions to maintain a friendly atmosphere.</li>
                <li>Organizing and promoting community events.</li>
              </ul>
            </div>
          </div>

          {/* Content Contributor */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
            <Edit className="text-gray-800 w-16 h-16 flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Content Contributor</h3>
              <p className="text-gray-600 mb-4">
                If you have a knack for creating compelling content, this role is for you. You'll help showcase the best of our community's culinary creativity. Key responsibilities include:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Reviewing and selecting user-submitted meal photos and recipes.</li>
                <li>Curating daily and weekly content highlights.</li>
                <li>Writing engaging blog posts and articles.</li>
                <li>Collaborating with the team on content strategy.</li>
              </ul>
            </div>
          </div>

          {/* Platform Ambassador */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
            <Megaphone className="text-gray-800 w-16 h-16 flex-shrink-0" />
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Platform Ambassador</h3>
              <p className="text-gray-600 mb-4">
                Help us expand our reach! As a Platform Ambassador, you'll be a key part of our growth by engaging with new audiences and spreading the word about our mission. You will be responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Promoting the platform on social media.</li>
                <li>Engaging with potential users and partners.</li>
                <li>Gathering feedback to help us improve.</li>
                <li>Representing our community at online events.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Application Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {isSubmitted ? (
            <div className="text-center py-12">
              <h3 className="text-3xl font-bold text-gray-800 mb-4">Thank you for your application!</h3>
              <p className="text-lg text-gray-600">
                We have received your submission and will get back to you soon.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">Apply Now</h3>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                  required
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Interested Role</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                  required
                >
                  <option value="" disabled>Select a role...</option>
                  <option value="community-manager">Community Manager</option>
                  <option value="content-contributor">Content Contributor</option>
                  <option value="platform-ambassador">Platform Ambassador</option>
                </select>
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Why do you want to join? (Cover Letter)</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition"
                  required
                ></textarea>
              </div>
              <div className="flex justify-center">
                <button
                  type="submit"
                  className="bg-gray-800 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-900 transition duration-300"
                >
                  Submit Application
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplyPage;
