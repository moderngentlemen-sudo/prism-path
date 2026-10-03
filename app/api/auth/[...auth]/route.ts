import {Auth} from '@auth/core';
import {authEnvironment} from '@/app/player-auth';
import {authConfig,authOrigin,providerOptions} from '@/lib/social-auth';
export const dynamic='force-dynamic';
async function handle(request:Request){
 const e=authEnvironment(),origin=authOrigin(e);
 if(!origin||!providerOptions(e).some(p=>p.enabled))return Response.json({error:'Additional sign-in providers are not available yet.'},{status:503,headers:{'Cache-Control':'no-store'}});
 if(new URL(request.url).origin!==origin)return new Response('Invalid sign-in origin',{status:400});
 const h=new Headers(request.headers);h.delete('x-forwarded-host');h.delete('x-forwarded-proto');h.set('host',new URL(origin).host);
 const response=await Auth(new Request(request,{headers:h}),authConfig(e));
 response.headers.set('Cache-Control','private, no-store');return response;
}
export const GET=handle;
export const POST=handle;
