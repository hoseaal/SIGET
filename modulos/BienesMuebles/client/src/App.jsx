import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Hacer petición al backend
    axios.get('/api')
      .then((res) => setMessage(res.data.message))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Frontend React + Vite</h1>
      <p>Mensaje del backend: <strong>{message}</strong></p>
    </div>
  );
}

export default App;