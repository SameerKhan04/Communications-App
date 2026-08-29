import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { auth, db } from "../firebase";

import "./ProfilePage.css";

function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [userId]);

  async function handleMessage() {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      // 1. Check if a chat already exists between these two users
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("participants", "array-contains", currentUser.uid));
      const snapshot = await getDocs(q);
      
      let existingChatId = null;
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants.includes(profile.id)) {
          existingChatId = doc.id;
        }
      });

      // 2. Navigate to existing chat, or create a new one
      if (existingChatId) {
        navigate(`/messages/${existingChatId}`);
      } else {
        const newChat = await addDoc(collection(db, "chats"), {
          participants: [currentUser.uid, profile.id],
          updatedAt: serverTimestamp(),
          lastMessage: "Say hi!"
        });
        navigate(`/messages/${newChat.id}`);
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  }

  if (loading) {
    return (
      <main className="public-profile-page">
        <div className="public-profile-container"><p>Loading profile...</p></div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="public-profile-page">
        <div className="public-profile-container"><p>User not found.</p></div>
      </main>
    );
  }

  return (
    <main className="public-profile-page">
      <header className="public-profile-navbar">
        <div className="public-profile-logo">
          <span>CHUM</span>
          <strong>BUDDY</strong>
        </div>
        <span>Profile</span>
      </header>

      <div className="public-profile-container">
        <section className="public-profile-card">
          <div className="public-profile-top">
            <div className="public-profile-picture">
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt={`${profile.name}'s profile`} />
              ) : (
                <span>{profile.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="public-profile-identity">
              <p className="public-profile-eyebrow">STUDENT PROFILE</p>
              <h1>{profile.name}</h1>
              {profile.pronouns && <p className="public-profile-pronouns">{profile.pronouns}</p>}
              {profile.bio && <p className="public-profile-bio">{profile.bio}</p>}
            </div>

            {/* Hide the message button if looking at your own profile */}
            {auth.currentUser?.uid !== profile.id && (
              <button type="button" className="public-message-button" onClick={handleMessage}>
                Message
              </button>
            )}
          </div>

          {(profile.degree || profile.major || profile.second_major_minor) && (
            <section className="public-profile-section">
              <h2>Study</h2>
              <div className="public-study-details">
                {profile.degree && (
                  <div>
                    <span>Degree</span>
                    <strong>{profile.degree}</strong>
                  </div>
                )}
                {profile.major && (
                  <div>
                    <span>Major</span>
                    <strong>{profile.major}</strong>
                  </div>
                )}
                {profile.second_major_minor && (
                  <div>
                    <span>Second major / minor</span>
                    <strong>{profile.second_major_minor}</strong>
                  </div>
                )}
              </div>
            </section>
          )}

          <ProfileTags title="Languages" items={profile.languages} />
          <ProfileTags title="Interests" items={profile.interests} highlight />
          <ProfileTags title="Societies" items={profile.societies} highlight />
        </section>
      </div>
    </main>
  );
}

function ProfileTags({ title, items = [], highlight = false }) {
  if (!items.length) return null;

  return (
    <section className="public-profile-section">
      <h2>{title}</h2>
      <div className="public-profile-tags">
        {items.map((item) => (
          <span key={item} className={highlight ? "public-profile-tag highlighted" : "public-profile-tag"}>
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

export default UserProfilePage;