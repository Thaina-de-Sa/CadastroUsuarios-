# Bancos Regulados — CRUD de Usuários

Trabalho desenvolvido com Next.js, React, TypeScript e JSON Server. 

## Requisitos

- Node.js 20.9 ou superior
- npm

## Como executar

1. Abra a pasta do projeto no VS Code e execute `npm install` no terminal.
2. No **primeiro terminal**, execute `npm run server` (API em http://localhost:3001).
3. No **segundo terminal**, execute `npm run dev` (site em http://localhost:3000).
4. Acesse **http://localhost:3000** — sem login, você será levado para `/login`.


**Atenção:** mantenha ambos os terminais abertos. Se a API não estiver rodando, a listagem exibirá uma mensagem de erro. Os dados ficam armazenados em `jsonserver/db.json` e permanecem após reiniciar os servidores.

## Funcionalidades

- Cadastro com nome, e-mail, CPF, telefone, data de nascimento, endereço completo e senha.
- Máscaras de CPF, telefone, CEP e data; validações de campos obrigatórios, formato do CPF, datas reais, e-mail, tamanho do telefone e senha.
- Verificação de e-mail e CPF duplicados no conjunto carregado.
- Listagem com busca por nome, e-mail e CPF.
- Edição de todos os dados, com senha opcional (em branco mantém a anterior).
- Exclusão com confirmação.
- Comunicação por `GET`, `POST`, `PATCH` e `DELETE` na API JSON Server.

## Autenticação e rotas protegidas (desafio)

- **Login:** `/login` envia e-mail e senha para `POST /api/login`. O servidor busca o usuário no JSON Server, compara o hash SHA-256 da senha e, se estiver correto, gera um **token JWT** (validade de 1 hora).
- **Token:** salvo em cookie `httpOnly` (o JavaScript do navegador não consegue lê-lo).
- **Rotas protegidas:** o arquivo `src/proxy.ts` (no Next 16, o antigo *middleware*) roda antes de cada página e confere a assinatura e a validade do token. Sem token válido, redireciona para `/login`.
- **Logout:** botão **Sair** na barra lateral (`POST /api/logout`) apaga o cookie.

Para testar: acesse `/usuarios` sem estar logado (vai para `/login`), entre com um usuário cadastrado e depois clique em **Sair**.

Arquivos principais: `src/lib/auth.ts`, `src/proxy.ts`, `src/app/api/login/route.ts`, `src/app/api/logout/route.ts` e `src/app/login/page.tsx`.

## Observação de segurança

Este é um sistema **didático**, com autenticação básica por JWT, mas a API do JSON Server (porta 3001) continua aberta. Antes do envio, a senha é transformada em um hash SHA-256 no navegador para não armazenar o texto original no JSON Server. Esse hash simples **não é adequado a produção**: em um sistema real, use backend seguro, autenticação, validação de dados no servidor e hashing com sal usando Argon2 ou bcrypt.


