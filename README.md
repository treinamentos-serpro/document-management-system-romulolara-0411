# Document Management System com GitHub Copilot

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

Hey romulolara!

Mona here. I'm done preparing your exercise. Hope you enjoy! 💚

Remember, it's self-paced so feel free to take a break! ☕️

[![](https://img.shields.io/badge/Go%20to%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/treinamentos-serpro/document-management-system-romulolara-0411/issues/1)

---

## Estado atual

O backend implementa upload, listagem e download de documentos. O frontend React
ainda está no estado inicial do workshop, sem interface de gestão de documentos.

## Pré-requisitos

- Node.js 24 ou superior, conforme exigido pelo frontend.
- npm.
- Permissão de escrita no diretório [backend/storage](backend/storage).

## Arquitetura

O backend utiliza Express e CommonJS, com o fluxo de dependências
`routes -> controllers -> services -> repositories`:

- [backend/src/routes](backend/src/routes): endpoints e middleware de upload.
- [backend/src/controllers](backend/src/controllers): entrada e saída HTTP.
- [backend/src/services](backend/src/services): regras de negócio.
- [backend/src/repositories](backend/src/repositories): metadados em memória
	e remoção de arquivos em caso de falha.
- [backend/src/app.js](backend/src/app.js): configuração do app e registro das rotas.

## Backend

Execute a partir da raiz do repositório:

```sh
cd backend
npm install
npm start
```

A API escuta em `http://localhost:3000` por padrão. Para desenvolvimento com
reinício automático, use `npm run dev` no lugar de `npm start`.

### Testes

Na raiz do repositório:

```sh
npm test --prefix backend
```

Os testes utilizam o runner nativo do Node e cobrem upload, persistência local,
listagem, download, validações e limpeza de arquivos após falhas. Não é necessário
iniciar o servidor separadamente para executá-los.

### API

- `GET /health`: verifica a disponibilidade do servidor.
- `POST /upload`: recebe um arquivo multipart no campo `file` e retorna os
  metadados com status `201`.
- `GET /documents`: retorna um array de metadados, dos mais recentes aos mais antigos.
- `GET /documents/:id/download`: baixa o arquivo com seu nome original.

```sh
curl -F 'file=@documento.pdf' http://localhost:3000/upload
curl http://localhost:3000/documents
curl -OJ http://localhost:3000/documents/ID_DO_DOCUMENTO/download
```

Substitua `documento.pdf` pelo caminho de um arquivo local e `ID_DO_DOCUMENTO`
pelo `id` retornado no upload ou na listagem. A API recebe os caminhos diretamente,
sem o prefixo `/api`.

### Armazenamento

Os uploads ficam exclusivamente em `backend/storage`, com nomes internos gerados
pela aplicação. Os metadados contêm `id`, `originalName`, `size`, `uploadedAt` e
`owner`, e ficam em memória: reiniciar o servidor perde a listagem, mas não apaga
os arquivos do disco. Não há autenticação ou isolamento por usuário nesta fase.

São permitidas as extensões PDF, TXT, CSV, DOCX, XLSX e PPTX. A validação de
extensão não verifica o conteúdo do arquivo. O limite padrão é 10 MB.

### Configuração

As variáveis são lidas do ambiente do processo:

- `PORT`: porta HTTP (padrão `3000`).
- `DMS_MAX_FILE_SIZE`: limite por arquivo em bytes, inteiro positivo
  (padrão `10485760`).
- `DMS_DEFAULT_OWNER`: dono indicativo dos documentos (padrão `default`).

Exemplo a partir da raiz do repositório:

```sh
DMS_MAX_FILE_SIZE=5242880 DMS_DEFAULT_OWNER=equipe npm start --prefix backend
```

### Erros

Os erros retornam JSON com o campo `error`: `400` para upload inválido, `413`
para tamanho excedido, `404` para documento ou arquivo ausente e `500` para
falhas internas. Um upload é removido do disco se falhar o registro dos metadados.

## Frontend

Para executar o frontend inicial, abra outro terminal na raiz do repositório:

```sh
cd frontend
npm install
npm run dev
```

O Vite utiliza a porta `5173` por padrão; consulte a URL exibida no terminal.
O proxy de desenvolvimento encaminha `/api` para `http://localhost:3000`, removendo
esse prefixo. Se a porta do backend mudar, ajuste o destino em
[frontend/vite.config.js](frontend/vite.config.js).

Para gerar o build, execute na raiz:

```sh
npm run build --prefix frontend
```

&copy; 2025 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)

