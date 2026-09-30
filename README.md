# Club'n Diagnóstico — CRM com banco de dados

Este projeto tem duas partes:

- `server.js` — um servidor (Node.js) que fala com um banco de dados PostgreSQL
  e expõe uma API simples (`/api/calls`, `/api/propostas`, `/api/diagnosticos`).
- `public/index.html` — o app inteiro (diagnóstico, apresentação, CRM), que agora
  usa essa API para salvar e ler os dados, em vez de guardar só no navegador.

Com isso, os dados ficam disponíveis em qualquer dispositivo que acessar o link,
porque tudo é salvo num banco de dados compartilhado.

## Deploy (GitHub + Render) — passo a passo

Este projeto usa um banco de dados PostgreSQL já existente na sua conta do
Render (o plano gratuito só permite 1 banco por conta, então reaproveitamos
o que já está lá em vez de criar outro). As tabelas usadas aqui têm o
prefixo `clubn_`, então não têm risco de conflitar com as de outros projetos
que dividem esse mesmo banco.

1. Suba esta pasta inteira para um repositório novo no GitHub (pode usar o
   "Upload files" pelo navegador, arrastando todos os arquivos e pastas).
2. No Render, abra o banco de dados PostgreSQL que você já tem (de outro
   projeto) e copie a **"Internal Database URL"** (na aba de conexão/Info).
3. Clique em **"New +" → "Blueprint"** e escolha este repositório.
4. Quando o Render pedir o valor da variável `DATABASE_URL`, cole a URL que
   você copiou no passo 2.
5. Clique em **"Apply"**. Em alguns minutos o servidor fica no ar.
6. O link do site aparece no serviço do tipo "Web Service" (algo como
   `https://clubn-diagnostico.onrender.com`).

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
