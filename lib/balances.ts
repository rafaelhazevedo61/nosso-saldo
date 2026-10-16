export type WalletRecord={id:string;name:string;initialBalance:number};
export function walletBalances(wallets:WalletRecord[],entries:{walletId:string;type:string;amount:number}[]){return wallets.map(w=>({...w,balance:entries.filter(e=>e.walletId===w.id).reduce((sum,e)=>sum+(e.type==='income'?e.amount:-e.amount),w.initialBalance)}))}
