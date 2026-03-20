# Build-A-Habit App

A 10-week guided program to help you build simple habits based on playful experimentation.

## Tech Stack
- React.js (Vite)
- React Router
- Tailwind CSS
- Firebase Authentication & Firestore

## Setup Instructions

1. **Install Dependencies**
   npm install

2. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
   - Enable **Authentication** (Email/Password provider).
   - Enable **Firestore Database** (start in test mode or configure proper security rules).
   - Copy the .env.example file to .env and fill in your Firebase project configuration

3. **Start Development Server**
   npm run dev

## App Structure
- / - Login / Sign Up Page
- /home - Habit List & Introduction
- /create - Create a New Habit Form
- /habit/:id - Main Calendar and Questionnaires (Daily Check-in, Weekly Reflection)
