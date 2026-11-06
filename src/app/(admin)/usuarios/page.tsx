"use client";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Usuario = { id: number | string; nome: string; email: string; cpf: string; telefone: string; nascimento: string; cep: string; logradouro: string; numero: string; complemento: string; bairro: string; cidade: string; estado: string; senha?: string };
type Formulario = Omit<Usuario, "id" | "senha"> & { senha: string; confirmarSenha: string };
const vazio: Formulario = { nome:"", email:"", cpf:"", telefone:"", nascimento:"", cep:"", logradouro:"", numero:"", complemento:"", bairro:"", cidade:"", estado:"", senha:"", confirmarSenha:"" };
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const digitos = (v:string) => v.replace(/\D/g, "");
const cpfMask = (v:string) => digitos(v).slice(0,11).replace(/^(\d{3})(\d)/,"$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/,"$1.$2.$3").replace(/\.(\d{3})(\d)/,".$1-$2");
const cepMask = (v:string) => digitos(v).slice(0,8).replace(/^(\d{5})(\d)/,"$1-$2");
const telMask = (v:string) => { const d=digitos(v).slice(0,11); if(!d)return ""; if(d.length<=2)return `(${d}`; const n=d.length>10?5:4;return `(${d.slice(0,2)}) ${d.slice(2,2+n)}${d.length>2+n?"-"+d.slice(2+n):""}`; };
const dataMask = (v:string) => digitos(v).slice(0,8).replace(/^(\d{2})(\d)/,"$1/$2").replace(/^(\d{2})\/(\d{2})(\d)/,"$1/$2/$3");
function cpfValido(v:string) { const d=digitos(v); if(d.length!==11 || /^(\d)\1{10}$/.test(d))return false; for(let t=9;t<11;t++){const s=[...d.slice(0,t)].reduce((a,c,i)=>a+Number(c)*(t+1-i),0);if((s*10)%11%10!==Number(d[t]))return false;}return true; }
function dataValida(v:string) {if(!/^\d{2}\/\d{2}\/\d{4}$/.test(v))return false;const [d,m,a]=v.split("/").map(Number);const x=new Date(a,m-1,d);return a>=1900 && x.getFullYear()===a && x.getMonth()===m-1 && x.getDate()===d && x<=new Date();}
async function api(path:string,options?:RequestInit) {const r=await fetch(`${API}${path}`,{...options,headers:{"Content-Type":"application/json",...options?.headers},cache:"no-store"});if(!r.ok)throw new Error(`Erro ${r.status}: confira se o JSON Server está funcionando.`);return r.status===204?null:r.json();}
async function senhaHash(v:string) {const hash=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(v));return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,"0")).join("");}

export default function Usuarios() {
 const router=useRouter();
 async function sair(){await fetch("/api/logout",{method:"POST"});router.replace("/login");router.refresh();}
 const [usuarios,setUsuarios]=useState<Usuario[]>([]),[form,setForm]=useState<Formulario>(vazio),[editando,setEditando]=useState<Usuario|null>(null);
 const [aberto,setAberto]=useState(false),[busca,setBusca]=useState(""),[carregando,setCarregando]=useState(true),[salvando,setSalvando]=useState(false),[erro,setErro]=useState(""),[sucesso,setSucesso]=useState("");
 const carregar=useCallback(async()=>{try{const dados=await api("/usuarios");setUsuarios(Array.isArray(dados)?dados:[]);setErro("");}catch(e){setErro(e instanceof Error?e.message:"Falha ao carregar usuários.");}finally{setCarregando(false);}},[]);
 useEffect(()=>{void Promise.resolve().then(carregar);},[carregar]);
 const filtrados=useMemo(()=>usuarios.filter(u=>`${u.nome} ${u.email} ${u.cpf}`.toLowerCase().includes(busca.toLowerCase())),[usuarios,busca]);
 function alterar(campo:keyof Formulario,v:string){const masks:Partial<Record<keyof Formulario,(v:string)=>string>>={cpf:cpfMask,cep:cepMask,telefone:telMask,nascimento:dataMask};setForm(f=>({...f,[campo]:masks[campo]?.(v)??v}));}
 function novo(){setForm(vazio);setEditando(null);setErro("");setSucesso("");setAberto(true);}
 function editar(u:Usuario){setEditando(u);setForm({nome:u.nome,email:u.email,cpf:u.cpf,telefone:u.telefone,nascimento:u.nascimento,cep:u.cep,logradouro:u.logradouro,numero:u.numero,complemento:u.complemento||"",bairro:u.bairro,cidade:u.cidade,estado:u.estado,senha:"",confirmarSenha:""});setErro("");setSucesso("");setAberto(true);window.scrollTo({top:0,behavior:"smooth"});}
 async function salvar(e:FormEvent<HTMLFormElement>){e.preventDefault();setErro("");setSucesso("");
  if(!cpfValido(form.cpf))return setErro("Informe um CPF válido.");
  if(digitos(form.telefone).length<10)return setErro("Informe um telefone válido com DDD.");
  if(!dataValida(form.nascimento))return setErro("Data de nascimento inválida (DD/MM/AAAA).");
  if(digitos(form.cep).length!==8)return setErro("O CEP deve ter 8 números.");
  if(!/^[A-Za-z]{2}$/.test(form.estado))return setErro("Informe a UF com 2 letras.");
  if((!editando||form.senha.length>0)&&form.senha.length<6)return setErro("A senha precisa ter pelo menos 6 caracteres.");
  if(form.senha!==form.confirmarSenha)return setErro("As senhas não conferem.");
  if(usuarios.some(u=>u.id!==editando?.id&&digitos(u.cpf)===digitos(form.cpf)))return setErro("CPF já cadastrado.");
  if(usuarios.some(u=>u.id!==editando?.id&&u.email.toLowerCase()===form.email.toLowerCase()))return setErro("E-mail já cadastrado.");
  setSalvando(true);try{const {senha,confirmarSenha,...campos}=form;void confirmarSenha;const payload:Record<string,string>={...campos,estado:campos.estado.toUpperCase()};if(senha)payload.senha=await senhaHash(senha);
   await api(editando?`/usuarios/${editando.id}`:"/usuarios",{method:editando?"PATCH":"POST",body:JSON.stringify(payload)});
   setAberto(false);setForm(vazio);setEditando(null);setSucesso(editando?"Usuário atualizado com sucesso!":"Usuário cadastrado com sucesso!");await carregar();
  }catch(e){setErro(e instanceof Error?e.message:"Falha ao salvar usuário.");}finally{setSalvando(false);}}
 async function excluir(u:Usuario){if(!window.confirm(`Excluir ${u.nome}? Esta ação não pode ser desfeita.`))return;setErro("");setSucesso("");try{await api(`/usuarios/${u.id}`,{method:"DELETE"});setSucesso("Usuário excluído com sucesso!");await carregar();}catch(e){setErro(e instanceof Error?e.message:"Falha ao excluir usuário.");}}
 return <main className="app-shell"><aside className="sidebar"><div className="brand">Bancos<span>Regulados</span></div><div className="nav-item active">Usuários</div><button className="secondary-button logout-button" onClick={()=>void sair()}>Sair</button></aside>
  <section className="content"><div className="page-inner">
   <div className="heading-row"><div><h1>Usuários</h1><p>Cadastre, consulte e edite os usuários.</p></div><button className="primary-button" onClick={novo}>Novo usuário</button></div>
   
   {sucesso&&<div className="alert success" role="status">{sucesso}</div>}{erro&&!aberto&&<div className="alert error" role="alert">{erro}</div>}
   {aberto&&<section className="panel form-panel"><div className="panel-heading"><div><h2>{editando?"Editar usuário":"Cadastrar usuário"}</h2><p>Campos com * são obrigatórios</p></div><button className="icon-button" aria-label="Fechar formulário" onClick={()=>{setAberto(false);setErro("");}}>Fechar</button></div><form onSubmit={salvar}>
    <div className="section-title">Dados pessoais</div><div className="form-grid">
     <Campo titulo="Nome completo" valor={form.nome} alterar={v=>alterar("nome",v)} placeholder="Ex.: Maria Oliveira" requerido largo/>
     <Campo titulo="E-mail" tipo="email" valor={form.email} alterar={v=>alterar("email",v)} placeholder="nome@exemplo.com" requerido/>
     <Campo titulo="CPF" valor={form.cpf} alterar={v=>alterar("cpf",v)} placeholder="000.000.000-00" max={14} requerido/>
     <Campo titulo="Telefone" valor={form.telefone} alterar={v=>alterar("telefone",v)} placeholder="(00) 00000-0000" max={15} requerido/>
     <Campo titulo="Data de nascimento" valor={form.nascimento} alterar={v=>alterar("nascimento",v)} placeholder="DD/MM/AAAA" max={10} requerido/>
    </div><div className="section-title">Endereço</div><div className="form-grid">
     <Campo titulo="CEP" valor={form.cep} alterar={v=>alterar("cep",v)} placeholder="00000-000" max={9} requerido/>
     <Campo titulo="Logradouro" valor={form.logradouro} alterar={v=>alterar("logradouro",v)} placeholder="Rua, avenida..." requerido/>
     <Campo titulo="Número" valor={form.numero} alterar={v=>alterar("numero",v)} placeholder="123" requerido/>
     <Campo titulo="Complemento" valor={form.complemento} alterar={v=>alterar("complemento",v)} placeholder="Opcional"/>
     <Campo titulo="Bairro" valor={form.bairro} alterar={v=>alterar("bairro",v)} placeholder="Centro" requerido/>
     <Campo titulo="Cidade" valor={form.cidade} alterar={v=>alterar("cidade",v)} placeholder="Sua cidade" requerido/>
     <Campo titulo="Estado (UF)" valor={form.estado} alterar={v=>alterar("estado",v.toUpperCase().replace(/[^A-Z]/g,""))} placeholder="PR" max={2} requerido/>
    </div><div className="section-title">Senha</div><div className="form-grid">
     <Campo titulo={editando?"Nova senha (em branco para manter)":"Senha"} tipo="password" valor={form.senha} alterar={v=>alterar("senha",v)} placeholder="Mínimo de 6 caracteres" requerido={!editando}/>
     <Campo titulo="Confirmar senha" tipo="password" valor={form.confirmarSenha} alterar={v=>alterar("confirmarSenha",v)} placeholder="Repita a senha" requerido={!editando||!!form.senha}/>
    </div>{erro&&<div className="alert error" role="alert" style={{marginTop:24,marginBottom:0}}>{erro}</div>}<div className="form-actions"><button type="button" className="secondary-button" onClick={()=>{setAberto(false);setErro("");}}>Cancelar</button><button type="submit" className="primary-button" disabled={salvando}>{salvando?"Salvando...":editando?"Salvar alterações":"Cadastrar usuário"}</button></div>
   </form></section>}
   <section className="panel"><div className="panel-heading list-heading"><div><h2>Lista de usuários <span className="count">{filtrados.length}</span></h2></div><label className="search"><input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar por nome, e-mail ou CPF" aria-label="Buscar usuários"/></label></div>
   <div className="table-scroll"><table><thead><tr><th>Usuário</th><th>CPF</th><th>Telefone</th><th>Cidade / UF</th><th>Ações</th></tr></thead><tbody>{filtrados.map(u=><tr key={u.id}><td><div className="person"><div><strong>{u.nome}</strong><small>{u.email}</small></div></div></td><td>{u.cpf}</td><td>{u.telefone}</td><td>{u.cidade} / {u.estado}</td><td><div className="action-buttons"><button className="edit-button" onClick={()=>editar(u)}>Editar</button><button className="delete-button" onClick={()=>void excluir(u)}>Excluir</button></div></td></tr>)}</tbody></table></div>
   {!carregando&&filtrados.length===0&&<div className="empty-state"><strong>{busca?"Nenhum resultado encontrado":"Nenhum usuário cadastrado"}</strong><p>{busca?"Tente outra pesquisa.":"Clique em Novo usuário para adicionar o primeiro registro."}</p></div>}{carregando&&<div className="empty-state">Carregando usuários...</div>}
   </section>
  </div></section></main>;
}
function Campo({titulo,valor,alterar,placeholder,requerido=false,largo=false,tipo="text",max}:{titulo:string;valor:string;alterar:(v:string)=>void;placeholder:string;requerido?:boolean;largo?:boolean;tipo?:string;max?:number}){
 return <label className={`field ${largo?"field-wide":""}`}><span>{titulo} {requerido&&<em>*</em>}</span><input type={tipo} value={valor} onChange={e=>alterar(e.target.value)} placeholder={placeholder} required={requerido} maxLength={max} autoComplete="off"/></label>;
}
