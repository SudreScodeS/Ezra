const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  requisitos: [String],
  salario: { type: String, default: 'A combinar' },
  localizacao: { type: String, default: 'Remoto' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', jobSchema);