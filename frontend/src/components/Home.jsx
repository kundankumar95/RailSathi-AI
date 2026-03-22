import React, { useState, useEffect, useRef } from "react";
import "./Home.css";

const Home = () => {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "🚆 Hi! I'm RailSathi AI. How can I assist you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastIntent, setLastIntent] = useState(null); 

  const bottomRef = useRef(null);

  const suggestions = [
    "Report cleanliness issue",
    "Water problem in coach",
    "Electricity issue",
    "Check complaint status",
  ];

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.toLowerCase();

    const userMessage = { role: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // 🔥 STEP 1: detect intent
    if (userText.includes("clean")) {
      setLastIntent("cleanliness_issue");
    } else if (userText.includes("water")) {
      setLastIntent("water_issue");
    } else if (userText.includes("electricity") || userText.includes("light")) {
      setLastIntent("electricity_issue");
    } else if (userText.includes("complaint status")) {
      setLastIntent("complaint_status");
    }

    // 🔥 STEP 2: detect train number + coach
    const trainPattern = /\d{3,5}/;
    const coachPattern = /[A-Z]\d+/i;

    if (
      lastIntent &&
      trainPattern.test(userText) &&
      coachPattern.test(userText)
    ) {
      const complaintId = "RS" + Math.floor(1000 + Math.random() * 9000);

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            text: `✅ Complaint Registered!\n\n📌 Complaint ID: ${complaintId}\n📊 Status: Pending`,
          },
        ]);
        setLoading(false);
        setLastIntent(null);
      }, 800);

      return;
    }

    // 🔥 STEP 3: normal backend call
    try {
      const response = await fetch("https://railsathi-ai-1.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
        }),
      });

      const data = await response.json();

      const botReply = {
        role: "bot",
        text:
          data.reply ||
          data.response ||
          "🤖 Sorry, I couldn't understand that.",
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "⚠️ Server error. Please try again later.",
        },
      ]);
    }

    setLoading(false);
  };

  const handleSuggestion = (text) => {
    setInput(text);
  };

  return (
    <div className="container">
      {/* HEADER */}
      <div className="header">
        <h1>🚆 RailSathi AI</h1>
        <p>Your Smart Railway Assistant</p>
      </div>

      {/* CHAT AREA */}
      <div className="chatBox">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.role === "user" ? "user" : "bot"}`}
          >
            {msg.text}
          </div>
        ))}

        {loading && <div className="typing">Bot is typing...</div>}

        <div ref={bottomRef}></div>
      </div>

      {/* SUGGESTIONS */}
      <div className="suggestions">
        {suggestions.map((s, i) => (
          <button key={i} onClick={() => handleSuggestion(s)}>
            {s}
          </button>
        ))}
      </div>

      {/* INPUT */}
      <div className="inputArea">
        <input
          type="text"
          placeholder="Describe your issue..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Home;
