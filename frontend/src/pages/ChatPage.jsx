// src/pages/ChatPage.jsx

import {
    addDoc,
    collection,
    doc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from "firebase/firestore";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    useNavigate,
    useParams,
} from "react-router";

import {
    auth,
    db,
} from "../firebase";

import "./Messages.css";

function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [translations, setTranslations] = useState({});

  const messagesEndRef = useRef(null);

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
          messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
          });
        }, 100);
      },
      (error) => {
        console.error("Error loading chat messages:", error);
      }
    );

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    if (!targetLanguage) {
      return;
    }

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

  async function handleSendMessage(event) {
    event.preventDefault();

    const currentUser = auth.currentUser;
    const cleanedMessage = newMessage.trim();

    if (!currentUser || !chatId || !cleanedMessage) return;

    setNewMessage("");

    try {
      await addDoc(
        collection(db, "chats", chatId, "messages"),
        {
          text: cleanedMessage,
          senderId: currentUser.uid,
          createdAt: serverTimestamp(),
        }
      );

      await updateDoc(
        doc(db, "chats", chatId),
        {
          lastMessage: cleanedMessage,
          updatedAt: serverTimestamp(),
        }
      );
    } catch (error) {
      console.error("Error sending message:", error);
      setNewMessage(cleanedMessage);
    }
  }

  return (
    <main className="chat-page">
      <div className="chat-toolbar">
        <button
          type="button"
          className="chat-back-button"
          onClick={() => navigate("/messages")}
        >
          <span aria-hidden="true">←</span>
          Back to messages
        </button>

        <div className="translation-toggle">
          <label htmlFor="translation-language">Translate</label>
          <select
            id="translation-language"
            value={targetLanguage}
            onChange={(event) => setTargetLanguage(event.target.value)}
          >
            <option value="">Off</option>
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

              return (
                <div
                  key={message.id}
                  className={`chat-bubble-wrapper ${isMine ? "mine" : "theirs"}`}
                >
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