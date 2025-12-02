import mongoose from "mongoose";

const subtaskSchema = new mongoose.Schema ({
    task: {
        type: mongoose.shema.Types.objectId,
        ref: "Task",
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
      },
    completed: {
        type: Boolean,
        default: false,
      },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    dueDate: {
        type: Date,
      },
      notes: {
        type: String,
        default: "",
      },
},
    { timestamps: true }
);

export default mongoose.model("Subtask", subtaskSchema);