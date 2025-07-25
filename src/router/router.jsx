import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home/Home/Home";
import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/Authentication/Login/Login";
import Register from "../pages/Authentication/Register/Register";
import Coverage from "../pages/Coverage/Coverage";
import PrivateRoute from "../routes/PrivateRoute";
import SendParcel from "../pages/SendParcel/SendParcel";
import DashboardLayout from "../layouts/DashboardLayout";
import MyParcels from "../pages/Dashboard/MyParcels/MyParcels";
import Payment from "../pages/Dashboard/Payment/Payment";
import PaymentHistory from "../pages/Dashboard/PaymentHistory/PaymentHistory";
import TrackParcel from "../pages/Dashboard/TrackParcel/TrackParcel";
// import BeARider from "../pages/Dashboard/BeARider/BeARider";
import PendingRiders from "../pages/Dashboard/PendingRiders/PendingRiders";
// import ActiveRiders from "../pages/Dashboard/ActiveRiders/ActiveRiders";
import MakeAdmin from "../pages/Dashboard/MakeAdmin/MakeAdmin";
import Forbidden from "../pages/Forbidden/Forbidden";
import AdminRoute from "../routes/AdminRoute";
// import AssignRider from "../pages/Dashboard/AssignRider/AssignRider";
import RiderRoute from "../routes/RiderRoute";
import PendingDeliveries from "../pages/Dashboard/PendingDeliveries/PendingDeliveries";
import CompletedDeliveries from "../pages/Dashboard/CompletedDeliveries/CompletedDeliveries";
import MyEarnings from "../pages/Dashboard/MyEarnings/MyEarnings";
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
        path: 'coverage',
        Component: Coverage,
        loader: () => fetch('./serviceCenter.json')
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
      // {
      //   path: 'beARider',
      //   element: <PrivateRoute><BeARider></BeARider></PrivateRoute>,
      //   loader: () => fetch('./serviceCenter.json')
      // },
      {
  path: '/membership',
  element: <MembershipSection />,
},
{
  path: '/checkout/:packageName',
  element: <PrivateRoute><CheckoutPage /></PrivateRoute>,
},
      {
        path: 'sendParcel',
        element: <PrivateRoute><SendParcel></SendParcel></PrivateRoute>,
        loader: () => fetch('./serviceCenter.json')
      }
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
        Component: DashboardHome
      },
      {
        path: 'myParcels',
        Component: MyParcels
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
        path: 'track',
        Component: TrackParcel
      },
      {
        path: 'profile',
        Component: ProfileSection
      },
      {
      path: 'payment/membership/:packageName',  // ✅ New route for membership payment
      Component: Payment
    },
      // rider only routes
      {
        path: 'pending-deliveries',
        element: <RiderRoute><PendingDeliveries></PendingDeliveries></RiderRoute>
      },
      {
        path: 'completed-deliveries',
        element: <RiderRoute>
          <CompletedDeliveries></CompletedDeliveries>
        </RiderRoute>
      },
      {
        path: 'my-earnings',
        element: <RiderRoute>
          <MyEarnings></MyEarnings>
        </RiderRoute>
      },
      {
        path: 'my-meal-request',
        element: 
        <MyRequestedMeals></MyRequestedMeals>
        
      },
      {
        path: 'my-meal-reviews',
        element: 
     <MyReviews></MyReviews>
        
      },

      // admin only routes
      // {
      //   path: 'assign-rider',
      //   element: <AdminRoute><AssignRider></AssignRider></AdminRoute>
      // },
      {
        path: 'pending-riders',
        element: <AdminRoute><PendingRiders></PendingRiders></AdminRoute>
      },
      {
        path: 'pending-meals',
        element: <AdminRoute><PendingMeals></PendingMeals></AdminRoute>
      },
      // {
      //   path: 'active-riders',
      //   element: <AdminRoute><ActiveRiders></ActiveRiders></AdminRoute>
      // },
      {
        path: 'makeAdmin',
        element: <AdminRoute><MakeAdmin></MakeAdmin></AdminRoute>
      },


// -----------------------------

 {
  path: '/dashboard/add-meal',
  element: <AdminRoute><AddMeal></AddMeal></AdminRoute>
},
{
  path: '/dashboard/upcoming-meals',
  element: <UpcomingMeals></UpcomingMeals>
},

      {
  path: '/dashboard/all-meals',
  element: <AdminRoute><AllMeals></AllMeals></AdminRoute>
},
      {
  path: '/dashboard/all-reviews',
  element: <AdminRoute><AllReviews></AllReviews></AdminRoute>
},


    ]
  }
]);