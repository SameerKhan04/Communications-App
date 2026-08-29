# Chum Buddies

Chum Buddies is a full-stack web application designed to help university students connect, match, and build communities based on shared interests, degrees, societies, and languages. Whether you are looking for a study group or a new friend on campus, Chum Buddies provides a smart matching algorithm and seamless real-time communication tools to bring students together.

## Key Features

* **Smart Matching Algorithm:** A dedicated Python FastAPI backend calculates compatibility scores using Jaccard similarity based on shared interests, university societies, spoken languages, and degree programs.
* **Mutual Match System:** Connect with peers through a mutual swipe/interest system. Users only appear on your Friends list if the interest is mutual.
* **Real-Time Chat & Group Chats:** Built on Firebase Firestore, supporting instant 1-on-1 messaging and dynamic group chats. Users can create groups with custom names and upload unique group profile photos.
* **Live Message Translation:** Break language barriers instantly. Incoming messages can be translated in real-time to multiple languages (Spanish, French, Chinese, Arabic, Hindi, etc.) via a FastAPI endpoint utilizing a public translation API.
* **Dynamic Search & Filtering:** Easily search through your mutual connections by name, degree, or specific interests.
* **Responsive Custom UI:** A clean, student-focused interface built with React, featuring custom branding, active state navigation, and smooth modal interactions.

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

* **`frontend/src/`**: Contains all React code.
  * **`components/`**: Reusable UI elements (e.g., `AppNavbar.jsx`).
  * **`pages/`**: Main application views (`Friends.jsx`, `MessagesPage.jsx`, `ChatPage.jsx`, etc.).
  * **`assets/`**: Static images, custom icons, and branding.
* **`backend/`**: Contains the Python server.
  * **`main.py`**: Houses the FastAPI endpoints (`/api/match`, `/api/translate`) and the Jaccard similarity logic.

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

IDK?