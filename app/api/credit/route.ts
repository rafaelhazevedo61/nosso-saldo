import {getChatGPTUser} from '../../chatgpt-auth';
import {getDb} from '../../../db';
import {creditCards,creditCharges,creditPayments} from '../../../db/schema';
import {env} from 'cloudflare:workers';
import {eq} from 'drizzle-orm';
import {z} from 'zod';
import {firstInvoice,splitPurchase} from '../../../lib/credit';
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>{const d=new Date(v+'T12:00:00Z');return !isNaN(+d)&&d.toISOString().slice(0,10)===v});
const month=z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);
const money=z.number().int().positive().max(10000000000);
const shape=z.discriminatedUnion('kind',[
 z.object({kind:z.literal('card'),id:z.string().uuid(),name:z.string().trim().min(1).max(60),limit:money,closingDay:z.number().int().min(1).max(31)}),
 z.object({kind:z.literal('purchase'),cardId:z.string().uuid(),description:z.string().trim().min(1).max(120),amount:money,date,installments:z.number().int().min(1).max(120),person:z.enum(['Rafael','Jéssica','Casal']),firstMonth:month.optional()}),
 z.object({kind:z.literal('payment'),cardId:z.string().uuid(),invoice:month,paid:z.boolean()})
]);
export async function GET(){if(!await getChatGPTUser())return Response.json({error:'Entre na sua conta.'},{status:401});const db=getDb();const [cards,charges,payments]=await Promise.all([db.select().from(creditCards),db.select().from(creditCharges),db.select().from(creditPayments)]);return Response.json({cards,charges,payments},{headers:{'Cache-Control':'no-store'}})}
export async function POST(req:Request){if(!await getChatGPTUser())return Response.json({error:'Entre na sua conta.'},{status:401});if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Origem inválida'},{status:403});const parsed=shape.safeParse(await req.json().catch(()=>null));if(!parsed.success)return Response.json({error:'Confira os valores, datas e dados informados.'},{status:400});const p=parsed.data;const db=getDb();if(p.kind==='card'){await db.insert(creditCards).values({id:p.id,name:p.name,limit:p.limit,closingDay:p.closingDay}).onConflictDoUpdate({target:creditCards.id,set:{name:p.name,limit:p.limit,closingDay:p.closingDay}});return Response.json({ok:true})}
const [card]=await db.select().from(creditCards).where(eq(creditCards.id,p.cardId));if(!card)return Response.json({error:'Cartão não encontrado.'},{status:404});
if(p.kind==='payment'){const id=p.cardId+':'+p.invoice;if(p.paid)await db.insert(creditPayments).values({id,cardId:p.cardId,invoice:p.invoice}).onConflictDoNothing();else await db.delete(creditPayments).where(eq(creditPayments.id,id));return Response.json({ok:true})}
if(p.amount<p.installments)return Response.json({error:'O valor deve permitir parcelas de pelo menos R$ 0,01.'},{status:400});const purchaseId=crypto.randomUUID(),parts=splitPurchase(p.amount,p.installments,p.firstMonth||firstInvoice(p.date,card.closingDay));
await env.DB!.batch([...parts.map(part=>env.DB!.prepare('INSERT INTO credit_charges (id,purchase_id,card_id,description,amount,date,invoice,installment,installments,person) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(crypto.randomUUID(),purchaseId,p.cardId,p.description,part.amount,p.date,part.invoice,part.installment,part.installments,p.person)),...parts.map(part=>env.DB!.prepare('DELETE FROM credit_payments WHERE card_id=? AND invoice=?').bind(p.cardId,part.invoice))]);
return Response.json({ok:true});
}
export async function DELETE(req:Request){if(!await getChatGPTUser())return Response.json({error:'Entre na sua conta.'},{status:401});if(req.headers.get('origin')!==new URL(req.url).origin)return Response.json({error:'Origem inválida'},{status:403});const id=z.string().uuid().safeParse(new URL(req.url).searchParams.get('purchaseId'));if(!id.success)return Response.json({error:'Compra inválida.'},{status:400});await getDb().delete(creditCharges).where(eq(creditCharges.purchaseId,id.data));return Response.json({ok:true})}
