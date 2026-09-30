const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
app.use(express.json({ limit: '20mb' })); // telas de proposta em base64 podem ser grandes

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('ERRO: variável de ambiente DATABASE_URL não definida.');
}

const pool = new Pool({
  connectionString,
  // O Postgres do Render exige SSL, mas com certificado que o driver não
  // reconhece por padrão; isso desativa a validação estrita (comum nesse caso).
  ssl: connectionString ? { rejectUnauthorized: false } : false
});

/* Prefixo "clubn_" nas tabelas: como este banco pode ser compartilhado com
   outros projetos (ex: Dash Loyal, Dash Prospecção) no mesmo Postgres
   gratuito do Render, isso evita qualquer conflito de nomes. */
const TABLE_PREFIX = 'clubn_';
const ENTITIES = ['calls', 'propostas', 'diagnosticos'];
const TABLES = ENTITIES.map(e => TABLE_PREFIX + e);

async function migrate() {
  for (const table of TABLES) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${table} (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
  }
  console.log('Migração concluída: tabelas prontas (' + TABLES.join(', ') + ').');
}

function crudRoutes(table) {
  const router = express.Router();

  // Lista tudo, na ordem de criação/atualização.
  router.get('/', async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT data FROM ${table} ORDER BY updated_at ASC`
      );
      res.json(rows.map(r => r.data));
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Erro ao ler do banco de dados.' });
    }
  });

  // Cria (ou substitui, se o id já existir) um registro completo.
  router.post('/', async (req, res) => {
    try {
      const record = req.body;
      if (!record || !record.id) {
        return res.status(400).json({ error: 'Registro precisa ter um campo "id".' });
      }
      await pool.query(
        `INSERT INTO ${table} (id, data, updated_at)
         VALUES ($1, $2, now())
         ON CONFLICT (id) DO UPDATE SET data = $2, updated_at = now()`,
        [record.id, record]
      );
      res.json(record);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Erro ao salvar no banco de dados.' });
    }
  });

  // Atualiza parcialmente (mescla os campos enviados com o registro existente).
  router.put('/:id', async (req, res) => {
    try {
      const { rows } = await pool.query(
        `SELECT data FROM ${table} WHERE id = $1`,
        [req.params.id]
      );
      if (!rows.length) {
        return res.status(404).json({ error: 'Registro não encontrado.' });
      }
      const merged = Object.assign({}, rows[0].data, req.body);
      await pool.query(
        `UPDATE ${table} SET data = $2, updated_at = now() WHERE id = $1`,
        [req.params.id, merged]
      );
      res.json(merged);
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Erro ao atualizar no banco de dados.' });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      await pool.query(`DELETE FROM ${table} WHERE id = $1`, [req.params.id]);
      res.json({ ok: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'Erro ao excluir no banco de dados.' });
    }
  });

  return router;
}

// A URL da API continua limpa (/api/calls, /api/propostas...), só a tabela
// de verdade no banco é que leva o prefixo clubn_.
ENTITIES.forEach((entity, i) => {
  app.use(`/api/${entity}`, crudRoutes(TABLES[i]));
});

// Carrega tudo de uma vez só, para o app abrir rápido.
app.get('/api/bootstrap', async (req, res) => {
  try {
    const [calls, propostas, diagnosticos] = await Promise.all(
      TABLES.map(t => pool.query(`SELECT data FROM ${t} ORDER BY updated_at ASC`))
    );
    res.json({
      calls: calls.rows.map(r => r.data),
      propostas: propostas.rows.map(r => r.data),
      diagnosticos: diagnosticos.rows.map(r => r.data)
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erro ao carregar dados do banco.' });
  }
});

// Health check simples (útil para o Render confirmar que o serviço está de pé).
app.get('/healthz', (req, res) => res.json({ ok: true }));

// Front-end estático (o arquivo index.html com todo o app).
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
migrate()
  .then(() => {
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch(err => {
    console.error('Falha ao migrar o banco de dados:', err);
    process.exit(1);
  });
