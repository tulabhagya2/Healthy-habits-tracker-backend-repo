
const supabase=require("../config/supabase.config")
const checkDBConnection=async()=>{
    try{
    const { error }=await supabase.from("usermodel").select().limit(1);
    if (error) throw error;
    console.log("Database connected successfully");
    return true
    }
    catch(error){
        console.log("DB connection failure due to",error.message);
        return false;

    }



}

module.exports=checkDBConnection;