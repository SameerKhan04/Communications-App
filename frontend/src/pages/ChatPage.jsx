import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { auth, db } from "../firebase";
import "./Messages.css";

function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      // Auto-scroll to bottom on new message
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsubscribe();
  }, [chatId]);

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const text = newMessage;
    setNewMessage("");

    // 1. Save message to subcollection
    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: text,
      senderId: auth.currentUser.uid,
      createdAt: serverTimestamp(),
    });

    // 2. Update parent chat document for the inbox preview
    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: text,
      updatedAt: serverTimestamp()
    });
  }

  return (
    <main className="chat-page">
      <header className="public-profile-navbar">
        <div className="back-button" onClick={() => navigate("/messages")}>
          ← Back
        </div>
        
        <div className="translation-toggle">
          <label>Translate: </label>
          <select value={targetLanguage} onChange={(e) => setTargetLanguage(e.target.value)}>
            <option value="">Off (Original)</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="zh">Chinese</option>
            <option value="ar">Arabic</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
      </header>

      <div className="chat-container">
        <div className="messages-view">
          {messages.map(msg => {
            const isMine = msg.senderId === auth.currentUser?.uid;
            // Check if Firebase Extension has generated the translation yet
            const translatedText = targetLanguage && msg.translations ? msg.translations[targetLanguage] : null;

            return (
              <div key={msg.id} className={`chat-bubble-wrapper ${isMine ? "mine" : "theirs"}`}>
                <div className="chat-bubble">
                  <p className="original-text">{msg.text}</p>
                  {translatedText && (
                    <p className="translated-text">{translatedText}</p>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-area">
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button type="submit">Send</button>
        </form>
      </div>
    </main>
  );
}

export default ChatPage;