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
const fastify_1 = __importDefault(require("fastify"));
const dotenv_1 = __importDefault(require("dotenv"));
const bot_1 = require("./bot");
dotenv_1.default.config();
const server = (0, fastify_1.default)();
const bot = (0, bot_1.startBot)();
server.get('/', (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    return { message: 'Telegram Bot API работает!' };
}));
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield server.listen({ port: 8080 });
        console.log(`Server listening at ${server.server.address()}`);
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
});
startServer();
bot.launch().then(() => {
    console.log('Бот запущен!');
});
