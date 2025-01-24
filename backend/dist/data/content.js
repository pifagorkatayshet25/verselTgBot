"use strict";
// data/content.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callbackTexts = exports.unsubscribedMenu = exports.mainMenu = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const menuItems_json_1 = __importDefault(require("./menuItems.json")); // Импортируем JSON файл
dotenv_1.default.config();
// Преобразуем данные из JSON в структуру, которую используем
exports.mainMenu = {
    inline_keyboard: menuItems_json_1.default === null || menuItems_json_1.default === void 0 ? void 0 : menuItems_json_1.default.menuItems.map((item) => [
        { text: item.text, callback_data: item.callback_data }
    ])
};
exports.unsubscribedMenu = {
    inline_keyboard: [
        [{ text: 'Подписаться на канал', url: process.env.LINK_SUBSCRIBED_CHANNEL || '' }],
    ],
};
// Составляем callbackTexts из данных JSON
exports.callbackTexts = menuItems_json_1.default.menuItems.reduce((acc, item) => {
    acc[item.callback_data] = item.response_text;
    return acc;
}, {});
