const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  skills: [String],  // Ex.: ['JavaScript', 'Node.js']
  experiencia: { type: String, default: '' },  // Anos de experiência
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  this.senha = await bcrypt.hash(this.senha, 10);
  next();
});

userSchema.methods.compareSenha = async function(senha) {
  return bcrypt.compare(senha, this.senha);
};

module.exports = mongoose.model('User ', userSchema);