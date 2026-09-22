const {onCall,HttpsError}=require("firebase-functions/v2/https");
const {initializeApp}=require("firebase-admin/app");
const {getAuth}=require("firebase-admin/auth");
const {getDatabase}=require("firebase-admin/database");
initializeApp();

exports.criarUsuarioAssinante=onCall(async(request)=>{
  if(!request.auth) throw new HttpsError("unauthenticated","Faça login para continuar.");
  const db=getDatabase();
  const adminSnap=await db.ref(`usuarios/${request.auth.uid}`).get();
  const adminPerfil=adminSnap.val();
  if(!adminPerfil || (adminPerfil.role!=="admin" && adminPerfil.admin!==true)){
    throw new HttpsError("permission-denied","Somente administradores podem criar usuários.");
  }
  const d=request.data||{};
  const nome=String(d.nome||"").trim();
  const email=String(d.email||"").trim().toLowerCase();
  const password=String(d.password||"");
  const plano=String(d.plano||"");
  const validade=String(d.validade||"");
  const ativo=d.ativo!==false;
  if(!nome || !email || password.length<6) throw new HttpsError("invalid-argument","Nome, e-mail e senha de pelo menos 6 caracteres são obrigatórios.");
  if(!["iniciante","experiente"].includes(plano)) throw new HttpsError("invalid-argument","Plano inválido.");
  if(!/^\d{4}-\d{2}-\d{2}$/.test(validade)) throw new HttpsError("invalid-argument","Validade inválida.");
  let userRecord;
  try{
    userRecord=await getAuth().createUser({email,password,displayName:nome,disabled:false});
    await db.ref(`usuarios/${userRecord.uid}`).set({email,nome,plano,ativo,bloqueado:false,validade,role:"user",criadoEm:Date.now(),criadoPor:request.auth.uid});
    return {ok:true,uid:userRecord.uid,email};
  }catch(err){
    if(userRecord?.uid){try{await getAuth().deleteUser(userRecord.uid)}catch(_){}}
    if(err.code==="auth/email-already-exists") throw new HttpsError("already-exists","Já existe uma conta com este e-mail.");
    console.error(err);throw new HttpsError("internal","Não foi possível criar a conta.");
  }
});


async function exigirAdmin(request){
  if(!request.auth) throw new HttpsError("unauthenticated","Faça login para continuar.");
  const db=getDatabase();
  const snap=await db.ref(`usuarios/${request.auth.uid}`).get();
  const perfil=snap.val();
  if(!perfil || (perfil.role!=="admin" && perfil.admin!==true)) throw new HttpsError("permission-denied","Somente administradores podem executar esta ação.");
  return {db,perfil};
}

exports.listarAssinantes=onCall(async(request)=>{
  const {db}=await exigirAdmin(request);
  const snap=await db.ref('usuarios').get();
  const dados=snap.val()||{};
  const usuarios=Object.entries(dados).map(([uid,p])=>({uid,email:p.email||'',nome:p.nome||'',plano:p.plano||'',ativo:p.ativo===true,bloqueado:p.bloqueado===true,validade:p.validade||'',role:p.role||'user'}));
  usuarios.sort((a,b)=>(a.nome||a.email).localeCompare(b.nome||b.email,'pt-BR'));
  return {usuarios};
});

exports.atualizarAssinante=onCall(async(request)=>{
  const {db}=await exigirAdmin(request);
  const d=request.data||{}; const uid=String(d.uid||'').trim();
  if(!uid) throw new HttpsError('invalid-argument','UID obrigatório.');
  if(uid===request.auth.uid && (d.bloqueado===true || d.ativo===false)) throw new HttpsError('failed-precondition','O administrador não pode bloquear ou desativar a própria conta por este painel.');
  const atual=(await db.ref(`usuarios/${uid}`).get()).val();
  if(!atual) throw new HttpsError('not-found','Usuário não encontrado.');
  const nome=String(d.nome??atual.nome??'').trim(); const plano=String(d.plano??atual.plano??''); const validade=String(d.validade??atual.validade??'');
  const ativo=d.ativo===true; const bloqueado=d.bloqueado===true;
  if(!nome) throw new HttpsError('invalid-argument','Nome obrigatório.');
  if(!['iniciante','experiente'].includes(plano) && atual.role!=='admin') throw new HttpsError('invalid-argument','Plano inválido.');
  if(validade && !/^\d{4}-\d{2}-\d{2}$/.test(validade)) throw new HttpsError('invalid-argument','Validade inválida.');
  await db.ref(`usuarios/${uid}`).update({nome,plano,validade,ativo,bloqueado,atualizadoEm:Date.now(),atualizadoPor:request.auth.uid});
  try{await getAuth().updateUser(uid,{displayName:nome,disabled:(!ativo||bloqueado)});}catch(err){console.error('Falha ao sincronizar Authentication',err);throw new HttpsError('internal','Perfil atualizado no banco, mas houve falha ao sincronizar o Authentication.');}
  return {ok:true};
});
