const mongoose = require('mongoose');
const { Schema } = mongoose;

const discussionSchema = new Schema({
  problemId: {
    type: Schema.Types.ObjectId,
    ref: 'problem',
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxLength: 2000,
  },
}, {
  timestamps: true,
});

discussionSchema.index({ problemId: 1, createdAt: -1 });

const Discussion = mongoose.model('discussion', discussionSchema);

module.exports = Discussion;
