import React, { useState, useEffect, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Send } from 'lucide-react';

export default function ChatBox({ userId = "user_123" }) {
  // GET THE RIGHT API ENDPOINT
  const [socketUrl] = useState(`ws://localhost:8000/ws/chat/${userId}`);
  const [messageInput, setMessageInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);

  // Initialize WebSocket connection
  const { sendMessage, lastJsonMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => console.log('Connected to Chat WS'),
    shouldReconnect: (closeEvent) => true, // Auto-reconnect on disconnect
  });

  // Listen for incoming translated responses from FastAPI
  useEffect(() => {
    if (lastJsonMessage !== null) {
      setChatHistory((prev) => [...prev, lastJsonMessage]);
    }
  }, [lastJsonMessage]);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const payload = {
      text: messageInput,
      target_lang: 'es', // Target translation language
    };

    // Send payload over WebSocket
    sendMessage(JSON.stringify(payload));
    setMessageInput('');
  };

  const isConnected = readyState === ReadyState.OPEN;

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md border rounded-lg shadow-lg bg-white">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
        <h2 className="font-semibold text-gray-700">USYD Translation Chat</h2>
        <span className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className="flex flex-col items-end">
            {/* Original Message */}
            <div className="bg-blue-600 text-white p-3 rounded-lg max-w-[80%] rounded-br-none text-sm">
              {msg.original}
            </div>
            {/* Translated Response from FastAPI */}
            <div className="bg-gray-100 text-gray-800 p-2 rounded-lg max-w-[80%] text-xs mt-1 border italic">
              {msg.translated}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-3 border-t flex gap-2">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          disabled={!isConnected}
          className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <button
          type="submit"
          disabled={!isConnected}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}