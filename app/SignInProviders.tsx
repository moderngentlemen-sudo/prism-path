'use client';
import {useEffect,useState} from 'react';
import './social.css';
export function SignInProviders(){
 const [providers,setProviders]=useState<{id:string;name:string;enabled:boolean}[]>([]),[csrf,setCsrf]=useState(''),[error,setError]=useState('');
 useEffect(()=>{let active=true;void fetch('/api/signin-options').then(r=>{if(!r.ok)throw Error();return r.json() as Promise<{id:string;name:string;enabled:boolean}[]>;}).then(async p=>{if(!active)return;setProviders(p);if(p.some((v:{enabled:boolean})=>v.enabled)){const r=await fetch('/api/auth/csrf');if(!r.ok)throw Error();const d=await r.json() as {csrfToken?:string};if(active)setCsrf(d.csrfToken||'');}}).catch(()=>{if(active)setError('Additional sign-in options could not load. ChatGPT sign-in is still available.');});return()=>{active=false;};},[]);
 return <div className="social-signin"><a className="primary-button" href="/signin-with-chatgpt?return_to=%2F%3Faccount%3D1" target="_top">Continue with ChatGPT</a>{providers.map(p=><form key={p.id} action={`/api/auth/signin/${p.id}`} method="POST" target="_top"><input type="hidden" name="csrfToken" value={csrf}/><input type="hidden" name="callbackUrl" value="/?account=1"/><button className="social-button" disabled={!p.enabled||!csrf}>Continue with {p.name}{!p.enabled&&<small>Not available yet</small>}</button></form>)}{providers.some(p=>!p.enabled)&&<p>More sign-in choices are being prepared. Use ChatGPT for now.</p>}<p>Use the same sign-in provider each time to return to the same player account.</p>{error&&<p role="status">{error}</p>}</div>;
}
