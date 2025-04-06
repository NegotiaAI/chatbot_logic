
/**
 * 
 * @param {product} p 
 * @param {number of negotiation rounds} r 
 * @returns 
 */
const Ns_b=async function(p,r)
{
   const K_1=(1/r)**2

   try{
    const result=p.max-K_1*(p.max-p.min)
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
 * @param {previous negotiation price} Xs_b_prev 
 * @returns 
 */
const Xs_b=async function(p,r,t,Xs_b_prev)
{
    const K_t=(t/r)**2;
    try{
        const result=parseFloat(Xs_b_prev)-K_t*(parseFloat(Xs_b_prev)-parseFloat(p.min))
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
 * @param {previous price} Xs_b 
 * @returns 
 */

const NSs_b=async function(p,Xs_b)
{
  
    try{
        const x1= Xs_b-p.min
        const x2=p.max-p.min
        const result = x1/x2
        return result
    }
    catch(error){
        console.log(error)
    }
}

/**
 * 
 * @param {product} p 
 * @param {Preference adjustment percentage-Willingess to buy the product} pap 
 * @param {previous price} Xs_b 
 * @returns 
 */
const Xs_b_tend=async function(p,pap,Xs_b)
{
    const p_end_min=(1-pap)*p.min
    // const K_end=1

    try{
        const result = Xs_b -Xs_b+p_end_min;
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
 * @param {Preference adjustment percentage-Willingess to buy the product} pap 
 * @param {last price} Xs_b_tend 
 * @returns 
 */

const NSs_b_tend=async function(p,pap,Xs_b_tend)
{
    const p_end_min=(1-pap)*p.min

    try{
        const result = Xs_b_tend-p_end_min/p.max-p_end_min;
        return result
    }
    catch(error)
    {
        console.log(error)
    }
}

export { Ns_b,Xs_b,NSs_b,Xs_b_tend,NSs_b_tend};
