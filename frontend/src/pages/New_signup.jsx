import { useEffect, useState } from "react";
import "./App.css";


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


function App() {
  const [page, setPage] = useState("login");


  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");


  const [selectedInterests, setSelectedInterests] = useState([]);


  const [loginEmail, setLoginEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");


  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------


  function handleSignIn(event) {
    event.preventDefault();


    const validUsydEmail = loginEmail
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


    // Authentication will be connected later.
    setPage("home");
  }


  // --------------------------------------------------
  // SIGN UP
  // --------------------------------------------------


  function handleSignUp() {
    setError("");
    setPage("signup");
  }


  function handleRegistrationSubmit(event) {
    event.preventDefault();


    const validUsydEmail = email
      .toLowerCase()
      .endsWith("@uni.sydney.edu.au");


    if (!validUsydEmail) {
      setError("Please use your University of Sydney email.");
      return;
    }


    if (phone.trim().length < 8) {
      setError("Please enter a valid phone number.");
      return;
    }


    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }


    setError("");
    setPage("interests");
  }


  // --------------------------------------------------
  // INTERESTS
  // --------------------------------------------------


  function toggleInterest(interest) {
    setSelectedInterests((current) => {
      if (current.includes(interest)) {
        return current.filter((item) => item !== interest);
      }


      return [...current, interest];
    });
  }


  function finishRegistration() {
    if (selectedInterests.length === 0) {
      setError("Please choose at least one interest.");
      return;
    }


    setError("");
    setPage("success");
  }


  // --------------------------------------------------
  // SUCCESS SCREEN
  // --------------------------------------------------


  useEffect(() => {
    if (page !== "success") {
      return;
    }


    const timer = setTimeout(() => {
      setPage("home");
    }, 4000);


    return () => clearTimeout(timer);
  }, [page]);


  // --------------------------------------------------
  // LOGIN PAGE
  // --------------------------------------------------


  if (page === "login") {
    return (
      <main className="login-page">
        <div className="background-decoration decoration-one" />
        <div className="background-decoration decoration-two" />


        <section className="login-container">
          <div className="brand-section">
            <p className="brand-label">UNIVERSITY OF SYDNEY</p>


            <h1 className="brand-name">
              <span className="brand-white">CHUM</span>
              <span className="brand-black">BUDDY</span>
            </h1>


            <p className="brand-description">
              Find your people.
              <br />
              Connect through what you care about.
            </p>
          </div>


          <div className="login-card">
            <div className="card-heading">
              <p className="small-heading">WELCOME BACK</p>
              <h2>Sign in</h2>
              <p>Connect with students across campus.</p>
            </div>


            <form onSubmit={handleSignIn}>
              <div className="form-group">
                <label htmlFor="login-email">University email</label>


                <input
                  id="login-email"
                  type="email"
                  placeholder="unikey@uni.sydney.edu.au"
                  value={loginEmail}
                  onChange={(event) => {
                    setLoginEmail(event.target.value);
                    setError("");
                  }}
                  autoComplete="email"
                  required
                />
              </div>


              <div className="form-group">
                <label htmlFor="login-password">Password</label>


                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  autoComplete="current-password"
                  required
                />
              </div>


              {error && <p className="error-message">{error}</p>}


              <button className="sign-in-button" type="submit">
                Sign in
              </button>
            </form>


            <div className="divider">
              <span />
              <p>OR</p>
              <span />
            </div>


            <button
              className="sign-up-button"
              type="button"
              onClick={handleSignUp}
            >
              Sign up
            </button>


            <p className="account-note">
              New to Chum Buddy? Create an account using your
              University of Sydney email.
            </p>
          </div>
        </section>
      </main>
    );
  }


  // --------------------------------------------------
  // REGISTRATION PAGE
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
            onClick={() => setPage("login")}
          >
            ← Back to sign in
          </button>
        </section>
      </main>
    );
  }


  // --------------------------------------------------
  // INTEREST SELECTION
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
                  className={`interest-button ${
                    selected ? "selected" : ""
                  }`}
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
  // SUCCESS MESSAGE
  // --------------------------------------------------


  if (page === "success") {
    return (
      <main className="success-page">
        <section className="success-card">
          <div className="success-icon">✓</div>


          <p className="small-heading">WELCOME TO CHUM BUDDY</p>


          <h1>
            Hay, you're all
            <br />
            ready to go.
          </h1>


          <p>
            Hope you find who you're looking for!
          </p>


          <div className="success-loader">
            <span />
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


export default App;