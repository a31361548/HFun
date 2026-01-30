import mongoose, { Schema, Model } from "mongoose";
import type { IWaterSetting } from "@/types";

const waterSettingSchema = new Schema<IWaterSetting>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    cupSizeCc: {
      type: Number,
      required: true,
      min: 0,
    },
    dailyTargetCc: {
      type: Number,
      required: true,
      min: 0,
    },
    defaultDrinkCc: {
      type: Number,
      required: true,
      min: 0,
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

const WaterSetting: Model<IWaterSetting> =
  mongoose.models.WaterSetting ||
  mongoose.model<IWaterSetting>("WaterSetting", waterSettingSchema);

export default WaterSetting;
