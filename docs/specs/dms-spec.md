## Plano: Especificação DMS

Criar somente `docs/specs/dms-spec.md`, usando [docs/specs/spec-template.md](docs/specs/spec-template.md) como base. O plano documentará a implementação futura, mas não haverá alterações nos arquivos de backend ou frontend nesta tarefa.

**Etapas**
1. Completar objetivo, escopo e requisitos funcionais e não funcionais com critérios verificáveis.
2. Definir o modelo de metadados: `id` UUID, `originalName`, `size`, `uploadedAt` em ISO 8601 e `owner`. O nome interno do arquivo será gerado pela aplicação.
3. Especificar os contratos de `POST /upload`, `GET /documents` e `GET /documents/:id/download`: campo multipart `file`, respostas, ordenação, headers de download e erros HTTP.
4. Documentar armazenamento local com Multer `diskStorage`, limite de 10 MB, allowlist PDF/TXT/CSV/DOCX/XLSX/PPTX, configuração e comportamento de falhas e reinícios.
5. Registrar decisões arquiteturais e etapas futuras de implementação: armazenamento/repositórios, serviços, controllers/rotas, testes, integração do frontend e validação ponta a ponta.

**Decisões**
- Primeira versão sem autenticação. `owner` vem de `DMS_DEFAULT_OWNER` (padrão `default`); é apenas indicativo, sem isolamento de acesso por usuário.
- O diretório permanece restrito a `backend/storage`; metadados ficam em memória. Portanto, após reinício, arquivos podem continuar no disco sem constarem na listagem.
- API do backend usa caminhos sem `/api`; o proxy do frontend remove esse prefixo antes de encaminhar as chamadas.
- Incluídos na especificação: `PORT`, `DMS_MAX_FILE_SIZE` e `DMS_DEFAULT_OWNER`, além da limpeza do arquivo recém-gravado se falhar o registro dos metadados.

**Verificação**
Conferir se o documento cobre todas as seções do modelo e se a única alteração no repositório é `docs/specs/dms-spec.md`. Não é necessário executar testes de runtime para esse artefato documental.
