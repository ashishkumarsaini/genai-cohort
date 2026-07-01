import { get_encoding } from "tiktoken";

const encoderForGPT2 = get_encoding('gpt2');

const encodedString = encoderForGPT2.encode('Hey, My name is Ashish');

console.log(encodedString);

const decodedString = encoderForGPT2.decode(encodedString);

console.log(new TextDecoder().decode(decodedString));
