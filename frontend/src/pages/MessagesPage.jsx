import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { auth, db } from "../firebase";
import "./Messages.css";

// Helper component to fetch and display the friend's actual name in the inbox
function ChatRow({ chat, onClick }) {
  const [otherUser, setOtherUser] = useState(null);
  const otherUserId = chat.participants.find(id => id !== auth.currentUser?.uid);

  useEffect(() => {
    if (!otherUserId) return;
    getDoc(doc(db, "users", otherUserId)).then(snap => {
      if (snap.exists()) setOtherUser(snap.data());
    });
  }, [otherUserId]);

  const name = otherUser?.name || `User ${otherUserId?.substring(0, 5)}...`;
  const avatar = otherUser?.profilePicture ? (
    <img src={otherUser.profilePicture} alt={name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
  ) : (
    name.charAt(0).toUpperCase()
  );

  return (
    <div className="chat-row" onClick={onClick} role="button" tabIndex={0}>
      <div className="chat-row-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {avatar}
      </div>
      <div className="chat-row-details">
        <strong>{name}</strong>
        <p>{chat.lastMessage}</p>
      </div>
    </div>
  );
}

function MessagesPage() {
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [friends, setFriends] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // -----------------------------------------
  // AUTH + LIVE CHAT LIST
  // -----------------------------------------

  useEffect(() => {
    let unsubscribeChats = null;

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      // Load mutual match friends via swipes collection
      await loadFriends(user.uid);

      // Listen for chats involving current user
      const chatsQuery = query(
        collection(db, "chats"),
        where("participants", "array-contains", user.uid)
      );

      unsubscribeChats = onSnapshot(
        chatsQuery,
        (snapshot) => {
          try {
            const loadedChats = snapshot.docs.map((chatDoc) => ({
              id: chatDoc.id,
              ...chatDoc.data(),
            }));

            // Newest chats first
            loadedChats.sort((a, b) => {
              const timeA = a.updatedAt?.toMillis?.() || 0;
              const timeB = b.updatedAt?.toMillis?.() || 0;
              return timeB - timeA;
            });

            setChats(loadedChats);
          } catch (error) {
            console.error("Error loading chats:", error);
          }
        }
      );
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeChats) unsubscribeChats();
    };
  }, [navigate]);

  // -----------------------------------------
  // LOAD FRIENDS FROM MATCHES (SWIPES)
  // -----------------------------------------

  async function loadFriends(uid) {
    try {
      const swipesRef = collection(db, "swipes");

      // 1. Get all swipes TO current user where decision is "interested"
      const toMeSnap = await getDocs(query(swipesRef, where("toUserId", "==", uid)));
      const whoLikedMe = [];
      toMeSnap.forEach(docSnap => {
        const data = docSnap.data();
        if (data.decision === "interested") {
          whoLikedMe.push(data.fromUserId);
        }
      });

      // 2. Get all swipes FROM current user where decision is "interested"
      const fromMeSnap = await getDocs(query(swipesRef, where("fromUserId", "==", uid)));
      const whoILiked = {};
      fromMeSnap.forEach(docSnap => {
        const data = docSnap.data();
        whoILiked[data.toUserId] = data.decision;
      });

      // 3. Find mutual matches (Intersection)
      const mutualMatchIds = whoLikedMe.filter(id => whoILiked[id] === "interested");

      if (mutualMatchIds.length === 0) {
        setFriends([]);
        return;
      }

      // 4. Fetch profile details for mutual matches
      const friendProfiles = await Promise.all(
        mutualMatchIds.map(async (friendId) => {
          const friendSnapshot = await getDoc(doc(db, "users", friendId));
          if (!friendSnapshot.exists()) return null;
          return {
            id: friendSnapshot.id,
            ...friendSnapshot.data(),
          };
        })
      );

      setFriends(friendProfiles.filter(Boolean));
    } catch (error) {
      console.error("Error loading friends from matches:", error);
      setFriends([]);
    }
  }

  // -----------------------------------------
  // START / OPEN CHAT
  // -----------------------------------------

  async function startChat(friendId) {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const existingChat = chats.find((chat) => {
        const participants = chat.participants || [];
        return (
          participants.includes(currentUser.uid) &&
          participants.includes(friendId)
        );
      });

      if (existingChat) {
        navigate(`/messages/${existingChat.id}`);
        return;
      }

      const newChat = await addDoc(collection(db, "chats"), {
        participants: [currentUser.uid, friendId],
        lastMessage: "Say hi!",
        updatedAt: serverTimestamp(),
      });

      navigate(`/messages/${newChat.id}`);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  }

  // -----------------------------------------
  // PAGE RENDER
  // -----------------------------------------

  return (
    <main className="messages-page">
      <div className="messages-container">
        
        {/* HEADER */}
        <div className="messages-header">
          <h1>Messages</h1>
          <button
            type="button"
            className="new-chat-button"
            onClick={() => setIsModalOpen(true)}
          >
            + New Chat
          </button>
        </div>

        {/* CHAT LIST */}
        <div className="chat-list">
          {chats.length === 0 ? (
            <p className="empty-state">No messages yet. Start a chat!</p>
          ) : (
            chats.map((chat) => (
              <ChatRow 
                key={chat.id} 
                chat={chat} 
                onClick={() => navigate(`/messages/${chat.id}`)} 
              />
            ))
          )}
        </div>
      </div>

      {/* =========================
          NEW CHAT MODAL (MATCHES)
          ========================= */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>Start a Chat</h2>
            <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "16px" }}>
              Select a match to start messaging.
            </p>

            <div className="friends-list">
              {friends.length === 0 ? (
                <p className="empty-state">
                  No matches yet. Head to the Discover page and connect with people!
                </p>
              ) : (
                friends.map((friend) => (
                  <div key={friend.id} className="friend-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span>{friend.name || "USYD Student"}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        startChat(friend.id);
                      }}
                      style={{ padding: "6px 12px", background: "var(--ochre)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}
                    >
                      Chat
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default MessagesPage;