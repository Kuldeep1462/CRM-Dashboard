import mongoose from "mongoose"

const CampaignSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    rules: [
      {
        id: String,
        field: String,
        operator: String,
        value: String,
        logic: String,
      },
    ],
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "active", "completed"],
      default: "draft",
    },
    targetCount: {
      type: Number,
      default: 0,
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    deliveredCount: {
      type: Number,
      default: 0,
    },
    failedCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Campaign || mongoose.model("Campaign", CampaignSchema)
