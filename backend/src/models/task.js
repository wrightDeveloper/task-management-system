import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    tilte: {
        type: String, 
        required: [true, "Task title is required"],
        trim: true,
    },

    desription: {
        type: String,
        default: "",
    },

    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    status: {
        type: String,
        enum: ["pending", "in-progress", "completed", "cancelled"],
        default: "pending",
    },

    priority: {
        type: String,
        enum: ["High", "Medium", "Low"],
        default: "Medium"
    },

    dueDate: {
        type: Date,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }, 

}, {timestamp: true}
);

const Task = mongoose.model("Task", taskSchema);

export default Task;