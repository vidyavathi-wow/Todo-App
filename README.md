📝 **Team Sprint — Todo Management System (Collaborative Assignment)**

A collaborative full-stack Task Management System built as part of Assignment #3.
Our team worked together using structured Git workflows, feature branches, PR reviews, and continuous integration to enhance the chosen base app from Assignment #1.

This project demonstrates our ability to collaborate effectively, review each other's work, integrate features without conflict, and maintain production-level discipline throughout development.

---

## 👥 **Team Members**

* **Arjun U**
* **Vidya Telugu**
* **Nikita Dung**

---

## 🚀 **Live Demo**

* **Frontend (React + Tailwind):** [https://tms-frontend-new.onrender.com](https://tms-frontend-new.onrender.com)
* **Backend (Node.js + Express + Sequelize):** [https://tms-backend-5dcu.onrender.com](https://tms-backend-5dcu.onrender.com)
* **UI Reference (Dribbble):** [https://share.google/K5TtkiojDCnre0oPN](https://share.google/K5TtkiojDCnre0oPN)

---

## 💡 **Team-Decided Enhancements (Sprint Features)**

The team collaboratively selected and implemented the following enhancements:

* **Role-Based Access**
* **Task Sharing Between Users**
* **Additional Analytics & Insights**
* **Email Notifications + Time-Scheduled Alerts**
* **Dynamic Calendar Improvements**
* **UI/UX Enhancements & Responsive Layout Fixes**
* **Improved Task Flow & State Consistency Across Components**
* **Enhanced API Integrations & Data Filtering Logic**

---

## 🧩 **Core App Features (Base Functionality)**

* Secure **JWT Authentication** (Login, Register, Forgot Password via Nodemailer)
* Full CRUD operations for todos
* Mark tasks as completed or pending
* Bar chart & pie chart analytics
* Profile upload using **Multer + Cloudinary**
* Email reminders scheduled using **node-cron**
* Fully responsive UI built with Tailwind CSS
* REST-based API using Sequelize ORM

---

## 🛠️ **Tech Stack**

### **Frontend**

* React.js
* Tailwind CSS
* Axios
* React Hot Toast
* React Router DOM

### **Backend**

* Node.js
* Express.js
* Sequelize ORM
* PostgreSQL
* JWT Authentication
* Nodemailer
* node-cron

---

## 🤝 **Team Collaboration Workflow**

Our teamwork strictly followed the assignment guidelines:

### ✔ **Feature Branch Workflow**

* Every member worked only on their own feature branch.
* No direct commits to **main**.

### ✔ **Pull Requests**

* All PRs reviewed and approved by **two teammates** before merging.
* Reviews included code suggestions, bug findings, and UI feedback.

### ✔ **GitHub Issues**

* Issues created for bugs, enhancements, and discussions.
* Each PR linked to a relevant issue.

### ✔ **Continuous Commits**

* No local-only work; every meaningful change was pushed immediately.
* Commit messages were descriptive and meaningful.

### ✔ **Code Comments**

* Components, services, and models documented for clarity and maintainability.

---

## 🌐 **Deployment**

Both frontend and backend deployed using **Render**.

| Service    | Platform | URL                                                                              |
| ---------- | -------- | -------------------------------------------------------------------------------- |
| Frontend   | Render   | [https://tms-frontend-new.onrender.com](https://tms-frontend-new.onrender.com)   |
| Backend    | Render   | [https://tms-backend-5dcu.onrender.com](https://tms-backend-5dcu.onrender.com)   |
| UI Concept | Dribbble | [https://share.google/K5TtkiojDCnre0oPN](https://share.google/K5TtkiojDCnre0oPN) |

---

## 🏗️ **Setup Instructions (Local Development)**

### **1️⃣ Clone Repo**

```bash
git clone https://github.com/your-username/todo-management-system.git
cd todo-management-system
```

### **2️⃣ Backend Setup**

```bash
cd server
npm install
```

Create **.env** using the assignment environment list.

Start backend:

```bash
npm run server
```

### **3️⃣ Frontend Setup**

```bash
cd ../client
npm install
npm run dev
```

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend: [http://localhost:5000](http://localhost:5000)

---

## 📄 **Team Decision Summary**

* Selected feature set balancing backend complexity and frontend enhancements.
* Prioritized high-impact improvements: access control, sharing, analytics, reminders, UI refinement.
* Followed strict Git standards to avoid conflicts.
* Chose Render for deployment due to easy integration and configuration.

---

## ⚠️ **Team Challenges **

### **Nikita’s Challenges**

During development, adding a new database column unexpectedly broke Sequelize associations, causing todos to lose assigned users on refresh; the dynamic calendar required additional filtering logic and month-based APIs; and dashboard responsiveness issues caused spacing, alignment, and sidebar overlap problems across devices.

### **Arjun’s Challenges**

Handling soft delete and status filtering caused inconsistent behavior between dashboard and calendar; library version mismatches created UI rendering bugs; repeated merge conflicts disrupted shared todo logic; and mismatches between backend responses and frontend state led to stale or unfiltered events requiring deep debugging.

### **Vidya’s Challenges**

Keeping the local and remote Git repositories synchronized was difficult with multiple active branches, and ensuring responsiveness for LatestTodos required correcting layout shifts, grid inconsistencies, and UI issues triggered by dynamic data and component rerenders.

---

## 🧪 **Testing Checklist**

* Register, login, and verify authentication flow
* Create, edit, delete, and share tasks
* View analytics (bar/pie charts)
* Trigger email reminders
* Test scheduled notifications
* Validate role-based restrictions
* Check responsiveness across all devices

---

## 📘 **Learning Outcomes**

* Real-world Git collaboration
* Peer code reviews
* Multi-branch workflow discipline
* Merge conflict resolution
* Scalable architecture design
* UI/UX consistency improvement
* Backend–frontend integration discipline
