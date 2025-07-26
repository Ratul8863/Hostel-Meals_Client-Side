import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home/Home/Home";
import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/Authentication/Login/Login";
import Register from "../pages/Authentication/Register/Register";

import PrivateRoute from "../routes/PrivateRoute";

import DashboardLayout from "../layouts/DashboardLayout";

import Payment from "../pages/Dashboard/Payment/Payment";
import PaymentHistory from "../pages/Dashboard/PaymentHistory/PaymentHistory";


import PendingRiders from "../pages/Dashboard/PendingRiders/PendingRiders";

import MakeAdmin from "../pages/Dashboard/MakeAdmin/MakeAdmin";
import Forbidden from "../pages/Forbidden/Forbidden";
import AdminRoute from "../routes/AdminRoute";


import DashboardHome from "../pages/Dashboard/DashboardHome/DashboardHome";
import AddMeal from "../pages/Dashboard/Addmeal/Addmeal";
import MealDetail from "../pages/Home/MealsByCategory/MealDetail";
import AllMeals from "../pages/Dashboard/Allmeals/Allmeals";
import MealsPage from "../pages/Home/MealsByCategory/MealsPage";
import MembershipSection from "../pages/Home/MembershipSection/MembershipSection";
import CheckoutPage from "../pages/Home/MembershipSection/CheckoutPage";
import PendingMeals from "../pages/Dashboard/PendingMeals/PendingMeals";
import UpcomingMeals from "../pages/Dashboard/UpcomingMeals/UpcomingMeals";
import UpcomingMealsUser from "../pages/UpcomingMealsUser/UpcomingMealsUser";
import ProfileSection from "../pages/Dashboard/ProfileSection/ProfileSection";
import MyRequestedMeals from "../pages/Dashboard/MyRequestedMeals/MyRequestedMeals";
import MyReviews from "../pages/Dashboard/MyReviews/MyReviews";
import AllReviews from "../pages/Dashboard/AllReviews/AllReviews";
import RiderRoute from "../routes/RiderRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        Component: Home
      },
     
      {
        path: 'forbidden',
        Component: Forbidden
      },
       {
        path: '/meal/:id',
        Component: MealDetail
      },
       {
        path: 'meals',
        Component: MealsPage
      },


       {
        path: 'UpcomingMealsUser',
        Component: UpcomingMealsUser
      },
      
      {
  path: '/membership',
  element: <MembershipSection />,
},
{
  path: '/checkout/:packageName',
  element: <PrivateRoute><CheckoutPage /></PrivateRoute>,
},
      
    ]
  },
  {
    path: '/',
    Component: AuthLayout,
    children: [
      {
        path: 'login',
        Component: Login
      },
      {
        path: 'register',
        Component: Register
      }
    ]
  },
  {
    path: '/dashboard',
    element: <PrivateRoute>
      <DashboardLayout></DashboardLayout>
    </PrivateRoute>,
    children: [
      {
        index: true,
        Component: ProfileSection
      },
      
      {
        path: 'payment/:parcelId',
        Component: Payment
      },
      {
        path: 'paymentHistory',
        Component: PaymentHistory
      },
      
      {
        path: 'profile',
        Component: ProfileSection
      },
      {
      path: 'payment/membership/:packageName',  // ✅ New route for membership payment
      Component: Payment
    },

    
      // user only routes
      
      
      {
        path: 'my-meal-request',
        element: <RiderRoute> <MyRequestedMeals></MyRequestedMeals></RiderRoute>
       
        
      },
      {
        path: 'my-meal-reviews',
        element: <RiderRoute><MyReviews></MyReviews></RiderRoute>
     
        
      },

      //admin routes 

      {
        path: 'pending-riders',
        element: <AdminRoute><PendingRiders></PendingRiders></AdminRoute>
      },
      {
        path: 'pending-meals',
        element: <AdminRoute><PendingMeals></PendingMeals></AdminRoute>
      },
      
      {
        path: 'makeAdmin',
        element: <AdminRoute><MakeAdmin></MakeAdmin></AdminRoute>
      },




 {
  path: '/dashboard/add-meal',
  element: <AdminRoute><AddMeal></AddMeal></AdminRoute>
},
{
  path: '/dashboard/upcoming-meals',
  element: <AdminRoute><UpcomingMeals></UpcomingMeals></AdminRoute>
},

      {
  path: '/dashboard/all-meals',
  element: <AllMeals></AllMeals>
},
      {
  path: '/dashboard/all-reviews',
  element: <AdminRoute><AllReviews></AllReviews></AdminRoute>
},


    ]
  }
]);