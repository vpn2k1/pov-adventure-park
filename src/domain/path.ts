import { sample,type Level } from '../../reference-engine/src/engine';
export type Vec={x:number;y:number;z:number};
export type Pose={p:Vec;right:Vec;up:Vec;forward:Vec;bank:number};
const rad=(n:number)=>n*Math.PI/180;
const add=(a:Vec,b:Vec):Vec=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z});
const mul=(a:Vec,k:number):Vec=>({x:a.x*k,y:a.y*k,z:a.z*k});
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const unit=(a:Vec)=>mul(a,1/(Math.hypot(a.x,a.y,a.z)||1));
export const offset=(f:Pose,x:number,y:number)=>add(f.p,add(mul(f.right,x),mul(f.up,y)));
function frame(p:Vec,heading:number,pitch:number,bank:number):Pose {
 const forward={x:Math.sin(heading)*Math.cos(pitch),y:-Math.sin(pitch),z:-Math.cos(heading)*Math.cos(pitch)};
 const r={x:Math.cos(heading),y:0,z:Math.sin(heading)};
 const u={x:Math.sin(heading)*Math.sin(pitch),y:Math.cos(pitch),z:-Math.cos(heading)*Math.sin(pitch)};
 return {p,forward,right:add(mul(r,Math.cos(bank)),mul(u,-Math.sin(bank))),up:add(mul(u,Math.cos(bank)),mul(r,Math.sin(bank))),bank};
}
export function createPath(l:Level,spacing=.5){
 const count=Math.ceil(l.lengthM/spacing),ds=l.lengthM/count;
 let p:Vec={x:0,y:0,z:0}, heading=0;
 const nodes:Pose[]=[];
 for(let i=0;i<=count;i++){
  const s=Math.min(i*ds,l.lengthM),a=sample(l,s);
  // smooth orientation in a short visual window near the segment edge
  const b=sample(l,Math.max(0,s-2)),w=Math.min(1,Math.max(0,(s-a.startM)/2));
  const pitch=rad(mix(b.slopeDeg,a.slopeDeg,w)),bank=rad(mix(b.bankDeg,a.bankDeg,w));
  const f=frame(p,heading,pitch,bank);nodes.push(f);
  if(i<count){const middle=sample(l,s+ds/2);const k=middle.curvature;const m=frame(p,heading+k*ds/2,rad(middle.slopeDeg),0);p=add(p,mul(m.forward,ds));heading+=k*ds;}
 }
 const floor=Math.min(...nodes.map(n=>n.p.y));for(const n of nodes)n.p.y+=6-floor;
 const at=(s:number):Pose=>{
  const t=Math.min(count,Math.max(0,s/ds)),i=Math.floor(t),a=nodes[i],b=nodes[Math.min(count,i+1)],u=t-i;
  const blend=(v:Vec,w:Vec)=>add(mul(v,1-u),mul(w,u));
  return {p:blend(a.p,b.p),right:unit(blend(a.right,b.right)),up:unit(blend(a.up,b.up)),forward:unit(blend(a.forward,b.forward)),bank:mix(a.bank,b.bank,u)};
 };
 return {at,ds,count,nodes};
}
export type Path=ReturnType<typeof createPath>;
