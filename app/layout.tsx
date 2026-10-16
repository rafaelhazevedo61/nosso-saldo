import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Nosso Saldo · Finanças a dois',description:'Receitas e despesas do casal em um só lugar.',icons:{icon:[{url:'/nosso-saldo-icon-v2-192.png',type:'image/png',sizes:'192x192'},{url:'/nosso-saldo-logo-v2.svg',type:'image/svg+xml'}],shortcut:'/nosso-saldo-icon-v2-192.png',apple:'/nosso-saldo-apple-v2.png'},appleWebApp:{capable:true,title:'Nosso Saldo',statusBarStyle:'default'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><head><link rel="manifest" href="/manifest.webmanifest" crossOrigin="use-credentials"/><meta name="theme-color" content="#326856"/></head><body>{children}</body></html>}
