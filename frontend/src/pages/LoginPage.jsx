import { useState } from "react";
import { useNavigate } from "react-router";
import logo from "../assets/chum_buddy_colour.png";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    // USYD email validation
    if (!email.toLowerCase().endsWith("@sydney.edu.au")) {
      setError("Please use your University of Sydney email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    // TODO: Replace this with your real authentication logic.
    console.log("Logging in:", email);

    // Temporary navigation so the page works.
    navigate("/home");
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <main className="login-page">
      {/* Decorative background */}
      <div className="background-decoration decoration-one" />
      <div className="background-decoration decoration-two" />

      <div className="login-container">
        {/* Branding */}
        <section className="brand-section">
          <p className="brand-label">COMMUNICATIONS APP</p>

          <img
            className="brand-logo"
            src={logo}
            alt="Chum Buddy"
          />

          <p className="brand-description">
            Connect with your university community, find your people,
            and make campus life a little more social.
          </p>
        </section>

        {/* Login card */}
        <section className="login-card">
          <div className="card-heading">
            <p className="small-heading">WELCOME BACK</p>

            <h2>Sign in</h2>

            <p>
              Sign in with your University of Sydney account to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="login-form-group">
              <label htmlFor="email">USYD email</label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="your.name@sydney.edu.au"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="login-form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}

            {/* Sign in */}
            <button
              type="submit"
              className="sign-in-button"
            >
              Sign In
            </button>

            {/* Divider */}
            <div className="login-divider">
              <span />
              <p>OR</p>
              <span />
            </div>

            {/* Sign up */}
            <button
              type="button"
              className="sign-up-button"
              onClick={handleSignUp}
            >
              Sign Up
            </button>

            <p className="account-note">
              Only University of Sydney students can create an account.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}

export default LoginPage;