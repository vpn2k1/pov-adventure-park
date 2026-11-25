import { memo,useEffect,useMemo,useRef } from 'react';
import { Canvas,useFrame } from '@react-three/fiber/native';
import * as THREE from 'three';
import { sample,type Level,type State,type RideEvent } from '../../reference-engine/src/engine';
import { createPath,offset,type Path,type Vec } from '@/domain/path';
import { advance,type Session } from '@/domain/session';
import type { MutableRefObject } from 'react';
const vector=(p:Vec)=>new THREE.Vector3(p.x,p.y,p.z);
type Shape=Array<[number,number]>;
function surface(path:Path,start:number,end:number,shape:Shape,closed=false){
 const n=Math.max(1,Math.ceil((end-start)/path.ds)),stride=shape.length,verts:number[]=[],uv:number[]=[],indices:number[]=[];
 for(let i=0;i<=n;i++){const s=start+(end-start)*i/n,f=path.at(s);for(let j=0;j<stride;j++){const p=offset(f,...shape[j]);verts.push(p.x,p.y,p.z);uv.push(j/(stride-1),s/3);}}
 for(let i=0;i<n;i++)for(let j=0;j<(closed?stride:stride-1);j++){const a=i*stride+j,b=i*stride+(j+1)%stride,c=a+stride,d=b+stride;indices.push(a,b,c,b,d,c);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingSphere();return g;
}
function profile(w:number,closed:boolean):Shape{
 return Array.from({length:closed?33:17},(_,i)=>{const a=closed?-Math.PI+i*Math.PI*2/32:-1.42+i*2.84/16;return [w*Math.sin(a)/(closed?1:Math.sin(1.42)),w*(1-Math.cos(a))*.78]});
}
function Track({level,path}:{level:Level;path:Path}){
 const pieces=useMemo(()=>{
 const out:{g:THREE.BufferGeometry;color:string}[]=[];const add=(a:number,b:number,shape:Shape,color:string)=>out.push({g:surface(path,a,b,shape),color});
 const w=level.params.halfWidth;
 if(level.family==='rail'){
  for(const side of [-1,1]){const x=side*w*.58;add(0,level.lengthM,[[x-.09,.12],[x-.09,.23],[x+.09,.23],[x+.09,.12]],'#E9B351');}
  for(let s=0;s<level.lengthM-0.4;s+=2.4)add(s,s+.28,[[-w*.75,.07],[w*.75,.07]],'#76503D');
 } else if(level.family==='fall'){
  for(const side of [-1,1]){const x=side*w;add(0,level.lengthM,[[x-.12,0],[x+.12,0],[x+.12,.22]],'#D9A049');}
  add(0,level.lengthM,[[-.42,.03],[.42,.03]],'#64758B');
 } else {
  for(const seg of level.segments){
   add(seg.startM,seg.endM,level.family==='ice'?[[-w,.28],[-w*.9,0],[w*.9,0],[w,.28]]:profile(w,seg.closed),level.family==='ice'?'#C7F0FF':seg.closed?'#8A57B5':level.family==='raft'?'#447FA9':'#0E8AA7');
   if(level.family!=='ice')add(seg.startM,seg.endM,[[-w*.52,.11],[w*.52,.11]],'#4BCEE7');
  }
  for(const side of [-1,1])add(0,level.lengthM,[[side*w*.95,.63],[side*w,.63],[side*w,.75]],'#FFD37B');
 }
 return out;
 },[level,path]);useEffect(()=>()=>pieces.forEach(p=>p.g.dispose()),[pieces]);
 return <>{pieces.map((p,i)=><mesh key={i} geometry={p.g}><meshStandardMaterial color={p.color} side={THREE.DoubleSide} roughness={.55}/></mesh>)}</>
}
function Scenery({level,path}:{level:Level;path:Path}){
 const items=useMemo(()=>Array.from({length:Math.min(44,Math.floor(level.lengthM/6))},(_,i)=>{
  const f=path.at(i*level.lengthM/Math.min(44,Math.floor(level.lengthM/6))),side=i%2===0?-1:1;
  const p=offset(f,side*(6+(i%3)*2),0);
  return {x:p.x,z:p.z,y:Math.max(2,Math.min(7,f.p.y-1)),support:f.p};
 }),[level,path]);
 const cold=level.family==='ice';
 const trees=useRef<THREE.InstancedMesh>(null),trunks=useRef<THREE.InstancedMesh>(null),supports=useRef<THREE.InstancedMesh>(null);
 useEffect(()=>{const o=new THREE.Object3D();items.forEach((p,i)=>{
  o.position.set(p.x,p.y,p.z);o.scale.set(1,1,1);o.updateMatrix();trees.current?.setMatrixAt(i,o.matrix);
  o.position.set(p.x,p.y/2,p.z);o.scale.set(1,p.y,1);o.updateMatrix();trunks.current?.setMatrixAt(i,o.matrix);
  o.position.set(p.support.x,p.support.y/2,p.support.z);o.scale.set(1,Math.max(.1,p.support.y),1);o.updateMatrix();supports.current?.setMatrixAt(i,o.matrix);
 });for(const ref of [trees,trunks,supports])if(ref.current){ref.current.instanceMatrix.needsUpdate=true;ref.current.computeBoundingSphere()}},[items]);
 return <>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.3,0]}><planeGeometry args={[1500,1500]}/><meshStandardMaterial color={cold?'#C8E6F1':'#78AD76'}/></mesh>
  <instancedMesh ref={trees} args={[undefined,undefined,items.length]}><coneGeometry args={[2.0,3.7,7]}/><meshStandardMaterial color={cold?'#4D8291':'#218D72'}/></instancedMesh>
  <instancedMesh ref={trunks} args={[undefined,undefined,items.length]}><cylinderGeometry args={[.14,.21,1,6]}/><meshStandardMaterial color="#A07046"/></instancedMesh>
  <instancedMesh ref={supports} args={[undefined,undefined,items.length]}><boxGeometry args={[.27,1,.27]}/><meshStandardMaterial color="#638D9B"/></instancedMesh>
  {level.events.map(e=>{const f=path.at(e.atM);
   if(e.kind==='rock'){const p=offset(f,(e.minX+e.maxX)/2,.37);return <mesh key={e.id} position={[p.x,p.y,p.z]} scale={[(e.maxX-e.minX)/2,.55,.65]}><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color="#765849"/></mesh>}
   if(e.kind==='gate')return <group key={e.id}>{e.zones.map((z,i)=>{const p=offset(f,(z.minX+z.maxX)/2,.18);return <mesh key={i} position={[p.x,p.y,p.z]} rotation={[0,Math.atan2(f.right.z,-f.right.x),0]}><boxGeometry args={[z.maxX-z.minX,.14,.5]}/><meshBasicMaterial color="#55F29B"/></mesh>})}<mesh position={vector(offset(f,0,2.7))}><sphereGeometry args={[.27,8,6]}/><meshBasicMaterial color="#FFCE6D"/></mesh></group>;
   return <mesh key={e.id} position={vector(offset(f,0,.18))}><sphereGeometry args={[.5,8,8]}/><meshBasicMaterial color="#55F29B"/></mesh>;
  })}
 </>;
}
export type SceneProps={level:Level;session:MutableRefObject<Session>;read:(dt:number)=>number|null;comfort:boolean;onHud:(state:State)=>void;onEvents:(events:RideEvent[])=>void;onLost:()=>void};
function Driver({level,session,read,comfort,onHud,onEvents,onLost,path}:SceneProps&{path:Path}){
 const hud=useRef(0);const failTime=useRef(0);
 useFrame(({camera},delta)=>{
  const s=session.current;const dt=Math.min(.1,delta);
  if(!s.paused&&s.state.status==='riding'){
   const u=read(dt);if(u===null){s.paused=true;s.acc=0;onLost();}
   else{const e=advance(level,s,dt,u);if(e.length)onEvents(e);hud.current+=dt;if(hud.current>=.1||e.length){hud.current=0;onHud({...s.state,routes:[...s.state.routes]});}}
  }
  const a=s.state, f=path.at(a.s),next=path.at(Math.min(level.lengthM,a.s+Math.max(2,Math.min(6,a.v*.5))));
  const rail=level.family==='rail'||level.family==='fall';
  const w=level.params.halfWidth;
  const dx=rail?a.x:Math.max(-w*.72,Math.min(w*.72,a.x));
  const lean=rail?a.balance:a.x/w;const height=rail?1.05:.64;
  if(a.status==='failed'&&!s.paused)failTime.current=Math.min(.48,failTime.current+dt);else if(a.status!=='failed')failTime.current=0;
  const exit=comfort||a.reason==='HIT_WALL'||a.reason==='HIT_ROCK'||a.reason==='WRONG_GATE'?0:Math.sign(lean||1)*w*2*failTime.current;
  const pos=offset(f,dx+exit,height+Math.abs(dx)*.12);
  const target=offset(next,Math.max(-w*.35,Math.min(w*.35,dx*.5)),height);
  camera.position.set(pos.x,pos.y,pos.z);
  const up=vector(f.up),r=vector(f.right);
  const roll=Math.max(-1,Math.min(1,lean))*(comfort?.045:.15);
  up.multiplyScalar(Math.cos(roll)).addScaledVector(r,Math.sin(roll));
  if(comfort){up.lerp(new THREE.Vector3(0,1,0),.6)}
  camera.up.copy(up.normalize());
  if(a.s>=level.lengthM-.2)camera.lookAt(camera.position.clone().add(vector(f.forward)));
  else camera.lookAt(target.x,target.y,target.z);
 });
 return null;
}
export const RideScene=memo(function RideScene(props:SceneProps){const path=useMemo(()=>createPath(props.level),[props.level]);
 return <Canvas camera={{fov:66,near:.08,far:160}} gl={{antialias:false}} style={{flex:1}}>
  <color attach="background" args={[props.level.id==='L08'?'#6C879B':'#8ACEE9']}/><fog attach="fog" args={[props.level.id==='L08'?'#6C879B':'#8ACEE9',45,150]}/>
  <ambientLight intensity={1.6}/><directionalLight position={[8,18,10]} intensity={2}/>
  <Track level={props.level} path={path}/><Scenery level={props.level} path={path}/><Driver {...props} path={path}/>
 </Canvas>
});
