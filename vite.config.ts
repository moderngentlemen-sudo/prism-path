import {defineConfig} from 'vite';
import vinext from 'vinext';
import tailwindcss from '@tailwindcss/postcss';
import {sites} from './build/sites-vite-plugin';
export default defineConfig(async()=>{
 process.env.CLOUDFLARE_CF_FETCH_ENABLED='false';process.env.WRANGLER_SEND_METRICS='false';
 const {cloudflare}=await import('@cloudflare/vite-plugin');
 return {server:{host:'0.0.0.0',allowedHosts:['terminal.local']},plugins:[vinext(),sites({mockAuth:false}),cloudflare({viteEnvironment:{name:'rsc',childEnvironments:['ssr']},inspectorPort:false,config:{main:'vinext/server/fetch-handler',compatibility_flags:['nodejs_compat'],d1_databases:[{binding:'DB',database_name:'prism-path-players',database_id:'00000000-0000-4000-8000-000000000000'}]}})],css:{postcss:{plugins:[tailwindcss()]}}};
});
