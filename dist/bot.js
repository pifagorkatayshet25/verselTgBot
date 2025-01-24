"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startBot = void 0;
const telegraf_1 = require("telegraf");
const dotenv_1 = __importDefault(require("dotenv"));
const content_1 = require("./data/content");
dotenv_1.default.config();
const bot = new telegraf_1.Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const channelChatId = process.env.CHANNEL_CHAT_ID;
const botMessages = {};
const clearUserMessages = (ctx, userId) => __awaiter(void 0, void 0, void 0, function* () {
    if (botMessages[userId]) {
        for (const messageId of botMessages[userId]) {
            try {
                yield ctx.deleteMessage(messageId);
            }
            catch (e) {
                console.error(`Ошибка при удалении сообщения ${messageId}:`, e);
            }
        }
        botMessages[userId] = [];
    }
});
const sendMenu = (ctx, userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let memberStatus;
        let retries = 3;
        while (retries > 0) {
            try {
                memberStatus = yield ctx.telegram.getChatMember(channelChatId, userId);
                break; // Выход из цикла, если запрос успешен
            }
            catch (error) {
                console.error(`Ошибка при проверке подписки. Повторная попытка... (${retries})`);
                retries--;
                yield new Promise(resolve => setTimeout(resolve, 2000)); // Пауза между попытками
            }
        }
        if (!memberStatus) {
            console.error('Не удалось получить статус подписки.');
            return yield ctx.reply('Не удалось проверить подписку. Попробуйте позже.');
        }
        const isSubscribed = ['member', 'administrator', 'creator'].includes(memberStatus.status);
        // Добавляем кнопку "Обновить" в меню
        const updateButton = { text: '🔄 Обновить', callback_data: 'update' };
        const menu = isSubscribed
            ? { inline_keyboard: [...content_1.mainMenu.inline_keyboard, [updateButton]] }
            : { inline_keyboard: [...content_1.unsubscribedMenu.inline_keyboard, [updateButton]] };
        const text = isSubscribed
            ? 'Меню 📜'
            : '🔔 Подпишитесь на канал, чтобы продолжить:';
        const message = yield ctx.reply(text, { reply_markup: menu });
        botMessages[userId] = [message.message_id];
    }
    catch (error) {
        console.error('Ошибка при проверке подписки:', error);
        yield ctx.reply('Не удалось проверить подписку. Попробуйте позже.');
    }
});
bot.start((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
    if (userId) {
        const botName = ctx.botInfo.first_name; // Получаем имя бота
        yield clearUserMessages(ctx, userId);
        // Приветственное сообщение с именем бота
        yield ctx.reply(`Привет! Я бот 👉 ${botName}. Посмотрите, чем могу помочь в меню.`);
        yield sendMenu(ctx, userId);
    }
}));
// Обработчик команды /update для обновления меню
bot.command('update', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
    if (userId) {
        yield clearUserMessages(ctx, userId);
        // Повторно вызываем sendMenu для обновления
        yield sendMenu(ctx, userId);
    }
}));
// Обработчик нажатия на кнопку "Обновить"
bot.on('callback_query', (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
    if (userId && ctx.callbackQuery && 'data' in ctx.callbackQuery) {
        const callbackData = ctx.callbackQuery.data;
        if (callbackData === 'update') {
            // Если нажата кнопка "Обновить", вызываем sendMenu
            yield clearUserMessages(ctx, userId);
            yield sendMenu(ctx, userId);
        }
        else if (content_1.callbackTexts[callbackData]) {
            yield clearUserMessages(ctx, userId);
            yield ctx.replyWithHTML(content_1.callbackTexts[callbackData]);
            yield sendMenu(ctx, userId); // Обновляем меню после обработки callback
        }
        else {
            console.error(`Не найден текст для callbackData: ${callbackData}`);
        }
    }
    else {
        console.error('Ошибка: callback_query не содержит data или ctx.from.id');
    }
}));
const startBot = () => {
    return bot;
};
exports.startBot = startBot;
