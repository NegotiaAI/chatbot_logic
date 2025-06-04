
function demand_urgency(urgency){

        if(urgency==10)
        {
            return "very_high"
        }
        else if(urgency>=7)
        {
            return "high"
        }
        else if(urgency >=4)
        {
            return "moderate"
        }

        return "low"

}
function CL_decreased(total){

  const current=total[total.length-1]
    if(total.length>1)
    {
        for(var i=0;i<total.length;i++){
            if(current=="high")
            {
                if (total[total.length - 2] == current && current!="high") {
                    // All three values are equal
                    return true
                }
                else if([total.length - 2]=="moderate" ||[total.length - 2]=="low")
                {
                    return true
                }
                else{
                    return false
                }
            }
            else if(current=="moderate")
            {
                if (total[total.length - 2] == current &&  current!="high") {
                    // All three values are equal
                    return true
                }
                else if([total.length - 2]=="low")
                    {
                        return true
                    }
                    else{
                        return false
                    }
            }
            else if(current=="low")
            {
                if (total[total.length - 2] == current) {
                    // All three values are equal
                    return true
                }
                else{
                    return false
                }
            }
           
        }
    }
    else{
        return false
    }
}

function chatbot_context()
{
    return 1
}
function negotiation_strategy(strategy)
{
    if(strategy=="accept")
    {
        return "Agree/Accept the current buyer price, making the buyer see clearly that you have accepted their price--- show signs of delight from your end"
    }
    else if(strategy=="justify")
    {
        return "Make the buyer see reasons to buy the product in question, make it very clear to them the value and reason for the price--- Tell them the new price you can offer them and ask to know if they are ok with the price"
    }
    else if(strategy=="create_urgency")
    {
        return "Do not just make the user see the value but create urgency , make the user know how important this product is ,convince them the best you can---Tell them the new price you can offer them and ask to know if they are ok with the price"
    }
    else if(strategy=="end_price_decided")
        {
            return "Make the buyer understand you both already arrived at an agreed price and the negotiation ended already.Be polite"
        }
    else{
        return "Make the buyer see reasons to buy the product in question, make it very clear to them the value and reason for the price"
    }
}


// user wants a counter offer 

function wantCounterOffer(userintent,generalintent){
        

    console.log(generalintent)

    const userIntent=userintent.class_name
    const generalIntent=generalintent.class_name
    const generalIntentConfidence=generalintent.confidence_score
    if(userIntent=="inquiry" &&  generalIntent=="product_information"  && generalIntentConfidence<0.5)
    {
        return true
    }
    else if(userIntent=="inquiry" &&  generalIntent=="shipping_costs" && generalIntentConfidence<0.5)
    {
        return true
    }
    else if(userIntent=="inquiry" &&  generalIntent=="payment_methods" && generalIntentConfidence<0.5)
    {
        return true
    }
    else if(userIntent=="inquiry" &&  generalIntent=="pay" && generalIntentConfidence<0.5)
    {
        return true
    }
    else if(userIntent=="inform" &&  generalIntent=="exchange_product" && generalIntentConfidence<0.5)
    {
        return true
    }
    else if(userIntent=="inquiry" &&  generalIntent=="remove_product")
    {
        return true
    }
    else if(userIntent=="inquiry" &&  generalIntent=="return_product" && generalIntentConfidence<0.5)
    {
        return true
    }
    
    else if(userIntent=="vague-price")
        {
            return true
        }
    else if(userIntent=="disagree")
        {
            return true
        }
    else{

        return false
    }
}


// detect of user is affirming 

/**
 * Checks if user input confirms agreement in eCommerce (supports text + emojis).
 * @param {string} input - User's text/emoji (case-insensitive, trimmed).
 * @returns {boolean} - True if input is a purchase affirmation.
 */
function isUserAffirming(input) {
    if (typeof input !== 'string') return false;
    const normalized = input.toLowerCase().trim();

    // 50+ affirmations per category (text + emojis)
    const affirmations = {
        // 1. Standard Checkout/Order Confirmations
        standard: [
            'yes', 'confirm', 'approved', 'accept', 'agreed', 'proceed', 
            'place order', 'complete purchase', 'checkout now', 'buy now', 
            'i agree', 'i accept', 'i confirm', 'i authorize', 'process payment',
            'finalize order', 'take my money', 'ship it', 'order confirmed',
            'ready to pay', 'make payment', 'authorize purchase', 'lock it in',
            'give me this', 'i\'ll take it', 'let\'s do it', 'go ahead',
            'purchase now', 'complete checkout', 'i\'m ready', 'i\'m sure',
            'i commit', 'i want this', 'i need this', 'add to cart',
            'proceed to checkout', 'secure checkout', 'pay now', 'confirm transaction',
            'instant buy', 'quick checkout', 'one-click buy', 'fast checkout',
            'i approve', 'i\'ll buy', 'i\'ll pay', 'i\'ll proceed', 'let\'s checkout',
            'let\'s buy', 'let\'s pay','sounds good','good','sounds ok','this price works','price work', 
            // Emojis
            '✅', '✔️', '👍', '🛒', '💳', '📦', '🚀', '🔒', '🤑', '💸'
        ],

        // 2. Informal/Slang + Emojis
        informal: [
            'yup', 'ya', 'ok', 'okay', 'sure', 'totally', 'hell yes', 'heck yes',
            'bet', 'fo sho', 'for sure', 'damn right', 'alright', 'alrighty', 
            'duh', 'obviously', 'no brainer', 'sold', 'take my cash', 
            'shut up and take my money', 'gimme', 'lemme get it', 'i\'m in',
            'count me in', 'sign me up', 'let\'s roll', 'all in', 'done deal',
            'locked in', 'easy yes', 'absolutely', '100%', 'let\'s go', 'go for it',
            'why not', 'sure thing', 'no doubt', 'you bet', 'you got it', 
            'i\'m down', 'i\'m game', 'i\'m sold', 'i\'m convinced', 'i\'m decided',
            'money ready', 'card out', 'where\'s pay', 'checkout where', 'take card',
            // Emojis
            '👌', '💯', '🆗', '🔥', '😍', '🤩', '🫡', '🙌', '✌️', '🎯'
        ],

        // 3. Non-English + Emojis (universal)
        international: [
            'sí', 'si', 'oui', 'ja', 'da', 'hai', 'sim', 'ken', 'gee', 'haan',
            'ndiyo', 'ee', 'ehe', 'hong', 'shi', 'sì', 'jes', 'tak', 'igen', 
            'evet', 'ano', 'jo', 'jesam', 'gè', 'shi de', 'hǎode', 'shì', 
            'duì', 'correcto', 'exacto', 'claro', 'por supuesto', 'natürlich',
            'selbstverständlich', 'sicher', 'genau', 'stimmt', 'certamente',
            'certo', 'ovviamente', 'assolutamente', 'точно', 'конечно', 'да',
            'безусловно', 'نعم', 'أجل', 'بلى', 'قطعا', 'حتما', 'もちろん', 
            'はい', 'そうです', '良い', '了解',
            // Emojis (universal)
            '👍🏽', '👌🏽', '✅', '✔️', '💪', '🤝', '🙏', '🤘', '✊', '🫶'
        ]
    };

    // Check all categories
    return Object.values(affirmations)
        .flat()
        .some(term => 
            normalized.includes(term) || // Matches substrings
            term === normalized          // Exact match
        );
}

// Gibberish Text detection

function isGibberish(text) {
    if (!text || text.trim().length < 3) return false;

    // Normalize the text by removing extra whitespace
    const normalizedText = text.trim().toLowerCase();
    const lettersOnly = normalizedText.replace(/[^a-z]/g, '');
    if (lettersOnly.length < 3) return false;

    // 1. Check for excessive repeated chars (e.g., "aaaaa" - more than 50% repeating)
    const charCounts = {};
    for (const char of lettersOnly) {
        charCounts[char] = (charCounts[char] || 0) + 1;
    }
    const maxCharCount = Math.max(...Object.values(charCounts));
    const repeatedChars = maxCharCount / lettersOnly.length > 0.5;

    // 2. Check for excessive non-alphabetic chars (>50%)
    const nonAlphaRatio = normalizedText.replace(/[a-z\s]/g, '').length / normalizedText.length;

    // 3. Check for random capitalization (but only if original has mixed case without reason)
    const hasMixedCase = text !== text.toLowerCase() && text !== text.toUpperCase();
    const randomCaps = hasMixedCase && !/[A-Z][a-z]/.test(text.replace(/[^a-zA-Z]/g, ''));

    // 4. Check for too many consonants in a row (e.g., "dfghjkl") - increased threshold
    const excessiveConsonants = /[bcdfghjklmnpqrstvwxyz]{6,}/i.test(text);

    // 5. Check for lack of vowels - more nuanced check
    const vowelRatio = lettersOnly.replace(/[^aeiouy]/g, '').length / lettersOnly.length;
    const noVowels = vowelRatio < 0.1; // At least 10% vowels

    // If multiple indicators are present, consider it gibberish
    const indicators = [
        repeatedChars,
        nonAlphaRatio > 0.5,
        randomCaps,
        excessiveConsonants,
        noVowels
    ];
    
    // Require at least 2 indicators to reduce false positives
    return indicators.filter(Boolean).length >= 2;
}

//remove symbols

function removeSymbols(text) {
    // We use a regular expression to replace all non-alphanumeric characters (except spaces)
    return text.replace(/[^\w\s]|_/g, '');
  }


export {demand_urgency,CL_decreased,chatbot_context,negotiation_strategy,wantCounterOffer,isUserAffirming,removeSymbols,isGibberish}