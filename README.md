# 🏠 ProFast Hostel Management System

A modern and feature-rich full-stack web application built to manage meals, users, reviews, premium subscriptions, and upcoming meal schedules in a hostel environment.

## 🔐 Admin Credentials

- **Username/Email:** admin@hostel.com  
- **Password:** 123456

> These credentials are for demo/testing purposes only.

## 🌐 Live Site

**Frontend:** [https://profast-hostel.vercel.app](https://profast-hostel.vercel.app)  
**Backend:** [https://profast-hostel-api.onrender.com](https://profast-hostel-api.onrender.com)  

---

## 🚀 Features

✅ **User Authentication** — Firebase login with secure JWT-based backend token verification.

✅ **User & Admin Dashboards** — Role-based access with separate routes and dashboards for regular users and admins.

✅ **Meals Management**  
- Admins can add, update, and delete meal items.
- Meals are categorized into **Breakfast**, **Lunch**, and **Dinner**.

✅ **Upcoming Meals Section**  
- Users can view upcoming meals and like them.
- Likes are restricted to premium users only.
- Admins can publish/unpublish upcoming meals.

✅ **Like/Unlike Feature**  
- Simple toggle system for likes.
- Backend keeps track of `likedBy` list per meal.

✅ **Meal Requests (Premium only)**  
- Premium users can request meals.
- Admins can approve or serve requested meals.

✅ **Stripe Payment Integration**  
- Users can subscribe to a premium plan through Stripe checkout.
- Premium users get access to exclusive features.

✅ **Dynamic Search**  
- Search for users by email or username.
- Server-side meal search across title, ingredients, and description using MongoDB indexing.

✅ **User Reviews System**  
- Users can post, edit, and delete reviews on meals.
- Admin can view all reviews in the dashboard.

✅ **Mobile-Responsive UI**  
- Fully responsive design using Tailwind CSS and DaisyUI.
- Clean and accessible layout with consistent modern styling.

---

## 🛠 Tech Stack

- **Frontend:** React.js, React Router, Tailwind CSS, DaisyUI
- **Backend:** Node.js, Express.js, MongoDB, Stripe
- **Authentication:** Firebase Auth + JWT
- **State Management & Fetching:** React Query (TanStack Query), Axios Secure
- **Deployment:** Vercel (Frontend), Render (Backend)

---

## 📂 Folder Structure Highlights

- `/client` → React frontend (pages, components, hooks)
- `/server` → Express backend (routes, controllers, database config)
- `/public/coverageData.json` → Used for dynamic service center dropdowns

---

## 🧪 Test Scenarios

- ✅ Login with valid user → View Meals
- ✅ Try to like an upcoming meal → Only works for premium users
- ✅ Admin can update meal status → Confirmed via Toast/Alert
- ✅ Stripe checkout → Redirects and verifies payment
- ✅ Unauthorized access to dashboard routes → Redirect to login

---

## 👨‍💻 Author

Made with 💙 by **Ratul Roy**  
🌍 Bangladesh | 🛠 MERN Stack Developer  
