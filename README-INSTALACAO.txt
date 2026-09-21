NIHIL - MVP COMERCIAL
=====================

ARQUIVOS
- index.html: pré-site público
- login.html: autenticação por e-mail/senha
- portal.html: valida plano e libera os atos
- ato1.html: ATO 1 original com proteção de autenticação/assinatura adicionada
- ato2.html: placeholder protegido do ATO 2
- firebase-config.js: configuração Firebase compartilhada pelo portal
- site.css: identidade visual do pré-site/portal
- database.rules.json: regras sugeridas do Realtime Database

1) FIREBASE AUTHENTICATION
No Firebase Console > Authentication > Sign-in method, habilite Email/Password.
Crie manualmente cada usuário em Authentication > Users.
Copie o UID gerado para o usuário.

2) REALTIME DATABASE - CADASTRO MANUAL
Crie a estrutura abaixo usando o UID do Authentication:

usuarios
  UID_DO_USUARIO
    email: "cliente@email.com"
    nome: "Cliente"
    plano: "iniciante"
    ativo: true
    bloqueado: false
    validade: "2026-10-21"

Planos aceitos:
- iniciante: ATO 1
- experiente: ATO 1 + ATO 2

Para bloquear imediatamente:
bloqueado = true

Para reativar:
bloqueado = false
ativo = true

3) REGRAS
Revise database.rules.json antes de publicar. O bloco usuarios permite que cada usuário autenticado leia apenas o próprio cadastro e não o altere.

IMPORTANTE: o ATO 1 atual ainda usa vários caminhos globais (tokens, status, mapa_atual etc.). As regras incluídas mantêm compatibilidade com o jogo atual. Para vender para várias mesas simultâneas, a próxima etapa deve mover TODO o estado para campanhas/{idCampanha}/ato1/... e autorizar somente membros daquela campanha.

4) ASSETS
Mantenha a pasta ./assets ao lado de ato1.html, exatamente como no projeto atual, pois o ATO 1 referencia esses caminhos.

5) TESTE
Sirva a pasta por HTTP/HTTPS. Não abra apenas com file://.
Exemplo no VS Code: Live Server.

Fluxo:
index.html -> login.html -> portal.html -> ato1.html


============================================================
ATUALIZAÇÃO V2 — CAMPANHAS ISOLADAS + COMPATIBILIDADE LEGADA
============================================================

1. O modo legado foi preservado.
   - Abrir ato1.html SEM parâmetro ?campanha= continua usando os caminhos antigos:
     tokens/, status/, mapa_atual, imagem_ativa, inimigo_ativo, rolagens/, musica, etc.
   - Isso permite continuar as campanhas antigas sem migração imediata.

2. Campanhas novas são criadas pelo Portal do Jogador.
   - Cada campanha recebe um ID único do Firebase.
   - O acesso ocorre por ato1.html?campanha=ID_DA_CAMPANHA
   - O estado passa a ser salvo em campanhas/ID_DA_CAMPANHA/ato1/...

3. Estrutura de uma campanha nova:
   campanhas/{campanhaId}/meta
      nome
      ownerUid
      ativa
      criadaEm
      membros/{uid}: true
   campanhas/{campanhaId}/ato1/tokens
   campanhas/{campanhaId}/ato1/status
   campanhas/{campanhaId}/ato1/mapa_atual
   campanhas/{campanhaId}/ato1/rolagens
   campanhas/{campanhaId}/ato1/musica
   ...

4. IMPORTANTE: publique também o novo database.rules.json no Realtime Database.
   As regras mantêm os nós legados autenticados e adicionam isolamento para campanhas novas.

5. Não apague os nós globais antigos enquanto houver campanhas legadas em andamento.
