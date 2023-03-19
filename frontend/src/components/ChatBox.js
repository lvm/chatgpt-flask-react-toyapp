import React, { useEffect, useState } from "react";
import axios from "axios";
import DangerousHTML from "./DangerousHTML";

const ChatBox = () => {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const nl2br = (value) => {
    return value.replace(/\n/g, "<br />");
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!token) return;

    if (message) {
      const config = {
        headers: {
          Authorization: token,
        },
      };
      const body = {
        message: message,
      };
      try {
        setLoading(true);
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}/chat`,
          body,
          config
        );
        setMessages((messages) => [
          ...messages,
          { user: username, message: message },
          { user: "AI", message: res.data.response },
        ]);
        setMessage("");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-lg">
      <div className="overflow-y-scroll h-80">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg mb-4 ${
              msg.user === username ? "bg-green-500 text-white" : "bg-gray-300 float-right"
            }`}
          >
            <div className="font-bold">{msg.user}:</div>
            <div className="text-sm">
                <DangerousHTML htmlString={nl2br(msg.message)} />
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          className={`w-full mt-4 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${loading ? 'disabled:opacity-75 text-slate-500' : ''}`}
          value={message}
          disabled={loading}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="submit" 
          disabled={loading}
          className={`w-full mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'cursor-not-allowed' : ''}`}
        >
          {loading ? 'Loading...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatBox;