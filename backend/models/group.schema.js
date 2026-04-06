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
        memberNames: [{ name: String, UID: String }],
        //group's shared goals
       Goals: [{ id : String, label: String, progress: Number, target: Number, color : String, deadline: String }],
        //group's chat history
        chat: { type: [{ senderUID: String, senderName: String, message: String, timestamp: Date }] },
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
        }] },
        //saved summaries from AI
        savedSummaries: { type: [{
            title: String,
            bullets: [String],
            keyTerms: [{
                term: String,
                definition: String
            }],
            savedBy: String,
            savedAt: { type: Date, default: Date.now }
        }] },
        Leaderboard: { type: [{ UID: String, name: String, points: Number }] }

    },
    { timestamps: true }
);

const Group = mongoose.model('Group', groupSchema);

export default Group;