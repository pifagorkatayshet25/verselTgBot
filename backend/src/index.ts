import Fastify from 'fastify';
import dotenv from 'dotenv';
import { startBot } from './bot';

dotenv.config();

const server = Fastify();
const bot = startBot();

server.get('/', async (request, reply) => {
  return { message: 'Telegram Bot API работает!' };
});

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});

bot.launch().then(() => {
  console.log('Бот запущен!');
});
