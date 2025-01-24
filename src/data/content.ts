// data/content.ts

import dotenv from 'dotenv';
import menuItemsData from './menuItems.json'; // Импортируем JSON файл

dotenv.config();

// Преобразуем данные из JSON в структуру, которую используем
export const mainMenu = {
  inline_keyboard: menuItemsData?.menuItems.map((item: { text: string; callback_data: string }) => [
    { text: item.text, callback_data: item.callback_data }
  ])
};

export const unsubscribedMenu = {
  inline_keyboard: [
    [{ text: 'Подписаться на канал', url: process.env.LINK_SUBSCRIBED_CHANNEL || '' }],
  ],
};

// Составляем callbackTexts из данных JSON
export const callbackTexts = menuItemsData.menuItems.reduce(
  (acc: { [key: string]: string }, item: { callback_data: string; response_text: string }) => {
    acc[item.callback_data] = item.response_text;
    return acc;
  },
  {}
);
