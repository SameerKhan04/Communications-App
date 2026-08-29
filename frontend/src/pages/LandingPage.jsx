// src/pages/LandingPage.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Check, X } from "lucide-react";

import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../firebase";

import "./LandingPage.css";


function shuffleProfiles(profiles) {
  const shuffled = [...profiles];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(
      Math.random() * (i + 1)
    );

    [shuffled[i], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[i],
    ];
  }

  return shuffled;
}


function LandingPage() {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);


  // -----------------------------------------
  // LOAD USERS FROM FIRESTORE
  // -----------------------------------------

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      async (user) => {
        if (!user) {
          navigate("/login");
          return;
        }

        try {
          const usersSnapshot = await getDocs(
            collection(db, "users")
          );

          const otherUsers = usersSnapshot.docs
            .filter(
              (userDoc) => userDoc.id !== user.uid
            )
            .map((userDoc) => ({
              id: userDoc.id,
              ...userDoc.data(),
            }));

          setProfiles(
            shuffleProfiles(otherUsers)
          );
        } catch (error) {
          console.error(
            "Error loading profiles:",
            error
          );
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, [navigate]);


  // -----------------------------------------
  // CURRENT PROFILE
  // -----------------------------------------

  const currentProfile =
    profiles[currentIndex] || null;


  // -----------------------------------------
  // MOVE TO NEXT PROFILE
  // -----------------------------------------

  function showNextProfile() {
    if (profiles.length === 0) {
      return;
    }

    // More profiles remaining in current pass
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(
        (previousIndex) => previousIndex + 1
      );

      return;
    }

    // Reached the end.
    // Shuffle again so discovery keeps going.
    const previousProfileId =
      currentProfile?.id;

    const reshuffledProfiles =
      shuffleProfiles(profiles);

    // Avoid showing the same person immediately
    // after reshuffling when possible.
    if (
      reshuffledProfiles.length > 1 &&
      reshuffledProfiles[0]?.id ===
        previousProfileId
    ) {
      [
        reshuffledProfiles[0],
        reshuffledProfiles[1],
      ] = [
        reshuffledProfiles[1],
        reshuffledProfiles[0],
      ];
    }

    setProfiles(reshuffledProfiles);
    setCurrentIndex(0);
  }


  // -----------------------------------------
  // HANDLE X / TICK
  // -----------------------------------------

  async function handleDecision(decision) {
    const user = auth.currentUser;

    if (!user || !currentProfile) {
      return;
    }

    // Move immediately so the UI feels responsive.
    showNextProfile();

    try {
      const swipeId =
        `${user.uid}_${currentProfile.id}`;

      await setDoc(
        doc(db, "swipes", swipeId),
        {
          fromUserId: user.uid,
          toUserId: currentProfile.id,
          decision,
          updatedAt: serverTimestamp(),
        },
        {
          merge: true,
        }
      );
    } catch (error) {
      console.error(
        "Error saving decision:",
        error
      );
    }
  }


  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading) {
    return (
      <main className="landing-page">
        <div className="landing-container">
          <p>Loading people...</p>
        </div>
      </main>
    );
  }


  // -----------------------------------------
  // PAGE
  // -----------------------------------------

  return (
    <main className="landing-page">

      <div className="landing-container">

        {/* PAGE HEADING */}

        <section className="landing-heading">
          <p className="landing-eyebrow">
            DISCOVER
          </p>

          <h1>
            Find your people.
          </h1>

          <p>
            Meet students across campus and
            connect with people you might
            get along with.
          </p>
        </section>


        {/* NO OTHER USERS */}

        {!currentProfile ? (
          <section className="landing-empty-card">

            <p className="landing-eyebrow">
              NO PROFILES YET
            </p>

            <h2>
              More chums are on the way.
            </h2>

            <p>
              Once more students join,
              their profiles will appear
              here automatically.
            </p>

          </section>
        ) : (

          <div className="landing-profile-area">

            {/* PROFILE CARD */}

            <article
              className="landing-profile-card"
              key={currentProfile.id}
            >

              <div className="landing-profile-top">

                {/* PROFILE PICTURE */}

                <div className="landing-profile-picture">

                  {currentProfile.profilePicture ? (
                    <img
                      src={
                        currentProfile.profilePicture
                      }
                      alt={
                        `${currentProfile.name}'s profile`
                      }
                    />
                  ) : (
                    <span>
                      {currentProfile.name
                        ? currentProfile.name
                            .charAt(0)
                            .toUpperCase()
                        : "?"}
                    </span>
                  )}

                </div>


                {/* PROFILE INFORMATION */}

                <div className="landing-profile-info">

                  <p className="landing-profile-eyebrow">
                    STUDENT PROFILE
                  </p>

                  <div className="landing-name-row">

                    <h2>
                      {currentProfile.name ||
                        "USYD Student"}
                    </h2>

                    {currentProfile.pronouns && (
                      <span>
                        {
                          currentProfile.pronouns
                        }
                      </span>
                    )}

                  </div>


                  {(currentProfile.degree ||
                    currentProfile.major) && (
                    <p className="landing-study">

                      {[
                        currentProfile.degree,
                        currentProfile.major,
                      ]
                        .filter(Boolean)
                        .join(" · ")}

                    </p>
                  )}


                  {currentProfile.bio && (
                    <p className="landing-bio">
                      {currentProfile.bio}
                    </p>
                  )}

                </div>

              </div>


              {/* INTERESTS */}

              <ProfileTags
                title="Interests"
                items={
                  currentProfile.interests
                }
                highlight
              />


              {/* LANGUAGES */}

              <ProfileTags
                title="Languages"
                items={
                  currentProfile.languages
                }
              />


              {/* SOCIETIES */}

              <ProfileTags
                title="Societies"
                items={
                  currentProfile.societies
                }
              />

            </article>


            {/* X / TICK BUTTONS */}

            <div className="landing-actions">

              <button
                type="button"
                className="landing-action-button landing-pass-button"
                aria-label="Pass"
                onClick={() =>
                  handleDecision("pass")
                }
              >
                <X
                  size={30}
                  strokeWidth={2.5}
                />
              </button>


              <button
                type="button"
                className="landing-action-button landing-connect-button"
                aria-label="Connect"
                onClick={() =>
                  handleDecision("interested")
                }
              >
                <Check
                  size={31}
                  strokeWidth={2.7}
                />
              </button>

            </div>

          </div>
        )}

      </div>

    </main>
  );
}


// -----------------------------------------
// PROFILE TAG SECTION
// -----------------------------------------

function ProfileTags({
  title,
  items = [],
  highlight = false,
}) {
  if (!items?.length) {
    return null;
  }

  return (
    <section className="landing-profile-section">

      <h3>
        {title}
      </h3>

      <div className="landing-profile-tags">

        {items.map((item) => (
          <span
            key={item}
            className={
              highlight
                ? "landing-profile-tag highlighted"
                : "landing-profile-tag"
            }
          >
            {item}
          </span>
        ))}

      </div>

    </section>
  );
}


export default LandingPage;