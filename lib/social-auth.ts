import type {AuthConfig} from '@auth/core';
import Apple from '@auth/core/providers/apple';
import Google from '@auth/core/providers/google';
import Microsoft from '@auth/core/providers/microsoft-entra-id';
import Discord from '@auth/core/providers/discord';
export type AuthEnvironment=Record<string,string|undefined>;
export const sessionCookie='__Secure-prism.session-token';
export const socialProviders=[{id:'apple',name:'Apple',key:'APPLE'},{id:'google',name:'Google',key:'GOOGLE'},{id:'microsoft-entra-id',name:'Microsoft',key:'MICROSOFT'},{id:'discord',name:'Discord',key:'DISCORD'}] as const;
export function authOrigin(e:AuthEnvironment){try{const u=new URL(e.AUTH_ORIGIN||'');return u.protocol==='https:'&&u.pathname==='/'&&!u.username&&!u.password&&!u.search&&!u.hash?u.origin:null;}catch{return null;}}
export function providerOptions(e:AuthEnvironment){return socialProviders.map(p=>({...p,enabled:!!(authOrigin(e)&&e.AUTH_SECRET&&e.AUTH_SECRET.length>=32&&e[`AUTH_${p.key}_ID`]&&e[`AUTH_${p.key}_SECRET`])}));}
export function socialIdentity(provider:string,subject:string){if(!socialProviders.some(p=>p.id===provider)||!subject||subject.length>512)throw Error('Invalid identity');return `oauth:${provider}:${subject}`;}
export function authConfig(e:AuthEnvironment):AuthConfig{
 const origin=authOrigin(e);if(!origin)throw Error('Sign-in origin is not configured');
 const active=providerOptions(e).filter(p=>p.enabled);
 return {basePath:'/api/auth',secret:e.AUTH_SECRET,trustHost:true,useSecureCookies:true,
  session:{strategy:'jwt',maxAge:60*60*24*7},cookies:{sessionToken:{name:sessionCookie,options:{httpOnly:true,sameSite:'lax',path:'/',secure:true}}},
  providers:active.map(p=>{const options={clientId:e[`AUTH_${p.key}_ID`]!,clientSecret:e[`AUTH_${p.key}_SECRET`]!};return p.id==='apple'?Apple(options):p.id==='google'?Google(options):p.id==='discord'?Discord(options):Microsoft({...options,issuer:'https://login.microsoftonline.com/common/v2.0'});}),
  callbacks:{
   jwt:async({token,account})=>{if(account){token.playerId=socialIdentity(account.provider,account.providerAccountId);token.provider=account.provider;}return token;},
   session:async({session,token})=>{session.user.id=typeof token.playerId==='string'?token.playerId:'';return session;},
   redirect:async({url})=>{try{const target=new URL(url,origin);return target.origin===origin?target.href:origin+'/?account=1';}catch{return origin+'/?account=1';}}
  },theme:{colorScheme:'dark',brandColor:'#c5f17c'},
  // Never put token responses, credentials, or user profiles into logs.
  logger:{error:()=>console.error('External sign-in failed'),warn:()=>{},debug:()=>{}}
 };
}
