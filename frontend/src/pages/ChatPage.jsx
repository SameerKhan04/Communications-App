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
  const [targetLanguage, setTargetLanguage] = useState("en");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(loadedMessages);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsubscribe();
  }, [chatId]);

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const text = newMessage;
    setNewMessage("");

    // Explicitly including the 'languages' array forces the extension to trigger 
    // and translate the message into these specific languages.
    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: text,
      senderId: auth.currentUser.uid,
      languages: ["en", "es", "fr", "zh", "ar", "hi", "de"],
      createdAt: serverTimestamp(),
    });

    await updateDoc(doc(db, "chats", chatId), {
      lastMessage: text,
      updatedAt: serverTimestamp()
    });
  }

  return (
    <main className="chat-page">
      <header className="public-profile-navbar">
        <div className="back-button" onClick={() => navigate("/messages")} style={{ cursor: "pointer" }}>
          ← Back
        </div>
        
        <div className="translation-toggle" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>Translate incoming messages:</label>
          <select 
            value={targetLanguage} 
            onChange={(e) => setTargetLanguage(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: "8px", border: "1px solid #cfd0d3" }}
          >
            <option value="en">English</option>
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
            
            // Debugging line: check your browser console (F12) to see what fields exist on incoming messages
            if (!isMine) {
              console.log("Incoming message object from Firestore:", msg);
            }

            // Check all common field names used by translation extensions (translations, translated, output)
            const translatedMap = msg.translations || msg.translated || msg.output || {};
            const translatedText = targetLanguage ? translatedMap[targetLanguage] : null;

            return (
              <div key={msg.id} className={`chat-bubble-wrapper ${isMine ? "mine" : "theirs"}`}>
                <div className="chat-bubble">
                  <p className="original-text" style={{ margin: 0 }}>
                    {!isMine && translatedText ? translatedText : msg.text}
                  </p>
                  
                  {!isMine && translatedText && translatedText !== msg.text && (
                    <p className="translated-text" style={{ fontSize: "0.75rem", opacity: 0.7, marginTop: "4px" }}>
                      Original: {msg.text}
                    </p>
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