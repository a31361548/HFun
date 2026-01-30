import mongoose, { Schema, Model } from "mongoose";
import type { ILog } from "@/types";

const logSchema = new Schema<ILog>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["food", "sport", "weight", "mood"],
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    time: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Log: Model<ILog> =
  mongoose.models.Log || mongoose.model<ILog>("Log", logSchema);

export default Log;
