import { useEffect, useState } from "react";
import "./New_signup.css";
import PasswordInput from "../PasswordInput.jsx";
import { useNavigate } from "react-router";
import {createUserWithEmailAndPassword, signInWithEmailAndPassword} from "firebase/auth";
import {auth} from "../firebase.js";

const INTERESTS = [
  "Gaming",
  "Music",
  "Sport",
  "Art & Design",
  "Technology",
  "Movies",
  "Books",
  "Food",
  "Travel",
  "Photography",
  "Anime",
  "Fitness",
  "Fashion",
  "Coffee",
  "Volunteering",
  "Study",
];


function New_signup() {
  const [page, setPage] = useState("signup");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");


  const [selectedInterests, setSelectedInterests] = useState([]);


  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();


  // --------------------------------------------------
  // SIGN UP
  // --------------------------------------------------
  const handleSubmit = async (e) => {
    // Prevent standard browser page reload
    e.preventDefault();
    setError('');
    // Handle authentication logic here
    console.log("Signing up with:", {email, password});

    const validUsydEmail = email
        .toLowerCase()
        .endsWith("@uni.sydney.edu.au");

    if (!validUsydEmail) {
      setError("Please enter a valid University of Sydney email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setError("");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    }
  };

  // --------------------------------------------------
  // REGISTRATION PAGE
  // --------------------------------------------------


  if (page === "signup") {
    return (
      <main className="login-page">
        <div className="background-decoration decoration-one" />
        <div className="background-decoration decoration-two" />


        <section className="login-container">
          <div className="brand-section">
            <p className="brand-label">UNIVERSITY OF SYDNEY</p>


            <h1 className="brand-name">
              <span className="brand-white">CHUM</span>
              <span className="brand-black">BUCKET</span>
            </h1>


            <p className="brand-description">
              Find your people.
              <br />
              Connect through what you care about.
            </p>
          </div>


          <div className="login-card">
            <div className="card-heading">
              <h2>Sign Up</h2>
              <p>Connect with students across campus.</p>
              <form onSubmit={handleSubmit} className="signup-form">
                {/* Email Field */}
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="signup-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <PasswordInput
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                  />
                </div>
                {error && <div className="error-message" style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

                {/* Submit Button */}
                <button type="submit" className="signup-submit-btn">
                  Create Account
                </button>
              </form>
            </div>
            <p className="account-note">
              New to Chum Bucket? Create an account using your
              University of Sydney email.
            </p>
          </div>
        </section>
      </main>
    );
  }


  // --------------------------------------------------
  // MAIN PAGE
  // --------------------------------------------------


  return (
    <main className="home-page">
      <header className="home-header">
        <div>
          <p className="home-label">CHUM BUCKET</p>
          <h1>Hey, {username || "Chum"}!</h1>
        </div>


        <div className="profile-circle">
          {(username || "C").charAt(0).toUpperCase()}
        </div>
      </header>


      <section className="home-content">
        <div className="home-welcome">
          <p className="small-heading">YOUR CHUMS</p>
          <h2>Find your people.</h2>
          <p>
            Discover students who share your interests and make
            university feel a little more like home.
          </p>
        </div>


        <div className="home-placeholder">
          <div className="placeholder-icon">✦</div>
          <h3>Your matches are coming soon</h3>
          <p>
            Once matching is connected to the backend, your
            recommended chums will appear here.
          </p>
        </div>
      </section>
    </main>
  );
}


export default New_signup;