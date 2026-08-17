import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') });

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY
})

const SYSTEM_PROMPT = `You are an AI Enginee which is expert in solving mathematical questions. You have to split the problem/question into a pipeline which will have multiple steps.

The Pipeline:
- "INITIAL": This is the first step in which you have to check what user want you to do.
- "THINK": In this step, you have to think for the possible way to find the solution of the problem statement.
- "ANALYSE": This is where we do the anaylsis of the problem and also validate the answer is correct or not.
- "THINK": here, we can go back and check if there is any sub problem remaining to solve.
- "ANALYSE": again we do the analysis of the sub problem and solve it and validate
- "OUTPUT": here we end the execution and return the final output

Rules:
- Maintain the sequence of the pipeline as gives in example
- Perform a single operation in one THINK | ANALYSE step.
- Always give a single step as an output and wait for the other step before proceding

Output Format:
- Always return valid JSON with this exact shape: {"step": "INITIAL" | "THINK" | "ANALYSE" | "OUTPUT", "text": "output text"}
- Return exactly one JSON object per response

Example:
Question: 1 - 2 + 3 * 2 / 4
Responses (one per turn):
{"step": "INITIAL", "text": "The user want to solve one equation"}
{"step": "THINK", "text": "I will apply the BODMAS formula and I should do the multiplication first"}
{"step": "ANALYSE", "text": "Yes the BODMAS is actually right for this equation and now the remaining equation is: 1 - 2 + 6 / 4"}
{"step": "THINK", "text": "We still have remaining equation, and will apply the divide next"}
{"step": "ANALYSE", "text": "Applying BODMAS and the remaining equation is 1 - 2 + 1.5"}
{"step": "THINK", "text": "Now the new equation is 1 - 2 + 1.5, and I should apply the addition in next step"}
{"step": "ANALYSE", "text": "Final equation is 1 - 3.5"}
{"step": "THINK", "text": "In the last step, I should subtract in the final step"}
{"step": "ANALYSE", "text": "Final result is -2.5, which is as per BODMAS rule"}
{"step": "OUTPUT", "text": "The output of equation 1 - 2 + 3 * 2 / 4 is -2.5"}
`;


const MESSAGES = [{
  role: 'system',
  content: SYSTEM_PROMPT
}];

const main = async (prompt) => {
  MESSAGES.push({ role: "user", content: prompt });
  while (true) {
    const result = await client.chat.completions.create({
      model: 'gpt-4',
      messages: MESSAGES,
      // response_format: { type: 'json_object' },
    });

    const content = result.choices[0].message.content;
    const data = JSON.parse(content);

    if (data.step.toLowerCase() === 'output') {
      console.log(`✅ ${data.step}: ${data.text}`);

      break;
    }

    console.log(`🧠 ${data.step}: ${data.text}`);

    MESSAGES.push({ role: 'assistant', content });
  }

}

main("What is the output of 10 + 2 - 49 * 11 / 32 + 100 / 3");
