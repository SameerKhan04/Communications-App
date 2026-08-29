// src/pages/ProfilePage.jsx

import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import { auth, db } from "../firebase";

import "./ProfilePage.css";


function ProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      async (user) => {
        if (!user) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        setLoading(true);
        setError("");

        try {
          const profileRef = doc(
            db,
            "users",
            user.uid
          );

          const profileSnapshot =
            await getDoc(profileRef);


          if (profileSnapshot.exists()) {
            setProfile({
              id: profileSnapshot.id,
              ...profileSnapshot.data(),
            });
          } else {
            setProfile(null);

            setError(
              "Your profile could not be found."
            );
          }
        } catch (err) {
          console.error(
            "Error fetching profile:",
            err
          );

          setProfile(null);

          setError(
            "Unable to load your profile right now."
          );
        } finally {
          setLoading(false);
        }
      }
    );


    return () => unsubscribe();
  }, [navigate]);


  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="public-profile-page">
        <div className="public-profile-container">

          <section className="public-profile-card">
            <div className="public-profile-top">

              <div className="public-profile-identity">
                <p className="public-profile-eyebrow">
                  MY PROFILE
                </p>

                <h1>
                  Loading profile...
                </h1>
              </div>

            </div>
          </section>

        </div>
      </main>
    );
  }


  // =========================
  // PROFILE FAILED TO LOAD
  // =========================

  if (!profile) {
    return (
      <main className="public-profile-page">
        <div className="public-profile-container">

          <section className="public-profile-card">

            <div className="public-profile-top">

              <div className="public-profile-identity">

                <p className="public-profile-eyebrow">
                  MY PROFILE
                </p>

                <h1>
                  Profile unavailable
                </h1>

                <p className="public-profile-bio">
                  {error}
                </p>

              </div>


              <button
                type="button"
                className="public-edit-button"
                onClick={() =>
                  navigate("/profile/edit")
                }
              >
                Edit profile
              </button>

            </div>

          </section>

        </div>
      </main>
    );
  }


  // =========================
  // PROFILE
  // =========================

  return (
    <main className="public-profile-page">

      <div className="public-profile-container">

        <section className="public-profile-card">

          {/* =========================
              PROFILE HEADER
             ========================= */}

          <div className="public-profile-top">

            <div className="public-profile-picture">

              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={`${profile.name || "User"}'s profile`}
                />
              ) : (
                <span>
                  {profile.name
                    ? profile.name
                        .charAt(0)
                        .toUpperCase()
                    : "?"}
                </span>
              )}

            </div>


            <div className="public-profile-identity">

              <p className="public-profile-eyebrow">
                MY PROFILE
              </p>


              <h1>
                {profile.name || "Unnamed user"}
              </h1>


              {profile.pronouns && (
                <p className="public-profile-pronouns">
                  {profile.pronouns}
                </p>
              )}


              {profile.bio && (
                <p className="public-profile-bio">
                  {profile.bio}
                </p>
              )}

            </div>


            <button
              type="button"
              className="public-edit-button"
              onClick={() =>
                navigate("/profile/edit")
              }
            >
              Edit profile
            </button>

          </div>


          {/* =========================
              STUDY
             ========================= */}

          {(
            profile.degree ||
            profile.major ||
            profile.second_major_minor
          ) && (
            <section className="public-profile-section">

              <h2>Study</h2>


              <div className="public-study-details">

                {profile.degree && (
                  <div>
                    <span>
                      Degree
                    </span>

                    <strong>
                      {profile.degree}
                    </strong>
                  </div>
                )}


                {profile.major && (
                  <div>
                    <span>
                      Major
                    </span>

                    <strong>
                      {profile.major}
                    </strong>
                  </div>
                )}


                {profile.second_major_minor && (
                  <div>
                    <span>
                      Second major / minor
                    </span>

                    <strong>
                      {profile.second_major_minor}
                    </strong>
                  </div>
                )}

              </div>

            </section>
          )}


          {/* =========================
              LANGUAGES
             ========================= */}

          <ProfileTags
            title="Languages"
            items={profile.languages}
          />


          {/* =========================
              INTERESTS
             ========================= */}

          <ProfileTags
            title="Interests"
            items={profile.interests}
            highlight
          />


          {/* =========================
              SOCIETIES
             ========================= */}

          <ProfileTags
            title="Societies"
            items={profile.societies}
            highlight
          />

        </section>

      </div>

    </main>
  );
}


function ProfileTags({
  title,
  items = [],
  highlight = false,
}) {
  if (!Array.isArray(items) || !items.length) {
    return null;
  }


  return (
    <section className="public-profile-section">

      <h2>{title}</h2>


      <div className="public-profile-tags">

        {items.map((item) => (
          <span
            key={item}
            className={
              highlight
                ? "public-profile-tag highlighted"
                : "public-profile-tag"
            }
          >
            {item}
          </span>
        ))}

      </div>

    </section>
  );
}


export default ProfilePage;