# Chum Buddies

Chum Buddies is a full-stack web application designed to help university students connect, match, and build communities based on shared interests, degrees, societies, and languages. Whether you are looking for a study group or a new friend on campus, Chum Buddies provides a smart matching algorithm and seamless real-time communication tools to bring students together.

## Key Features

* **Smart Matching Algorithm:** A dedicated Python FastAPI backend calculates compatibility scores using Jaccard similarity based on shared interests, university societies, spoken languages, and degree programs.
* **Mutual Match System:** Connect with peers through a mutual swipe/interest system. Users only appear on your Friends list if the interest is mutual.
* **Real-Time Chat & Group Chats:** Built on Firebase Firestore, supporting instant 1-on-1 messaging and dynamic group chats. Users can create groups with custom names and upload unique group profile photos.
* **Live Message Translation:** Break language barriers instantly. Incoming messages can be translated in real-time to multiple languages (Spanish, French, Chinese, Arabic, Hindi, etc.) via a FastAPI endpoint utilizing a public translation API.
* **Dynamic Search & Filtering:** Easily search through your mutual connections by name, degree, or specific interests.
* **Responsive Custom UI:** A clean, student-focused interface built with React, featuring custom branding, active state navigation, and smooth modal interactions.

* **Student Profile:** Users can create and customise their own profile by adding a profile picture, username, biography, degree, major, interests, languages, societies and pronouns.

* **Explore Friends:** After signing in, users can explore potential connections based on their compatibility and shared interests.

* **Direct Messaging:** Users can privately message their mutual connections through the built-in direct messaging system.

* **Friend Discovary** Users can view other students' profiles and discover people with similar academic backgrounds, interests, languages, and societies.

## Tech Stack

**Frontend:**
* React (Vite)
* React Router (for SPA navigation)
* Standard CSS (Custom responsive styling)

**Backend:**
* Python
* FastAPI (API routing & matching algorithm)
* Uvicorn (ASGI server)
* Requests (External API handling)

**Database & Authentication:**
* Firebase Authentication
* Friebase Storage (for profile and group images)
* Cloud Firestore (NoSQL Database for users, swipes, and chats)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
Make sure you have the following installed:
* [Node.js](https://nodejs.org/) (v16 or higher)
* [Python](https://www.python.org/) (3.8 or higher)
* A [Firebase](https://firebase.google.com/) account/project

### 1. Clone the repository
```bash
git clone [https://github.com/your-username/chum-buddies.git](https://github.com/your-username/chum-buddies.git)
cd chum-buddies
```

### 2. Setup Firebase (Frontend)
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install NPM packages:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory and add your Firebase configuration details:
   ```env
   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   ```
*(Note: Ensure your `src/firebase.js` is configured to read these variables).*

### 3. Setup FastAPI (Backend)
1. Open a **new terminal tab/window** and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install backend dependencies:
   ```bash
   pip install fastapi uvicorn requests pydantic
   ```

## Usage

To run the application, you will need to start both the backend server and the frontend development server simultaneously.

**Start the Backend:**
```bash
# In the backend directory
uvicorn main:app --reload
```
*The FastAPI server will run on `http://127.0.0.1:8000`. This must be running for the matching algorithm and live translation to work.*

**Start the Frontend:**
```bash
# In the frontend directory
npm run dev
```
*The Vite development server will start, typically on `http://localhost:5173`.*

## Project Structure Overview

* **`frontend/`**: Contains the React/Vite frontend application.

  * **`src/`**: Main React source code.
    * **`components/`**: Reusable UI components such as navigation and shared interface elements.
    * **`pages/`**: Main application views, including `LoginPage.jsx`, `ProfilePage.jsx`, `EditProfilePage.jsx`, `Friends.jsx`, `MessagesPage.jsx`, `ChatPage.jsx`, and `UserProfilePage.jsx`.
    * **`assets/`**: Static images, logos, icons, and other branding assets.
    * **`App.jsx`**: Defines the application's React Router routes and page navigation.
    * **`main.jsx`**: Entry point for the React application.
    * **`index.css`**: Global CSS styles and variables.
  * **`package.json`**: Frontend dependencies and development scripts.

* **`backend/`**: Contains the Python FastAPI server.

  * **`main.py`**: Houses the FastAPI endpoints, including the matching and translation functionality.
  * **Matching logic**: Calculates compatibility between students using shared profile attributes and Jaccard similarity.
  * **Translation endpoint**: Handles requests for message translation using an external translation API.

* **`firebase/`**: Firebase configuration and integration used for authentication, Firestore, and Storage.

## Pages & Navigation

Chum Buddies uses React Router to provide navigation between the different sections of the application.

* **`LoginPage.jsx`**: Provides the sign-in and sign-up interface. Students can create an account and sign in using their university credentials.

* **`ExplorePage.jsx`**: The main discovery page shown after signing in. Users can browse potential connections recommended by the matching algorithm based on their profile information and shared interests.

* **`ProfilePage.jsx`**: Displays the current user's profile, including their profile picture, username, biography, degree, major, interests, languages, societies, and pronouns.

* **`EditProfilePage.jsx`**: Allows users to update and customise their profile information, including their profile picture, personal details, interests, languages, and academic information.

* **`UserProfilePage.jsx`**: Displays another student's public profile. Users can view their academic background, interests, languages, societies, and other information before deciding whether to connect with them.

* **`Friends.jsx`**: Displays the user's mutual connections. Users can search and filter their friends by name, degree, or interests.

* **`MessagesPage.jsx`**: Displays the user's conversations and provides access to their direct messages and group chats.

* **`ChatPage.jsx`**: Provides the real-time messaging interface for individual and group conversations. Messages are stored using Firebase Firestore and can be translated to help overcome language barriers.

### Navigation Flow

The general user flow through the application is:

`Sign Up / Sign In` -> `Explore Friends` -> `View Student Profile` -> `Express Interest` -> `Mutual Connection` -> `Friends` -> `Direct Messages / Group Chats`

Users can also navigate between their **Profile**, **Friends**, and **Messages** sections while using the application.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

When contributing, please try to keep the existing project structure and coding style consistent. New features should also be tested locally before submitting a pull requiuest.

## Future Improvments

Some potential future improvements include:

* Expanding the matching algorithm with additional compatibility factors.
* Adding more advanced friend and connection recommendations.
* Improving accessibility across the application.
* Adding push notifications for new messages and connections.
* Supporting additional languages for message translation.
* Adding more customisation options for student profiles.
* Deploying the application for use by students outside of the development environment.

## License

This project was created as a university/hackathon project.

Unless otherwise stated, the project is currently not distributed under a specific open-source licence. All rights are reserved by the project authors.