import express, { response } from "express"
import axios from 'axios';
import mongoose from "mongoose"
import Chat from "../../models/chat.js"


import { Nb_s,Xb_s,NSb_s,Xb_s_tend,NSb_s_tend} from '../mathematical_model/buyer.js'

import { Ns_b,Xs_b,NSs_b,Xs_b_tend,NSs_b_tend} from '../mathematical_model/seller.js'

import {determineCL,calculatePercentageDiscounts} from '../linguistic_variables/concesstion_level.js'

import {demand_urgency,CL_decreased,chatbot_context} from '../others/others.js'

import {updateNegotiation} from '../negotiations/updateNegotiation.js'
import { isNegotiation } from "../others/isnegotiation.js";




const core_logic=async(website_id,chat_id,product,currentBuyerPrice,buyersSentiment)=>{

    /**
    * This core logic returns a counter offer,suggested negotiation strategy (By name) and a negotiation status, update important fields,such as prices amongst others
    * 
     */

    /**
     * 
     * Setting values for DU,CL,t,r,pap
     */
      const chat = await Chat.findOne({ "chat_id": chat_id });

    //   make  
      chat.lastNegotiationWasAbid=true

     //   Set all posible strings to floats
      product.price=parseFloat(product.price)
      product.minPrice=parseFloat(product.minPrice)

      if(currentBuyerPrice==0)
      {
        var currentBuyersPrice=0
      }
      else{
        var currentBuyersPrice=currentBuyerPrice.analysis.desired_price.value
      }
      

    //   console.log("Buyer Price: "+currentBuyersPrice)

       const sellersPrevPrice=chat.last_bot_price
        const tone={"sentiment":buyersSentiment.class_name,"confidence":buyersSentiment.confidence_score}

        const s_product={min:product.minPrice,max:product.price}

        // get important information from the database

        var i=chat.n_round
        console.log("i: "+i)
        console.log(website_id,chat_id,s_product,currentBuyersPrice,tone)
        console.log("Last bot Price: "+sellersPrevPrice)
        
        // const b_product={min:300,max:390}
        // const s_product={min:250,max:400}
        const r=10

        const s_pap=0

        // const buyer_pap=0.2
        const urgency=product.DU
        if(chat.concessions)
        {
            var concessions=chat.concessions
        }
        else{
            var concessions=[]
        }

        
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
        //  const prices=req.body.prices
        //  const maxPrice=req.body.maxPrice
        //  const tone=req.body.tone
        //  const percentageDiscounts = calculatePercentageDiscounts([50,200,100], 350);
        //  const averageDiscount = percentageDiscounts.reduce((sum, discount) => sum + discount, 0) / percentageDiscounts.length;
         
        // var CL = await determineCL(buyersPrices.push(currentBuyersPrice-20,currentBuyersPrice-50,currentBuyersPrice),s_product.max,tone.sentiment,tone.confidence);
        //  res.json({ CL});
         const DU=demand_urgency(urgency)
         console.log("Demand Urgency: "+DU)
        //  console.log("Concession Level: "+CL)
    



        // forloop starts

            if(chat.status=="accepted")
            {
                return {price:chat.accepted_price,status:"accepted",strategy:"end_price_decided"}
            }
            else if(chat.status=="rejected")
            {
                    return {price:chat.accepted_price,status:"rejected",strategy:"rejected"}
            }

             buyersPrices[0]=0
             sellersPrices[0]=0

             const value=parseInt(i+1)
             
             
             if(i==1)
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
            
            //  Add concessions  to backend
           
           

             //  initial seller price
             const buyersInitialProposal=currentBuyersPrice
             
            // Assesments by the seller
            if(i===r)
                {
                    const Xs_b_tendp=await Xs_b_tend(s_product,s_pap,sellersPrevPrice)
                    const sellerNumericScoretend= await NSs_b_tend(s_product,s_pap,Xs_b_tendp)
                    const buyerNumericScorelast= await NSb_s(s_product,s_pap,buyersPrices[i])
                    console.log("Last price: "+Xs_b_tendp)
                    // console.log(buyerNumericScorelast,sellerNumericScoretend)
                  
                    if(DU=="very_high" ||DU=="high")
                    {
                        chat.status="rejected"
                        await chat.save()
                        return {price:buyersPrices[i],status:"rejected",strategy:"reject"}
                    
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
                                return {price:buyersPrices[i],status:"rejected",strategy:"reject"}
                            
                            }
                    }
    
                    else if(DU=="low")
                    {
                        // consider all past prices and accept the highest price / closest to minimum price"(t=9)
    
                        if(buyerNumericScorelast>=sellerNumericScoretend){
                            // Take highest suggested customer price
                            // if(buyersPrices[i]>Xs_b_tendp)
                            chat.status="accepted"
                            await chat.save()
                            return {price:buyersPrices[i],status:"accepted",strategy:"accept"}
                        }
    
                        else{
                            return {price:buyersPrices[i],status:"rejected",strategy:"reject"}
                           
                        }
                    }
                    else{
                        return {price:buyersPrices[i],status:"rejected",strategy:"reject"}
                         return
                    }
                    
            }

             if(i===1)
             {
                concessions.push(CL)
                chat.concessions.push(CL)
                console.log("concession: "+concessions)
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
                // sellersPrices[i+1]=sellerPrices_next
                // console.log("Seller's Next price: "+sellerPrices_next)
                // console.log("Buyer's price: "+buyersPrices[i])
                // console.log("Seller Numertic Score: "+numericScoreOfSeller_next,"Buyer numeric score: "+numericScoreOfBuyer[i])
                

                if(numericScoreOfBuyer[i]>=numericScoreOfSeller_next){
                    chat.status="accepted"
                    chat.accepted_price=buyersPrices[i]
                    await chat.save()
                    return {price:buyersPrices[i],status:"accepted",strategy:"accept"}
                }

                chat.n_round=i+1
                chat.last_bot_price=sellersPrices[i]
                chat.last_user_price=buyersPrices[i]
                chat.buyerPrices.push(buyersInitialProposal)
                chat.status="active"
                await chat.save()
                return {price:sellersInitialProposal,status:"active",strategy:"justify"}

             }
              
             else if(i>1){
                     //  console.log("CExitd seller price : "+sellersPrices[i])
                   
                    sellersPrices[i]=await Xs_b(s_product,r,i,sellersPrevPrice)
                    
                    console.log("Bot Price: "+sellersPrices[i])
                    // numericScoreOfSeller[i]=await NSs_b(s_product,sellersPrices[i])
                    // buyer
                    
                    buyersPrices[i]= currentBuyersPrice
                    numericScoreOfBuyer[i]=await NSs_b(s_product,buyersPrices[i])
                    
                    console.log(buyersPrices)
                    console.log(tone)

                    var CL = await determineCL([0].concat(chat.buyerPrices),s_product.max,tone.sentiment,tone.confidence);
            
                    concessions=chat.concessions.push(CL)
                    //  if DU is high or very high the initial seller price doesn't change
                    
                     // seller
                    console.log(CL_decreased(concessions))
                    var negotiation_strategy="justify"

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
                            negotiation_strategy="create_urgency"
                        }
    
                     const numericScoreOfSeller_next=await NSs_b(s_product,sellerPrices_next) //NSPt+1
                     sellersPrices[i+1]=sellerPrices_next
                     
                      console.log("Seller's Next price: "+sellerPrices_next)
                      console.log("Seller Numertic Score: "+numericScoreOfSeller_next,"Buyer numeric score: "+numericScoreOfBuyer[i])
                     
                     
                     chat.n_round=i+1
                     chat.last_bot_price=sellersPrices[i]
                     chat.last_user_price=buyersPrices[i]
                     chat.buyerPrices.push(currentBuyersPrice)
                     
                     await chat.save()
                     
                     if(numericScoreOfBuyer[i]>=numericScoreOfSeller_next){
                         console.log("Offer Accepted")
                        //  return
                        chat.status="accepted"
                        chat.accepted_price=buyersPrices[i]
                        await chat.save()
                        return {price:buyersPrices[i],status:"accepted",strategy:"accept"}
                     }
    
                     
                     chat.status="active"
                     await chat.save()
                     return {price:sellersPrices[i],status:"active",strategy:negotiation_strategy}

                    
         }
           
        //  forloop_ends
         
         
  
}

export {core_logic}