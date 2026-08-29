import {
    addDoc,
    collection,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import defaultGroupIcon from "../assets/chum-buddy-colour.png";
import { auth, db } from "../firebase";
import "./Messages.css";

function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [chatDetails, setChatDetails] = useState(null);
  const [participantProfiles, setParticipantProfiles] = useState({});
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  
  const [targetLanguage, setTargetLanguage] = useState("");
  const [translations, setTranslations] = useState({});

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = onSnapshot(doc(db, "chats", chatId), async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setChatDetails(data);

        const profiles = {};
        for (const uid of data.participants) {
          if (uid !== auth.currentUser?.uid) {
            const pSnap = await getDoc(doc(db, "users", uid));
            if (pSnap.exists()) {
              profiles[uid] = pSnap.data().name || "Unknown";
            }
          }
        }
        setParticipantProfiles(profiles);
      }
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;

    const messagesQuery = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const loadedMessages = snapshot.docs.map((messageDoc) => ({
          id: messageDoc.id,
          ...messageDoc.data(),
        }));

        setMessages(loadedMessages);

        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      },
      (error) => console.error("Error loading chat messages:", error)
    );

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    if (!targetLanguage) return;

    messages.forEach(async (msg) => {
      if (msg.senderId !== auth.currentUser?.uid && msg.text) {
        try {
          const res = await fetch("http://127.0.0.1:8000/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: msg.text, target_lang: targetLanguage })
          });
          const data = await res.json();
          if (data.translated) {
            setTranslations(prev => ({ ...prev, [`${msg.id}_${targetLanguage}`]: data.translated }));
          }
        } catch (err) {
          console.error("Translation request failed:", err);
        }
      }
    });
  }, [targetLanguage, messages]);

  async function handleUpdateGroupPhoto(event) {
    if (!chatDetails?.isGroup) return;
    
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await updateDoc(doc(db, "chats", chatId), {
          groupPhoto: reader.result,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error updating group photo:", error);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSendMessage(event) {
    event.preventDefault();

    const currentUser = auth.currentUser;
    const cleanedMessage = newMessage.trim();

    if (!currentUser || !chatId || !cleanedMessage) return;

    setNewMessage("");

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        text: cleanedMessage,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: cleanedMessage,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setNewMessage(cleanedMessage);
    }
  }

  const chatTitle = chatDetails?.isGroup 
    ? chatDetails.groupName 
    : Object.values(participantProfiles)[0] || "Chat";

  return (
    <main className="chat-page">
      <div className="chat-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <button
          type="button"
          className="chat-back-button"
          onClick={() => navigate("/messages")}
          style={{ zIndex: 10 }}
        >
          <span aria-hidden="true">←</span>
          Back
        </button>

        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '40%' }}>
          {chatDetails?.isGroup && (
            <label style={{ cursor: "pointer", display: "flex", alignItems: "center" }} title="Click to change group photo">
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--light-grey)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                {chatDetails.groupPhoto ? (
                  <img src={chatDetails.groupPhoto} alt="Group" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <img src={defaultGroupIcon} alt="Default Group" style={{ width: "70%", height: "70%", objectFit: "contain" }} />
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleUpdateGroupPhoto} style={{ display: "none" }} />
            </label>
          )}
          <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {chatTitle}
          </strong>
        </div>

        <div className="translation-toggle" style={{ zIndex: 10 }}>
          <label htmlFor="translation-language" style={{ display: 'none' }}>Translate</label>
          <select
            id="translation-language"
            value={targetLanguage}
            onChange={(event) => setTargetLanguage(event.target.value)}
          >
            <option value="">Original</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="zh">Chinese</option>
            <option value="ar">Arabic</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
      </div>

      <div className="chat-container">
        <div className="messages-view">
          {messages.length === 0 ? (
            <div className="chat-empty-state">
              <p>No messages yet.</p>
              <span>Say hi to start the conversation.</span>
            </div>
          ) : (
            messages.map((message) => {
              const isMine = message.senderId === auth.currentUser?.uid;
              const translatedText = targetLanguage && !isMine ? translations[`${message.id}_${targetLanguage}`] : null;
              const senderName = participantProfiles[message.senderId] || "User";

              return (
                <div
                  key={message.id}
                  className={`chat-bubble-wrapper ${isMine ? "mine" : "theirs"}`}
                >
                  {chatDetails?.isGroup && !isMine && (
                    <span style={{ fontSize: "0.75rem", color: "#888", marginLeft: "12px", marginBottom: "4px", display: "block" }}>
                      {senderName}
                    </span>
                  )}
                  
                  <div className="chat-bubble">
                    <p className="original-text">
                      {isMine ? message.text : (translatedText || message.text)}
                    </p>

                    {!isMine && translatedText && translatedText !== message.text && (
                      <p className="translated-text" style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: "4px" }}>
                        Original: {message.text}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-area" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            aria-label="Message"
          />
          <button type="submit" disabled={!newMessage.trim()}>
            Send
          </button>
        </form>
      </div>
    </main>
  );
}

export default ChatPage;