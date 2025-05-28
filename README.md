# Job-Hunting

A modern, full-stack job portal application built with **React**, **TypeScript**, and **Supabase**. The platform allows users to browse, search, and apply for jobs, while administrators can post and manage job listings. The project includes robust authentication, application tracking, and a clean, responsive UI.

---

## 🚀 Features

- **User Dashboard**
  - Browse and search job listings
  - Filter jobs by title, company, location, and description
  - Apply for jobs with instant feedback (localStorage-based tracking)
  - See application status persistently

- **Admin Dashboard**
  - Post new job listings
  - Edit or delete existing job postings
  - Manage all job listings in the system

- **Authentication**
  - Secure user authentication via Supabase Auth
  - Role-based access (admin/user)
  - Google OAuth and email/password login

- **Application Tracking**
  - Tracks job applications per user and job
  - LocalStorage fallback for application status
  - Toast notifications for user feedback

- **Responsive Design**
  - Clean, modern, and mobile-friendly UI
  - Beautiful use of badges, icons, and cards

---

## 🛠️ Tech Stack

| Layer         | Technology                                   |
| ------------- | -------------------------------------------- |
| Frontend      | React, TypeScript, Tailwind CSS, Lucide Icons|
| Backend/API   | Supabase (PostgreSQL, Auth, Storage)         |
| Auth          | Supabase Auth (Email/Password, Google OAuth) |
| State/UI      | React Hooks, Context API, Toast Notifications|
| Database      | Supabase (Postgres)                          |
| Deployment    | GitHub, Vercel/Netlify (suggested)           |

---

## 📁 Project Structure
Job-Hunting/ ├── src/ │ ├── components/ # React components (JobCard, UserDashboard, AdminDashboard, etc.) │ ├── hooks/ # Custom hooks (useAuth, use-toast) │ ├── integrations/ │ │ └── supabase/ # Supabase client and types │ └── ... # Other source files ├── public/ # Static assets (logo, icons) ├── package.json ├── README.md └── ...


---

## ⚙️ Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/rishabhurfrk/Job-Hunting.git](https://github.com/rishabhurfrk/Job-Hunting.git)
   cd Job-Hunting
   ```
2. install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Configure Supabase:
    - Create a Supabase project.
    - Copy your Supabase URL and public API key.
    - Update the credentials in src/integrations/supabase/client.ts.
4. Database Setup:
    - Run the SQL scripts to create the following tables:
        - job_listings (for job postings)
        - job_applications (for application tracking)
        - profiles (for user profiles)
    - Enable Row Level Security (RLS) and add appropriate policies.

5. Access the application:
    - Open your browser and navigate to http://localhost:5173 to view the application.
## 📝 Database Schema Overview
    - job_listings
    id, title, company_name, company_logo, apply_link, description, location, salary_range, job_type, created_at, created_by
    - job_applications
    id, user_id, job_id, applied_at, created_at
    Foreign keys: user_id → auth.users(id), job_id → job_listings(id)
    - profiles
    id, email, full_name, role, created_at, updated_at

# 🎨 UI/UX
    -Modern card-based layout
    -Responsive grid for job listings
    -Visual feedback with badges and icons
    -Toast notifications for actions
# 🧑‍💻 Contributing
    -Fork the repository
    -Create your feature branch: git checkout -b feature/your-feature
    -Commit your changes: git commit -m "feat: Add your feature"
    -Push to the branch: git push origin feature/your-feature
    -Open a pull request
# 📚 License
    This project is licensed under the MIT License.
