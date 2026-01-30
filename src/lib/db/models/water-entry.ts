import mongoose, { Schema, Model } from "mongoose";
import type { IWaterEntry } from "@/types";

const waterEntrySchema = new Schema<IWaterEntry>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    amountCc: {
      type: Number,
      required: true,
      min: 0,
    },
    time: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const WaterEntry: Model<IWaterEntry> =
  mongoose.models.WaterEntry ||
  mongoose.model<IWaterEntry>("WaterEntry", waterEntrySchema);

export default WaterEntry;
