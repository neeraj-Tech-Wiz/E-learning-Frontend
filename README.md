<div align="center">

# 🎓 EduVerse

### A Full-Stack eLearning Platform with AI-Powered Learning & Live Virtual Classrooms

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_Now-2EA3F7?style=for-the-badge&logo=vercel&logoColor=white)](https://e-learning-frontend-orcin.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](#-license)

![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=flat-square&logo=springsecurity&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)

</div>

---

## 📖 Overview

**EduVerse** is a production-grade, full-stack eLearning platform built to bring classrooms online — complete with **role-based dashboards**, **live video lectures**, **AI-powered assistance**, and **automated assessment**. It's designed around three user roles (Admin, Teacher, Student), each with a tailored experience, secured end-to-end with JWT authentication and fine-grained Spring Security authorization.

The platform combines traditional LMS features (attendance, testing, dashboards) with modern AI capabilities — an intelligent chatbot for instant student support and an AI-driven assignment grader that reads and evaluates submitted PDFs automatically.

🔗 **Live Demo:** [e-learning-frontend-orcin.vercel.app](https://e-learning-frontend-orcin.vercel.app/)

---

## ✨ Features

### 🔐 Role-Based Access Control
- Three distinct roles — **Admin**, **Teacher**, and **Student** — each with dedicated dashboards and permissions
- Secured via **JWT authentication** and fine-grained **Spring Security** authorization rules
- Protected REST endpoints ensure users can only access data and actions relevant to their role

### 🎥 Live Video Conferencing
- Real-time lecture sessions powered by the **Jitsi Meet API**
- Teachers can host live classes directly from their dashboard; students join with a single click
- No third-party paid video SDKs — integrated as a lightweight, embeddable video layer

### 🤖 AI Chatbot (Google Gemini)
- Built-in conversational assistant powered by the **Google Gemini API**
- Gives students instant answers to course-related queries, reducing dependency on teacher availability for basic doubts
- Integrated directly into the student dashboard for a seamless in-app experience

### 📝 AI-Powered Assignment Grader
- Students submit assignments as **PDF files**
- Backend uses **Apache PDFBox** to extract text content from submitted PDFs
- Extracted content is sent to the **Google Gemini API**, which evaluates the submission and returns an AI-generated grade and feedback
- Removes manual grading bottlenecks for large classes while giving students fast, consistent feedback

### ✅ MCQ Testing Engine
- Multi-question assignment/test builder for teachers
- Auto-calculated marks with instant, auto-graded results for objective assessments
- Supports structured question banks per course/subject

### 📊 Automated Attendance Tracking
- Attendance is tracked automatically per session
- **Email alerts via JavaMail** notify students/parents of attendance status, keeping engagement transparent without manual follow-up

### 🗄️ Robust Data Layer
- Normalized **PostgreSQL** schema supporting 3 user roles, 10+ REST endpoints, and concurrent session management
- Built with **Spring Data JPA** for clean, maintainable persistence logic

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React (Vite), Tailwind CSS |
| **Backend** | Spring Boot, Spring Security, Spring Data JPA |
| **Authentication** | JWT (JSON Web Tokens) |
| **Database** | PostgreSQL |
| **Video Conferencing** | Jitsi Meet API |
| **AI / ML** | Google Gemini API |
| **PDF Processing** | Apache PDFBox |
| **Email Service** | JavaMail |
| **Deployment** | Vercel (frontend), Render (backend), Neon (database) |
| **Containerization** | Docker |

---

## 🧩 Architecture

```
┌─────────────────┐        JWT-secured REST API        ┌──────────────────────┐
│  React (Vite)     │ ───────────────────────────────▶ │   Spring Boot API      │
│  Tailwind CSS      │ ◀─────────────────────────────── │   Spring Security      │
└─────────────────┘                                    └──────────┬───────────┘
                                                                    │
                        ┌───────────────────────────────────────────┼───────────────────────────────────────────┐
                        ▼                                           ▼                                           ▼
              ┌──────────────────┐                     ┌────────────────────┐                    ┌──────────────────────┐
              │   PostgreSQL       │                     │   Google Gemini API  │                    │   Jitsi Meet API       │
              │  (Neon-hosted)      │                     │ (Chatbot + AI Grader) │                    │  (Live Video Sessions)  │
              └──────────────────┘                     └────────────────────┘                    └──────────────────────┘
```

- **Frontend** communicates with the backend exclusively through authenticated REST calls
- **AI Grader flow:** Student uploads PDF → PDFBox extracts text → text sent to Gemini API → grade + feedback returned → stored against the submission
- **Video flow:** Teacher creates a session → Jitsi room generated → students join via a shared link within their dashboard

---

## 🚀 Run Locally

**Requires:** Java 17+, Node 18+, PostgreSQL 14+, Maven, a Google Gemini API key

```bash
# Backend
cd backend
mvn spring-boot:run   # configure DB, JWT, Gemini, and mail credentials in application.properties

# Frontend
cd frontend
npm install
npm run dev
```

---

## 🖥️ Demo Access

A public `/demo` route is available with pre-seeded accounts so recruiters and reviewers can explore all three roles without registering:

| Role | Access |
|---|---|
| Admin | Available on `/demo` |
| Teacher | Available on `/demo` |
| Student | Available on `/demo` |

👉 Try it live: **[e-learning-frontend-orcin.vercel.app/demo](https://e-learning-frontend-orcin.vercel.app/)**

---

## 💡 Why I Built This

I wanted to go beyond CRUD tutorials and build something that actually solves a real problem — remote learning that feels complete, not stitched together. EduVerse was my way of combining backend architecture (auth, security, data modeling) with practical AI integration (grading, chat support) and real-time systems (live video) in one working product, rather than isolated demos.

It's also where I learned to debug production-style issues — like reordering Spring Security rules to fix 403 errors on video endpoints, and designing an AI grading pipeline that reliably extracts and evaluates PDF content.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Neeraj Upadhye**
Java Backend / Full-Stack Developer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/neeraj-upadhye-13b813259)
[![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:upadhyeneeraj7777@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/neeraj-Tech-Wiz)
