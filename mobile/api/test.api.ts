

export const testApiHealth = async () => {
    
    try{
        const response = await fetch(`http://localhost:5000/api/health`);
        const data = await response.json();
        console.log("API response data:", data);
        return data;
    }
    catch(err){
        console.error(err);
    }
    finally{
        console.log("API test function executed");
    }
}