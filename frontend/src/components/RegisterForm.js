import React, { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RegisterForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegistration = async (newUsername, newPassword) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/register/create`, {
        username: newUsername,
        password: newPassword
      });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', newUsername);
      toast.success(`Welcome ${newUsername}`);
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        toast.error("User already exists");
        return;
      } else {
        toast.error("An error occurred. Please try again later.");
        return;
      }
    }

  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    } else {
      try {
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/register/check`, {
            username: username
        });

        if (res.status === 200) {
          toast.error("User already exists");
          return;
        } else if (res.status >= 500 ) {
          toast.error("An error occurred. Please try again later.");
          return;
        }
      } catch(err) {
        if (err.response && err.response.status === 404) {
          handleRegistration(username, password);
        }
      }
    }

  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <ToastContainer />

        <div className="mb-6">
          <label htmlFor="username" className="block text-gray-700 font-bold mb-2">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            placeholder="Enter your username"
            onChange={(e) => setUsername(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            placeholder="Enter your password"
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="confirm-password" className="block text-gray-700 font-bold mb-2">Confirm Password</label>
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            placeholder="Confirm your password"
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        </div>
        <div className="flex items-center justify-between">
          <button type="submit" className="p-2 bg-blue-500 text-white rounded">
            Register
          </button>
      </div>
    </form>
  );
};

export default RegisterForm;
