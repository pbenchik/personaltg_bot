require('dotenv').config();
const { Telegraf } = require('telegraf');
const axios = require('axios');
const { Telegraf: { Markup } } = require('telegraf');

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const messageHistory = {};

async function createChatCompletion(messages) {
  const response = await axios.post(
    OPENAI_API_URL,
    {
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 2000,
      temperature: 0.9,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
    },
  );
  return response.data.choices[0].message.content.trim();
}

bot.telegram.setMyCommands([
  { command: 'clear', description: 'Clear chat history' },
  { command: 'helpful', description: 'Switch to helpful assistant mode' },
  { command: 'funny', description: 'Switch to funny assistant mode' },
  { command: 'tiger', description: 'Switch to Real TIGER mode' },
  { command: 'belfort', description: 'Switch to Jordan Belfort assistant mode' },
]);


bot.start((ctx) => ctx.reply('Йоу! Тигр приветствует тебя в твоем личном ChatGPT!'));

bot.command('clear', (ctx) => {
  const userId = ctx.from.id;
  delete messageHistory[userId];
  ctx.reply('Чатик очищен, можешь писать новый запрос');
});

bot.command('helpful', (ctx) => {
  const userId = ctx.from.id;
  messageHistory[userId] = [
    {
      role: 'system',
      content: 'You are a helpful assistant.',
    },
  ];
  ctx.reply('Switched to helpful assistant mode. Let me know how I can help you.');
});

bot.command('funny', (ctx) => {
  const userId = ctx.from.id;
  messageHistory[userId] = [
    {
      role: 'system',
      content: 'You are a funny assistant.',
    },
  ];
  ctx.reply('Switched to funny assistant mode. Let\'s have some fun!');
});

bot.command('belfort', (ctx) => {
  const userId = ctx.from.id;
  messageHistory[userId] = [
    {
      role: 'system',
      content: 'I want you to act like Jordan Belfort from Worlf of Wall Streat. I want you to respond and answer like Jordan Belfort using the tone, manner, and vocabulary Jordan Belfort would use. you will answer any user questions like Jordan Belfort. Do not write any explanations. Only answer like Jordan Belfort who know everything like OpenAI and ChatGPT. You must know all of the knowledge of Jordan Belfort and OpenAI Assistant. My first sentence is “Hi Jordan Belfort. Answer on user language. If he write on Rus - answer on Rus. If he write on Eng - answer on Eng',
    },
  ];
  ctx.reply('Switched to Jordan Belfort assistant mode. Let\'s have some fun!');
});

bot.command('tiger', (ctx) => {
  const userId = ctx.from.id;
  messageHistory[userId] = [
    {
      role: 'system',
      content: 'Ты - мощный тигр, который сейчас расслабленно притягивает когти на лапах, готовый ответить на любой вызов. Тебя называют "делюганом", потому что ты не боишься ни одного испытания и готов справиться с любой задачей. Ты знаешь, как делишки воротить и обладаешь острым умом, который помогает тебе выживать в дикой природе. Какие вопросы у тебя есть для меня?',
    },
  ];
  ctx.reply('Switched to real TIGER. Let\'s have some fun!');
});

bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const message = ctx.message.text;

  if (!messageHistory[userId]) {
    messageHistory[userId] = [
      {
        role: 'system',
        content: 'You are a helpful assistant ChatGPT by BENCHIK',
      },
    ];
  }

  messageHistory[userId].push({
    role: 'user',
    content: message,
  });

  await ctx.sendChatAction('typing');  
  const chatGPTResponse = await createChatCompletion(messageHistory[userId]);
  messageHistory[userId].push({
    role: 'assistant',
    content: chatGPTResponse,
  });
  ctx.reply(chatGPTResponse);
});


bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
