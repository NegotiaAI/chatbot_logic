
function isIntro(userintent,generalintent=null){
    const userIntent=userintent.class_name
    const generalIntent=generalintent.class_name
    const generalIntentConfidence=generalintent.confidence_score

    const userIntentConfidence=userintent.confidence_score
    
    if(userIntent=="intro" && userIntentConfidence>0.5)
    {
        return true
    }
    else if(userIntent=="inquiry" && generalIntent=="human_agent" && generalIntentConfidence<0.4)
    {

        return true
    }
    
    return false

}

export {isIntro}