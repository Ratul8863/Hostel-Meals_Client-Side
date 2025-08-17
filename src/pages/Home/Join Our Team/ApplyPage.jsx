import React from 'react';
import { Users, Edit, Megaphone } from 'lucide-react';

const ApplyPage = () => {
  const email = "ratulroy8863@gmail.com";

  return (
    <section className="py-16 px-4 sm:px-8 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-gray-100 mb-2">
            Join Our Team
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Ready to make a difference? Learn more about our open roles and follow the instructions below to apply.
          </p>
        </div>

        {/* Roles Info */}
        <div className="mb-12 space-y-12">
          {[
            {
              Icon: Users,
              title: 'Community Manager',
              description:
                'As a Community Manager, you will be the heart of our platform, ensuring a positive and engaging experience for all users.',
              responsibilities: [
                'Welcoming and onboarding new members.',
                'Answering questions and providing support.',
                'Moderating discussions to maintain a friendly atmosphere.',
                'Organizing and promoting community events.',
              ],
            },
            {
              Icon: Edit,
              title: 'Content Contributor',
              description:
                "If you have a knack for creating compelling content, this role is for you. You'll help showcase the best of our community's culinary creativity.",
              responsibilities: [
                'Reviewing and selecting user-submitted meal photos and recipes.',
                'Curating daily and weekly content highlights.',
                'Writing engaging blog posts and articles.',
                'Collaborating with the team on content strategy.',
              ],
            },
            {
              Icon: Megaphone,
              title: 'Platform Ambassador',
              description:
                "Help us expand our reach! As a Platform Ambassador, you'll be a key part of our growth by engaging with new audiences and spreading the word about our mission.",
              responsibilities: [
                'Promoting the platform on social media.',
                'Engaging with potential users and partners.',
                'Gathering feedback to help us improve.',
                'Representing our community at online events.',
              ],
            },
          ].map(({ Icon, title, description, responsibilities }, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8 transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl"
            >
              <Icon className="text-primary-dark dark:text-primary-light w-16 h-16 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{description}</p>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
                  {responsibilities.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* How to Apply Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">How to Apply</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            To apply for any of the roles above, please send an email to:
          </p>
          <a
            href={`mailto:${email}?subject=Application for Team Role&body=Dear Team,%0D%0A%0D%0AI would like to apply for the [Role Name] position.%0D%0A%0D%0APlease find my CV and cover letter attached.%0D%0A%0D%0AThank you.%0D%0A%0D%0ABest regards,%0D%0A[Your Name]`}
            className="text-primary-dark dark:text-primary-light font-semibold text-lg hover:underline"
          >
            {email}
          </a>
          <p className="text-gray-600 dark:text-gray-300 mt-6">
            Make sure to attach your <strong>CV</strong> and a <strong>cover letter</strong> in your email explaining why you want to join our team and how your skills can contribute.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ApplyPage;
