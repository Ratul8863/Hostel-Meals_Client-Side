import React from 'react';
import logo from "../../../assets/Lottie/Food_Carousel.json";
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import useAuth from '../../../hooks/useAuth';

const ProFastLogo2 = () => {
  const { theme } = useAuth();

  return (
    <Link to="/">
      <div
        className={`flex items-center gap-2 ${
          theme === 'dark' ? 'text-gray-900' : ''
        }`}
      >
        <Lottie
          animationData={logo}
          loop={true}
          autoplay={true}
          style={{ width: 55, height: 55 }}
        />
        <p className="text-3xl font-extrabold">
          Hostel Meals
        </p>
      </div>
    </Link>
  );
};

export default ProFastLogo2;
