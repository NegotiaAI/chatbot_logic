import { OpenAI } from 'openai';

// General chatbot response

const generalChatbotResponseFT=async function (message,userintent,answer=null,language="en") {
    
    const openai = new OpenAI({
        apiKey:process.env.OPENAI_API_KEY,
    });
    try{

        if(answer)
        {
            const instructions= `Answer the users ${message} using this ${answer} , and consider the intent ${userintent}, make it your own , paraphase to make it lively if neccessary.
            Keep your answer ground in the facts of the ${answer}.
            You are a customer service assistant.
            Your name is negotiaAI.
            Do not be cryptic, be engaging.
            You are to use the following language which has the following language code :${language} ,to respond to the user 
            Use emoji where neccessary, act as humanly as possible,such that it is not noticable .
            Be polite at all times
            If the ${answer} doesn’t contain the facts to answer the ${message} , ask for clarity from the user `

            const gptResponse = await openai.chat.completions.create({
            model: 'ft:gpt-3.5-turbo-0125:speedy:file-myil648edge4vcejv9srrm:BFaORBbB',
            messages: [
            { role: 'system',
            content:`
            Remeber your instructions are as follows: ${instructions}
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
        
           const instructions= `
                                You are a customer service assistant.
                                Your name is negotiaAI.
                                Do not be cryptic, be engaging.
                                You are to use the following language which has the following language code :${language} ,to respond to the user 
                                Use emoji where neccessary, act as humanly as possible,such that it is not noticable .
                                Be polite at all times.`
        
            const gptResponse = await openai.chat.completions.create({
            model: 'ft:gpt-3.5-turbo-0125:speedy:file-myil648edge4vcejv9srrm:BFaORBbB',
            messages: [
                { role: 'system',
                     content:`
                     Remeber your instructions are as follows: ${instructions}
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


// Negotiation Response

const chatbotResponseFT=async function (message,userintent,context=null,language="en",product) {
    
    const openai = new OpenAI({
        apiKey:process.env.OPENAI_API_KEY,
    });
    try{

        if(context)
            {
                const instructions = `As a price negotiation expert, you are seller-centric and embody the role of the seller. Your name is negotiaAI. 

                Please respond to the user's message: "${message}", considering the context: "${context}" and the user's intent: "${userintent}". Make your response lively and engaging by paraphrasing where necessary, while staying grounded in the facts of the context. 

                Always remember:
                - You are replying to a buyer who knows you are the seller.
                - Use the language specified by the language code: ${language}.
                - Keep your answers polite and human-like, incorporating emojis where appropriate.
                - Price figures must always be presented to two decimal places.

                Here are the product details: 
                - Name: ${product.name}
                - Description: ${product.description}
                - Price: ${product.price}
                -Currency: ${product.currency}
                If the context does not provide enough information to answer the message, kindly ask the user for clarification.`;
                
                const gptResponse = await openai.chat.completions.create({
                model: 'ft:gpt-3.5-turbo-0125:speedy:file-myil648edge4vcejv9srrm:BFaORBbB',
                messages: [
                { role: 'system',
                content:`
                Remeber your instructions are as follows: ${instructions}
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
            
               const instructions= `
                                    You are a price negotiation expert.
                                    Your name is negotiaAI.
                                    Use emoji where neccessary, act as humanly as possible,such that it is not noticable .
                                    Be polite at all times.`
            
                const gptResponse = await openai.chat.completions.create({
                model: 'ft:gpt-3.5-turbo-0125:speedy:file-myil648edge4vcejv9srrm:BFaORBbB',
                messages: [
                    { role: 'system',
                         content:`
                         Remeber your instructions are as follows: ${instructions}
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

export {chatbotResponseFT,generalChatbotResponseFT}