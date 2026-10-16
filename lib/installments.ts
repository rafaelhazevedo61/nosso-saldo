import {monthOffset} from './credit';
export type InstallmentCharge={id:string;purchaseId:string;cardId:string;description:string;amount:number;date:string;invoice:string;installment:number;installments:number;person:string};
export type InvoicePayment={cardId:string;invoice:string};
export function installmentOverview(charges:InstallmentCharge[],payments:InvoicePayment[],start:string,count:number){
 const paidKeys=new Set(payments.map(p=>p.cardId+':'+p.invoice));const isPaid=(c:InstallmentCharge)=>paidKeys.has(c.cardId+':'+c.invoice);
 const installments=charges.filter(c=>c.installments>1);
 const monthly=Array.from({length:count},(_,i)=>{const month=monthOffset(start,i);const entries=installments.filter(c=>c.invoice===month);const total=entries.reduce((n,c)=>n+c.amount,0);const unpaid=entries.filter(c=>!isPaid(c)).reduce((n,c)=>n+c.amount,0);const byCard:Record<string,number>={};for(const c of entries)byCard[c.cardId]=(byCard[c.cardId]||0)+c.amount;return {month,total,unpaid,paid:total-unpaid,entries,byCard}});
 const groups=new Map<string,InstallmentCharge[]>();for(const c of installments){const list=groups.get(c.purchaseId)||[];list.push(c);groups.set(c.purchaseId,list)}
 const purchases=Array.from(groups.entries()).map(([id,list])=>{const entries=[...list].sort((a,b)=>a.installment-b.installment);const remaining=entries.filter(c=>!isPaid(c));return {id,entries,description:entries[0].description,cardId:entries[0].cardId,person:entries[0].person,date:entries[0].date,total:entries.reduce((n,c)=>n+c.amount,0),remaining:remaining.reduce((n,c)=>n+c.amount,0),paidCount:entries.length-remaining.length,count:entries.length,firstMonth:entries[0].invoice,lastMonth:entries.at(-1)!.invoice}}).sort((a,b)=>b.date.localeCompare(a.date)||a.description.localeCompare(b.description));
 return {monthly,purchases,outstanding:installments.filter(c=>!isPaid(c)).reduce((n,c)=>n+c.amount,0),beforePeriod:installments.filter(c=>c.invoice<start&&!isPaid(c)).reduce((n,c)=>n+c.amount,0),isPaid};
}
