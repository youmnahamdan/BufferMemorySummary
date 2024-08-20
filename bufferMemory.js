import { ChatOpenAI } from '@langchain/openai';
import { BufferMemory, ChatMessageHistory} from 'langchain/memory'
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import  {ConversationChain} from 'langchain/chains';
import readline from 'readline';
import Summarize from './createSummary.js';

import dotenv from 'dotenv';
dotenv.config();
const SUMMARY_LIMIT_MACRO = 3;
let summaryLimit = SUMMARY_LIMIT_MACRO;

const llm = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    apiKey: process.env.OPENAI_API_KEY,
});

const prompt = ChatPromptTemplate.fromTemplate(
    `answer user query {input} from conversation history : {history} to answer any questions and interact with them. Thay can choose your name and ask you for jokes.`
)

const memory = new BufferMemory({
    memoryKey: 'history',
})


const convChain = new ConversationChain({
    llm,
    prompt,
    memory
});



const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


const AskQ = async () => {
    rl.question('Enter a question: ', async(input)=>{

        if( input.toUpperCase() === 'EXIT'){
            rl.close();
            return;
        }
        if( input.trim() !== ''){
            const response = await convChain.invoke({input: input});
            /*
            To save context when using an agent:
            memory.chatHistory.messages.push(new HumanMessgae(input));
            memory.chatHistory.messages.push(new AIMessgae(response.answer));
            */

            console.log(response);
            await memory.loadMemoryVariables(); // Comment out
            summaryLimit--;
            
            if(summaryLimit === 0 ){
                await Summarize(memory);
                summaryLimit = SUMMARY_LIMIT_MACRO;
            }
        }
        
        AskQ();
    }) 
}

AskQ();
