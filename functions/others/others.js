
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

export {demand_urgency,CL_decreased}