const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User ', required: true },
  vagaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  interacao: { type: String, required: true },  // Ex.: 'visualizou', 'aplicou'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Interaction', interactionSchema);