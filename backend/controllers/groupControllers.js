import { getAuth } from "@clerk/express";
import Group from "../models/group.schema.js";

export const groupDashboardHandler = (req, res) => {
  // Logic for handling group dashboard
  res.status(200).json({ success: true, message: 'Group dashboard data' });

}

export const createGroupHandler = async (req, res) => {
  // Logic for creating a group
  const { groupName, about , user} = req.body;

  try {
    const group = await Group.findOne({ name: groupName });
    if (group) {
      return res.status(400).json({ success: false, message: 'Group name already exists' });
    }

    //get user id from clerk auth middleware
    console.log('User creating group:', user); 

    const newGroup = new Group({ name: groupName, about, UID: [userId]});
    await newGroup.save();
    res.status(200).json({ success: true, message: 'Group created successfully'});
  }
  catch(err) {
    console.error('Error creating group:', err);
    res.status(500).json({ success: false, message: 'Failed to create group' });
  }
}

export const getGroupDetailsHandler = (req, res) => {
  const { groupId } = req.params;
    // Logic for fetching group details by groupId
}