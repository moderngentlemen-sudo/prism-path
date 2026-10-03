import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Auth} from '@auth/core';
import {encode,getToken} from '@auth/core/jwt';
import {authConfig,providerOptions,authOrigin,socialIdentity,sessionCookie} from '../lib/social-auth.ts';
const e={AUTH_ORIGIN:'https://example.test',AUTH_SECRET:'test-only-secret-32-characters-long',AUTH_GOOGLE_ID:'test-google',AUTH_GOOGLE_SECRET:'test-google-secret'};
test('Provider readiness never exposes a half-configured sign-in',()=>{
 assert.ok(providerOptions({}).every(p=>!p.enabled));assert.equal(providerOptions(e).filter(p=>p.enabled).length,1);assert.equal(authOrigin({...e,AUTH_ORIGIN:'http://example.test'}),null);assert.ok(providerOptions({...e,AUTH_SECRET:'short'}).every(p=>!p.enabled));
 assert.notEqual(socialIdentity('google','123'),socialIdentity('apple','123'));assert.throws(()=>socialIdentity('fake','123'));
});
test('Social sessions require authenticated encryption with the correct secret and cookie',async()=>{
 const token=await encode({token:{playerId:socialIdentity('google','123'),provider:'google'},secret:e.AUTH_SECRET,salt:sessionCookie,maxAge:60});
 const req={headers:new Headers({cookie:`${sessionCookie}=${token}`})};
 assert.equal((await getToken({req,secret:e.AUTH_SECRET,salt:sessionCookie,cookieName:sessionCookie}))?.playerId,'oauth:google:123');
 assert.equal(await getToken({req,secret:'wrong-secret',salt:sessionCookie,cookieName:sessionCookie}),null);
 assert.equal(await getToken({req:{headers:new Headers()},secret:e.AUTH_SECRET,salt:sessionCookie,cookieName:sessionCookie}),null);
});
test('Auth endpoint emits secure CSRF cookies and rejects a forged sign-in request',async()=>{
 const cfg=authConfig(e);const csrf=await Auth(new Request(e.AUTH_ORIGIN+'/api/auth/csrf'),cfg);assert.equal(csrf.status,200);assert.ok((await csrf.json() as {csrfToken:string}).csrfToken);assert.match(csrf.headers.get('set-cookie')||'',/HttpOnly/);assert.match(csrf.headers.get('set-cookie')||'',/Secure/);
 const forged=await Auth(new Request(e.AUTH_ORIGIN+'/api/auth/signin/google',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'csrfToken=fake'}),cfg);assert.ok(forged.status>=300);assert.ok(!forged.headers.get('location')?.startsWith('https://accounts.google.com'));
 const redirect=cfg.callbacks!.redirect!;assert.equal(await redirect({url:'https://evil.test',baseUrl:e.AUTH_ORIGIN}),e.AUTH_ORIGIN+'/?account=1');
});
