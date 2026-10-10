# Retomada segura — 10/10/2026

## Estado observado

- Repositório: `thaironoliveira/forja-da-meia-noite`, base `fea3155`.
- Frontend HTML/CSS/JavaScript, funções Netlify, Supabase e Mercado Pago.
- O endereço Netlify configurado no backend respondeu HTTP 200; isso não comprova o funcionamento do login ou dos pagamentos.
- O projeto Supabase correspondente foi listado como `INACTIVE`.
- O advisor retornou uma lista vazia, mas, com o projeto inativo e sem inspeção das tabelas/políticas, isso **não comprova segurança**.
- Nenhum pagamento real, alteração de saldo, reativação do banco ou publicação foi executado nesta revisão.

## Correções contidas nesta branch

1. `comprar-creditos` retorna HTTP 410 sem acessar banco: elimina a concessão direta de saldo enviada pelo navegador quando a correção for publicada.
2. Build com lista explícita de arquivos públicos; funções, configuração e futuros arquivos privados ficam fora da pasta estática.
3. Scripts inline transferidos para arquivos locais, sem mudar sua lógica, para permitir CSP com `script-src 'self'`.
4. Cabeçalhos contra incorporação em frames e MIME sniffing; política de referência e restrição de câmera/microfone/geolocalização.
5. Testes locais de bloqueio da rota e isolamento da pasta pública.

**Esta branch é uma contenção inicial, não uma versão pronta para relançamento.** O login, a cobrança e a geração premium continuam exigindo as correções abaixo. Não reativar vendas com base apenas nestes testes.

## Bloqueadores de relançamento identificados no código

| Prioridade | Evidência | Correção necessária |
| --- | --- | --- |
| Crítica | `login.js` no backend aceita e-mail sem provar sua titularidade; funções de crédito confiam no e-mail do corpo | Supabase Auth com e-mail verificado e validação do token no servidor; vincular usuário ao ID autenticado |
| Crítica | `gerador.js` libera acesso por e-mail administrativo público e confia em localStorage | Remover exceção pública e cache como autorização; permissões e benefícios somente no servidor |
| Crítica | Roda e SVG são gerados integralmente no navegador | Entregar resultados premium por backend autenticado, após autorização/consumo atômico |
| Crítica | Webhook não registra IDs de pagamentos já processados | Transação com ID único de pagamento e lançamento único de créditos, tolerante a reenvios e concorrência |
| Alta | Webhook não verifica assinatura, valor, moeda e vínculo a um pedido interno | Validar assinatura oficial e consultar pagamento no provedor; conferir recebedor, ambiente e pedido persistido |
| Alta | Consumo de saldo usa leitura e atualização separadas | Débito atômico no Postgres, sem saldo negativo, com chave de idempotência |
| Alta | Esquema, grants e RLS não estão versionados nem foram inspecionados | Inspecionar banco restaurado em condição controlada; proteger tabelas e funções RPC; criar migrações e testar isolamento |
| Alta | SDK Mercado Pago legado e dependências sem lockfile | Atualizar conforme documentação, fixar versões e auditar dependências antes de publicar |
| Média | Erros internos enviados ao cliente; JSON e métodos sem validação consistente | Padronizar validação, limites, respostas e logs sem dados pessoais |
| Média | Compra de pacote pode substituir saldo ilimitado por saldo comum | Preservar benefício ilimitado no modelo de dados e na transação |

## Sequência de retomada

1. Acessar o projeto Netlify e verificar site vinculado, deploy ativo e nomes das variáveis (sem copiar segredos para chat/repositório).
2. Colocar backend antigo em manutenção antes de reativar o banco; preservar dados e configuração para recuperação.
3. Reativar Supabase, inspecionar esquema/RLS e preservar uma cópia recuperável antes de migrações.
4. Implementar autenticação, operações atômicas e pedidos/pagamentos idempotentes, com preservação dos saldos legítimos.
5. Testar login por e-mail, isolamento entre usuários, consumo concorrente, reenvio de webhook, pagamento inválido e benefícios premium.
6. Validar em preview com credenciais de teste; publicar depois da verificação completa.

## Referências técnicas

- https://supabase.com/docs/guides/auth/auth-email-passwordless
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://www.mercadopago.com.br/developers/en/docs/your-integrations/notifications/webhooks

## Validação local

Executar `npm test` e `npm run build` com Node.js. Esses comandos não exigem credenciais e não acessam banco/pagamentos. Não equivalem a testes de produção.
