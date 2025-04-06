import mongoose from "mongoose";
import Chat from '../../models/chat.js';

const updateNegotiation = async (message, response, websiteId, chatId, userPrice = null, botPrice = null, sentiment = null) => {
    try {
        // console.log(message, response, websiteId, chatId, userPrice, botPrice, sentiment);
        
        // Initialize variables properly
        let userprice = null;
        let botprice = null;
        
        // Handle userPrice and botPrice
        if (userPrice && userPrice.status) {
            userprice = userPrice.analysis?.desired_price?.value || null;
        }
        
        if (botPrice) {
            botprice = botPrice;
        }

        // Error validations
        if (!message || !response || !websiteId || !chatId) {
            return { error: 400, message: "Missing required fields" };
        }

       
        const chatExists = await Chat.findOne({ "chat_id": chatId });

        if (!chatExists) {
            const nego = new Chat({
                chat_id: chatId,
                website_id: websiteId,
                last_user_price: userprice,
                last_bot_price: botprice,
                conversations: [{
                    user: message,
                    bot: response
                }]
            });

            await nego.save();
            return { success: true };
        }
        
        // Update existing chat
        if (userprice !== null) {
            chatExists.last_user_price = userprice;
        }
        if (botprice !== null) {
            chatExists.last_bot_price = botprice;
        }
        
        chatExists.conversations.push({
            bot: response,
            user: message
        });
        console.log("Response: "+chatExists)
        await chatExists.save();
        return { success: true };

    } catch (error) {
        console.error("Error in updateNegotiation:", error);
        return { error: 500, message: "Internal server error" };
    }
};

export { updateNegotiation };