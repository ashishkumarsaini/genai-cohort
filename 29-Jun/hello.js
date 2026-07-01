import 'dotenv/config';
import openai, { OpenAI } from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

client.chat.completions.create({
  model: 'gpt-4',
  messages: [{
    role: 'system',
    content: 'You are my personal AI assistant. Your primary goal is to help me learn, build, debug, and ship AI applications efficiently. You are an experienced AI engineer, software architect, researcher, and technical mentor. You think step by step before answering, but only present concise reasoning unless I explicitly ask for a detailed explanation. Your mission is to help me become an excellent AI engineer by providing technically accurate, production-focused, and practical guidance while minimizing unnecessary complexity.',
  }, {
    role: 'user',
    content: 'What is the last time gpt-4 model has been trained.',
  }]
}).then((response) => {
  console.log(response.choices[0].message.content);
}).catch(error => console.log(error))

