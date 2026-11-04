---
description: "Transforma planos do agente planner em tarefas detalhadas, coesas e objetivas, ordenadas por dependencias e prioridade."
name: gerar-tarefas
argument-hint: "Plano do planner na conversa ou caminho do arquivo que contem o plano"
agent: planner
---

# Gerar tarefas a partir de um plano

Transforme o plano de implementacao produzido pelo agente [planner](../agents/planner.agent.md) em tarefas executaveis. Use o plano indicado na mensagem do usuario ou em arquivo referenciado; na ausencia de indicacao, use o plano mais recente do planner na conversa. Se nenhum plano estiver disponivel, solicite-o antes de continuar. Se houver varios planos indicados, trate cada um separadamente.

## Regras

- Apenas apresente as tarefas na conversa. Nao implemente, nao edite arquivos e nao execute comandos que alterem o projeto.
- Preserve o escopo, as decisoes arquiteturais, as restricoes e os criterios de aceite do plano. Consulte somente os arquivos e a especificacao relevantes quando precisar confirmar detalhes.
- Decomponha cada etapa em tarefas com um unico resultado observavel. Cada tarefa deve ser coesa, objetiva e detalhada o suficiente para ser executada sem reinterpretar o plano.
- Inclua preparacao, implementacao, testes e documentacao somente quando necessarios ao plano. Evite tarefas vagas, duplicadas ou sem contribuicao verificavel.
- Identifique dependencias por IDs estaveis, como T01 e T02. Ordene as tarefas de modo que todos os pre-requisitos aparecam antes das tarefas dependentes; nao crie dependencias circulares ou artificiais entre tarefas independentes.
- Atribua prioridade P0 a bloqueadores e pre-requisitos indispensaveis, P1 as entregas essenciais restantes e P2 a complementos explicitamente previstos. Entre tarefas prontas para execucao, priorize as que desbloqueiam mais trabalho e reduzem riscos; a prioridade nunca permite ignorar uma dependencia.
- Sinalize lacunas como pendencias de esclarecimento, sem inventar requisitos ou decisoes. Se uma lacuna impedir o detalhamento, indique a pergunta necessaria e quais tarefas ficam bloqueadas.
- Nao estime prazos nem adicione funcionalidades fora do plano. Use nomes reais de arquivos e simbolos quando confirmados; marque caminhos ainda nao confirmados como propostos.
- Escreva em portugues. Use titulos curtos com verbo de acao e passos concretos, sem explicacoes redundantes.

## Formato de saida

Identifique brevemente o plano de origem e seu objetivo.

### Ordem de execucao

Apresente uma tabela em ordem valida de execucao:

| Ordem | ID | Tarefa | Prioridade | Depende de | Etapa do plano |
| --- | --- | --- | --- | --- | --- |
| 1 | T01 | Verbo de acao e resultado | P0 | Nenhuma | Etapa de origem |

### Detalhamento das tarefas

Para cada tarefa, na mesma ordem da tabela, use:

#### T01 - Titulo objetivo

- **Objetivo:** um unico resultado esperado.
- **Prioridade e justificativa:** P0, P1 ou P2 e o motivo concreto.
- **Dependencias:** IDs dos pre-requisitos ou nenhuma; destaque bloqueios externos.
- **Origem:** etapa e criterio do plano atendidos.
- **Arquivos ou componentes:** locais confirmados ou propostos que serao afetados.
- **Passos:** lista numerada curta de acoes concretas, com detalhes tecnicos relevantes.
- **Criterios de aceite:** condicoes observaveis que definem a conclusao.
- **Validacao:** teste, comando existente ou verificacao manual especifica, com resultado esperado. Nao apresente comandos sugeridos como executados.

### Pendencias e paralelismo

Liste esclarecimentos e riscos herdados do plano que afetam a execucao. Indique quais tarefas podem ocorrer em paralelo apos seus pre-requisitos, considerando conflitos nos mesmos arquivos; se nao houver, diga isso brevemente.

Antes de responder, confira se todas as etapas e criterios do plano foram cobertos, se todos os IDs referenciados existem e se nenhuma tarefa aparece antes de suas dependencias.