import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { OpenAI } from 'openai';

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') });

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});

async function main() {
  const result = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'user',
      content: `
        What is 2 + 2 ?
        Example:
          - what is 4 + 5?
            Expected output: 4 + 5 = 9
        `,
    }]
  })

  console.log(result.choices[0].message.content);
}

main();
