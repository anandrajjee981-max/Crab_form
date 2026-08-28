// Why does this file exist? Defines persistence for responses; answer validation happens in Activities, not schema.
import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    fieldId: { type: mongoose.Schema.Types.ObjectId, required: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const responseSchema = new mongoose.Schema(
  {
    form_id: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true, index: true },
    respondentEmail: { type: String, default: null },
    respondentName: { type: String, default: null },
    respondentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    answers: { type: [answerSchema], required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ResponseSchema = mongoose.models.Response || mongoose.model("Response", responseSchema);
export default ResponseSchema;
