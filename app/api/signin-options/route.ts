import {authEnvironment} from '@/app/player-auth';
import {providerOptions} from '@/lib/social-auth';
export const dynamic='force-dynamic';
export function GET(){return Response.json(providerOptions(authEnvironment()).map(({id,name,enabled})=>({id,name,enabled})),{headers:{'Cache-Control':'no-store'}});}
