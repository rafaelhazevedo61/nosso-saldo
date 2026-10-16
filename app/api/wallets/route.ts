import {getChatGPTUser} from '../../chatgpt-auth';
import {getDb} from '../../../db';
import {wallets} from '../../../db/schema';
import {env} from 'cloudflare:workers';
import {z} from 'zod';
const shape=z.object({id:z.union([z.literal('main'),z.string().uuid()]),name:z.string().trim().min(1).max(50),initialBalance:z.number().int().min(-10000000000).max(10000000000)});
export async function GET(){if(!await getChatGPTUser())return Response.json({error:'Entre na sua conta.'},{status:401});const all=await getDb().select().from(wallets);const list=all.filter(w=>!w.archived);return Response.json(all.some(w=>w.id==='main')?list:[{id:'main',name:'Carteira principal',initialBalance:0},...list],{headers:{'Cache-Control':'no-store'}})}
export async function POST(req:Request){if(!await getChatGPTUser())return Response.json({error:'Entre na sua conta.'},{status:401});if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Origem inválida'},{status:403});const p=shape.safeParse(await req.json().catch(()=>null));if(!p.success)return Response.json({error:'Confira os dados da carteira.'},{status:400});const w=p.data;const result=await env.DB!.prepare('INSERT INTO wallets (id,name,initial_balance,archived) VALUES (?,?,?,0) ON CONFLICT(id) DO UPDATE SET name=excluded.name,initial_balance=excluded.initial_balance WHERE wallets.archived=0').bind(w.id,w.name,w.initialBalance).run();if(!result.meta.changes)return Response.json({error:'Carteira excluída. Atualize a página.'},{status:409});return Response.json({ok:true})}

export async function DELETE(req:Request){
 if(!await getChatGPTUser())return Response.json({error:'Entre na sua conta.'},{status:401});
 if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Origem inválida'},{status:403});
 const id=new URL(req.url).searchParams.get('id');if(!id||!z.union([z.literal('main'),z.string().uuid()]).safeParse(id).success)return Response.json({error:'Carteira inválida.'},{status:400});
 const db=env.DB!;
 const result=id==='main'?await db.prepare("INSERT INTO wallets (id,name,initial_balance,archived) SELECT 'main','Carteira principal',0,1 WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE wallet_id='main') ON CONFLICT(id) DO UPDATE SET archived=1 WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE wallet_id='main') AND wallets.archived=0").run():await db.prepare('UPDATE wallets SET archived=1 WHERE id=? AND archived=0 AND NOT EXISTS (SELECT 1 FROM transactions WHERE wallet_id=?)').bind(id,id).run();
 if(!result.meta.changes)return Response.json({error:'Esta carteira possui lançamentos ou já foi excluída. Transfira os lançamentos para outra carteira pela opção Editar e tente novamente.'},{status:409});
 return Response.json({ok:true});
}
