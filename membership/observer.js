import './eligibility.js';
const api=globalThis.ZovoSubscriptionMembership;
// Updated synchronously on oldValue before any asynchronous persistence begins.
let member=false,recovery=false,readFailed=false;
let queue=Promise.resolve();
function capture(data){const kind=api.subscriptionKind(data);if(kind==='free')return false;if(kind==='member')member=true;else recovery=true;return true;}
async function persist(){const flags={};if(member)flags[api.MEMBER]=true;if(recovery)flags[api.RECOVERY]=true;if(!Object.keys(flags).length)return;
 let durable=false;try{await chrome.storage.local.set(flags);durable=true;}catch{readFailed=true;}
 // Session fallback survives service-worker suspension when local persistence fails.
 try{await chrome.storage.session.set(flags);}catch{if(!durable)readFailed=true;}
}
function schedule(){queue=queue.then(persist).catch(()=>{readFailed=true;});}
chrome.storage.onChanged.addListener((changes,area)=>{
 if(area==='local'){if(changes[api.MEMBER]?.newValue===true)member=true;if(changes[api.RECOVERY]?.newValue===true)recovery=true;}
 if(area!=='local'&&area!=='sync')return;
 let hit=false;for(const key of api.WATCHED){const change=changes[key];if(!change)continue;if('oldValue' in change&&capture({[key]:change.oldValue}))hit=true;if(capture({[key]:change.newValue}))hit=true;}
 if(hit)schedule();
});
const initialized=(async()=>{try{const flags=await chrome.storage.local.get([api.CAMPAIGN,api.MEMBER,api.RECOVERY]);member=member||flags[api.MEMBER]===true||flags[api.CAMPAIGN]?.memberSeen===true;recovery=recovery||flags[api.RECOVERY]===true||flags[api.CAMPAIGN]?.recoverySeen===true;}catch{readFailed=true;}
try{capture(await api.readLicense());}catch{readFailed=true;}
try{const data=await chrome.storage.session.get([api.MEMBER,api.RECOVERY]);member=member||data[api.MEMBER]===true;recovery=recovery||data[api.RECOVERY]===true;}catch{readFailed=true;}schedule();})();
async function status(){await initialized;try{if(capture(await api.readLicense()))schedule();}catch{readFailed=true;}
// Do not wait for potentially delayed writes: the volatile guard already has the result.
return member?'member':recovery||readFailed?'unknown':'free';}
chrome.runtime.onConnect.addListener(port=>{if(port.name!==api.PORT)return;port.onMessage.addListener(message=>{if(message?.request!=='status')return;void status().then(value=>{try{port.postMessage({campaign:api.CAMPAIGN,status:value});}catch{}});});});
