
import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { AIMessage } from "@langchain/core/messages";


let chain;

const createSummaryModel = async () => {
   const summaryModel = new OpenAI({
      modelName: 'gpt-3.5-turbo',
      apiKey: process.env.OPENAI_API_KEY,
   });

   const prompt = PromptTemplate.fromTemplate(
      `You are a program assistant, and you're supposed to summarize a given text. This text will represent a conversation.
      your job is to make sure that the summary is not too long and highlight the most important points. There is no shared theme
      in different conversations.
      conversation history: {history}`
   );

   chain = prompt.pipe(summaryModel).pipe(new StringOutputParser());

}

const Summarize = async(bufferMemory) => {

   if(!chain){
      await  createSummaryModel();
   }
   
   console.log( 'content before summary: ',bufferMemory );
   const summary = await chain.invoke({history: (await bufferMemory.loadMemoryVariables()).history});
   console.log('summary: ', summary);

   // clear buffer memory
   bufferMemory.clear();

   // Append summary to buffer memory
   bufferMemory.chatHistory.messages.push(new AIMessage(summary));
   console.log('content after summary: ',bufferMemory);
}


export default Summarize;