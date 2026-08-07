import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { CONTENT_TYPES, TRIGGERS } from "@/lib/content";

const SubmissionSchema = new Schema(
  {
    type: { type: String, required: true, enum: [...CONTENT_TYPES] },
    text: { type: String, required: true, maxlength: 180, trim: true },
    trigger: { type: String, required: true, enum: [...TRIGGERS] },
    author: { type: String, required: true, maxlength: 32, default: "anonymous" },
    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    votes: { type: Number, default: 0, min: 0 },
    /** Set when an admin edits the text before approving. */
    editedFrom: { type: String, default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// The live site's hot path: approved content, newest first.
SubmissionSchema.index({ status: 1, createdAt: -1 });

export type SubmissionDoc = InferSchemaType<typeof SubmissionSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Submission: Model<SubmissionDoc> =
  (mongoose.models.Submission as Model<SubmissionDoc>) ??
  mongoose.model<SubmissionDoc>("Submission", SubmissionSchema);
