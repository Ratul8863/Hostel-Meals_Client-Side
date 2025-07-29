import React from 'react';

import Services from '../Services/Services';
import ClientLogosMarquee from '../ClientLogosMarquee/ClientLogosMarquee';
import Benefits from '../Benefits/Benefits';
import BeMerchant from '../BeMerchant/BeMerchant';
import BannerSection from '../BannerSection/BannerSection';
import MealsByCategory from '../MealsByCategory/MealsByCategory';
import MembershipSection from '../MembershipSection/MembershipSection';
import CustomerTestimonials from '../CustomerTestimonials/CustomerTestimonials';
import TopRatedMeals from '../TopRatedMeals/TopRatedMeals';
import MeetOurTeam from '../MeetOurTeam/MeetOurTeam';
import { Helmet } from 'react-helmet-async';

const Home = () => {
    return (
        <div>
 <Helmet>
        <title>Hostel Meals | Home</title>
      </Helmet>


           <BannerSection></BannerSection>
    
            <MealsByCategory></MealsByCategory>
            <MembershipSection></MembershipSection>
            <CustomerTestimonials></CustomerTestimonials>
            {/* <TopRatedMeals></TopRatedMeals> */}
            <MeetOurTeam></MeetOurTeam>
            
        </div>
    );
};

export default Home;





















       {/* <Services></Services> */}
{/* <ClientLogosMarquee></ClientLogosMarquee>
            <Benefits></Benefits>
            <BeMerchant></BeMerchant> */}