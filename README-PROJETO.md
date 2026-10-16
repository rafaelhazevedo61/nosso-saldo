# Nosso Saldo

Aplicativo web para controle financeiro de Rafael e Jéssica, com layout responsivo e instalação como PWA.

## Funcionalidades

- Receitas e despesas por mês, pessoa, categoria e carteira.
- Carteiras com saldo inicial, saldo individual e saldo consolidado.
- Metas compartilhadas com registro de valores guardados e retirados.
- Cartões com limite e dia de fechamento, compras à vista e parceladas e faturas.
- Central de parcelas com projeção mensal de todos os cartões.
- Exportação CSV dos lançamentos e ícones para Android/iPhone.

## Arquitetura

React 19, TypeScript e Vinext (interface compatível com Next.js), Vite, Cloudflare Workers, D1/SQLite e Drizzle. O servidor usa `cloudflare:workers`: não é um site estático nem um projeto que pode ser hospedado diretamente em GitHub Pages. O repositório remoto guarda o código; hospedagem e banco são serviços separados.

A produção atual utiliza autenticação e política de acesso da plataforma Sites. `app/chatgpt-auth.ts` lê a identidade confiável fornecida pela plataforma. Fora dela, será necessário implementar autenticação e autorização próprias no servidor e substituir essa integração. Não confie em cabeçalhos de identidade enviados diretamente pelo visitante.

O ZIP contém código e migrações de estrutura. Não contém dados financeiros de produção, credenciais, dependências instaladas ou histórico Git.

## Rodar em desenvolvimento local

Requisito: Node.js 22.13 ou superior e pnpm conforme `packageManager` de `package.json`.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm run build
```

Na raiz do projeto, aplique as migrações SQL locais em ordem (sem repetir as já aplicadas). Exemplo para a primeira:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_exotic_zuras.sql
```

Repita o comando para cada arquivo SQL restante em `drizzle/`, em ordem crescente. As migrações antigas são imutáveis; para mudanças de estrutura use `pnpm run db:generate` e acrescente uma nova migração.

```sh
pnpm run dev
```

O perfil padrão de um checkout novo é `portable`; o servidor de desenvolvimento usa `http://localhost:5173`. Em loopback, `/signin-with-chatgpt?return_to=/` fornece uma identidade simulada exclusivamente para desenvolvimento. O banco local é separado do banco de produção. `pnpm run start` serve o Worker compilado com Wrangler, mas não simula esse login.

## Publicação e portabilidade

`.openai/hosting.json` identifica o Site atual e declara o binding D1 `DB`. Esse ID não é uma credencial, mas pertence à publicação existente. Preserve-o para atualizar este Site; não o reutilize como identidade de outro projeto. O build usa `build/sites-vite-plugin.ts` para produzir a saída de Worker e metadados de hospedagem.

Para outro provedor, adapte a configuração de deployment, provisione um banco D1/alternativa compatível, aplique as migrações e configure autenticação. Nunca torne as APIs financeiras públicas sem autorização adequada.

## Criar seu próprio repositório remoto

Após extrair o ZIP e entrar na pasta `nosso-saldo`, crie um repositório vazio no provedor desejado e use seu endereço real:

```sh
git init
git add .
git commit -m "Versão inicial do Nosso Saldo"
git branch -M main
git remote add origin URL_DO_SEU_REPOSITORIO
git push -u origin main
```

Não envie `.env`, tokens, bancos locais, `node_modules`, `dist`, `.wrangler` ou `.sites-runtime`. `.gitignore` já protege esses arquivos. Prefira um repositório privado se o uso for pessoal.

## PWA e ícones

O manifesto está em `public/manifest.webmanifest`, com ícones PNG de 192 e 512 pixels, um ícone maskable e um apple-touch-icon. O layout declara `crossOrigin="use-credentials"` no manifesto, pois o Site atual exige sessão autenticada.

Para testar a instalação, abra o endereço publicado no Chrome completo (não apenas na janela interna de outro aplicativo), entre na conta e use o menu de instalação. A disponibilidade de instalação depende também do navegador e do acesso aos arquivos do PWA pela camada de hospedagem privada. Este projeto não promete funcionamento offline; os registros financeiros são consultados online e não ficam em cache no service worker.

## Estrutura principal

- `app/dashboard.tsx`: visão geral, lançamentos e carteiras.
- `app/metas/`: metas.
- `app/cartoes/`: cartões e faturas.
- `app/parcelas/`: central de parcelas.
- `app/api/`: APIs autenticadas.
- `db/schema.ts` e `drizzle/`: schema e migrações.
- `lib/`: cálculos de saldos, faturas e parcelas.
- `public/`: logo, ícones, manifesto e service worker.

## Verificações

A versão entregue passou pela verificação TypeScript e pelo build de produção. A instalação real no Android ainda precisa ser confirmada; a última captura mostrava o Chrome sem reconhecer o aplicativo.
