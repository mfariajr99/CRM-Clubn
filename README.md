# Club'n Diagnóstico — CRM com banco de dados

Este projeto tem duas partes:

- `server.js` — um servidor (Node.js) que fala com um banco de dados PostgreSQL
  e expõe uma API simples (`/api/calls`, `/api/propostas`, `/api/diagnosticos`).
- `public/index.html` — o app inteiro (diagnóstico, apresentação, CRM), que agora
  usa essa API para salvar e ler os dados, em vez de guardar só no navegador.

Com isso, os dados ficam disponíveis em qualquer dispositivo que acessar o link,
porque tudo é salvo num banco de dados compartilhado.

## Deploy (GitHub + Render) — passo a passo

1. Suba esta pasta inteira para um repositório novo no GitHub (pode usar o
   "Upload files" pelo navegador, arrastando todos os arquivos e pastas).
2. No Render, clique em **"New +" → "Blueprint"**.
3. Escolha o repositório que você acabou de criar.
4. O Render vai ler o arquivo `render.yaml` desta pasta e configurar **sozinho**:
   - um banco de dados PostgreSQL gratuito
   - um servidor web (Node.js) já conectado a esse banco
5. Clique em **"Apply"**. Em alguns minutos os dois ficam no ar.
6. O link do site aparece no serviço do tipo "Web Service" (algo como
   `https://clubn-diagnostico.onrender.com`).

Pronto — não precisa configurar nada manualmente (nem senha de banco, nem
variáveis de ambiente): o `render.yaml` já faz essa ligação automaticamente.

### Atualizando o app depois

Sempre que eu te mandar um `index.html` novo, é só substituir o arquivo dentro
de `public/` no GitHub (editar ou fazer upload de novo) e commitar. O Render
publica a atualização sozinho, sem precisar mexer em mais nada.

### Rodando localmente (opcional, só se quiser testar antes de subir)

Precisa ter Node.js instalado e um Postgres à mão.

```
npm install
DATABASE_URL=postgres://usuario:senha@localhost:5432/nome_do_banco npm start
```

O app abre em `http://localhost:3000`.
