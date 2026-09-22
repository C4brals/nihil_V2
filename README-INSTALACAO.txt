NIHIL COMERCIAL MVP V5.1 - MODO HIBRIDO SPARK
================================================

Esta versão foi adaptada para funcionar sem Cloud Functions/Blaze.
A criação da credencial (email/senha) continua manual em Authentication. Depois disso, todo o perfil comercial é cadastrado e gerenciado pelo painel ADMIN do Portal usando o UID.

PASSO OBRIGATORIO: publique database.rules.json desta versão antes de usar a área administrativa.

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


============================================================
ATUALIZAÇÃO V3 — CONVITES + ASSINATURA OBRIGATÓRIA
============================================================

1. O Mestre cria uma campanha nova no Portal.
2. O sistema gera um código no formato ID_DA_CAMPANHA.SEGREDO.
3. O Mestre usa “Convidar jogadores” e compartilha o código.
4. O convidado precisa possuir conta própria no Firebase Authentication e cadastro em usuarios/{uid}.
5. O Portal valida ativo=true, bloqueado=false, validade e plano antes de tentar a entrada.
6. As Rules também exigem ativo=true, bloqueado!=true e plano iniciante/experiente para gravar a associação de membro.
7. Ao entrar, o usuário é registrado em campanhas/{id}/meta/membros/{uid} e campanhasPorUsuario/{uid}/{id}.
8. O modo legado permanece intacto.

IMPORTANTE SOBRE VALIDADE:
A data validade (YYYY-MM-DD) é validada pelo Portal/ATO. As Rules do Realtime Database incluídas reforçam ativo, bloqueado e plano. Para validação de expiração totalmente server-side, a evolução recomendada é gravar também validadeTs (timestamp) por backend/Admin SDK e comparar com now nas Rules.

MIGRAÇÃO DE CAMPANHAS V2 JÁ CRIADAS:
Campanhas criadas na V2 podem não ter inviteSecret nem índice campanhasPorUsuario. Elas continuam acessíveis diretamente pela URL já existente. Para habilitar convites nelas, crie inviteSecret em meta e campanhasPorUsuario/{ownerUid}/{campanhaId}=true, ou crie uma nova campanha pela V3.


============================================================
V4 - ÁREA ADMINISTRATIVA E CADASTRO DE ASSINANTES
============================================================

O Portal identifica administradores pelo campo usuarios/UID/role = "admin".
Para contas administrativas, aparece a seção "Administração de usuários".

O formulário cria, em uma única operação segura:
- conta no Firebase Authentication;
- registro usuarios/UID no Realtime Database;
- plano iniciante ou experiente;
- ativo/bloqueado;
- validade;
- role=user.

A criação usa a Cloud Function criarUsuarioAssinante, incluída em functions/index.js.
Ela valida novamente no servidor se quem fez a chamada é administrador.

Consulte CONFIGURAR-ADMIN.txt para ativar o primeiro administrador e implantar a função.


V5: area administrativa ampliada com listagem, busca, alteracao de plano, renovacao de validade, bloqueio/desbloqueio e ativacao/desativacao de assinantes. Reimplante as Cloud Functions apos atualizar.
