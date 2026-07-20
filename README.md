# TeamFlow — Team Task Management Workspace

TeamFlow is a modern, full-stack productivity application designed to streamline collaboration, task management, and project tracking for teams. Built with a focus on speed, clarity, and intuitive user experience, TeamFlow provides a centralized workspace where teams can transition from ideation to execution seamlessly.

In an era of fragmented communication, TeamFlow solves the problem of "where is that task?" by providing a single source of truth. Whether you are managing a small startup team or a complex project, TeamFlow offers the tools needed to monitor progress, assign accountability, and visualize productivity through a high-performance SaaS dashboard.

---

## 🚀 Key Features

### 🔐 Secure Authentication
- robust JWT-based authentication system.
- Secure password hashing and session management.
- Protected API routes and client-side middleware guards.

### 👥 Role-Based Access Control (RBAC)
- Distinct permissions for **Admins** and **Members**.
- Workspace-level security ensuring users only see what they are authorized to.

### 📂 Project & Workspace Management
- Create and manage multiple workspaces/projects.
- Intuitive project dashboards with real-time status updates.
- Centralized member management for every project.

### 📝 Comprehensive Task Management
- Detailed task creation with descriptions, due dates, and priorities.
- Status tracking (Todo, In-Progress, Done).
- Assign tasks to specific team members to ensure clear accountability.

### 📊 Advanced Analytics
- Visualized productivity metrics via a dedicated analytics dashboard.
- Track project completion rates and team member workload.
- Data-driven insights into project health.

### 🌟 Demo Workspace
- "One-Click" exploration for recruiters and new users.
- Automated data seeding to showcase platform capabilities instantly.

### 🌗 Modern UI/UX
- Fully responsive design for mobile, tablet, and desktop.
- Dark and Light mode support with seamless theme switching.
- Smooth animations and micro-interactions powered by Framer Motion.

---

## 📱 Product Screens Overview

### Dashboard
The command center of your productivity. View your recent projects, upcoming deadlines, and high-level stats at a glance.
![Dashboard Placeholder](https://via.placeholder.com/1200x600/1e1e2e/ffffff?text=TeamFlow+Dashboard)

### Workspace & Project Board
A dedicated space for each project where you can manage the full lifecycle of tasks and monitor team contributions.
![Workspace Placeholder](https://via.placeholder.com/1200x600/1e1e2e/ffffff?text=Project+Workspace)

### Task Management
Granular control over individual tasks, including priority levels, assignments, and progress tracking.
![Task Board Placeholder](https://via.placeholder.com/1200x600/1e1e2e/ffffff?text=Task+Management)

### Member Management
Easily invite team members to projects and manage their roles within the workspace.
![Member Management Placeholder](https://via.placeholder.com/1200x600/1e1e2e/ffffff?text=Member+Management)

### Analytics View
Deep dive into the data with charts and metrics that show exactly how your team is performing.
![Analytics Placeholder](https://via.placeholder.com/1200x600/1e1e2e/ffffff?text=Analytics+Dashboard)

---

## 🏗️ Architecture Overview

TeamFlow follows a hierarchical data relationship model designed for scalability and performance:

**User → Workspace/Project → Members → Tasks → Analytics**

1.  **User**: The root entity; authenticates and can own or belong to multiple projects.
2.  **Project**: The primary container for collaboration. Each project has one Admin (creator) and multiple Members.
3.  **Members**: A junction between Users and Projects, defining access levels.
4.  **Tasks**: Entities within a Project, assigned to specific Members.
5.  **Analytics**: An aggregation layer that processes Task and Project data for visualization.

---

## 💾 Database Schema

Built with **MongoDB** and **Mongoose** for a flexible, document-oriented data structure.

### User Model
```typescript
{
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  avatarInitials: { type: String },
  createdAt: { type: Date, default: Date.now }
}
```

### Project Model
```typescript
{
  title: { type: String, required: true },
  description: { type: String },
  adminId: { type: ObjectId, ref: 'User', required: true },
  members: [{ type: ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
}
```

### Task Model
```typescript
{
  title: { type: String, required: true },
  description: { type: String },
  dueDate: { type: Date },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  assignedTo: { type: ObjectId, ref: 'User' },
  projectId: { type: ObjectId, ref: 'Project', required: true },
  createdBy: { type: ObjectId, ref: 'User', required: true }
}
```

---

## 🔐 Role System

TeamFlow implements a clear separation of concerns through its role-based system:

### 👑 Admin
- **Full Control**: Create, edit, and delete projects/workspaces.
- **Team Management**: Invite or remove members from the workspace.
- **Task Authority**: Create and assign any task within the project.
- **Project Configuration**: Modify project settings and descriptions.

### 👤 Member
- **Active Collaboration**: View all projects they are a part of.
- **Task Ownership**: Update the status and details of tasks assigned to them.
- **Visibility**: Access the task board and project analytics.

---

## 📂 Folder Structure

```text
src/
├── app/              # Next.js App Router (Pages & API Routes)
│   ├── (dashboard)/  # Protected dashboard layouts and pages
│   ├── api/          # Backend API endpoints (Auth, Tasks, Projects)
│   ├── login/        # Authentication pages
│   └── signup/       # User registration
├── components/       # Reusable React components
│   └── ui/           # shadcn/ui base components
├── hooks/            # Custom React hooks for state and fetching
├── lib/              # Shared utilities, DB config, and seed scripts
├── models/           # Mongoose schemas and models
├── types/            # TypeScript interfaces and definitions
└── proxy.ts          # API request proxying/handling
```

---

## 🛠️ Installation Guide

Follow these steps to set up TeamFlow locally:

1.  **Clone the repository**
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
    cd YOUR_REPO
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env.local` file in the root directory and add the variables listed in the section below.

4.  **Start the development server**
    ```bash
    npm run dev
    ```

---

## 🔑 Environment Variables

Create a file named `.env.local` (or `.env` for production) and include the following:

```env
# MongoDB Connection String
MONGODB_URI=your_mongodb_connection_string

# JWT Secret for Authentication
JWT_SECRET=your_super_secret_jwt_key

# Application Environment
NODE_ENV=development

# (Optional) Base URL for API calls
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 💻 Running Locally

Once dependencies are installed and environment variables are set:

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

---

## 🚢 Deployment

TeamFlow is designed to be deployed on **Railway** or **Vercel** with minimal configuration.

1.  Connect your GitHub repository to Railway.
2.  Add your `MONGODB_URI` and `JWT_SECRET` in the Railway Project Settings.
3.  Railway will automatically detect the Next.js environment and deploy the application.

---

## 🧪 Demo Workspace Feature

To make it easy for recruiters and reviewers to explore the platform without manually creating dozens of tasks, TeamFlow includes a **Demo Seeding System**.

By clicking the "Try Demo" button on the landing page, the application:
1.  Seeds a sample workspace with a pre-defined set of projects and tasks.
2.  Creates demo users with varied roles.
3.  Populates the analytics dashboard with historical-style data.
This allows for an instant "Live Product" experience.

---

## 🔮 Future Improvements

- [ ] **Real-time Updates**: Integration of WebSockets (Socket.io) for instant task updates.
- [ ] **Drag-and-Drop**: Interactive Kanban board using `@dnd-kit`.
- [ ] **Activity Logs**: A full audit trail of project changes and task movements.
- [ ] **Notification System**: In-app and email alerts for task assignments and deadlines.
- [ ] **Comments System**: Collaborative discussion threads on individual tasks.

---

## 🎨 Design Philosophy

-   **Productivity First**: Every click should lead to an action. We avoid cluttered interfaces.
-   **Clean SaaS Aesthetics**: Using a refined color palette, modern typography (Inter), and subtle shadows to create a premium feel.
-   **Minimal Friction**: Users should be able to go from login to creating their first task in under 60 seconds.

---

## 🧠 Tech Decisions

-   **Next.js**: Chosen for its robust App Router, built-in SEO capabilities, and seamless integration of frontend and backend.
-   **MongoDB + Mongoose**: Selected for the flexible document schema, which is ideal for the evolving nature of project/task data.
-   **JWT**: Provides a stateless, scalable way to handle authentication across the app and API.
-   **Tailwind CSS + shadcn/ui**: Enables rapid development of a consistent, professional design system that is fully customizable.

---

## ✍️ Author

**Siddhant**
- GitHub: [@Siddhant-0912](https://github.com/Siddhant-0912)
- Project Repository: [TeamFlow](https://github.com/Siddhant-0912/TeamFlow-TaskManager)

---
*Built with ❤️ for teams that move fast.*
