import mongoose from "mongoose";

const Schema = mongoose.Schema;

const groupSchema = new Schema(
    {
        //group name
        name: { type: String, required: true, unique: true },
        about: { type: String },
        //group icons
        icon: { type: String },
        color: { type: String },
        //admin user ID
        adminUID: { type: String, required: true },
        //User IDs of group members
        UID: { type: [String], required: true },
        //group's shared goals
        goals: { type: [String] },
        //group's chat history
        chat: { type: [{ senderUID: String, message: String, timestamp: Date }] },
        //saved quizzes from AI
        savedQuizzes: { type: [{ 
            title: String,
            questions: [{
                id: String,
                question: String,
                choices: [{ id: String, text: String }],
                answer: String,
                difficulty: String,
                explanation: String
            }],
            savedBy: String,
            savedAt: { type: Date, default: Date.now }
        }] }

    },
    { timestamps: true }
);

const Group = mongoose.model('Group', groupSchema);

export default Group;