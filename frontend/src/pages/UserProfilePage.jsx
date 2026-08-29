import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

import { auth, db } from "../firebase";

import "./ProfilePage.css";


function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messageLoading, setMessageLoading] = useState(false);


  // -----------------------------------------
  // LOAD USER PROFILE
  // -----------------------------------------

  useEffect(() => {
    async function loadProfile() {
      try {
        const userRef = doc(
          db,
          "users",
          userId
        );

        const userSnapshot =
          await getDoc(userRef);

        if (!userSnapshot.exists()) {
          setProfile(null);
          return;
        }

        setProfile({
          id: userSnapshot.id,
          ...userSnapshot.data(),
        });

      } catch (error) {
        console.error(
          "Error loading user profile:",
          error
        );

        setProfile(null);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId]);


  // -----------------------------------------
  // OPEN / CREATE CHAT
  // -----------------------------------------

  async function handleMessage() {
    const currentUser = auth.currentUser;

    if (
      !currentUser ||
      !profile ||
      messageLoading
    ) {
      return;
    }

    if (currentUser.uid === profile.id) {
      return;
    }

    setMessageLoading(true);

    try {
      // Find chats belonging to current user
      const chatsQuery = query(
        collection(db, "chats"),
        where(
          "participants",
          "array-contains",
          currentUser.uid
        )
      );

      const chatsSnapshot =
        await getDocs(chatsQuery);


      // Check whether a chat with this user
      // already exists
      const existingChat =
        chatsSnapshot.docs.find(
          (chatDoc) => {
            const participants =
              chatDoc.data().participants || [];

            return participants.includes(
              profile.id
            );
          }
        );


      if (existingChat) {
        navigate(
          `/messages/${existingChat.id}`
        );

        return;
      }


      // No existing chat — create one
      const newChat = await addDoc(
        collection(db, "chats"),
        {
          participants: [
            currentUser.uid,
            profile.id,
          ],
          lastMessage: "Say hi!",
          updatedAt: serverTimestamp(),
        }
      );


      navigate(
        `/messages/${newChat.id}`
      );

    } catch (error) {
      console.error(
        "Error opening chat:",
        error
      );
    } finally {
      setMessageLoading(false);
    }
  }


  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading) {
    return (
      <main className="public-profile-page">
        <div className="public-profile-container">
          <p>Loading profile...</p>
        </div>
      </main>
    );
  }


  // -----------------------------------------
  // USER NOT FOUND
  // -----------------------------------------

  if (!profile) {
    return (
      <main className="public-profile-page">
        <div className="public-profile-container">
          <p>User not found.</p>
        </div>
      </main>
    );
  }


  // -----------------------------------------
  // PAGE
  // -----------------------------------------

  return (
    <main className="public-profile-page">

      <div className="public-profile-container">

        <section className="public-profile-card">

          <div className="public-profile-top">

            {/* PROFILE PICTURE */}

            <div className="public-profile-picture">

              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={`${profile.name}'s profile`}
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


            {/* IDENTITY */}

            <div className="public-profile-identity">

              <p className="public-profile-eyebrow">
                STUDENT PROFILE
              </p>

              <h1>
                {profile.name ||
                  "USYD Student"}
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


            {/* MESSAGE */}

            {auth.currentUser?.uid !==
              profile.id && (

              <button
                type="button"
                className="public-message-button"
                onClick={handleMessage}
                disabled={messageLoading}
              >
                {messageLoading
                  ? "Opening..."
                  : "Message"}
              </button>

            )}

          </div>


          {/* STUDY */}

          {(profile.degree ||
            profile.major ||
            profile.second_major_minor) && (

            <section className="public-profile-section">

              <h2>
                Study
              </h2>


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
                      {
                        profile.second_major_minor
                      }
                    </strong>
                  </div>
                )}

              </div>

            </section>

          )}


          <ProfileTags
            title="Languages"
            items={profile.languages}
          />


          <ProfileTags
            title="Interests"
            items={profile.interests}
            highlight
          />


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
    <section className="public-profile-section">

      <h2>
        {title}
      </h2>


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


export default UserProfilePage;