import { addDoc, arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
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
    <div className="chat-row" onClick={onClick}>
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendEmail, setFriendEmail] = useState("");
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) return navigate("/login");

      // 1. Listen for active chats
      const q = query(collection(db, "chats"), where("participants", "array-contains", user.uid));
      onSnapshot(q, (snapshot) => {
        const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by newest first
        chatList.sort((a, b) => b.updatedAt?.toMillis() - a.updatedAt?.toMillis());
        setChats(chatList);
      });

      // 2. Load friends list
      loadFriends(user.uid);
    });
    return () => unsubscribe();
  }, [navigate]);

  async function loadFriends(uid) {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists() && userDoc.data().friends) {
      const friendIds = userDoc.data().friends;
      const loadedFriends = [];
      for (const fId of friendIds) {
        const fDoc = await getDoc(doc(db, "users", fId));
        if (fDoc.exists()) loadedFriends.push({ id: fDoc.id, ...fDoc.data() });
      }
      setFriends(loadedFriends);
    }
  }

  async function handleAddFriend(e) {
    e.preventDefault();
    setModalError("");
    const currentUser = auth.currentUser;
    
    if (friendEmail.toLowerCase() === currentUser.email?.toLowerCase()) {
      return setModalError("You can't add yourself!");
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", friendEmail.toLowerCase()));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return setModalError("No user found with that email.");
    }

    const newFriend = snapshot.docs[0];
    
    await updateDoc(doc(db, "users", currentUser.uid), {
      friends: arrayUnion(newFriend.id)
    });

    setFriendEmail("");
    loadFriends(currentUser.uid);
  }

  async function startChat(friendId) {
    const currentUser = auth.currentUser;
    
    const existingChat = chats.find(c => c.participants.includes(friendId));
    if (existingChat) {
      return navigate(`/messages/${existingChat.id}`);
    }

    const newChat = await addDoc(collection(db, "chats"), {
      participants: [currentUser.uid, friendId],
      updatedAt: serverTimestamp(),
      lastMessage: "Say hi!"
    });

    navigate(`/messages/${newChat.id}`);
  }

  return (
    <main className="messages-page">
      <header className="public-profile-navbar">
        <div className="public-profile-logo" onClick={() => navigate("/profile")} style={{cursor: "pointer"}}>
          <span>CHUM</span><strong>BUCKET</strong>
        </div>
        <span>Direct Messages</span>
      </header>

      <div className="messages-container">
        <div className="messages-header">
          <h1>Messages</h1>
          <button className="new-chat-button" onClick={() => setIsModalOpen(true)}>+ New Chat</button>
        </div>

        <div className="chat-list">
          {chats.length === 0 ? (
            <p className="empty-state">No messages yet. Start a chat!</p>
          ) : (
            chats.map(chat => (
              <ChatRow key={chat.id} chat={chat} onClick={() => navigate(`/messages/${chat.id}`)} />
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Start a Chat</h2>
            
            <form onSubmit={handleAddFriend} className="add-friend-form">
              <input 
                type="email" 
                placeholder="Add friend by university email..." 
                value={friendEmail}
                onChange={e => setFriendEmail(e.target.value)}
                required
              />
              <button type="submit">Add</button>
            </form>
            {modalError && <p className="error-message">{modalError}</p>}

            <div className="friends-list">
              <h3>Your Friends</h3>
              {friends.length === 0 ? (
                <p className="empty-state">Add a friend above to start chatting.</p>
              ) : (
                friends.map(friend => (
                  <div key={friend.id} className="friend-row">
                    <span>{friend.name}</span>
                    <button onClick={() => startChat(friend.id)}>Chat</button>
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