import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
    email: { type: String, required: true },
    goalName: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentBalance: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

const GoalModel = mongoose.model("goals", goalSchema);

export { GoalModel };
