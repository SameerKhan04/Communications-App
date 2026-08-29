import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import "./App.css";
import { auth } from "./firebase";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  async function handleSignIn(event) {
    event.preventDefault();

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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      console.log("Sign in successful:", userCredential.user);
    } catch (err) {
      setError(err.message);
      console.error("Sign in error:", err);
    }
  }

  async function handleSignUp() {
    setError("");

    const validUsydEmail = email
      .toLowerCase()
      .endsWith("@uni.sydney.edu.au");

    if (!validUsydEmail) {
      setError("Please enter a valid University of Sydney email to sign up.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters for sign up.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      console.log("Sign up successful:", userCredential.user);
    } catch (err) {
      setError(err.message);
      console.error("Sign up error:", err);
    }
  }

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
          {user ? (
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <p className="small-heading">SUCCESS</p>
              <h2>Welcome, {user.email}!</h2>
              <p>You are now securely logged into Chum Bucket.</p>
            </div>
          ) : (
            <>
              <div className="card-heading">
                <p className="small-heading">WELCOME BACK</p>
                <h2>Sign in</h2>
                <p>Connect with students across campus.</p>
              </div>

              <form onSubmit={handleSignIn}>
                <div className="form-group">
                  <label htmlFor="email">University email</label>

                  <input
                    id="email"
                    type="email"
                    placeholder="unikey@uni.sydney.edu.au"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                    autoComplete="email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>

                  <input
                    id="password"
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
                New to Chum Bucket? Create an account using your
                University of Sydney email.
              </p>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;