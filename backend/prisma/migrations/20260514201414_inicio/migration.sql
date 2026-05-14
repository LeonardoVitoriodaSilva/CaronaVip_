-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('PASSAGEIRO', 'MOTORISTA', 'AMBOS');

-- CreateEnum
CREATE TYPE "StatusViagem" AS ENUM ('DISPONIVEL', 'EM_ANDAMENTO', 'FINALIZADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "StatusSolicitacao" AS ENUM ('PENDENTE', 'ACEITA', 'RECUSADA', 'CANCELADA_PASSAGEIRO', 'CANCELADA_MOTORISTA');

-- CreateEnum
CREATE TYPE "MetodoPagamento" AS ENUM ('PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'DINHEIRO');

-- CreateEnum
CREATE TYPE "StatusPagamento" AS ENUM ('PENDENTE', 'APROVADO', 'RECUSADO', 'ESTORNADO');

-- CreateEnum
CREATE TYPE "AcaoHistorico" AS ENUM ('VIAGEM_CRIADA', 'VIAGEM_INICIADA', 'VIAGEM_FINALIZADA', 'VIAGEM_CANCELADA', 'SOLICITACAO_ENVIADA', 'SOLICITACAO_ACEITA', 'SOLICITACAO_RECUSADA', 'SOLICITACAO_CANCELADA', 'PAGAMENTO_REALIZADO', 'AVALIACAO_REGISTRADA');

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "tipo" "TipoUsuario" NOT NULL DEFAULT 'PASSAGEIRO',
    "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
    "telefoneVerificado" BOOLEAN NOT NULL DEFAULT false,
    "cnhVerificada" BOOLEAN NOT NULL DEFAULT false,
    "cnhNumero" TEXT,
    "fotoPerfil" TEXT,
    "mediaAvaliacao" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "totalAvaliacoes" INTEGER NOT NULL DEFAULT 0,
    "totalCancelamentos" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "motivoBloqueio" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "veiculos" (
    "id" TEXT NOT NULL,
    "motoristaId" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "cor" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "capacidade" INTEGER NOT NULL DEFAULT 4,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "veiculos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "viagens" (
    "id" TEXT NOT NULL,
    "motoristaId" TEXT NOT NULL,
    "veiculoId" TEXT NOT NULL,
    "origem" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "latOrigem" DOUBLE PRECISION,
    "lngOrigem" DOUBLE PRECISION,
    "latDestino" DOUBLE PRECISION,
    "lngDestino" DOUBLE PRECISION,
    "distanciaKm" DOUBLE PRECISION,
    "duracaoMin" INTEGER,
    "horarioSaida" TIMESTAMP(3) NOT NULL,
    "vagasTotal" INTEGER NOT NULL,
    "vagasDisponiveis" INTEGER NOT NULL,
    "precoPorPessoa" DOUBLE PRECISION NOT NULL,
    "observacoes" TEXT,
    "status" "StatusViagem" NOT NULL DEFAULT 'DISPONIVEL',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "viagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitacoes" (
    "id" TEXT NOT NULL,
    "viagemId" TEXT NOT NULL,
    "passageiroId" TEXT NOT NULL,
    "pontoEmbarque" TEXT,
    "observacao" TEXT,
    "status" "StatusSolicitacao" NOT NULL DEFAULT 'PENDENTE',
    "solicitadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mensagens" (
    "id" TEXT NOT NULL,
    "solicitacaoId" TEXT NOT NULL,
    "remetenteId" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "enviadaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mensagens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "avaliacoes" (
    "id" TEXT NOT NULL,
    "viagemId" TEXT NOT NULL,
    "avaliadorId" TEXT NOT NULL,
    "avaliadoId" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "comentario" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avaliacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id" TEXT NOT NULL,
    "solicitacaoId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "taxaPlataforma" DOUBLE PRECISION NOT NULL,
    "valorMotorista" DOUBLE PRECISION NOT NULL,
    "metodo" "MetodoPagamento" NOT NULL DEFAULT 'PIX',
    "status" "StatusPagamento" NOT NULL DEFAULT 'PENDENTE',
    "referenciaExterna" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historico" (
    "id" TEXT NOT NULL,
    "viagemId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "acao" "AcaoHistorico" NOT NULL,
    "metadata" JSONB,
    "registradoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_telefone_key" ON "usuarios"("telefone");

-- CreateIndex
CREATE UNIQUE INDEX "veiculos_placa_key" ON "veiculos"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "solicitacoes_viagemId_passageiroId_key" ON "solicitacoes"("viagemId", "passageiroId");

-- CreateIndex
CREATE UNIQUE INDEX "avaliacoes_viagemId_avaliadorId_key" ON "avaliacoes"("viagemId", "avaliadorId");

-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_solicitacaoId_key" ON "pagamentos"("solicitacaoId");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- AddForeignKey
ALTER TABLE "veiculos" ADD CONSTRAINT "veiculos_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_motoristaId_fkey" FOREIGN KEY ("motoristaId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "viagens" ADD CONSTRAINT "viagens_veiculoId_fkey" FOREIGN KEY ("veiculoId") REFERENCES "veiculos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_viagemId_fkey" FOREIGN KEY ("viagemId") REFERENCES "viagens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_passageiroId_fkey" FOREIGN KEY ("passageiroId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "solicitacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_remetenteId_fkey" FOREIGN KEY ("remetenteId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_viagemId_fkey" FOREIGN KEY ("viagemId") REFERENCES "viagens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_avaliadorId_fkey" FOREIGN KEY ("avaliadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_avaliadoId_fkey" FOREIGN KEY ("avaliadoId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_solicitacaoId_fkey" FOREIGN KEY ("solicitacaoId") REFERENCES "solicitacoes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico" ADD CONSTRAINT "historico_viagemId_fkey" FOREIGN KEY ("viagemId") REFERENCES "viagens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historico" ADD CONSTRAINT "historico_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
