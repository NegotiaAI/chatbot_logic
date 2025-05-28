function isgeneralQuery(generalintent)
{
    const generalintents=[ "close_account", "return_product","payment_methods","change_order","request_invoice","submit_product_idea","return_product_in_store","product_issue", "add_product","delivery_issue", "change_account", "availability", "store_location","use_app","delivery_time", "track_delivery","exchange_product_in_store", 
        "technical_issue","refund_status", "availability_in_store", "damaged_delivery", "recover_password", "track_order","submit_feedback", "product_information","request_refund","customer_service","availability_online","human_agent","sales_period", "submit_product_feedback","remove_product", "pay","return_policy", "missing_item", 
        "order_history","open_account","shipping_costs","request_right_to_rectification","cancel_order","wrong_item","payment_issue","return_product_online","refund_policy", "store_opening_hours","exchange_product"
      ]
      
      const generalIntent=generalintent.class_name
      const generalIntentConfidence=generalintent.confidence_score
      const isGeneralIntent=generalintents.includes(generalIntent)
    
      if(!isGeneralIntent && generalIntentConfidence>=0.5)
      {
        return false
      }
      return true


}
function isUnknown(userintent)
{
    const userIntent=userintent.class_name
    const userIntentConfidence=userintent.confidence_score
    
    if(userIntent=="unknown" && userIntentConfidence>0.1)
    {
        return true
    }
    return false
}

export {isgeneralQuery,isUnknown}