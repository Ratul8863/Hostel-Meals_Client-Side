import React from 'react';
import logo from "../../../assets/Lottie/Food_Carousel.json"
import { Link } from 'react-router';
import Lottie from 'lottie-react';

const ProFastLogo = () => {
    return (
        <Link to="/">
            <div className='flex items-center gap-2'>
                 <Lottie
  animationData={logo}
  loop={true}
  autoplay={true}
  style={{ width: 55, height: 55 }}
/>
                <p className='text-3xl  font-extrabold'>Hostel Meals</p>
            </div>
        </Link>
    );
};

export default ProFastLogo;