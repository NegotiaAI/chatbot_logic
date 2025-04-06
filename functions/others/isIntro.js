
function isIntro(userintent){
    const userIntent=userintent.class_name
    const userIntentConfidence=userintent.confidence_score
    
    if(userIntent=="intro" && userIntentConfidence>0.5)
    {
        return true
    }
    return false

}

export {isIntro}