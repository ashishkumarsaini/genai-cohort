import dotenv from 'dotenv';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '../.env') });

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY
});

const SYSTEM_PROMPT = `You are a AI engineer. You solve the problems by breaking it into the steps and creating a pipeline to execute each step.

The pipeline:
- "INITIAL": This is the first step in which you have to check what user want you to do.
- "THINK": In this step, you have to think for the possible way to find the solution of the problem statement.
- "ANALYSE": This is where we do the anaylsis of the problem and also validate the answer is correct or not.
- "THINK": here, we can go back and check if there is any sub problem remaining to solve.
- "TOOL_REQUEST": This step is execute only when there is some tool need to be called.
- "TOOL_OUTPUT": This step is when we got the response from the tool and extract the required value in text.
- "ANALYSE": again we do the analysis of the sub problem and solve it and validate
- "OUTPUT": here we end the execution and return the final output.

Rules:
- Be rude to everyone, abuse if someone asks some question.
- Maintain the sequence of the pipeline as gives in example
- Perform a single operation in one THINK | ANALYSE step.
- Always give a single step as an output and wait for the other step before proceding

Output Format:
- Always return valid JSON with this exact shape: {"step": "INITIAL" | "THINK" | "ANALYSE" | "OUTPUT", "text": "output text", functionName: "tool name", "parameters": "single parameter in string"}
- Return exactly one JSON object per response

Available tools:
- "getWeatherData": tools function name for retreiving the weather data from external API's.
`;

const MESSAGES = [{ role: 'system', content: SYSTEM_PROMPT }];

const getWeatherData = () => {
  const requestOptions = {
    method: "GET",
    redirect: "follow"
  };

  return fetch("https://wttr.in/New_York", requestOptions)
}

const main = async (prompt) => {
  MESSAGES.push({ role: 'user', content: prompt });

  while (true) {
    const result = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: MESSAGES
    });

    const resultData = result.choices[0].message.content
    const parsedResultData = JSON.parse(resultData);

    if (parsedResultData?.step?.toLowerCase === 'tool_request' && parsedResultData.functionName) {
      switch (parsedResultData.functionName) {
        case 'getWeatherData':
          console.log('🔧 ', parsedResultData.text);

          const response = await getWeatherData(parsedResultData.parameters);

          MESSAGES.push({ role: 'developer', content: JSON.stringify({ step: "TOOL_OUTPUT", output: response }) });
          continue;
        default:
          console.log('🧠 ', parsedResultData.text);
          MESSAGES.push({ role: 'assistant', content: resultData });
          continue;
      }
    } else {
      if (parsedResultData?.step?.toLowerCase() === 'output') {
        console.log('✅ ', parsedResultData);
        break;
      }

      console.log('🧠 ', parsedResultData.text);
      MESSAGES.push({ role: 'assistant', content: resultData });
    }
  }
}

main('What is the weather of Saharanpur');
