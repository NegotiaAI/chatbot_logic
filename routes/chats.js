import express, { response } from "express"
import axios from 'axios';
import mongoose from "mongoose"
import Chat from "../models/chat.js"
import { OpenAI } from 'openai';

// mathematical algorithm functions
import { Nb_s,Xb_s,NSb_s,Xb_s_tend,NSb_s_tend} from '../functions/mathematical_model/buyer.js'

import { Ns_b,Xs_b,NSs_b,Xs_b_tend,NSs_b_tend} from '../functions/mathematical_model/seller.js'

import {determineCL,calculatePercentageDiscounts} from '../functions/linguistic_variables/concesstion_level.js'

import {demand_urgency,CL_decreased,chatbot_context,negotiation_strategy,wantCounterOffer,isUserAffirming,removeSymbols} from '../functions/others/others.js'
import {isNegotiation} from '../functions/others/isnegotiation.js'
import {isgeneralQuery,isUnknown} from '../functions/others/isgeneralQuery.js'
import {isIntro} from '../functions/others/isIntro.js'
import {chatbotResponseFT,generalChatbotResponseFT} from '../functions/others/chatbotResponse.js'
import {updateNegotiation} from '../functions/negotiations/updateNegotiation.js'
import {core_logic} from '../functions/negotiations/core_logic.js'




import dotenv from "dotenv"

// ---------------------

// const Websites = mongoose.connection.negotiAI.collection('websites');
// First get the native MongoDB driver connection
const db = mongoose.connection.useDb('negotiAI'); // Switch databases
const Websites = db.collection('websites');



if(process.env.NODE_ENV!=='production')
{
    dotenv.config()
}


const openai = new OpenAI({
    apiKey:process.env.OPENAI_API_KEY,
});

const FLASK_API_URL = 'http://127.0.0.1:5000';


const router=express.Router();





/**
 * Test mathematical model
 */

router.post('/mathematical_model',async(req,res)=>{

    const b_product={min:300,max:390}
   const s_product={min:250,max:400}
   const r=10
   const s_pap=0
   const b_pap=0.2
   /**
    * Note: If the pap is more than 0 it means the algorithm wants to compromise below it's minimum price
    * this could hurt the client's business.  if the demand urgency on the product is between 0-2 ,this should be
    * the only time the algorithm compromises below the minimum, this is because with such level of demand urgency,
    * we consider that the product isn't being purchased in like every year or 6 months or a very wide time range
    * based on what the client considers as wide time range for their product.We could set the pap to dk=-0.03(Dilan's constant)
    * with with value the the there is atleast a 1.03% profit made by the business
    */

   //buyer
//    const Nb_sp=await Nb_s(b_product,r)
//    const Xb_sp=await Xb_s(b_product,r,2,Nb_sp)
//    const NSb_sp=await NSb_s(b_product,Xb_sp)
//    const Xb_s_tendp=await Xb_s_tend(b_product,b_pap,Nb_sp)
//    const NSb_s_tendp=await NSb_s_tend(b_product,b_pap,Xb_s_tendp)

   
   
//     // res.json({Nb_sp,Xb_sp,NSb_sp,Xb_s_tendp,NSb_s_tendp})

//     //seller

//     const Ns_bp=await Ns_b(s_product,r)
//     const Xs_bp=await Xs_b(s_product,r,2,Ns_bp)
//     const NSs_bp=await NSs_b(s_product,Xs_bp)
//     const Xs_b_tendp=await Xs_b_tend(s_product,s_pap,Ns_bp)
//     const NSs_b_tendp=await NSs_b_tend(s_product,s_pap,Xs_b_tendp)
 
    // res.json({Ns_bp,Xs_bp,NSs_bp,Xs_b_tendp,NSs_b_tendp})
    // Algorithm 1 Test-Buyer's perspective
    console.log("Algorithm by P.K. Haleema and N.Ch.S.N. Iyengar")
    console.log(" ")
    let numericScoreOfSeller=[]
    let numericScoreOfBuyer=[]
    let buyersPrices=[]
    let sellersPrices=[]
    
    for(let i=1;i<=r;i++)
    {
        buyersPrices[0]=0
        sellersPrices[0]=0
        // delete buyersPrices[0]
        // delete sellersPrices[0]
        const buyersInitialProposal=await Nb_s(b_product,r)
        const sellersInitialProposal=await Ns_b(s_product,r)
        
        if(i===1)
        {
            buyersPrices[i]=buyersInitialProposal
            sellersPrices[i]=sellersInitialProposal
            numericScoreOfBuyer[i]=await NSs_b(s_product,buyersInitialProposal)
            numericScoreOfSeller[i]=await NSs_b(s_product,sellersInitialProposal)
            // console.log(sellersPrices[i])
            // return
            console.log(" Seller's price: "+sellersPrices[i]+" ...Buyer's Price: "+buyersPrices[i]+ " ... Negotiation round: "+ parseInt(i))

        }
        else if(i>1){
                //  console.log("CExitd seller price : "+sellersPrices[i])
                if(!sellersPrices[i])
                    {
                        sellersPrices[i]=await Xs_b(s_product,r,i,sellersPrices[i-1])
                    }

                    numericScoreOfSeller[i]=await NSs_b(s_product,sellersPrices[i])

                    // buyer
                    
                    buyersPrices[i]=await Xb_s(b_product,r,i,buyersPrices[i-1])
                    
                    numericScoreOfBuyer[i]=await NSs_b(s_product,buyersPrices[i])
     
            // Assesments by the seller
            if(i===r)
            {
                const Xs_b_tendp=await Xs_b_tend(s_product,s_pap,sellersPrices[i-1])
                const sellerNumericScoretend= await NSs_b_tend(s_product,s_pap,Xs_b_tendp)
                const buyerNumericScorelast= await NSs_b(s_product,s_pap,buyersPrices[i])
                // console.log(buyerNumericScorelast,sellerNumericScoretend)
                console.log(" Seller's price: "+Xs_b_tendp+" ...Buyer's Price: "+buyersPrices[i]+ " ... Negotiation round: "+ parseInt(i))

                if(buyerNumericScorelast>=sellerNumericScoretend){
                    console.log("Offer Accepted At End")
                    return
                }
                else{
                    console.log("Offer Rejected At end")
                    return
                }
            }
        else {
                // seller
              
                const value=parseInt(i+1)
    
                const sellerPrices_next=await Xs_b(s_product,r,value,sellersPrices[i]) //
                const numericScoreOfSeller_next=await NSs_b(s_product,sellerPrices_next) //NSPt+1
                sellersPrices[i+1]=sellerPrices_next
                
                console.log("Seller's Next price: "+sellerPrices_next)
                 console.log("Seller Numertic Score: "+numericScoreOfSeller_next,"Buyer numeric score: "+numericScoreOfBuyer[i])
                // console.log("Buyer'Price "+buyersPrices[i])
                console.log(buyersPrices)
                console.log(sellersPrices)

                if(numericScoreOfBuyer[i]>=numericScoreOfSeller_next){
                    // console.log("Offer Accepted")
                    // return
                }
                // if(buyersPrices[i]>=sellerPrices_next){
                //     console.log("Offer Accepted")
                //     return
                // }

            }  
            console.log(" Seller's price: "+sellersPrices[i]+" ...Buyer's Price: "+buyersPrices[i]+ " ... Negotiation round: "+ parseInt(i))
            console.log(" ")
            console.log(" ")
    }
    
    }
    
})



/**
 * Negotia AI algorithm , an upgrade on the mathematical model algorithm
 */

router.post('/mathematical_nai_model',async(req,res)=>{

    const b_product={min:300,max:390}
    const s_product={min:250,max:400}
    const r=10
    const s_pap=0
    const b_pap=0.2
    const urgency=req.body.DU
    var concessions=[]
    /**
     * Note: If the pap is more than 0 it means the algorithm wants to compromise below it's minimum price
     * this could hurt the client's business.  if the demand urgency on the product is between 0-2 ,this should be
     * the only time the algorithm compromises below the minimum, this is because with such level of demand urgency,
     * we consider that the product isn't being purchased in like every year or 6 months or a very wide time range
     * based on what the client considers as wide time range for their product.We could set the pap to dk=-0.03(Dilan's constant)
     * with with value the the there is atleast a 1.03% profit made by the business
     * CL for negotiAI's base algorithm is focused on percentage discount by the user and their tone
     */
 
     console.log("Updated P.K. Haleema and N.Ch.S.N. Iyengar Algorithm, NegotiAI algorithm by N.Dilan K")
     console.log(" ")
     let numericScoreOfSeller=[]
     let numericScoreOfBuyer=[]
     let buyersPrices=[]
     let sellersPrices=[]
    //  sellersPrices=[400,425,435]
     const prices=req.body.prices
     const maxPrice=req.body.maxPrice
     const tone=req.body.tone
    //  const percentageDiscounts = calculatePercentageDiscounts([50,200,100], 350);
    //  const averageDiscount = percentageDiscounts.reduce((sum, discount) => sum + discount, 0) / percentageDiscounts.length;
     
    // const CL = await determineCL(prices,maxPrice, 'positive',0.5);
    //  res.json({ CL});
     const DU=demand_urgency(urgency)
     console.log("Demand Urgency: "+DU)
    //  console.log("Concession Level: "+CL)

     for(let i=1;i<=r;i++)
     {
         buyersPrices[0]=0
         sellersPrices[0]=0
         const value=parseInt(i+1)
         if(i==0 || i==1)
         {
            var CL="moderate" // look into this value
            if(tone.sentiment=="positive" && tone.confidence>0.7 &&DU>7)
            {
                 CL="high"
            }
            else if(tone.sentiment=="positive" && tone.confidence>0.2  &&DU>4)
            {
                 CL="moderate"
            }
            else if(tone.sentiment=="negative" && tone.confidence>0.7  &&DU>1)
            {
                     CL="low"
            }
            else if(tone.sentiment=="negative" && tone.confidence>0.2  &&DU>4)
            {
                     CL="moderate"
            }
            else{
                 CL="low"
            }

         }
        
         concessions.push(CL)
         const buyersInitialProposal=await Nb_s(b_product,r)
         console.log("concession: "+concessions)
         if(i===1)
         {
               
            // buyersPrices[i]=buyersInitialProposal
            // sellersPrices[i]=sellersInitialProposal
            // numericScoreOfBuyer[i]=await NSs_b(s_product,buyersInitialProposal)
            // numericScoreOfSeller[i]=await NSs_b(s_product,sellersInitialProposal)
            if(DU=="very_high" || DU=="high")
            {
                var sellersInitialProposal=s_product.max
            }
            else{
                var sellersInitialProposal=await Ns_b(s_product,r)
            }
             buyersPrices[i]=buyersInitialProposal
             sellersPrices[i]=sellersInitialProposal
             numericScoreOfBuyer[i]=await NSs_b(s_product,buyersInitialProposal)
             numericScoreOfSeller[i]=await NSs_b(s_product,sellersInitialProposal)
             // console.log(sellersPrices[i])
             // return
            console.log(" Seller's price: "+sellersPrices[i]+" ...Buyer's Price: "+buyersPrices[i]+ " ... Negotiation round: "+ parseInt(1))

            const sellerPrices_next=await Xs_b(s_product,r,value,sellersPrices[i]) //
            const numericScoreOfSeller_next=await NSs_b(s_product,sellerPrices_next) //NSPt+1
            sellersPrices[i+1]=sellerPrices_next
            console.log("Seller's Next price: "+sellerPrices_next)
            console.log("Buyer's price: "+buyersPrices[i])
            console.log("Seller Numertic Score: "+numericScoreOfSeller_next,"Buyer numeric score: "+numericScoreOfBuyer[i])

            if(numericScoreOfBuyer[i]>=numericScoreOfSeller_next){
                console.log("Offer Accepted")
                return
            }

         }
           // Assesments by the buyer
           if(i===r)
            {
                const Xs_b_tendp=await Xs_b_tend(s_product,s_pap,sellersPrices[i-1])
                const sellerNumericScoretend= await NSs_b_tend(s_product,s_pap,Xs_b_tendp)
                const buyerNumericScorelast= await NSb_s(s_product,s_pap,buyersPrices[i])
                console.log("Last price: "+Xs_b_tendp)
                // console.log(buyerNumericScorelast,sellerNumericScoretend)
                if(DU=="very_high" ||DU=="high")
                {
                        console.log("Offer Rejected At end,the demand on this offer is too high we can't accept this offer")
                        return
                
                }
                else if(DU=="moderate")
                    {
                        // consider all past prices and accept the highest price / closest to minimum price"(t=9)

                        if(buyerNumericScorelast>=sellerNumericScoretend){
                            // Accept buyer's last price if it is more 20% of the minimum price
                            if(buyersPrices[i-1]>s_product.min+s_product.min*0.3)
                           {
                            console.log("Offer Accepted At End,price: "+buyersPrices[i-1])
                            return
                           }
                            else{
                                console.log("Reject Offer,Must be atleast 30% of minimum price")
                                 return
                            }
                        }
                        else{
                            console.log("Reject Offer")
                             return
                        }
                }

                else if(DU=="low")
                {
                    // consider all past prices and accept the highest price / closest to minimum price"(t=9)

                    if(buyerNumericScorelast>=sellerNumericScoretend){
                        // Take highest suggested customer price
                        // if(buyersPrices[i]>Xs_b_tendp)
                        console.log("Offer Accepted At End,price: "+buyersPrices[i-1])
                        return
                    }

                    else{
                        console.log("Reject Offer")
                         return
                    }
                }
                else{
                    console.log("Reject Offer")
                     return
                }
                
            }
         else if(i>1){
                 //  console.log("CExitd seller price : "+sellersPrices[i])
                if(!sellersPrices[i])
                {
                    sellersPrices[i]=await Xs_b(s_product,r,i,sellersPrices[i-1])
                }

                // numericScoreOfSeller[i]=await NSs_b(s_product,sellersPrices[i])
                // buyer
                
                buyersPrices[i]= await Xb_s(b_product,r,i,buyersPrices[i-1])
                numericScoreOfBuyer[i]=await NSs_b(s_product,buyersPrices[i])
                
                console.log(buyersPrices)
                var CL = await determineCL(buyersPrices.slice(1),s_product.max, tone.sentiment,tone.confidence);
                 
        
                
                //  if DU is high or very high the initial seller price doesn't change
                
                 // seller
                console.log(CL_decreased(concessions))
                if(DU=="very_high" || DU=="high")
                {
                    if(i==2)
                    {
                        var sellerPrices_next=await Xs_b(s_product,r,value,sellersPrices[i]) //Xs_b t+1
                    }
                    else{
                        var sellerPrices_next=sellersPrices[i] //Xs_b t+1
                    }
                }
                else if(DU=="moderate")
                {
                    if(CL_decreased(concessions))
                    {
                        var sellerPrices_next=await Xs_b(s_product,r,value,sellersPrices[i]) //Xs_b t+1
                    }
                    else{
                        var sellerPrices_next=sellersPrices[i] //Xs_b t+1
                    }
                }
                else if(DU=="low")
                    {
                        if(CL_decreased(concessions))
                        {
                            var sellerPrices_next=await Xs_b(s_product,r,value,sellersPrices[i]) //Xs_b t+1
                        }
                        else{
                            var sellerPrices_next=sellersPrices[i] //Xs_b t+1
                        }
                    }

                 const numericScoreOfSeller_next=await NSs_b(s_product,sellerPrices_next) //NSPt+1
                 sellersPrices[i+1]=sellerPrices_next
                 
                 console.log("Seller's Next price: "+sellerPrices_next)
                  console.log("Seller Numertic Score: "+numericScoreOfSeller_next,"Buyer numeric score: "+numericScoreOfBuyer[i])
                 // console.log("Buyer'Price "+buyersPrices[i])
                 // console.log(buyersPrices)
                 // console.log(sellersPrices)
 
                 if(numericScoreOfBuyer[i]>=numericScoreOfSeller_next){
                     console.log("Offer Accepted")
                    //  return
                 }

                 // if(buyersPrices[i]>=sellerPrices_next){
                 //     console.log("Offer Accepted")
                 //     return
                 // }
 
                 console.log(" Seller's price: "+sellersPrices[i]+" ...Buyer's Price: "+buyersPrices[i]+ " ... Negotiation round: "+ parseInt(i))
                 console.log(" ")
                 console.log(" ")
     }
       
     }
     
 })
 
// google translate test



router.post('/detect-language', async (req, res) => {
  try {
    const { text } = req.body.text;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required and must be a string' });
    }

    // Get access token (you might want to cache this)
    const authResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: generateJWT() // You'll need to implement this
      }
    );

    const { access_token } = authResponse.data;

    // Call the Language API
    const apiResponse = await axios.post(
      'https://language.googleapis.com/v1/documents:detectLanguage',
      {
        document: {
          content: text,
          type: 'PLAIN_TEXT'
        }
      },
      {
        params: { key: 'YOUR_API_KEY' }, // Alternative to OAuth
        headers: { Authorization: `Bearer ${access_token}` }
      }
    );

    res.json({
      text,
      languageCode: apiResponse.data.languageCode,
      status: 'success'
    });
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to detect language' });
  }
});



router.get('/',async(req,res)=>{
    const message = req.body.message;
    const gptResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            { role: 'system',
                 content:`
                 You are a price negotiation assistant
                 Reply to users with a justification strategy on any price they suggest,
                 Be calm and use emoji's to protray emotions
                 Answer has humanly as you can .
                 Your name is NegotiAI

                `
                },
            { role: 'user', content: message },
        ],
        max_tokens: 150, // Limit response length
    });

    // Extract the generated response
    const generatedText = gptResponse.choices[0].message.content;

    // Send the response back to the client
    res.json({ generatedText });

})



/**
 * Negotiation core logic 
 */
router.post('/response/:wId/chat/:cId',async(req,res)=>{
    var message=req.body.text
    const chatId=req.params.cId
    const websiteId=req.params.wId 
    const product=req.body.product
    
    console.log(message,product)
    const websiteExists = await Websites.findOne({ _id: new mongoose.Types.ObjectId(websiteId) });
    var chat = await Chat.findOne({ "chat_id": chatId });
    
    // Error validation
    if(!websiteExists)
    {
        res.status(400).json({message:"Invalid website ID"})
        return
    }
    else if(!product)
    {
        res.status(400).json({message:"Invalid product"})
        return
    }
    else if(!chat)
    {
        const newChat =new Chat({
            chat_id:chatId
        })
        chat=await newChat.save()
    }


    // res.json(websiteExists)


    // Validate data from user is valid, from the chat id to request id to input message


    try{

         // Detecting user's language
         const userLanguage=await axios.post(`${FLASK_API_URL}/detect-language`,req.body)
         console.log(userLanguage.data.language)
         var languageToRespondWith=userLanguage.data.language
         // Translate to english if language isn't initially english
         if(userLanguage.data.language!="en")
         {
             req.body.source=userLanguage.data.language
             req.body.destination="en"
             var translatedMessage=await axios.post(`${FLASK_API_URL}/translate`,req.body)
             req.body.text=translatedMessage.data.translated_text
             message=translatedMessage.data.translated_text
             
             console.log(translatedMessage.data.translated_text)

         }

        console.log("Translated message: "+message)

        const userintent = await axios.post(`${FLASK_API_URL}/userintent`, req.body);
        const usersentiment = await axios.post(`${FLASK_API_URL}/sentiment`, req.body);
        const usergeneralintent= await axios.post(`${FLASK_API_URL}/generalintent`,req.body)
        const userPrice= await axios.post(`${FLASK_API_URL}/buyerPrice`,req.body)
        const isNegotiationn=isNegotiation(userintent.data,usergeneralintent.data)
        
        const savedFAqs=websiteExists.general_questions

        const faqsAnswers = savedFAqs.find((item) => item.category == usergeneralintent.data.class_name) || { response: "" }
        

        console.log(userintent.data,usergeneralintent.data,isNegotiationn)

        // // res.json(userPrice)
        // // return
        // console.log("FAQs"+faqsAnswers.response)
        // const response=await chatbotResponseFT(message,"intro")
        // await updateNegotiation(message,response,websiteId,chatId)
        // return

        // Check if this chat had reached a conclusion in the past or concession

        // if(chat.status=="accepted" ||chat.status=="rejected")
        // {

        //     var context=`
        //       The buyer is trying to start a conversation, but you both already reached an agreement with the price
        //       ${chat.last_bot_price}.
        //     `
        //     const response=await chatbotResponseFT(message,chat.status,context)

        //     const resp={
        //         text:response,
        //         id: new mongoose.Types.ObjectId(),
        //         status:"accepted",
        //         timestamp:new Date()
        //     }

        //     // update negotiations
 
        //     // await updateNegotiation(message,response,websiteId,chatId)

        //     res.json({"response":resp})
        //     return
        // }

        if(isIntro(userintent.data,usergeneralintent.data))
        {
            // send introduction reply
            // console.log("Message: "+message)
        

                const response=await generalChatbotResponseFT(message,"intro",null,languageToRespondWith)
                console.log("response: "+response)
                const resp={
                    text:response,
                    id: new mongoose.Types.ObjectId(),
                    status:"active",
                    timestamp:new Date()
                }

                // update negotiations

                 await updateNegotiation(message,response,websiteId,chatId)
    
                res.json({"response":resp})
                return
        
           
        }
        else if(isUnknown(userintent.data))
        {

            if(isUserAffirming(message))
            {
                // check if a previous negotiation exist and accept deal based on latest price

                if(chat.last_bot_price)
                {
                    var context=`
                                The buyer has accepted the deal the seller proposed for this product "${product.name}", with the price:"${chat.last_bot_price}" .
                                Thank them in a warm way
                                `
                    const response=await chatbotResponseFT(message,"agreement",context,languageToRespondWith,product)

                    const resp={
                        text:response,
                        id: new mongoose.Types.ObjectId(),
                        status:"active",
                        timestamp:new Date()
                    }
       
                    chat.status="accepted"
                    await chat.save()
                    // update negotiations
                   
                    await updateNegotiation(message,response,websiteId,chatId)
       
                    res.json({"response":resp})
                    return
                }
                

                
            }


             //Can't understand user input or error reply
             const response=await generalChatbotResponseFT(message,"unknown","Can you clarify what you are talking about?",languageToRespondWith)

             const resp={
                 text:response,
                 id: new mongoose.Types.ObjectId(),
                 status:"active",
                 timestamp:new Date()
             }

             // update negotiations
            
             // await updateNegotiation(message,response,websiteId,chatId)

             res.json({"response":resp})

             return
        }
        else if(!isNegotiationn || wantCounterOffer(userintent.data,usergeneralintent.data))
        {
            // 
            
            // console.log("Is general query: "+isgeneralQuery(usergeneralintent.data))

            if(isgeneralQuery(usergeneralintent.data) && wantCounterOffer(userintent.data,usergeneralintent.data)==false)
            {
                // retreive important information,by using endpoints to query response from e-commerce website owners
                // response="General query response"
                // res.json({response:response})
                console.log("FAQ: "+faqsAnswers.response)
                    const response=await generalChatbotResponseFT(message,usergeneralintent.data.class_name,faqsAnswers.response,languageToRespondWith)

                    const resp={
                        text:response,
                        id: new mongoose.Types.ObjectId(),
                        status:"active",
                        timestamp:new Date()
                    }
                    // update negotiations
                   
                    await updateNegotiation(message,response,websiteId,chatId)

                    res.json({"response":resp})

                    return
        
                
            }
            else if(wantCounterOffer(userintent.data,usergeneralintent.data))
            {
                // Suggest counter offer

                const buyerCurrentPrice=0

                console.log("User Price: "+userPrice)
    
    
                console.log("Buyer's price: "+buyerCurrentPrice)
    
                
                const currency="USD"
                
                const logic=await core_logic(websiteId,chatId,product,buyerCurrentPrice,usersentiment.data)     
                console.log(logic)
                // Define different contexts
    
                const contextCount = Math.min(chat.contexts.length, 3);
                const recentContexts = chat.contexts.slice(-contextCount);
    
                console.log("Recent context:"+recentContexts)
                if (logic.strategy == "end_price_decided") {
                    var context = `You and the buyer have reached an agreement on this price:${logic.price},for this product: ${product.name}.
                    You are to use the following negotiation strategy: ${negotiation_strategy(logic.strategy)},the currency in question is ${currency}.
                    ${contextCount > 0 ? ` Here is previous chat between you both: ${recentContexts},It can give you a better clue of what you have been talking about.` : ""}
                    `;
                } else {
                    var context = `The buyer hasn't suggest a price so you are giving them an offer of: ${logic.price}.
                    You are to use the following negotiation strategy: ${negotiation_strategy(logic.strategy)},the product name is ${product.name}, the currency in question is ${currency}.
                    ${contextCount > 0 ? ` Here is previous chat between you both: ${recentContexts},It can give you a better clue of what you have been talking about.` : ""}
                    `;
                }
    
    
                // save context
                chat.contexts.push(`Buyer offered: ${buyerCurrentPrice}, Seller(You) countered: ${logic.price}`);
                await chat.save()
    
                const chat_intent = logic.status === "accepted" ? "accepted" : 
                              logic.status === "rejected" ? "rejected" : 
                              "offer";
                console.log("chatbot intent"+chat_intent)
                const response=await chatbotResponseFT(message,chat_intent,context,languageToRespondWith,product)
    
                const resp={
                    text:response,
                    status:"active",
                    id: new mongoose.Types.ObjectId(),
                    timestamp:new Date()
                }

                // update negotiations
                await updateNegotiation(message,response,websiteId,chatId)
    
                res.json({"response":resp})
            }
            else{

                //Can't understand user input or error reply
                const response=await generalChatbotResponseFT(message,"unknown","please this goes out of our scope , we cannot help with")

                const resp={
                    text:response,
                    id: new mongoose.Types.ObjectId(),
                    status:"active",
                    timestamp:new Date()
                }

                // update negotiations
               
                await updateNegotiation(message,response,websiteId,chatId)

                res.json({"response":resp})

                return
            }
        }
        else{

            
            // Collect previous contexts if none exists , initialise new variables


            //Validations on numbers

            // Create user price , if they are asks for discount

            
            const buyerCurrentPrice=userPrice.data.analysis.desired_price.value||0

            console.log("User Price: "+userPrice)


            // if(!buyerCurrentPrice)
            // {
            //     console.log("Message: "+message)
            //     const response=await chatbotResponseFT(message,"specify price")
                
            //     const resp={
            //         text:response,
            //         status:"active",
            //         id: new mongoose.Types.ObjectId(),
            //         timestamp:new Date()
            //     }

            //     // update negotiations
            //     await updateNegotiation(message,response,websiteId,chatId)

            //     res.json({"response":resp})

            // }


            console.log("Buyer's price: "+buyerCurrentPrice)

            
            const currency="USD"
            
            const logic=await core_logic(websiteId,chatId,product,userPrice.data,usersentiment.data)     
            console.log(logic)
            // Define different contexts
            console.log(chat.contexts)
            
                const contextCount = Math.min(chat.contexts.length, 3);
                const recentContexts = chat.contexts.slice(-contextCount);
                console.log("Recent context:"+recentContexts)

                if (logic.strategy == "end_price_decided") {
                    var context = `You and the buyer have reached an agreement on this price:${logic.price},for this product: ${product.name}.
                    You are to use the following negotiation strategy: ${negotiation_strategy(logic.strategy)},the currency in question is ${currency}.
                    ${contextCount > 0 ? ` Here is previous chat between you both: ${recentContexts},It can give you a better clue of what you have been talking about.` : ""}
                    `;
                } else {
                    var context = `The buyer has suggested this price: ${buyerCurrentPrice},and your counter offer is: ${logic.price}.
                    You are to use the following negotiation strategy: ${negotiation_strategy(logic.strategy)},the product name is ${product.name}, the currency in question is ${currency}.
                    ${contextCount > 0 ? ` Here is previous chat between you both: ${recentContexts},It can give you a better clue of what you have been talking about.` : ""}
                    `;
                }


            // save context
            chat.contexts.push(`Buyer offered: ${buyerCurrentPrice||0}, Seller(You) countered: ${logic.price}`);
            await chat.save()

            const chat_intent = logic.status === "accepted" ? "accepted" : 
                          logic.status === "rejected" ? "rejected" : 
                          "offer";
            console.log("chatbot intent: "+chat_intent)
            const response=await chatbotResponseFT(message,chat_intent,context,languageToRespondWith,product)

            const resp={
                text:response,
                status:logic.status,
                id: new mongoose.Types.ObjectId(),
                timestamp:new Date()
            }

            // update negotiations
            await updateNegotiation(message,response,websiteId,chatId)

            res.json({"response":resp})
            // res.json({
            //     userintent: userintent.data,
            //     usersentiment: usersentiment.data,
            //     generalintent:usergeneralintent.data,
            //     isNegotiation:isNegotiationn,
            //     userPrice:userPrice.data
                
            // });
        }
       

    }
    catch(error)
    {
        res.status(400).json({message:"Error from backend "+error})
    }

})




// Predefined functions for negotiation


export default router