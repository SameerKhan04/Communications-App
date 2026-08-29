import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import defaultGroupIcon from "../assets/chum-buddy-colour.png";
import { auth, db } from "../firebase";
import "./Messages.css";

// Helper component to fetch and display the friend's actual name in the inbox
function ChatRow({ chat, onClick }) {
  const [otherUser, setOtherUser] = useState(null);
  const isGroup = chat.isGroup;

  useEffect(() => {
    if (isGroup) return;

    const otherUserId = chat.participants.find(id => id !== auth.currentUser?.uid);
    if (!otherUserId) return;
    
    getDoc(doc(db, "users", otherUserId)).then(snap => {
      if (snap.exists()) setOtherUser(snap.data());
    });
  }, [chat.participants, isGroup]);

  const name = isGroup ? (chat.groupName || "Group Chat") : (otherUser?.name || "Loading...");
  
  const avatar = isGroup ? (
    chat.groupPhoto ? (
      <img src={chat.groupPhoto} alt={name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
    ) : (
      <img src={defaultGroupIcon} alt="Default Group" style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
    )
  ) : otherUser?.profilePicture ? (
    <img src={otherUser.profilePicture} alt={name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
  ) : (
    name.charAt(0).toUpperCase()
  );

  return (
    <div className="chat-row" onClick={onClick} role="button" tabIndex={0}>
      <div className="chat-row-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: isGroup && !chat.groupPhoto ? 'var(--light-grey)' : 'transparent', borderRadius: '50%', overflow: 'hidden' }}>
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
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [groupPhoto, setGroupPhoto] = useState(null);

  useEffect(() => {
    let unsubscribeChats = null;

    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      await loadFriends(user.uid);

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

  async function loadFriends(uid) {
    try {
      const swipesRef = collection(db, "swipes");

      const toMeSnap = await getDocs(query(swipesRef, where("toUserId", "==", uid)));
      const whoLikedMe = [];
      toMeSnap.forEach(docSnap => {
        if (docSnap.data().decision === "interested") whoLikedMe.push(docSnap.data().fromUserId);
      });

      const fromMeSnap = await getDocs(query(swipesRef, where("fromUserId", "==", uid)));
      const whoILiked = {};
      fromMeSnap.forEach(docSnap => {
        whoILiked[docSnap.data().toUserId] = docSnap.data().decision;
      });

      const mutualMatchIds = whoLikedMe.filter(id => whoILiked[id] === "interested");

      if (mutualMatchIds.length === 0) {
        setFriends([]);
        return;
      }

      const friendProfiles = await Promise.all(
        mutualMatchIds.map(async (friendId) => {
          const friendSnapshot = await getDoc(doc(db, "users", friendId));
          if (!friendSnapshot.exists()) return null;
          return { id: friendSnapshot.id, ...friendSnapshot.data() };
        })
      );

      setFriends(friendProfiles.filter(Boolean));
    } catch (error) {
      console.error("Error loading friends from matches:", error);
      setFriends([]);
    }
  }

  function toggleFriendSelection(friendId) {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId) 
        : [...prev, friendId]
    );
  }

  function handleGroupPhotoChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setGroupPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  }

  async function handleCreateChat() {
    const currentUser = auth.currentUser;
    if (!currentUser || selectedFriends.length === 0) return;

    try {
      if (selectedFriends.length === 1) {
        const friendId = selectedFriends[0];
        const existingChat = chats.find((chat) => {
          return !chat.isGroup && chat.participants.includes(currentUser.uid) && chat.participants.includes(friendId);
        });

        if (existingChat) {
          navigate(`/messages/${existingChat.id}`);
        } else {
          const newChat = await addDoc(collection(db, "chats"), {
            participants: [currentUser.uid, friendId],
            isGroup: false,
            lastMessage: "Say hi!",
            updatedAt: serverTimestamp(),
          });
          navigate(`/messages/${newChat.id}`);
        }
      } else {
        const newGroupChat = await addDoc(collection(db, "chats"), {
          participants: [currentUser.uid, ...selectedFriends],
          isGroup: true,
          groupName: groupName.trim() || "New Group Chat",
          groupPhoto: groupPhoto || null,
          lastMessage: "Group created!",
          updatedAt: serverTimestamp(),
        });
        navigate(`/messages/${newGroupChat.id}`);
      }

      setIsModalOpen(false);
      setSelectedFriends([]);
      setGroupName("");
      setGroupPhoto(null);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  }

  return (
    <main className="messages-page">
      <div className="messages-container">
        <div className="messages-header">
          <h1>Messages</h1>
          <button
            type="button"
            className="new-chat-button"
            onClick={() => {
              setIsModalOpen(true);
              setSelectedFriends([]);
              setGroupName("");
              setGroupPhoto(null);
            }}
          >
            + New Chat
          </button>
        </div>

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

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()} style={{ padding: "24px", maxWidth: "400px", width: "90%" }}>
            
            <h2 style={{ margin: "0 0 8px 0" }}>Start a Chat</h2>
            <p style={{ color: "#666", fontSize: "0.9rem", marginBottom: "16px" }}>
              Select one friend for a direct message, or multiple to create a group.
            </p>

            {selectedFriends.length > 1 && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "var(--light-grey)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                    {groupPhoto ? (
                      <img src={groupPhoto} alt="Group Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <img src={defaultGroupIcon} alt="Default Group" style={{ width: "70%", height: "70%", objectFit: "contain" }} />
                    )}
                  </div>
                  <label style={{ cursor: "pointer", color: "var(--ochre)", fontWeight: "bold", fontSize: "0.9rem" }}>
                    + Upload Group Photo
                    <input type="file" accept="image/*" onChange={handleGroupPhotoChange} style={{ display: "none" }} />
                  </label>
                </div>
                
                <input 
                  type="text" 
                  placeholder="Enter Group Name (Optional)" 
                  value={groupName} 
                  onChange={(e) => setGroupName(e.target.value)}
                  style={{ width: "100%", padding: "10px", marginBottom: "16px", borderRadius: "8px", border: "1px solid #ccc" }}
                />
              </>
            )}

            <div className="friends-list" style={{ maxHeight: "300px", overflowY: "auto", borderTop: "1px solid #eee", paddingTop: "12px", marginBottom: "20px" }}>
              {friends.length === 0 ? (
                <p className="empty-state">No matches yet. Connect on the Discover page!</p>
              ) : (
                friends.map((friend) => (
                  <label key={friend.id} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 0", cursor: "pointer" }}>
                    <input 
                      type="checkbox" 
                      checked={selectedFriends.includes(friend.id)}
                      onChange={() => toggleFriendSelection(friend.id)}
                      style={{ transform: "scale(1.2)" }}
                    />
                    <span>{friend.name || "USYD Student"}</span>
                  </label>
                ))
              )}
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                style={{ padding: "8px 16px", background: "transparent", border: "none", color: "#666", cursor: "pointer", fontWeight: "bold" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateChat}
                disabled={selectedFriends.length === 0}
                style={{ 
                  padding: "8px 16px", 
                  background: selectedFriends.length > 0 ? "var(--ochre)" : "#ccc", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "8px", 
                  cursor: selectedFriends.length > 0 ? "pointer" : "not-allowed", 
                  fontWeight: "bold" 
                }}
              >
                {selectedFriends.length > 1 ? "Create Group" : "Start Chat"}
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}

export default MessagesPage;