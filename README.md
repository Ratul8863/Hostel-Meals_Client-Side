# 🏠 ProFast Hostel Management System

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

> A full-stack hostel meal and membership management platform with Stripe integration, admin control panel, premium user experience, and a modern UI.

---

## 🔐 Admin Credentials

- **Email:** `ratulroy@gmail.com`  
- **Password:** `ASDf123@`  
> ✅ For demo and testing only. Use responsibly.

---

## 🌐 Live Preview

- **Frontend:** [hostel-management-by-ratul.web.app](https://hostel-management-by-ratul.web.app)  
- **Backend API:** [hostel-management-server-nine.vercel.app](https://hostel-management-server-nine.vercel.app)

---


## 🚀 Key Features

🔑 **Authentication & Authorization**
- Firebase Auth + Secure JWT integration
- Role-based dashboard navigation for `admin` and `user`

🍛 **Meal Management**
- Add/update/delete categorized meals: **Breakfast**, **Lunch**, **Dinner**
- Meal detail pages with description, ingredients, likes, and reviews

📆 **Upcoming Meals**
- Users can preview next meals
- Premium users can ❤️ like meals
- Admins can toggle publish status

💸 **Stripe Payment Integration**
- Stripe Checkout to upgrade to premium membership
- Payment success updates backend status

⭐ **Premium Features**
- Premium members can request meals
- Access to like and interact with exclusive content

📝 **Meal Reviews**
- Users can write, edit, and delete reviews
- Admins can monitor all reviews from dashboard

🔎 **Smart Search**
- Server-side user and meal search with filters
- MongoDB indexing ensures fast lookups

📈 **Real-Time Like System**
- Toggle-based like/unlike system per meal
- Backend tracks `likedBy` list for each item

📱 **Fully Responsive UI**
- Tailwind + DaisyUI design system
- Clean mobile-first layout with toast alerts and modals

🧑‍💼 **Admin Dashboard**
- Manage all meals, users, reviews, and premium requests
- Sortable tables and status controls

---

## 🛠 Tech Stack Overview

| Layer         | Technologies |
|---------------|--------------|
| **Frontend**  | React.js, React Router, Tailwind CSS, DaisyUI |
| **Backend**   | Node.js, Express.js, MongoDB |
| **Auth**      | Firebase Auth + JWT |
| **Payment**   | Stripe Integration |
| **Fetching**  | Axios + [TanStack Query](https://tanstack.com/query/latest) |
| **Deployment**| Vercel (Client) & Render (API Server) |

---


## 🧪 Suggested Test Scenarios

✅ Login as user → View meals, reviews  
✅ Attempt to like a meal without premium → Blocked  
✅ Upgrade via Stripe → Success and updated membership  
✅ Navigate to Admin Dashboard → Add meal, manage users  
✅ Check upcoming meals → Like as premium, admin publish/unpublish  
✅ Unauthorized route access → Auto-redirect to login

---

## 🙋‍♂️ Author

**Ratul Roy**  
🇧🇩 Bangladesh | 🔧 MERN Stack Developer  
📫 [LinkedIn](https://linkedin.com) | 💼 Portfolio (Coming Soon)

---

> 🚨 This is a practice/assignment project and not intended for production use. Feel free to fork and explore!


