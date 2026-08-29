import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router";
import { auth, db } from "../firebase";

import "./New_signup.css";

function New_signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignUp(event) {
    event.preventDefault();
    setError("");

    const validUsydEmail = email.toLowerCase().endsWith("@uni.sydney.edu.au");

    if (!validUsydEmail) {
      setError("Please enter a valid University of Sydney email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Initialize the user's document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: email.toLowerCase(),
        name: name.trim(),
        pronouns: "",
        bio: "",
        degree: "",
        major: "",
        second_major_minor: "",
        languages: ["English"],
        interests: [],
        societies: [],
        profilePicture: null,
      });

      // 3. Send them to the edit profile page to fill out their preferences
      navigate("/profile/edit");
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page"> {/* Reusing login-page class for the same background styling */}
      <div className="background-decoration decoration-one" />
      <div className="background-decoration decoration-two" />

      <section className="login-container">
        {/* BRAND */}
        <div className="brand-section">
          <p className="brand-label">UNIVERSITY OF SYDNEY</p>

          <h1 className="brand-name">
            <span className="brand-white">CHUM</span>
            <span className="brand-black">BUDDIES</span>
          </h1>

          <p className="brand-description">
            Find your people.
            <br />
            Connect through what you care about.
          </p>
        </div>

        {/* SIGN UP CARD */}
        <div className="login-card">
          <div className="card-heading">
            <p className="small-heading">JOIN THE COMMUNITY</p>
            <h2>Create Account</h2>
            <p>Enter your details to get started.</p>
          </div>

          {/* SIGN UP FORM */}
          <form onSubmit={handleSignUp}>
            <div className="login-form-group">
              <label htmlFor="name">Preferred Name</label>
              <input
                id="name"
                type="text"
                placeholder="What should we call you?"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setError("");
                }}
                required
              />
            </div>

            <div className="login-form-group">
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

            <div className="login-form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                autoComplete="new-password"
                required
              />
            </div>

            {error && <p className="error-message">{error}</p>}

            <button 
              className="sign-in-button" 
              type="submit" 
              disabled={isSubmitting}
              style={{ opacity