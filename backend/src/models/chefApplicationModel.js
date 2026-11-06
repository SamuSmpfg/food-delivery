import mongoose from 'mongoose';

const chefApplicationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 200,
      index: true,
    },
    restaurantName: { type: String, required: true, trim: true, maxlength: 150 },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    invitationId: { type: String },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('ChefApplication', chefApplicationSchema);