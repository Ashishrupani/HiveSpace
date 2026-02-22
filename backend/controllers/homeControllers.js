import User from '../models/user.schema.js';


/* Note: Error codes use in this file
1. - user-not-found: The specified user does not exist in the database.
2. - goal-limit-reached: The user has already reached the maximum number of goals allowed (5 goals).
3. - failed-to-create-goal: An error occurred while trying to create a new goal for the user.
4. - failed-to-fetch-goals: An error occurred while trying to fetch the user's goals from the database.
5. - failed-to-delete-goal: An error occurred while trying to delete a goal from the user's goals in the database.
6. - no-goals-to-delete: The user has no goals to delete, but a delete request was made.
7. - goal-not-found: The specified goal to update or delete does not exist in the user's goals array.
8. - failed-to-update-goal: An error occurred while trying to update an existing goal for the user.
9. - invalid-goal-data: The data provided for creating or updating a goal is invalid or incomplete.
10.- user-manager-failed: The user manager failed with fetching or creating a user.

 */



export const dashboardHandler = async (req, res) => {
    // Populate user's dashboard
    const userId = req.userId;

    try{
    // Verify that the user exists in the system
    const isUser = await User.findOne({UID : userId});

    // if no such user exists create an entry
    if (!isUser){
        const newUser = new User({UID : userId})
        await newUser.save();

        //Send the data to populate dashboard
        res.status(200).json({ success: true, user : newUser , err: null });
        
    }

        //Send the data to populate dashboard
        res.status(200).json({ success: true, user : isUser , err: null });

    }
    catch(err){
        console.error("Error with managing User:", err);
        res.status(500).json({ success: false, message: "Failed in User manager", err: "user-manager-failed" });
    }
};

export const createGoalHandler = async (req, res) => {
    // Logic to create a new goal

    // Extract user ID from the request (assuming it's set by the authentication middleware)
    const userId = req.userId;
    const { id, label, progress, target, color, deadline } = req.body;

    // Find the user in the database
    try{
        const user = await User.findOne({ UID: userId });

        if(!user){
            return res.status(404).json({ success: false, message: "User not found" , err : "user-not-found"});
        }

        // Limit to 5 goals per user
        if(user.Goals.length >= 5){
            return res.status(400).json({ success: false, message: "Goal limit reached. You can only have up to 5 goals.", err: "goal-limit-reached" });
        }
        
        // Create a new goal object
        const newGoal = { id, label, progress, target, color, deadline };

        // Add the new goal to the user's goals array
        user.Goals.push(newGoal);

        // Save the updated user document
        await user.save();

        res.status(201).json({ success: true, message: "Goal created successfully!", err: null});
        
    }
    catch(err){
        console.error("Error creating goal:", err);
        res.status(500).json({ success: false, message: "Failed to create goal", err: "failed-to-create-goal" });
    }
};

export const updateGoalHandler = async (req, res) => {
    // Logic to update an existing goal
    const userId = req.userId;
    const { id , label, progress, target, color, deadline } = req.body;

    try{
        // Find the user in the database
        const user = await User.findOne({ UID: userId });

        if(!user){
            return res.status(404).json({ success: false, message: "User not found", err: "user-not-found" });
        }
        // Find the goal to update
        const goalIndex = user.Goals.findIndex(goal => goal.id === id);
        if(goalIndex === -1){
            return res.status(404).json({ success: false, message: "Goal not found", err: "goal-not-found" });
        }
        // Update the goal's properties
        user.Goals[goalIndex] = { id, label, progress, target, color, deadline };
        // Save the updated user document
        await user.save();
        res.status(200).json({ success: true, message: "Goal updated successfully!", err: null });
    }
    catch(err){
        console.error("Error updating goal:", err);
        res.status(500).json({ success: false, message: "Failed to update goal", err: "failed-to-update-goal" });
    }
};

export const deleteGoalHandler = async (req, res) => {
    const userId = req.userId;
    const { id } = req.body;

    try {
        // Find the user in the database
        const user = await User.findOne({ UID: userId });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found", err: "user-not-found" });
        }

        if (user.Goals.length === 0) {
            return res.status(400).json({ success: false, message: "No goals to delete", err: "no-goals-to-delete" });
        }
        // Remove the goal from the user's goals array
        user.Goals = user.Goals.filter(goal => goal.id !== id);
        await user.save();

        res.status(200).json({ success: true, message: "Goal deleted successfully", err: null });

    } catch (error) {
        console.error("Error deleting goal:", error);
        res.status(500).json({ success: false, message: "Failed to delete goal", err: "failed-to-delete-goal" });
    }
};

export const fetchGoalsHandler = async (req, res) => {
    const userId = req.userId;

    try {
        const user = await User.findOne({UID : userId});
        if(!user){
            return res.status(404).json({ success: false, message: "User not found", err: "user-not-found" });
        }

        // Return the user's goals if user is found
        res.status(200).json({ success: true, message: "Goals fetched successfully", goals: user.Goals, err: null });


    } catch (error) {
        console.error("Error fetching goals:", error);
        res.status(500).json({ success: false, message: "Failed to fetch goals", err: "failed-to-fetch-goals" });
    }
};

