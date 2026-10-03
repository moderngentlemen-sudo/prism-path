import {env} from 'cloudflare:workers';
import {headers} from 'next/headers';
import {getToken} from '@auth/core/jwt';
import {getChatGPTUser} from './chatgpt-auth';
import {sessionCookie,type AuthEnvironment} from '@/lib/social-auth';
export const authEnvironment=()=>env as unknown as AuthEnvironment;
export async function getPlayerUser(){
 const e=authEnvironment();
 if(e.AUTH_SECRET){try{const token=await getToken({req:{headers:await headers()},secret:e.AUTH_SECRET,salt:sessionCookie,cookieName:sessionCookie,secureCookie:true});
  if(typeof token?.playerId==='string'&&token.playerId.startsWith('oauth:')&&typeof token.provider==='string')return {userId:token.playerId,provider:token.provider};
 }catch{}}
 const user=await getChatGPTUser();return user?{userId:user.userId,provider:'chatgpt'}:null;
}
