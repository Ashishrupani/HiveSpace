//getAuth isn't used yet but will be later. Need to refer to documents for proper usage.
import { getAuth } from "@clerk/express";
import Group from "../models/group.schema.js";
import User from "../models/user.schema.js";



/** Important Note **
List of error codes used in this file for various error scenarios:

1. 'missing-search-query' - When the search query parameter "find" is missing in the request.
2. 'no-groups-found' - When no groups are found matching the search query.
3. 'group-name-exists' - When trying to create a group with a name that already exists.
4. 'no-such-group' - When the specified groupId does not exist in the database.
5. 'group-not-found' - When a group with the specified ID is not found.
6. 'not-a-member' - When a user tries to access group details but is not a member of that group.
7. 'already-a-member' - When a user tries to join a group they are already a member of.
8. 'missing-params' - When required parameters (groupId or userId) are missing in the request.
9. 'missing-userId' - When the userId parameter is missing in the request to fetch user's joined groups.
10. 'missing-groupId' - When the groupId parameter is missing in the request to leave a group.
11. 'no-such-group-or-user' - When either the specified groupId or user is missing in the request.
12. 'null' - Used to indicate no error occurred successfully.
13. 'err.message' - Used to pass the actual error message from exceptions. 

These error codes help in identifying specific issues during API operations and can be used for debugging and user feedback.

**  End of Note   **/




export const groupHomeHandler = (req, res) => {
  // Logic for handling group dashboard (inside groups view with posts etc.)
  res.status(200).json({ success: true, message: 'Group dashboard data', error: null });

  // WIP -- will implement later
  // This is crucial so have to be careful while implementing

}

export const findGroupHandler = async (req, res) => {
  // Logic for finding groups based on search query

  // Extract search query from request
  const { search, q } = req.query;
  const searchQuery = search ?? q;

  try {
    let groups = [];
    if (searchQuery) {
      // Normalize search query to lowercase
      const normalizedSearch = searchQuery.toLowerCase();
      // Search for groups with names matching the query (case-insensitive) for partial matches
      groups = await Group.find({ name: { $regex: normalizedSearch, $options: 'i' } });
    } else {
      // If no query provided, return all groups
      groups = await Group.find({});
    }

    // Error handling for no groups found ("it's not really an error, but we handle it nicely" --Ashish)
    if (groups.length === 0) {
      return res.status(404).json({ success: false, message: 'No groups found matching the query', error: 'no-groups-found' });
    }

    // only send necessary group data such as id and group name
    const groupData = groups.map(group => ({ id: group._id, name: group.name, members: group.UID?.length ?? 0, color: group.color, icon: group.icon, about: group.about }));

    res.status(200).json({ success: true, groups: groupData, error: null });
  } catch (err) {

    console.error('Error finding group with that query:', err);
    res.status(500).json({ success: false, message: 'Something went wrong while finding groups', error: err.message });
  }
}

export const createGroupHandler = async (req, res) => {
  // Logic for creating a group
  // Extract group details from request body
  const { groupName, about, iconName, color } = req.body;
  const userId = req.userId;

  if (!groupName || !userId) {
    console.log('Create group missing params:', { groupName, userId });
    return res.status(400).json({ success: false, message: 'Missing group name or userId', error: 'missing-params' });
  }

  console.log('Create group request:', { groupName, userId, about, iconName, color });

  try {
    // Normalize group name to lowercase
    const lowerCasedGroupName = groupName.toLowerCase();
    console.log(`Creating group with name: ${lowerCasedGroupName}`);
    const group = await Group.findOne({ name: lowerCasedGroupName });
    // Check if group with the same name already exists
    if (group) {
      return res.status(400).json({ success: false, message: 'Group name already exists', error: 'group-name-exists' });
    }

    // Create a new group
    const newGroup = new Group({ name: groupName, about , adminUID: userId, UID: [userId], icon: iconName, color });
    await newGroup.save();
    res.status(200).json({ success: true, message: 'Group created successfully', groupId: newGroup._id, error: null });

  }
  catch (err) {
    console.error('Error creating group:', err);
    res.status(500).json({ success: false, message: 'Failed to create group', error: err.message });
  }
}

export const updateGroupHandler = async (req, res) => {
  const { groupId, groupName, about, iconName, color } = req.body;
  const userId = req.userId;

  if (!groupId || !userId) {
    return res.status(400).json({ success: false, message: 'Missing groupId or userId', error: 'missing-params' });
  }

  if (!groupName || !groupName.trim()) {
    return res.status(400).json({ success: false, message: 'Group name is required', error: 'missing-params' });
  }

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found', error: 'group-not-found' });
    }

    if (!group.UID?.includes(userId)) {
      return res.status(403).json({ success: false, message: 'Only group members can edit group settings', error: 'not-authorized' });
    }

    const normalizedName = groupName.trim().toLowerCase();
    const existingGroup = await Group.findOne({
      name: { $regex: `^${normalizedName}$`, $options: 'i' },
      _id: { $ne: group._id },
    });

    if (existingGroup) {
      return res.status(400).json({ success: false, message: 'Group name already exists', error: 'group-name-exists' });
    }

    group.name = groupName.trim();
    group.about = about ? about.trim() : group.about;
    group.icon = iconName || group.icon;
    group.color = color || group.color;

    await group.save();

    return res.status(200).json({
      success: true,
      message: 'Group updated successfully',
      group: {
        id: group._id,
        name: group.name,
        about: group.about,
        icon: group.icon,
        color: group.color,
      },
      error: null,
    });
  } catch (err) {
    console.error('Error updating group:', err);
    return res.status(500).json({ success: false, message: 'Failed to update group', error: err.message });
  }
}

export const getGroupDetailsHandler = async (req, res) => {

  const userId = req.userId;
  // Logic for fetching group details by groupId
  const { groupId } = req.body;

  // Error handling for missing groupId
  if (!groupId || !userId) {
    return res.status(400).json({ success: false, message: 'Error: No such group exists or user is missing', error: 'no-such-group-or-user' });
  }

  try {
    // Find the group by ID
    const groupDetails = await Group.findOne({ _id: groupId });

    // Error handling for group not found
    if (!groupDetails) {
      return res.status(404).json({ success: false, message: 'Group not found', error: 'group-not-found' });
    }

    // Check if the user is a member of the group
    const isMember = groupDetails.UID.includes(userId);

    // If the user is not a member, restrict access
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Access denied: User is not a member of the group', error: 'not-a-member' });
    }

    // Return group details if the user is a member and group is found
    res.status(200).json({ success: true, groupDetails: groupDetails, message: 'Group details fetched successfully', error: null });
  }
  catch (err) {

    // Log the error for debugging
    console.error('Error fetching group details:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch group details', error: err.message });
  }
}

export const joinGroupHandler = async (req, res) => {
  // Logic for joining a group
  const userId = req.userId;
  // extract groupId from request parameter
  const { groupId } = req.body;

  // Error handling for missing groupId
  if (!groupId || !userId) {
    return res.status(400).json({ success: false, message: 'No such group exists or userId is missing', error: 'no-such-group-or-userId' });
  }


  try {
    // Find the group by ID
    const group = await Group.findOne({ _id: groupId });

    // Error handling for group not found
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found', error: 'group-not-found' });
    }

    //Extract userId's from the group to see if the user is already a member
    const { UID } = group;
    if (UID.includes(userId)) {
      return res.status(200).json({ success: true, message: 'User is already a member of the group', error: 'already-a-member' });
    }
    // Add userId to the group's UID array
    group.UID.push(userId);

    // Save the updated group
    await group.save();

    // Return success response because user joined the group successfully
    res.status(200).json({ success: true, message: 'Joined group successfully', error: null });

  }
  catch (err) {

    // Log the error for debugging
    console.error('Error joining group:', err);
    res.status(500).json({ success: false, message: 'Failed to join group', error: err.message });
  }

}

export const leaveGroupHandler = async (req, res) => {
  // Logic for leaving a group
  const userId = req.userId;
  // extract groupId from request parameter
  const { groupId } = req.body;

  // Error handling for missing groupId
  if (!groupId || !userId) {
    return res.status(400).json({ success: false, message: 'Missing groupId or userId', error: 'missing-params' });
  }

  try {
    // Find the group by ID
    const group = await Group.findOne({ _id: groupId });

    // Error handling for group not found
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found', error: 'group-not-found' });
    }

    // Remove userId from the group's UID array
    group.UID = group.UID.filter(uid => uid !== userId);

    // Save the updated group
    await group.save();

    // Return success response because user left the group successfully
    res.status(200).json({ success: true, message: 'Left group successfully', error: null });

  }
  catch (err) {

    // Log the error for debugging
    console.error('Error leaving group:', err);
    res.status(500).json({ success: false, message: 'Failed to leave group', error: err.message });
  }
}

export const getUserJoinedGroupsHandler = async (req, res) => {
  // Logic for fetching user's joined groups
  const userId = req.userId;
  console.log(`Fetching joined groups for userId: ${userId}`);

  // Error handling for missing userId
  if (!userId) {
    return res.status(400).json({ success: false, message: 'Missing userId parameter', error: 'missing-userId' });
  }

  try {
    // Find groups where the userId is in the UID array
    /** --Ashish
     Notes: We can optimize this later by simply looking in the USER model for the list of joined groups
     but for now this works fine. To keep things simple we are doing it this way. 
     Note to self: Please refactor later.
     //planning---> requires us to look into two collections which might be slightly inefficient
      const userData = await User.findOne({ UID: userId });
      const joinedGroupIds = userData.GID;
      const joinedGroups = await Group.find({ _id: { $in: joinedGroupIds } });
     */
    const joinedGroups = await Group.find({ UID: userId });

    // If no groups found, return empty array
    if (joinedGroups.length === 0) {
      return res.status(200).json({ success: true, groups: [], error: null });
    }

    // only send necessary group data such as id and group name, and number of members (length of UID array), color and icon for the group
    const groupData = joinedGroups.map(group => ({ id: group._id, name: group.name, members: group.UID?.length ?? 0 , color: group.color, icon: group.icon, about: group.about }));

    // Return the list of joined groups
    res.status(200).json({ success: true, groups: groupData, error: null });
  }
  catch (err) {
    // Log the error for debugging
    console.error('Error fetching user joined groups:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch user joined groups', error: err.message });
  }

}

export const saveQuizHandler = async (req, res) => {
  // Logic for saving a quiz to a group
  const groupId = req.params.id || req.body.groupId;
  const { quiz } = req.body;
  const userId = req.userId;

  if (!groupId || !quiz) {
    return res.status(400).json({ success: false, message: 'Missing groupId or quiz data', error: 'missing-params' });
  }

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found', error: 'group-not-found' });
    }

    // Add quiz to savedQuizzes array
    if (!group.savedQuizzes) {
      group.savedQuizzes = [];
    }

    group.savedQuizzes.push({
      ...quiz,
      savedBy: userId,
      savedAt: new Date()
    });

    await group.save();

    res.status(200).json({ success: true, message: 'Quiz saved successfully', error: null });
  } catch (err) {
    console.error('Error saving quiz:', err);
    res.status(500).json({ success: false, message: 'Failed to save quiz', error: err.message });
  }
}

export const saveSummaryHandler = async (req, res) => {
  // Logic for saving a summary to a group
  const groupId = req.params.id || req.body.groupId;
  const { summary } = req.body;
  const userId = req.userId;

  if (!groupId || !summary) {
    return res.status(400).json({ success: false, message: 'Missing groupId or summary data', error: 'missing-params' });
  }

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found', error: 'group-not-found' });
    }

    if (!group.savedSummaries) {
      group.savedSummaries = [];
    }

    group.savedSummaries.push({
      ...summary,
      savedBy: userId,
      savedAt: new Date()
    });

    await group.save();

    res.status(200).json({ success: true, message: 'Summary saved successfully', error: null });
  } catch (err) {
    console.error('Error saving summary:', err);
    res.status(500).json({ success: false, message: 'Failed to save summary', error: err.message });
  }
}

export const getSavedQuizzesHandler = async (req, res) => {
  // Logic for fetching saved quizzes for a group
  const groupId = req.params.id || req.params.groupId;

  if (!groupId) {
    return res.status(400).json({ success: false, message: 'Missing groupId', error: 'missing-params' });
  }

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found', error: 'group-not-found' });
    }

    const savedQuizzes = group.savedQuizzes || [];

    res.status(200).json({ success: true, quizzes: savedQuizzes, error: null });
  } catch (err) {
    console.error('Error fetching saved quizzes:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch saved quizzes', error: err.message });
  }
}

export const getSavedSummariesHandler = async (req, res) => {
  // Logic for fetching saved summaries for a group
  const groupId = req.params.id || req.params.groupId;

  if (!groupId) {
    return res.status(400).json({ success: false, message: 'Missing groupId', error: 'missing-params' });
  }

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found', error: 'group-not-found' });
    }

    const savedSummaries = group.savedSummaries || [];

    res.status(200).json({ success: true, summaries: savedSummaries, error: null });
  } catch (err) {
    console.error('Error fetching saved summaries:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch saved summaries', error: err.message });
  }
}

export const getGroupLeaderboardHandler = async (req, res) => {
  const groupId = req.params.id || req.params.groupId;

  if (!groupId) {
    return res.status(400).json({ success: false, message: 'Missing groupId', error: 'missing-params' });
  }

  return res.status(200).json({
    success: true,
    groupId,
    leaderboard: [],
    message: 'Leaderboard controller placeholder. WebSocket integration pending.',
    error: null,
  });
}

export const createGroupGoalHandler = async (req, res) => {
  // Logic for creating a goal for a group
  const userId = req.userId;
  const { groupId, label, progress, target, color, deadline } = req.body;

  if (!groupId || !userId) {
    return res.status(400).json({ success: false, message: 'Missing required parameters', err: 'missing-params' });
  }

  try {
    const group = await Group.findOne({ _id: groupId });

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found', err: 'group-not-found' });
    }
    if (!group.UID?.includes(userId)) {
      return res.status(403).json({ success: false, message: 'Only group members can create group goals', err: 'not-authorized' });
    }
    const newGoal = { id: new Date().getTime().toString(), label, progress, target, color, deadline };

    if (!group.Goals) {
      group.Goals = [];
    }
    group.Goals.push(newGoal);
    await group.save();

    res.status(200).json({ success: true, message: 'Group goal created successfully', err: null });
  } catch (err) {
    console.error('Error creating group goal:', err);
    res.status(500).json({ success: false, message: 'Failed to create group goal', err: err.message });
  }
};

export const updateGroupGoalHandler = async (req, res) => {
  // Logic for updating a goal for a group
  const userId = req.userId;
  const { groupId, id, label, progress, target, color, deadline } = req.body;

  if (!groupId || !userId) {
    return res.status(400).json({ success: false, message: 'Missing required parameters', err: 'missing-params' });
  }

  try {
    const group = await Group.findOne({ _id: groupId });

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found', err: 'group-not-found' });
    }
    if (!group.UID?.includes(userId)) {
      return res.status(403).json({ success: false, message: 'Only group members can update group goals', err: 'not-authorized' });
    }
    const goalIndex = group.Goals.findIndex(goal => goal.id === id);
    if (goalIndex === -1) {
      return res.status(404).json({ success: false, message: 'Goal not found', err: 'goal-not-found' });
    }
    group.Goals[goalIndex] = { id, label, progress, target, color, deadline };
    await group.save();

    res.status(200).json({ success: true, message: 'Group goal updated successfully', err: null });

  }
  catch (err) {
    console.error('Error updating group goal:', err);
    res.status(500).json({ success: false, message: 'Failed to update group goal', err: err.message });
  }
};

export const deleteGroupGoalHandler = async (req, res) => {
  // Logic for deleting a goal for a group
  const userId = req.userId;
  const { groupId } = req.body;

  if (!groupId || !userId) {
    return res.status(400).json({ success: false, message: 'Missing groupId or userId', error: 'missing-params' });
  }

  try {
    const group = await Group.findOne({ _id: groupId });

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found', error: 'group-not-found' });
    }

    if (!group.UID?.includes(userId)) {
      return res.status(403).json({ success: false, message: 'Only group members can delete group goals', error: 'not-authorized' });
    }

    const { goalId } = req.body;
    if (!goalId) {
      return res.status(400).json({ success: false, message: 'Missing goalId parameter', error: 'missing-params' });
    }

    // Remove the goal from the group's Goals array
    group.Goals = group.Goals.filter(goal => goal.id !== goalId);
    await group.save();
    res.status(200).json({ success: true, message: 'Group goal deleted successfully', error: null });

  } catch (err) {
    console.error('Error deleting group goal:', err);
    res.status(500).json({ success: false, message: 'Failed to delete group goal', error: err.message });
  }

};

export const fetchGroupGoalsHandler = async (req, res) => {
  // Logic for fetching goals for a group
  const userId = req.userId;
  const { groupId } = req.body;
  if (!userId || !groupId) {
    return res.status(400).json({ success: false, message: 'Missing userId or groupId parameter', error: 'missing-params' });
  }

  try {
    const group = await Group.findOne({ _id: groupId });

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found', error: 'group-not-found' });
    }

    const goals = group.Goals || [];

    res.status(200).json({ success: true, goals, message: 'Dashboard goals fetched successfully', error: null });
  }
  catch (err) {
    console.error('Error fetching dashboard goals:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard goals', error: err.message });
  }

};

