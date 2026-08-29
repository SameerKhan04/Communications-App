import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { Check, MessageSquare, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { auth, db } from "../firebase";

import "./Friends.css"; // Reusing your existing shell styling!

function MatchesPage() {
  const navigate = useNavigate();
  const [likes, setLikes] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      loadLikesAndMatches(user.uid);
    });

    return () => unsubscribe();
  }, [navigate]);

  async function loadLikesAndMatches(uid) {
    setLoading(true);
    try {
      const swipesRef = collection(db, "swipes");

      // 1. Get all swipes where people swiped on YOU
      const toMeQuery = query(swipesRef, where("toUserId", "==", uid));
      const toMeSnap = await getDocs(toMeQuery);
      
      const whoLikedMe = [];
      toMeSnap.forEach(doc => {
        const data = doc.data();
        if (data.decision === "interested") {
          whoLikedMe.push(data.fromUserId);
        }
      });

      // 2. Get all swipes YOU have made
      const fromMeQuery = query(swipesRef, where("fromUserId", "==", uid));
      const fromMeSnap = await getDocs(fromMeQuery);
      
      const mySwipesMap = {};
      fromMeSnap.forEach(doc => {
        const data = doc.data();
        mySwipesMap[data.toUserId] = data.decision;
      });

      // 3. Categorize them into Pending Likes vs Mutual Matches
      const pendingIds = [];
      const matchIds = [];

      whoLikedMe.forEach(theirId => {
        if (mySwipesMap[theirId] === "interested") {
          matchIds.push(theirId); // We both liked each other
        } else if (!mySwipesMap[theirId]) {
          pendingIds.push(theirId); // They liked me, I haven't decided yet
        }
      });

      // 4. Fetch the actual profile data for these users
      const fetchProfiles = async (ids) => {
        const profiles = await Promise.all(
          ids.map(async (id) => {
            const userDoc = await getDoc(doc(db, "users", id));
            return userDoc.exists() ? { id, ...userDoc.data() } : null;
          })
        );
        return profiles.filter(Boolean);
      };

      setLikes(await fetchProfiles(pendingIds));
      setMatches(await fetchProfiles(matchIds));

    } catch (error) {
      console.error("Error loading matches:", error);
    } finally {
      setLoading(false);
    }
  }

  // -----------------------------------------
  // ACTIONS
  // -----------------------------------------

  async function handleDecision(theirId, decision, e) {
    e.stopPropagation(); // Prevents the card click from firing
    const user = auth.currentUser;
    if (!user) return;

    try {
      const swipeId = `${user.uid}_${theirId}`;
      await setDoc(doc(db, "swipes", swipeId), {
        fromUserId: user.uid,
        toUserId: theirId,
        decision,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // Update UI locally without reloading the whole page
      const decidedUser = likes.find(u => u.id === theirId);
      setLikes(likes.filter(u => u.id !== theirId));
      
      if (decision === "interested" && decidedUser) {
        setMatches([decidedUser, ...matches]);
      }
    } catch (error) {
      console.error("Error saving decision:", error);
    }
  }

  async function handleMessage(friendId, e) {
    e.stopPropagation();
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
  // RENDER
  // -----------------------------------------

  if (loading) {
    return (
      <main className="friends-page">
        <div className="friends-shell"><h2 style={{padding: "24px"}}>Loading...</h2></div>
      </main>
    );
  }

  return (
    <main className="friends-page">
      <div className="friends-background friends-background-one" />
      <div className="friends-background friends-background-two" />

      <section className="friends-shell">
        <header className="friends-header">
          <div>
            <p className="friends-eyebrow">CONNECTIONS</p>
            <h1>Likes & Matches</h1>
            <p className="friends-subtitle">See who wants to connect with you.</p>
          </div>
        </header>

        <div style={{ marginTop: "32px" }}>
          <h2 style={{ fontSize: "1.2rem", color: "var(--charcoal)", marginBottom: "16px", padding: "0 8px" }}>
            People who liked you ({likes.length})
          </h2>
          
          <div className="friends-list" style={{ marginBottom: "48px" }}>
            {likes.length === 0 ? (
              <p style={{ padding: "0 8px", color: "#777" }}>No new likes right now. Keep swiping!</p>
            ) : (
              likes.map(user => (
                <article 
                  className="friend-card" 
                  key={user.id}
                  onClick={() => navigate(`/users/${user.id}`)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div className="friend-avatar" style={{ flexShrink: 0 }}>
                      {user.profilePicture ? <img src={user.profilePicture} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : user.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem" }}>{user.name}</h3>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>{user.degree || "USYD Student"}</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button 
                      onClick={(e) => handleDecision(user.id, "pass", e)}
                      style={{ width: "40px", height: "40px", borderRadius: "50%", border: "1px solid #cfd0d3", background: "white", color: "var(--charcoal)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <X size={20} />
                    </button>
                    <button 
                      onClick={(e) => handleDecision(user.id, "interested", e)}
                      style={{ width: "40px", height: "40px", borderRadius: "50%", border: "none", background: "var(--ochre)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <Check size={20} />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          <h2 style={{ fontSize: "1.2rem", color: "var(--charcoal)", marginBottom: "16px", padding: "0 8px" }}>
            Your Matches ({matches.length})
          </h2>

          <div className="friends-list">
            {matches.length === 0 ? (
              <p style={{ padding: "0 8px", color: "#777" }}>You don't have any mutual matches yet.</p>
            ) : (
              matches.map(user => (
                <article 
                  className="friend-card" 
                  key={user.id}
                  onClick={() => navigate(`/users/${user.id}`)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", cursor: "pointer" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div className="friend-avatar" style={{ flexShrink: 0 }}>
                      {user.profilePicture ? <img src={user.profilePicture} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : user.name?.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem" }}>{user.name}</h3>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>{user.degree || "USYD Student"}</p>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => handleMessage(user.id, e)}
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "20px", border: "none", background: "var(--ochre)", color: "white", fontWeight: "bold", cursor: "pointer" }}
                  >
                    <MessageSquare size={16} />
                    Message
                  </button>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export default MatchesPage;