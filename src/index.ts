import Fastify from 'fastify';
import dotenv from 'dotenv';
import { startBot } from './bot';

dotenv.config();

const server = Fastify();
const bot = startBot();

server.get('/', async (request, reply) => {
  return { message: 'Telegram Bot API работает!' };
});

const startServer = async () => {
  try {
    await server.listen({ port: 8080 });
    console.log(`Server listening at ${server.server.address()}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

startServer();

bot.launch().then(() => {
  console.log('Бот запущен!');
});
