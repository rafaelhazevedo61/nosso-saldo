import {getChatGPTUser} from '../../chatgpt-auth';
import {getDb} from '../../../db';
import {goals} from '../../../db/schema';
import {eq} from 'drizzle-orm';
import {z} from 'zod';
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>{const d=new Date(v+'T12:00:00Z');return !isNaN(+d)&&d.toISOString().slice(0,10)===v});
const shape=z.object({id:z.string().uuid(),name:z.string().trim().min(1).max(80),target:z.number().int().positive().max(10000000000),saved:z.number().int().min(0).max(10000000000),deadline:date.nullable()});
export async function GET(){if(!await getChatGPTUser())return Response.json({error:'Entre na sua conta.'},{status:401});return Response.json(await getDb().select().from(goals),{headers:{'Cache-Control':'no-store'}})}
export async function POST(req:Request){if(!await getChatGPTUser())return Response.json({error:'Entre na sua conta.'},{status:401});if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Origem inválida'},{status:403});const p=shape.safeParse(await req.json().catch(()=>null));if(!p.success)return Response.json({error:'Confira o nome, os valores e o prazo.'},{status:400});await getDb().insert(goals).values(p.data).onConflictDoUpdate({target:goals.id,set:{name:p.data.name,target:p.data.target,deadline:p.data.deadline}});return Response.json({ok:true})}
export async function DELETE(req:Request){if(!await getChatGPTUser())return Response.json({error:'Entre na sua conta.'},{status:401});if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Origem inválida'},{status:403});const p=z.string().uuid().safeParse(new URL(req.url).searchParams.get('id'));if(!p.success)return Response.json({error:'Meta inválida.'},{status:400});await getDb().delete(goals).where(eq(goals.id,p.data));return Response.json({ok:true})}
