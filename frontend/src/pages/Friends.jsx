import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";

import { auth, db } from "../firebase";

import "./Friends.css";

function Friends() {
  const navigate = useNavigate();

  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // -----------------------------------------
  // LOAD FRIENDS FROM FIREBASE
  // -----------------------------------------

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const currentUserRef = doc(db, "users", user.uid);
        const currentUserSnapshot = await getDoc(currentUserRef);

        if (!currentUserSnapshot.exists()) {
          setFriends([]);
          setLoading(false);
          return;
        }

        const currentUserData = currentUserSnapshot.data();
        const friendIds = currentUserData.friends || [];

        if (friendIds.length === 0) {
          setFriends([]);
          setLoading(false);
          return;
        }

        // Load each friend's profile
        const friendProfiles = await Promise.all(
          friendIds.map(async (friendId) => {
            const friendRef = doc(db, "users", friendId);
            const friendSnapshot = await getDoc(friendRef);

            if (!friendSnapshot.exists()) {
              return null;
            }

            const data = friendSnapshot.data();

            return {
              id: friendSnapshot.id,
              name: data.name || "Unknown Chum",
              degree: data.degree || "Degree not listed",
              interests: data.interests || [],
              avatar: data.profilePicture ? (
                <img 
                  src={data.profilePicture} 
                  alt={data.name} 
                  style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
                />
              ) : (
                (data.name ? data.name.charAt(0).toUpperCase() : "?")
              ),
              ...data,
            };
          })
        );

        // Remove deleted / invalid users
        setFriends(friendProfiles.filter(Boolean));
      } catch (error) {
        console.error("Error loading friends:", error);
        setFriends([]);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // -----------------------------------------
  // SEARCH
  // -----------------------------------------

  const filteredFriends = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return friends;
    }

    return friends.filter((friend) => {
      const nameMatch = (friend.name || "")
        .toLowerCase()
        .includes(query);

      const degreeMatch = (friend.degree || "")
        .toLowerCase()
        .includes(query);

      const interestMatch = (friend.interests || []).some(
        (interest) => interest.toLowerCase().includes(query)
      );

      return nameMatch || degreeMatch || interestMatch;
    });
  }, [friends, search]);

  // -----------------------------------------
  // CHAT LOGIC
  // -----------------------------------------

  async function handleStartChat(friendId) {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("participants", "array-contains", currentUser.uid));
      const snapshot = await getDocs(q);
      
      let existingChatId = null;
      snapshot.forEach((doc) => {
        if (doc.data().participants.includes(friendId)) {
          existingChatId = doc.id;
        }
      });

      if (existingChatId) {
        navigate(`/messages/${existingChatId}`);
      } else {
        const newChat = await addDoc(collection(db, "chats"), {
          participants: [currentUser.uid, friendId],
          updatedAt: serverTimestamp(),
          lastMessage: "Say hi!"
        });
        navigate(`/messages/${newChat.id}`);
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  }

  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading) {
    return (
      <main className="friends-page">
        <section className="friends-shell">
          <p>Loading friends...</p>
        </section>
      </main>
    );
  }

  // -----------------------------------------
  // PAGE
  // -----------------------------------------

  return (
    <main className="friends-page">

      <div className="friends-background friends-background-one" />
      <div className="friends-background friends-background-two" />

      <section className="friends-shell">

        {/* HEADER */}
        <header className="friends-header">
          <div>
            <p className="friends-eyebrow">CHUM BUDDY</p>
            <h1>Friends</h1>
            <p className="friends-subtitle">
              Your university chums, all in one place.
            </p>
          </div>

          <div className="friends-count">
            <strong>{friends.length}</strong>
            <span>chums</span>
          </div>
        </header>

        {/* SEARCH */}
        <div className="friends-search">
          <span className="friends-search-icon">⌕</span>

          <input
            type="search"
            placeholder="Search your friends..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search friends"
          />

          {search && (
            <button
              className="friends-search-clear"
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        {/* FRIEND LIST */}
        <div className="friends-list">
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <article 
                className="friend-card" 
                key={friend.id} 
                style={{ display: "flex", flexDirection: "column", padding: "20px", cursor: "default" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                  <div className="friend-avatar" style={{ flexShrink: 0 }}>
                    {friend.avatar}
                  </div>

                  <div className="friend-information" style={{ flex: 1, padding: 0 }}>
                    <h2 style={{ margin: "0 0 4px", fontSize: "1.2rem", color: "var(--charcoal)" }}>
                      {friend.name || "USYD Student"}
                    </h2>
                    
                    {friend.degree && (
                      <p className="friend-degree" style={{ margin: "0 0 8px", fontSize: "0.9rem", color: "#666" }}>
                        {friend.degree}
                      </p>
                    )}

                    <div className="friend-interests" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {(friend.interests || []).slice(0, 3).map((interest) => (
                        <span 
                          key={interest} 
                          style={{ fontSize: "0.75rem", background: "var(--light-grey)", padding: "4px 8px", borderRadius: "12px", color: "var(--charcoal)" }}
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* The Two New Buttons */}
                <div style={{ display: "flex", gap: "8px", width: "100%" }}>
                  <button
                    onClick={() => handleStartChat(friend.id)}
                    style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", backgroundColor: "var(--ochre)", color: "var(--white)", fontWeight: "bold", cursor: "pointer", transition: "transform 0.15s" }}
                    onMouseOver={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
                    onMouseOut={(e) => e.currentTarget.style.transform = "translateY(0)"}
                  >
                    Message
                  </button>
                  <button
                    onClick={() => navigate(`/users/${friend.id}`)}
                    style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #cfd0d3", backgroundColor: "var(--white)", color: "var(--charcoal)", fontWeight: "bold", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--light-grey)"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "var(--white)"}
                  >
                    Profile
                  </button>
                </div>
              </article>
            ))
          ) : (
            <div className="friends-empty">
              <div className="friends-empty-icon">⌕</div>
              <h2>No chums found</h2>
              <p>
                {friends.length === 0 
                  ? "You haven't added any friends yet. Get out there and meet some people!" 
                  : "Try searching for a different name, degree, or interest."}
              </p>
            </div>
          )}
        </div>

      </section>
    </main>
  );
}

export default Friends;