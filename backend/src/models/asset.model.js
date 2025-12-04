import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileName: String,
    fileType: String,
  },
  { timestamps: true }
);

const Asset = mongoose.model("Asset", assetSchema)
export default Asset;