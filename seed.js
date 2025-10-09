const mongoose = require('mongoose');
const Job = require('./models/Job');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    await Job.deleteMany({});  // Limpar DB
    const jobs = [
      { titulo: 'Desenvolvedor Full-Stack', descricao: 'Desenvolva apps web sustentáveis.', requisitos: ['JavaScript', 'Node.js'], salario: 'R$ 5.000', localizacao: 'Remoto' },
      { titulo: 'Analista de Marketing', descricao: 'Estratégias inclusivas para B-Corp.', requisitos: ['Marketing Digital'], salario: 'R$ 4.000', localizacao: 'São Paulo' },
      { titulo: 'Designer UX/UI', descricao: 'Design acessível e responsivo.', requisitos: ['Figma', 'Acessibilidade'], salario: 'R$ 4.500', localizacao: 'Remoto' },
      { titulo: 'Gerente de Projetos', descricao: 'Projetos com foco em impacto social.', requisitos: ['Gestão Ágil'], salario: 'R$ 6.000', localizacao: 'Rio de Janeiro' },
      { titulo: 'Suporte Técnico', descricao: 'Ajude usuários com empatia.', requisitos: ['Customer Service'], salario: 'R$ 3.000', localizacao: 'Remoto' }
    ];
    await Job.insertMany(jobs);
    console.log('Vagas populadas!');
    process.exit(0);
  });