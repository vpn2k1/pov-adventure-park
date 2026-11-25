/** Standalone design reference. Not a native renderer or real-world safety simulation. */
export type Family = 'slide'|'rail'|'raft'|'ice'|'fall';
export type Reason = 'EJECT_SLIDE'|'HIT_WALL'|'DERAIL'|'CAPSIZE'|'HIT_ROCK'|'OFF_TRACK'|'WRONG_GATE'|'UNSTABLE_LANDING';
export type Zone = {minX:number;maxX:number;route:'left'|'right'};
export type LevelEvent = {id:string;atM:number} & (
 {kind:'rock';minX:number;maxX:number} | {kind:'gate';zones:Zone[]} | {kind:'landing';maxAbsBalance:number});
export interface Segment {startM:number;endM:number;curvature:number;slopeDeg:number;bankDeg:number;flow:number;closed:boolean}
export interface Level {schemaVersion:1;id:string;name:string;family:Family;difficulty:number;lengthM:number;startSpeed:number;minSpeed:number;maxSpeed:number;
 params:{halfWidth:number;steer:number;damping:number;centering:number;drag:number;graceSec:number;balanceLimit:number;balanceGain:number;balanceRecovery:number};segments:Segment[];events:LevelEvent[]}
export interface State {s:number;v:number;x:number;vx:number;balance:number;unsafeSec:number;elapsed:number;safeTicks:number;ticks:number;risk:number;peakSpeed:number;warning:boolean;eventCursor:number;routes:string[];status:'riding'|'finished'|'failed';reason?:Reason}
export type RideEvent = {type:'WARNING_ENTER'|'WARNING_EXIT'|'FINISH'}|{type:'FAIL';reason:Reason;s:number}|{type:'GATE';id:string;route:string};
export const DT=1/60;
const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));
const rad=(a:number)=>a*Math.PI/180;
export function validateLevel(l:Level):void {
 if(l.schemaVersion!==1||!['slide','rail','raft','ice','fall'].includes(l.family)|| !Number.isFinite(l.lengthM)||l.lengthM<=0||![l.minSpeed,l.startSpeed,l.maxSpeed].every(x=>Number.isFinite(x)&&x>0)|| l.minSpeed>l.startSpeed||l.startSpeed>l.maxSpeed) throw Error('Invalid metadata/speed');
 if(Object.values(l.params).some(x=>!Number.isFinite(x)||x<=0)) throw Error('Invalid params');
 let end=0; for(const p of l.segments){if(![p.startM,p.endM,p.curvature,p.slopeDeg,p.bankDeg,p.flow].every(Number.isFinite)||p.startM!==end||p.endM<=p.startM|| (p.closed&&l.family!=='slide'))throw Error('Invalid segment');end=p.endM;} if(end!==l.lengthM)throw Error('Segment coverage');
 let last=0;const ids=new Set<string>();const validZone=(a:number,b:number)=>Number.isFinite(a)&&Number.isFinite(b)&&a<b&&a>=-l.params.halfWidth&&b<=l.params.halfWidth;
 for(const e of l.events){if(ids.has(e.id)||!Number.isFinite(e.atM)||e.atM<=0||e.atM<last||e.atM>l.lengthM)throw Error('Invalid event order/id');ids.add(e.id);last=e.atM;
  if(e.kind==='rock'&&(!validZone(e.minX,e.maxX)||l.family!=='raft'))throw Error('Invalid rock');
  if(e.kind==='gate'&&(!e.zones.length||e.zones.some(z=>!validZone(z.minX,z.maxX))||e.zones.some((a,i)=>e.zones.slice(i+1).some(b=>a.minX<=b.maxX&&b.minX<=a.maxX))))throw Error('Invalid gate');
  if(e.kind==='landing'&&(l.family!=='fall'||!Number.isFinite(e.maxAbsBalance)||e.maxAbsBalance<0))throw Error('Invalid landing');
 }
}
export function initialState(l:Level):State {validateLevel(l);return {s:0,v:l.startSpeed,x:0,vx:0,balance:0,unsafeSec:0,elapsed:0,safeTicks:0,ticks:0,risk:0,peakSpeed:l.startSpeed,warning:false,eventCursor:0,routes:[],status:'riding'};}
export function sample(l:Level,s:number):Segment{return l.segments.find(p=>s>=p.startM&&s<p.endM)??l.segments[l.segments.length-1];}
function threshold(l:Level,p:Segment):Reason {switch(l.family){case 'slide':return p.closed?'HIT_WALL':'EJECT_SLIDE';case 'rail':return 'DERAIL';case 'raft':return 'CAPSIZE';case 'ice':return 'OFF_TRACK';case 'fall':return 'UNSTABLE_LANDING';}}
/** One fixed tick. Caller handles stale sensors, pause, and accumulator; never advances on invalid input. Mutates state for hot-path usage. */
export function step(l:Level,a:State,u:number,dt=DT):RideEvent[]{
 if(a.status!=='riding')return [];
 if(!Number.isFinite(u)||!Number.isFinite(dt)||Math.abs(dt-DT)>1e-9)throw Error('Expected finite input and fixed timestep');
 u=clamp(u,-1,1);const p=sample(l,a.s),q=l.params,oldS=a.s;const events:RideEvent[]=[];
 a.v=clamp(a.v+(9.81*Math.sin(rad(p.slopeDeg))-q.drag*a.v)*dt,l.minSpeed,l.maxSpeed);
 a.s=Math.min(l.lengthM,a.s+a.v*dt);a.elapsed+=dt;a.peakSpeed=Math.max(a.peakSpeed,a.v);a.ticks++;
 const demand=a.v*a.v*p.curvature-9.81*Math.sin(rad(p.bankDeg));
 if(l.family==='rail'||l.family==='fall'){
  const d=l.family==='fall'?p.flow:demand;
  a.balance+=(u*q.balanceGain-d*q.balanceGain/q.steer-a.balance*q.balanceRecovery)*dt;
  a.x=clamp(a.balance,-1,1)*.15;a.risk=Math.abs(a.balance)/q.balanceLimit;
 }else{
  const ax=q.steer*u-demand+(l.family==='raft'?p.flow:0)-q.damping*a.vx-q.centering*a.x;
  a.vx+=ax*dt;a.x+=a.vx*dt;
  if(p.closed){const lim=q.halfWidth*1.15;if(Math.abs(a.x)>lim){a.x=clamp(a.x,-lim,lim);a.vx=0;}}
  a.risk=Math.abs(a.x)/q.halfWidth;
 }
 if(a.risk<.7)a.safeTicks++;
 const warn=a.risk>=.7;if(warn!==a.warning){a.warning=warn;events.push({type:warn?'WARNING_ENTER':'WARNING_EXIT'});}
 a.unsafeSec=a.risk>=1?a.unsafeSec+dt:Math.max(0,a.unsafeSec-2*dt);
 let reason:Reason|undefined;
 while(a.eventCursor<l.events.length&&l.events[a.eventCursor].atM<=a.s){const e=l.events[a.eventCursor++];if(e.atM<=oldS)continue;
  if(e.kind==='rock'&&a.x>=e.minX&&a.x<=e.maxX)reason??='HIT_ROCK';
  if(e.kind==='landing'&&Math.abs(a.balance)>e.maxAbsBalance)reason??='UNSTABLE_LANDING';
  if(e.kind==='gate'){const z=e.zones.find(z=>a.x>=z.minX&&a.x<=z.maxX);if(!z)reason??='WRONG_GATE';else{a.routes.push(z.route);events.push({type:'GATE',id:e.id,route:z.route});}}
  if(reason)break;
 }
 if(!reason&&a.unsafeSec>=q.graceSec)reason=threshold(l,p);
 if(reason){a.status='failed';a.reason=reason;events.push({type:'FAIL',reason,s:a.s});}
 else if(a.s>=l.lengthM){a.status='finished';events.push({type:'FINISH'});}
 return events;
}
export function score(a:State){const balanceScore=a.ticks?100*a.safeTicks/a.ticks:0;return {balanceScore,stars:a.status==='finished'?(balanceScore>=90?3:balanceScore>=70?2:1):0};}
export function wrapAngle(a:number){return ((a+180)%360+360)%360-180;}
export function normalizeTilt(angle:number,center:number,deadzone=4,full=28,sensitivity=1){if(![angle,center,deadzone,full,sensitivity].every(Number.isFinite)||full<=deadzone||deadzone<0||sensitivity<=0)throw Error('Invalid tilt settings');const d=wrapAngle(angle-center);return Math.sign(d)*clamp((Math.abs(d)-deadzone)/(full-deadzone)*sensitivity,0,1);}
