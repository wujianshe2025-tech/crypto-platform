import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  predictionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prediction',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  optionIndex: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    default: 0
  },
  txHash: String,
  isWinner: {
    type: Boolean,
    default: false
  },
  rewardAmount: {
    type: Number,
    default: 0
  },
  rewardTxHash: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Vote', voteSchema);
