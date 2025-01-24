import React, { useState, useEffect } from 'react';

const BotStatus = () => {
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch('/.netlify/functions/bot')
      .then((res) => res.json())
      .then((data) => setStatus(data.message))
      .catch(() => setStatus('Ошибка подключения'));
  }, []);

  return <h1>Статус бота: {status}</h1>;
};

export default BotStatus;
