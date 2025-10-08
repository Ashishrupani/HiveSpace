

export const testApi = async () => {
    
    try{
        const response = await fetch(`${process.env.API_URL}/api/health`);
        console.log("API response data:", response);
    }
    catch(err){
        console.error(err);
    }
    finally{
        console.log("API test function executed");
    }
}