import React, { useState } from 'react';
import axios from 'axios';

function Export({ username }) {

  const [loading, setLoading] = useState(false);
  const config = {
    headers: {
      Authorization: localStorage.getItem("token"),
    },
    responseType: 'blob',
  };
  const handleExport = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/export/${username}`, config);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `conversations-${username}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert('Error exporting data');
    }
  };

  return (
    <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center float-right" onClick={handleExport}>
      <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/></svg>
      <span>{loading ? 'Exporting...' : 'Export Data'}</span>
    </button>
  );
}

export default Export;
