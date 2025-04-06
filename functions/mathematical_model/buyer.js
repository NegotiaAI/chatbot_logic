
/**
 * 
 * @param {product} p 
 * @param {number of negotiation rounds} r 
 * @returns 
 */
const Nb_s=async function(p,r)
{
    const K_1=(1/r)**2
   
   try{
    const result=p.min+K_1*(p.max-p.min)
    return result
   }
   catch(error)
   {
    console.log(error)
   }

}
/**
 * 
 * @param {product} p 
 * @param {number or negotiation rounds} r 
 * @param {current negotiation round} t 
 * @param {previous negotiation price} Xb_s_prev 
 * @returns 
 */
const Xb_s=async function(p,r,t,Xb_s_prev)
{
    const K_t=(t/r)**2

    try{
        const result=parseFloat(Xb_s_prev)+K_t*(parseFloat(p.max)-parseFloat(Xb_s_prev))
        return result
    }
    catch(error)
    {
        console.log(error)
    }
    
}
/**
 * 
 * @param {product} p 
 * @param {current price} Xb_s 
 * @returns 
 */
const NSb_s=async function(p,Xb_s)
{
  
    try{

        const result = p.max - Xb_s / (p.max - p.min);
        return result
    }
    catch(error)
    {
        console.log(error)
    }
}
/**
 * 
 * @param {*} p 
 * @param {Preference adjustment percentage-Willingess to buy the product} pap 
 * @param {previous price} Xb_s 
 * @returns 
 */
const Xb_s_tend=async function(p,pap,Xb_s)
{
    const p_end_max=(1+pap)*p.max
    const K_end=1
    try{
        const result = Xb_s +p_end_max - Xb_s;
        return result
    }
    catch(error)
    {
        console.log(error)
    }
}

const NSb_s_tend=async function(p,pap,Xb_s_tend)
{
    const p_end_max=(1+pap)*p.max
    const K_end=1
    try{
        const result = p_end_max - Xb_s_tend/p_end_max - p.min;
        return result
    }
    catch(error)
    {
        console.log(error)
    }
}

export { Nb_s,Xb_s,NSb_s,Xb_s_tend,NSb_s_tend};
