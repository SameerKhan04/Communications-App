import { useState } from "react";
import { useNavigate } from "react-router";

import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSignIn(event) {
    event.preventDefault();

    const validUsydEmail = email
      .toLowerCase()
      .endsWith("@uni.sydney.edu.au");

    if (!validUsydEmail) {
      setError(
        "Please enter a valid University of Sydney email.",
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters.",
      );
      return;
    }

    setError("");

    console.log("Prototype sign in:", {
      email,
      password,
    });

    // Temporary frontend-only behaviour.
    // Later authentication can replace this.
    navigate("/profile");
  }

  function handleSignUp() {
    setError("");

    // Signup page will be connected later.
    alert("Sign up page coming soon.");
  }

  return (
    <main className="login-page">
      <div className="background-decoration decoration-one" />
      <div className="background-decoration decoration-two" />

      <section className="login-container">
        <div className="brand-section">
          <p className="brand-label">
            UNIVERSITY OF SYDNEY
          </p>

          <h1 className="brand-name">
            <span className="brand-white">
              CHUM
            </span>

            <span className="brand-black">
              BUCKET
            </span>
          </h1>

          <p className="brand-description">
            Find your people.
            <br />
            Connect through what you care about.
          </p>
        </div>

        <div className="login-card">
          <div className="card-heading">
            <p className="small-heading">
              WELCOME BACK
            </p>

            <h2>Sign in</h2>

            <p>
              Connect with students across campus.
            </p>
          </div>

          <form onSubmit={handleSignIn}>
            <div className="login-form-group">
              <label htmlFor="email">
                University email
              </label>

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

            <div className="login-form-group">
              <label htmlFor="password">
                Password
              </label>

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

            {error && (
              <p className="error-message">
                {error}
              </p>
            )}

            <button
              className="sign-in-button"
              type="submit"
            >
              Sign in
            </button>
          </form>

          <div className="login-divider">
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
            New to Chum Bucket? Create an account
            using your University of Sydney email.
          </p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;