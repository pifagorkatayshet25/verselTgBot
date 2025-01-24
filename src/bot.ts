import { Telegraf, Context } from 'telegraf';
import dotenv from 'dotenv';
import { mainMenu, unsubscribedMenu, callbackTexts } from './data/content';

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
const channelChatId = process.env.CHANNEL_CHAT_ID!;
const botMessages: { [userId: number]: number[] } = {};

const clearUserMessages = async (ctx: Context, userId: number) => {
  if (botMessages[userId]) {
    for (const messageId of botMessages[userId]) {
      try {
        await ctx.deleteMessage(messageId);
      } catch (e) {
        console.error(`Ошибка при удалении сообщения ${messageId}:`, e);
      }
    }
    botMessages[userId] = [];
  }
};

const sendMenu = async (ctx: Context, userId: number) => {
  try {
    let memberStatus;
    let retries = 3;
    while (retries > 0) {
      try {
        memberStatus = await ctx.telegram.getChatMember(channelChatId, userId);
        break; // Выход из цикла, если запрос успешен
      } catch (error) {
        console.error(`Ошибка при проверке подписки. Повторная попытка... (${retries})`);
        retries--;
        await new Promise(resolve => setTimeout(resolve, 2000)); // Пауза между попытками
      }
    }

    if (!memberStatus) {
      console.error('Не удалось получить статус подписки.');
      return await ctx.reply('Не удалось проверить подписку. Попробуйте позже.');
    }

    const isSubscribed = ['member', 'administrator', 'creator'].includes(memberStatus.status);
    
    // Добавляем кнопку "Обновить" в меню
    const updateButton = { text: '🔄 Обновить', callback_data: 'update' };
    
    const menu = isSubscribed 
      ? { inline_keyboard: [...mainMenu.inline_keyboard, [updateButton]] } 
      : { inline_keyboard: [...unsubscribedMenu.inline_keyboard, [updateButton]] };

    const text = isSubscribed
      ? 'Меню 📜'
      : '🔔 Подпишитесь на канал, чтобы продолжить:';

    const message = await ctx.reply(text, { reply_markup: menu });
    botMessages[userId] = [message.message_id];
  } catch (error) {
    console.error('Ошибка при проверке подписки:', error);
    await ctx.reply('Не удалось проверить подписку. Попробуйте позже.');
  }
};

bot.start(async (ctx) => {
  const userId = ctx.from?.id;

  if (userId) {
    const botName = ctx.botInfo.first_name;  // Получаем имя бота
    await clearUserMessages(ctx, userId);
    
    // Приветственное сообщение с именем бота
    await ctx.reply(`Привет! Я бот 👉 ${botName}. Посмотрите, чем могу помочь в меню.`);
    
    await sendMenu(ctx, userId);
  }
});

// Обработчик команды /update для обновления меню
bot.command('update', async (ctx) => {
  const userId = ctx.from?.id;

  if (userId) {
    await clearUserMessages(ctx, userId);
    
    // Повторно вызываем sendMenu для обновления
    await sendMenu(ctx, userId);
  }
});

// Обработчик нажатия на кнопку "Обновить"
bot.on('callback_query', async (ctx) => {
  const userId = ctx.from?.id;

  if (userId && ctx.callbackQuery && 'data' in ctx.callbackQuery) {
    const callbackData = ctx.callbackQuery.data;

    if (callbackData === 'update') {
      // Если нажата кнопка "Обновить", вызываем sendMenu
      await clearUserMessages(ctx, userId);
      await sendMenu(ctx, userId);
    } else if (callbackTexts[callbackData]) {
      await clearUserMessages(ctx, userId);
      await ctx.replyWithHTML(callbackTexts[callbackData]);
      await sendMenu(ctx, userId); // Обновляем меню после обработки callback
    } else {
      console.error(`Не найден текст для callbackData: ${callbackData}`);
    }
  } else {
    console.error('Ошибка: callback_query не содержит data или ctx.from.id');
  }
});

export const startBot = () => {
  return bot;
}
