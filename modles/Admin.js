import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password: { type: String, required: true },
});

const adminModel = mongoose.model("admin1", adminSchema);

export { adminModel as Admin };
