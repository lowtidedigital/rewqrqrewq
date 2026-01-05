import { createRequire } from 'module'; const require = createRequire(import.meta.url);
import{DynamoDBClient as U}from"@aws-sdk/client-dynamodb";import{DynamoDBDocumentClient as L,GetCommand as x,PutCommand as v,UpdateCommand as d,QueryCommand as M,TransactWriteCommand as V}from"@aws-sdk/lib-dynamodb";var k=new U({}),l=L.from(k,{marshallOptions:{removeUndefinedValues:!0}}),m=process.env.LINKS_TABLE,D=process.env.ANALYTICS_TABLE,p=process.env.AGGREGATES_TABLE;async function A(e){let t=await l.send(new x({TableName:m,Key:{PK:`SLUG#${e}`,SK:"METADATA"}}));if(!t.Item)return null;let{linkId:n,userId:r}=t.Item,i=await l.send(new x({TableName:m,Key:{PK:`USER#${r}`,SK:`LINK#${n}`}}));return i.Item?N(i.Item):null}async function S(e,t){await l.send(new d({TableName:m,Key:{PK:`USER#${e}`,SK:`LINK#${t}`},UpdateExpression:"SET clickCount = if_not_exists(clickCount, :zero) + :inc",ExpressionAttributeValues:{":zero":0,":inc":1}}))}async function T(e){let t=new Date(e.timestamp),n=`${t.getUTCFullYear()}-${String(t.getUTCMonth()+1).padStart(2,"0")}`;await l.send(new v({TableName:D,Item:{PK:`LINK#${e.linkId}#${n}`,SK:`TS#${e.timestamp}#${e.eventId}`,GSI1PK:`USER#${e.userId}#${n}`,GSI1SK:`TS#${e.timestamp}`,...e,ttl:Math.floor(Date.now()/1e3)+365*24*60*60*2}})),await R(e)}async function R(e){let t=new Date(e.timestamp),n=t.toISOString().split("T")[0],r=`${t.getUTCFullYear()}-${String(t.getUTCMonth()+1).padStart(2,"0")}`;await l.send(new d({TableName:p,Key:{PK:`LINK#${e.linkId}`,SK:`AGG#daily#${n}`},UpdateExpression:"SET clicks = if_not_exists(clicks, :zero) + :inc, lastUpdated = :now",ExpressionAttributeValues:{":zero":0,":inc":1,":now":Date.now()}})),await l.send(new d({TableName:p,Key:{PK:`LINK#${e.linkId}`,SK:"AGG#total"},UpdateExpression:"SET clicks = if_not_exists(clicks, :zero) + :inc, lastUpdated = :now",ExpressionAttributeValues:{":zero":0,":inc":1,":now":Date.now()}})),await l.send(new d({TableName:p,Key:{PK:`USER#${e.userId}`,SK:`AGG#monthly#${r}`},UpdateExpression:"SET clicks = if_not_exists(clicks, :zero) + :inc, lastUpdated = :now",ExpressionAttributeValues:{":zero":0,":inc":1,":now":Date.now()}}))}function N(e){return e?{id:e.id,userId:e.userId,slug:e.slug,longUrl:e.longUrl,title:e.title,tags:e.tags,notes:e.notes,enabled:e.enabled??!0,privacyMode:e.privacyMode??!1,redirectType:e.redirectType??302,expiresAt:e.expiresAt,createdAt:e.createdAt,updatedAt:e.updatedAt,deletedAt:e.deletedAt,clickCount:e.clickCount??0,qrPngKey:e.qrPngKey,qrSvgKey:e.qrSvgKey,qrUpdatedAt:e.qrUpdatedAt}:null}import{createHash as $,randomBytes as j}from"crypto";function I(e,t="shortfuse"){return $("sha256").update(`${e}:${t}:${new Date().toISOString().split("T")[0]}`).digest("hex").substring(0,16)}function b(e){if(!e)return"unknown";let t=e.toLowerCase();return/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(t)?/tablet|ipad/i.test(t)?"tablet":"mobile":/bot|crawler|spider|slurp|googlebot|bingbot/i.test(t)?"bot":"desktop"}function w(e){return e["cloudfront-viewer-country"]||e["cf-ipcountry"]||"unknown"}function G(e,t,n={}){return{statusCode:e,headers:{"Content-Type":"application/json","Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"Content-Type,Authorization",...n},body:JSON.stringify(t)}}function K(e,t=302,n=60){return{statusCode:t,headers:{Location:e,"Cache-Control":`public, max-age=${n}`,"X-Robots-Tag":"noindex"},body:""}}function g(e,t,n){return G(e,{error:t,message:n,statusCode:e})}var o={info:(e,t)=>{console.log(JSON.stringify({level:"INFO",message:e,...t,timestamp:new Date().toISOString()}))},warn:(e,t)=>{console.warn(JSON.stringify({level:"WARN",message:e,...t,timestamp:new Date().toISOString()}))},error:(e,t,n)=>{console.error(JSON.stringify({level:"ERROR",message:e,error:t?.message,stack:t?.stack,...n,timestamp:new Date().toISOString()}))}};import _ from"crypto";var u=new Uint8Array(256),c=u.length;function y(){return c>u.length-16&&(_.randomFillSync(u),c=0),u.slice(c,c+=16)}var s=[];for(let e=0;e<256;++e)s.push((e+256).toString(16).slice(1));function E(e,t=0){return s[e[t+0]]+s[e[t+1]]+s[e[t+2]]+s[e[t+3]]+"-"+s[e[t+4]]+s[e[t+5]]+"-"+s[e[t+6]]+s[e[t+7]]+"-"+s[e[t+8]]+s[e[t+9]]+"-"+s[e[t+10]]+s[e[t+11]]+s[e[t+12]]+s[e[t+13]]+s[e[t+14]]+s[e[t+15]]}import O from"crypto";var f={randomUUID:O.randomUUID};function z(e,t,n){if(f.randomUUID&&!t&&!e)return f.randomUUID();e=e||{};let r=e.random||(e.rng||y)();if(r[6]=r[6]&15|64,r[8]=r[8]&63|128,t){n=n||0;for(let i=0;i<16;++i)t[n+i]=r[i];return t}return E(r)}var h=z;async function ce(e){let t=Date.now(),n=e.pathParameters?.slug;if(o.info("Redirect request",{slug:n,path:e.rawPath}),!n)return g(400,"BAD_REQUEST","Slug is required");try{let r=await A(n);if(!r)return o.warn("Link not found",{slug:n}),{statusCode:404,headers:{"Content-Type":"text/html","Cache-Control":"no-cache"},body:`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Link Not Found - ShortFuse</title>
              <meta name="robots" content="noindex">
              <style>
                body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: #e2e8f0; }
                .container { text-align: center; padding: 2rem; }
                h1 { font-size: 4rem; margin: 0; color: #f97316; }
                p { font-size: 1.25rem; color: #94a3b8; }
                a { color: #f97316; text-decoration: none; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>404</h1>
                <p>This short link doesn't exist.</p>
                <p><a href="https://${process.env.APP_DOMAIN||"app.shortfuse.io"}">Create your own short links \u2192</a></p>
              </div>
            </body>
          </html>
        `};if(!r.enabled)return o.warn("Link disabled",{slug:n,linkId:r.id}),{statusCode:410,headers:{"Content-Type":"text/html","Cache-Control":"no-cache"},body:`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Link Disabled - ShortFuse</title>
              <meta name="robots" content="noindex">
              <style>
                body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: #e2e8f0; }
                .container { text-align: center; padding: 2rem; }
                h1 { font-size: 2rem; margin: 0 0 1rem; color: #f97316; }
                p { color: #94a3b8; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Link Disabled</h1>
                <p>This short link has been disabled by its owner.</p>
              </div>
            </body>
          </html>
        `};if(r.expiresAt&&r.expiresAt<Date.now())return o.warn("Link expired",{slug:n,linkId:r.id,expiresAt:r.expiresAt}),{statusCode:410,headers:{"Content-Type":"text/html","Cache-Control":"no-cache"},body:`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Link Expired - ShortFuse</title>
              <meta name="robots" content="noindex">
              <style>
                body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: #e2e8f0; }
                .container { text-align: center; padding: 2rem; }
                h1 { font-size: 2rem; margin: 0 0 1rem; color: #f97316; }
                p { color: #94a3b8; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Link Expired</h1>
                <p>This short link has expired.</p>
              </div>
            </body>
          </html>
        `};if(!r.privacyMode){let a=e.headers||{};Promise.all([T({eventId:h(),linkId:r.id,slug:r.slug,userId:r.userId,timestamp:Date.now(),referrer:a.referer||a.Referer,userAgent:a["user-agent"]||a["User-Agent"],country:w(a),device:b(a["user-agent"]||a["User-Agent"]||""),ipHash:I(e.requestContext?.http?.sourceIp||"")}),S(r.userId,r.id)]).catch(P=>{o.error("Failed to record analytics",P)})}let i=Date.now()-t;o.info("Redirect successful",{slug:n,linkId:r.id,redirectType:r.redirectType,duration:i});let C=r.redirectType===301?300:60;return K(r.longUrl,r.redirectType,C)}catch(r){return o.error("Redirect error",r,{slug:n}),g(500,"INTERNAL_ERROR","An error occurred processing your request")}}export{ce as handler};
//# sourceMappingURL=redirect.js.map
