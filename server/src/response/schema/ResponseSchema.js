// Why does this file exist? Defines persistence for responses; answer validation happens in Activities, not schema.
import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    fieldId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    // Snapshot from Form.formfield at submit time — ensures actual que is stored even if Form is later edited
    question: { type: String, default: null },
    title: { type: String, default: null },
    datatype: { type: String, default: null },
    description: { type: String, default: null },
    required: { type: Boolean, default: null },
    options: { type: [String], default: null },
  },
  { _id: false }
);

const responseSchema = new mongoose.Schema(
  {
    form_id: { type: mongoose.Schema.Types.ObjectId, ref: "Form", required: true, index: true },
    // Owner of the form — denormalized from Form.owner_id via shipped link; allows owner to query all responses without extra join
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    respondentEmail: { type: String, default: null },
    respondentName: { type: String, default: null },
    respondentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    answers: { type: [answerSchema], required: true },
    // Denormalized snapshot of form for ref-free display (optional but helps old docs)
    formSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Virtual to populate actual form via ref — allows `populate('form_id')` to get form + que
responseSchema.virtual("form", {
  ref: "Form",
  localField: "form_id",
  foreignField: "_id",
  justOne: true,
});

const ResponseSchema = mongoose.models.Response || mongoose.model("Response", responseSchema);
export default ResponseSchema;
