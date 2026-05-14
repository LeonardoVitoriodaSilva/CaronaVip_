// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  const senhaHash = await bcrypt.hash('senha123', 12)

  const joao = await prisma.usuario.upsert({
    where: { email: 'joao@caronavip.com' },
    update: {},
    create: {
      nome: 'João Silva',
      email: 'joao@caronavip.com',
      telefone: '86999111222',
      senhaHash,
      tipo: 'PASSAGEIRO',
      emailVerificado: true,
      telefoneVerificado: true,
      mediaAvaliacao: 4.8,
      totalAvaliacoes: 23,
    },
  })

  const carlos = await prisma.usuario.upsert({
    where: { email: 'carlos@caronavip.com' },
    update: {},
    create: {
      nome: 'Carlos Motorista',
      email: 'carlos@caronavip.com',
      telefone: '86999333444',
      senhaHash,
      tipo: 'MOTORISTA',
      emailVerificado: true,
      telefoneVerificado: true,
      cnhVerificada: true,
      cnhNumero: '12345678901',
      mediaAvaliacao: 4.9,
      totalAvaliacoes: 87,
    },
  })

  await prisma.usuario.upsert({
    where: { email: 'ana@caronavip.com' },
    update: {},
    create: {
      nome: 'Ana Passageira',
      email: 'ana@caronavip.com',
      telefone: '86999555666',
      senhaHash,
      tipo: 'PASSAGEIRO',
      emailVerificado: true,
      telefoneVerificado: true,
      mediaAvaliacao: 4.7,
      totalAvaliacoes: 15,
    },
  })

  const civic = await prisma.veiculo.upsert({
    where: { placa: 'ABC1D23' },
    update: {},
    create: {
      motoristaId: carlos.id,
      modelo: 'Civic',
      marca: 'Honda',
      placa: 'ABC1D23',
      cor: 'Prata',
      ano: 2021,
      capacidade: 4,
    },
  })

  const amanha = new Date()
  amanha.setDate(amanha.getDate() + 1)
  amanha.setHours(7, 30, 0, 0)

  await prisma.viagem.create({
    data: {
      motoristaId: carlos.id,
      veiculoId: civic.id,
      origem: 'Teresina',
      destino: 'Parnaíba',
      latOrigem: -5.0892,
      lngOrigem: -42.8019,
      latDestino: -2.9045,
      lngDestino: -41.7769,
      distanciaKm: 336,
      duracaoMin: 230,
      horarioSaida: amanha,
      vagasTotal: 3,
      vagasDisponiveis: 3,
      precoPorPessoa: 65.0,
      observacoes: 'Saída pelo Terminal Rodoviário. Parada em Campo Maior.',
      status: 'DISPONIVEL',
    },
  })

  console.log('✅ Seed concluído!')
  console.log('   joao@caronavip.com / senha123 → Passageiro')
  console.log('   carlos@caronavip.com / senha123 → Motorista')
  console.log('   ana@caronavip.com / senha123 → Passageiro')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
