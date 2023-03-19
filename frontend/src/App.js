import React, { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ChatBox from './components/ChatBox';
import Logout from './components/Logout';
import Export from './components/Export';
import './App.css';

function App() {
  const [token, setToken] = useState(null);
  const [activeTab, setActiveTab] = useState("login");

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto w-full max-w-screen-md">
        <div className="bg-white py-8 px-4 shadow rounded-lg px-10 mx-auto">
        {token ? (
            <>
              <div className="flex flex-wrap">
                <div className="w-full mb-4">
                  <Logout />
                  <Export />
                </div>
              </div>
              <div className="flex flex-wrap">
                <div className="w-full mb-4">
                  <ChatBox />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
              <button
                className={`${
                  activeTab === "login" ? "bg-gray-900 text-white" : "text-gray-900"
                } font-semibold py-2 px-4 border border-gray-400 rounded shadow mr-2`}
                onClick={() => setActiveTab("login")}>
                Login
              </button>
              <button
                className={`${
                  activeTab === "register" ? "bg-gray-900 text-white" : "text-gray-900"
                } font-semibold py-2 px-4 border border-gray-400 rounded shadow`}
                onClick={() => setActiveTab("register")}>
                Register
              </button>
            </div>
            {activeTab === "login" && (
              <div className="flex flex-wrap">
                <div className="w-full mb-4">
                  <LoginForm />
                </div>
              </div>
            )}
            {activeTab === "register" && (
              <div className="flex flex-wrap">
                <div className="w-full mb-4">
                  <RegisterForm />
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

