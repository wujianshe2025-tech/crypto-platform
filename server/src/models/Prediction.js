import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  options: [{
    text: String,
    votes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  hasReward: {
    type: Boolean,
    default: false
  },
  rewardPerPerson: {
    type: Number,
    default: 0
  },
  totalPool: {
    type: Number,
    default: 0
  },
  deadline: Date,
  status: {
    type: String,
    enum: ['active', 'closed', 'settled'],
    default: 'active'
  },
  winningOption: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Prediction', predictionSchema);
