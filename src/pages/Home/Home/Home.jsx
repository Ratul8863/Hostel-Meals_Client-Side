import React from 'react';

import Services from '../Services/Services';
import ClientLogosMarquee from '../ClientLogosMarquee/ClientLogosMarquee';
import Benefits from '../Benefits/Benefits';
import BeMerchant from '../BeMerchant/BeMerchant';
import BannerSection from '../BannerSection/BannerSection';
import MealsByCategory from '../MealsByCategory/MealsByCategory';
import MembershipSection from '../MembershipSection/MembershipSection';

const Home = () => {
    return (
        <div>
           <BannerSection></BannerSection>
    
            <MealsByCategory></MealsByCategory>
            <MembershipSection></MembershipSection>
            
        </div>
    );
};

export default Home;





















       {/* <Services></Services> */}
{/* <ClientLogosMarquee></ClientLogosMarquee>
            <Benefits></Benefits>
            <BeMerchant></BeMerchant> */}