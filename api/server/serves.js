import "dotenv/config";
import express from "express";
import cors from "cors";
import { createClient } from '@supabase/supabase-js';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import morgan from "morgan";
import apiRedirect from "../routes/index.js";
import rateLimit from "express-rate-limit";


const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Limitar tamanho do body
app.use(express.json({ limit: '10kb' }));

// Rate limit: 100 requisições por 15 minutos por IP
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// CORS aberto para todos os frontends temporariamente
app.use(cors());

// Tratamento global de erros
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Erro interno no servidor" });
});

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "API internaN8N",
      version: "1.0.0",
      description: "Documentação da API internaN8N com Supabase",
      contact: {
        name: "Pedro Henrique",
        url: "https://github.com/seu-usuario",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./api/server/serves.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /test-supabase:
 *   get:
 *     summary: Testa conexão com Supabase
 *     responses:
 *       200:
 *         description: Conexão bem-sucedida
 *       500:
 *         description: Erro de conexão
 */

// Testa conexão com Supabase antes de subir o servidor
async function startServer() {
  const { error } = await supabase.from(process.env.SUPABASE_TABLE).select('*').limit(1);
  if (error) {
    console.error('Erro ao conectar ao Supabase:', error.message);
    process.exit(1);
  }
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
  });
}

// Rotas da API
app.use("/api/v1", apiRedirect);

// Ping automático para evitar que o Render durma
const PING_URL = process.env.PING_URL || "https://api-internan8n.onrender.com";
setInterval(() => {
    fetch(PING_URL)
        .then(() => console.log("Ping enviado para manter o Render acordado"))
        .catch(() => console.log("Falha ao enviar ping (Render pode estar dormindo)"));
}, 1000 * 60 * 14); // a cada 14 minutos (menos que 15 para garantir)

startServer();

export default app;


