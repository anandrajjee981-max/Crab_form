// Why does this file exist? Defines MongoDB persistence structure for Form; no business logic.
import mongoose from "mongoose";

const formFieldSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    datatype: {
      type: String,
      required: true,
      enum: ["text","textarea","email","number","phone","date","select","radio","checkbox","rating","slider"],
    },
    placeholder: { type: String, default: "" },
    description: { type: String, default: "" },
    required: { type: Boolean, default: false },
    order: { type: Number, required: true },
    options: { type: [String], default: [] },
    validation: {
      minLength: { type: Number, default: null },
      maxLength: { type: Number, default: null },
      min: { type: Number, default: null },
      max: { type: Number, default: null },
      pattern: { type: String, default: null },
    },
  },
  { _id: true }
);

const formSchema = new mongoose.Schema(
  {
    owner_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    slug: { type: String, required: true, unique: true, index: true },
    theme: {
      name: { type: String, default: "genz" },
      primary: { type: String, default: "#8B5CF6" },
      secondary: { type: String, default: "#EC4899" },
      background: { type: String, default: "#F9FAFB" },
      surface: { type: String, default: "#FFFFFF" },
      text: { type: String, default: "#111827" },
      mutedText: { type: String, default: "#6B7280" },
      border: { type: String, default: "#E5E7EB" },
      error: { type: String, default: "#EF4444" },
      success: { type: String, default: "#10B981" },
      button: { type: String, default: "#8B5CF6" },
    },
    settings: {
      showProgress: { type: Boolean, default: true },
      allowMultipleResponses: { type: Boolean, default: false },
      collectEmail: { type: Boolean, default: false },
    },
    formfield: { type: [formFieldSchema], default: [] },
    status: { type: String, enum: ["draft","published","closed"], default: "draft" },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const FormSchema = mongoose.models.Form || mongoose.model("Form", formSchema);
export default FormSchema;
