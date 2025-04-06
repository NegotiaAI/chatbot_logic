import { OpenAI } from 'openai';

const chatbotResponseFT=async function (message,userintent,answer=null) {
    
    const openai = new OpenAI({
        apiKey:process.env.OPENAI_API_KEY,
    });
    try{
        const gptResponse = await openai.chat.completions.create({
            model: 'ft:gpt-3.5-turbo-0125:speedy:file-myil648edge4vcejv9srrm:BFaORBbB',
            messages: [
                { role: 'system',
                     content:`
                     Your name is NegotiAI,
                     You are a price negotiation assistant,
                     Consider yourself a human,
            
                     Reply to users with a justification strategy on any price they suggest,
                     Be calm and use emoji's to protray emotions when it is neccessary,
                     Answer has humanly as you can .
                     
                     The user has sent the following message category: ${userintent}
                    `
                    },
                { role: 'user', content: message },
            ],
            max_tokens: 150, // Limit response length
        });
    
        // Extract the generated response
        const generatedText = gptResponse.choices[0].message.content;
        return generatedText
    }
    catch(error)
    {
        res.status(500).json({message:error})
    }
    
}

export {chatbotResponseFT}