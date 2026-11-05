(function(root){'use strict';
// Form Filler Pro licence storage (background.js storage helpers A/k, 303.js/211.js license module, popup.js activation):
// chrome.storage.sync (local fallback when sync fails or the value exceeds the sync item quota):
//   proStatus     {isPro:boolean, plan?:'monthly'|'yearly'|'lifetime', expiresAt?:number, customerId?:string}
//   licenseKey    raw ZOVO-XXXX-XXXX-XXXX-XXXX string written on activation
//   ffpro_license {license:{status:'active'|'expired'|..., plan:'pro'|'team'|'free', expiresAt, lastVerified, features}, cachedAt, offlineGracePeriodEnd}
// The worker's isPro() rewrites proStatus to {isPro:false} once expiresAt+1h passes (plan/expiresAt erased). No trial exists in this product.
const PRO='proStatus',LICENSE_KEY='licenseKey',CACHE='ffpro_license',WATCHED=[PRO,LICENSE_KEY,CACHE],AREAS=['sync','local'];
const CAMPAIGN="zovo.membership.formfiller.v1",PRODUCT="Form Filler Pro",CARD="Fill forms in one click. Help me keep improving Form Filler Pro.",DAYS30=30*86400000;
function isObject(v){return v!==null&&typeof v==='object'&&!Array.isArray(v);}
function proKind(record){
 if(record===undefined||record===null)return 'free';
 if(!isObject(record))return 'unknown';
 if(record.isPro===true)return 'member';
 if(typeof record.plan==='string'&&record.plan&&record.plan!=='free')return 'member';
 if(record.isPro!==false)return 'unknown';
 if(record.customerId!==undefined&&record.customerId!==null&&record.customerId!=='')return 'unknown';
 if(record.expiresAt!==undefined&&record.expiresAt!==null&&(typeof record.expiresAt!=='number'||!Number.isFinite(record.expiresAt)))return 'unknown';
 return 'free';
}
function keyKind(key){if(key===undefined||key===null||key==='')return 'free';return 'unknown';}
function cacheKind(record){
 if(record===undefined||record===null)return 'free';
 if(!isObject(record))return 'unknown';
 const license=record.license;
 if(license===undefined||license===null)return record.cachedAt===undefined||typeof record.cachedAt==='number'?'free':'unknown';
 if(!isObject(license))return 'unknown';
 if(license.status==='active'&&typeof license.plan==='string'&&license.plan&&license.plan!=='free')return 'member';
 return 'unknown';
}
function subscriptionKind(data){
 if(!isObject(data))return 'unknown';
 const kinds=[proKind(data[PRO]),keyKind(data[LICENSE_KEY]),cacheKind(data[CACHE])];
 if(kinds.includes('member'))return 'member';
 if(kinds.includes('unknown'))return 'unknown';
 return 'free';
}
function classify(data,state,now){const kind=subscriptionKind(data);if(kind!=='free')return kind;
 if(state!==undefined&&state!==null){if(!isObject(state))return 'unknown';if(state.memberSeen)return 'member';if(state.recoverySeen)return 'unknown';if(state.hidden===true)return 'dismissed';if(state.dismissedAt!==undefined&&(typeof state.dismissedAt!=='number'||!Number.isFinite(state.dismissedAt)))return 'unknown';if(state.dismissedAt&&now-state.dismissedAt<DAYS30)return 'dismissed';}return 'free';}
const MEMBER=CAMPAIGN+'.memberSeen',RECOVERY=CAMPAIGN+'.recoverySeen',TRIAL=CAMPAIGN+'.trialUntil',PORT=CAMPAIGN+'.status';
function requestWorkerStatus(){return new Promise(resolve=>{let port,done=false;const finish=status=>{if(done)return;done=true;clearTimeout(timer);try{port?.disconnect();}catch{}resolve(status);};const timer=setTimeout(()=>finish('unknown'),2500);try{port=chrome.runtime.connect({name:PORT});port.onMessage.addListener(message=>{finish(message&&message.campaign===CAMPAIGN&&['free','member','trial','unknown'].includes(message.status)?message.status:'unknown');});port.onDisconnect.addListener(()=>{void chrome.runtime.lastError;finish('unknown');});port.postMessage({request:'status'});}catch{finish('unknown');}});}
// Licence records live in sync with a local fallback; both areas are read and the stricter answer wins.
async function readLicense(){const merged={};for(const area of AREAS){const data=await chrome.storage[area].get(WATCHED);for(const key of WATCHED)if(data[key]!==undefined&&merged[key]===undefined)merged[key]=data[key];else if(data[key]!==undefined&&subscriptionKind({[key]:merged[key]})==='free')merged[key]=data[key];}return merged;}
async function read(){try{const license=await readLicense();const flags=await chrome.storage.local.get([CAMPAIGN,MEMBER,RECOVERY,TRIAL]);const localKind=classify(license,flags[CAMPAIGN],Date.now());if(flags[MEMBER]===true)return 'member';if(flags[RECOVERY]===true)return 'unknown';if(flags[TRIAL]!==undefined&&(typeof flags[TRIAL]!=='number'||!Number.isFinite(flags[TRIAL])))return 'unknown';if(flags[TRIAL]>Date.now())return 'trial';const workerKind=await requestWorkerStatus();if(workerKind!=='free')return workerKind;return localKind;}catch{return 'unknown';}}
async function dismiss(forever){const data=await chrome.storage.local.get(CAMPAIGN);await chrome.storage.local.set({[CAMPAIGN]:{...(isObject(data[CAMPAIGN])?data[CAMPAIGN]:{}),dismissedAt:Date.now(),hidden:forever===true}});}
function touches(changes,area){if(area==='sync')return WATCHED.some(k=>changes[k]);if(area!=='local')return false;return WATCHED.some(k=>changes[k])||!!(changes[CAMPAIGN]||changes[MEMBER]||changes[RECOVERY]||changes[TRIAL]);}
root.ZovoSubscriptionMembership={PRO,LICENSE_KEY,CACHE,WATCHED,AREAS,CAMPAIGN,PRODUCT,CARD,classify,subscriptionKind,readLicense,read,dismiss,touches,MEMBER,RECOVERY,TRIAL,PORT};
})(globalThis);
