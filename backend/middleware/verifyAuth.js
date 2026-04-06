import { getAuth } from "@clerk/express";

export const verifyAuth = (req, res, next) => {
    // Extract the authentication information from the request using Clerk's getAuth function ()

    const auth = getAuth(req)

    try{
    // Handle if the user is not authorized
    if (!auth || !auth.userId) {
        return res.status(403).send('Forbidden: User not authenticated');
    }

    req.userId = auth.userId; // Attach the user ID to the request object for use in subsequent middleware or route handlers
    //User is authenticated, proceed to the next middleware or route handler
    next()

    }catch(err){
        console.error("Error in verifyAuth middleware:", err);
        return res.status(500).send('Unauthorized: Failed Authentication');
    }
};

export const verifyName = (req, res, next) => {
    const auth = getAuth(req)

    try{
    if (!auth || !auth.userId || !auth.firstName) {
        return res.status(403).send('Forbidden: User not authenticated or missing name');
    }
    req.userId = auth.userId; // Attach the user ID to the request object for use in subsequent middleware or route handlers
    req.firstName = auth.firstName;
    //User is authenticated, proceed to the next middleware or route handler
    next()
    
    }
    catch(err){
        console.error("Error in verifyName middleware:", err);
        return res.status(500).send('Unauthorized: Failed Authentication');
    }
}