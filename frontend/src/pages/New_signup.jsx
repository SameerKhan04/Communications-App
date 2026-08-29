import { useState } from "react";
import { useNavigate } from "react-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

import "./New_signup.css";
import PasswordInput from "../PasswordInput.jsx";

const INTERESTS = [
  "Gaming", "Music", "Sport", "Art & Design", "Technology",
  "Movies", "Books", "Food", "Travel", "Photography",
  "Anime", "Fitness", "Fashion", "Coffee", "Volunteering", "Study",
];

function New_signup() {
  const navigate = useNavigate();

  const [page, setPage] = useState("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // STEP 1: VALIDATE SIGNUP DETAILS
  // --------------------------------------------------
  const handleRegistrationSubmit = (e) => {
    e.preventDefault();

    const validUsydEmail = email.toLowerCase().endsWith("@uni.sydney.edu.au");

    if (!validUsydEmail) {
      setError("Please enter a valid University of Sydney email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setError("");
    setPage("interests");
  };

  // --------------------------------------------------
  // STEP 2: TOGGLE INTERESTS
  // --------------------------------------------------
  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // --------------------------------------------------
  // STEP 3: FINISH & SAVE TO FIREBASE
  // --------------------------------------------------
  const finishRegistration = async () => {
    setError("");

    try {
      // 1. Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Save profile to Firestore (CRITICAL: includes email for messaging feature!)
      await setDoc(doc(db, "users", user.uid), {
        email: email.toLowerCase(), 
        name: username || email.split("@")[0],
        phone: phone,
        pronouns: "",
        bio: "",
        degree: "",
        major: "",
        second_major_minor: "",
        languages: ["English"],
        interests: selectedInterests,
        societies: [],
        profilePicture: null,
      });

      // 3. Move to success screen
      setPage("success");

      // 4. Redirect to the app after 2 seconds
      setTimeout(() => {
        navigate("/profile");
      }, 2000);

    } catch (err) {
      setError(err.message);
    }
  };

  // --------------------------------------------------
  // UI: REGISTRATION PAGE (Step 1)
  // --------------------------------------------------
  if (page === "signup") {
    return (
      <main className="signup-page">
        <section className="signup-card">
          <div className="signup-progress">
            <span className="progress-dot active" />
            <span className="progress-line" />
            <span className="progress-dot" />
          </div>

          <div className="signup-heading">
            <p className="small-heading">LET'S GET STARTED</p>
            <h1>Create your account</h1>
            <p>
              A few details and you'll be ready to meet your new
              university chums.
            </p>
          </div>

          <form onSubmit={handleRegistrationSubmit}>
            <div className="form-group">
              <label htmlFor="signup-email">University email</label>
              <input
                id="signup-email"
                type="email"
                placeholder="unikey@uni.sydney.edu.au"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <PasswordInput
                id="signup-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="Create a strong password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-phone">Phone number</label>
              <input
                id="signup-phone"
                type="tel"
                placeholder="04XX XXX XXX"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  setError("");
                }}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="signup-username">Username</label>
              <input
                id="signup-username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setError("");
                }}
                minLength={3}
                required
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <button className="primary-button" type="submit">
              Continue
            </button>
          </form>

          <button
            className="back-button"
            type="button"
            onClick={() => navigate("/login")}
          >
            ← Back to sign in
          </button>
        </section>
      </main>
    );
  }

  // --------------------------------------------------
  // UI: INTEREST SELECTION (Step 2)
  // --------------------------------------------------
  if (page === "interests") {
    return (
      <main className="interests-page">
        <section className="interests-card">
          <div className="signup-progress">
            <span className="progress-dot completed">✓</span>
            <span className="progress-line completed" />
            <span className="progress-dot active" />
          </div>

          <div className="signup-heading">
            <p className="small-heading">MAKE IT YOURS</p>
            <h1>What are you into?</h1>
            <p>
              Pick a few things you enjoy. We'll use these to help
              you find people with similar interests.
            </p>
          </div>

          <div className="interest-grid">
            {INTERESTS.map((interest) => {
              const selected = selectedInterests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  className={`interest-button ${selected ? "selected" : ""}`}
                  onClick={() => toggleInterest(interest)}
                >
                  {selected && <span className="interest-check">✓</span>}
                  {interest}
                </button>
              );
            })}
          </div>

          <p className="interest-count">
            {selectedInterests.length}{" "}
            {selectedInterests.length === 1 ? "interest" : "interests"} selected
          </p>

          {error && <p className="error-message">{error}</p>}

          <button
            className="primary-button"
            type="button"
            onClick={finishRegistration}
          >
            Finish
          </button>

          <button
            className="back-button"
            type="button"
            onClick={() => setPage("signup")}
          >
            ← Back
          </button>
        </section>
      </main>
    );
  }

  // --------------------------------------------------
  // UI: SUCCESS MESSAGE (Step 3)
  // --------------------------------------------------
  if (page === "success") {
    return (
      <main className="success-page">
        <section className="success-card">
          <div className="success-icon">✓</div>
          <p className="small-heading">WELCOME TO CHUM BUDDY</p>
          <h1>
            Hey, you're all
            <br />
            ready to go.
          </h1>
          <p>Hope you find who you're looking for!</p>
          <div className="success-loader">
            <span />
          </div>
        </section>
      </main>
    );
  }

  // --------------------------------------------------
  // DEFAULT / FALLBACK PAGE
  // --------------------------------------------------
  return (
    <main className="home-page">
      <header className="home-header">
        <div>
          <p className="home-label">CHUM BUDDY</p>
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