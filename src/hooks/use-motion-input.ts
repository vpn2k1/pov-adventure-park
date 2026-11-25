import { useCallback,useEffect,useRef,useState } from 'react';
import { DeviceMotion } from 'expo-sensors';
import { normalizeTilt,wrapAngle } from '../../reference-engine/src/engine';
import type { Settings } from '@/stores/game-store';
export function useMotionInput(settings:Settings,enabled:boolean){
 const raw=useRef({angle:0,time:0,valid:false});const history=useRef<{angle:number;time:number}[]>([]);const center=useRef<number|null>(null);
 const filtered=useRef(0),touch=useRef(0);
 const [status,setStatus]=useState<'loading'|'ready'|'unavailable'|'flat'>('loading');
 const [calibrated,setCalibrated]=useState(false),[stable,setStable]=useState(false);
 const cfg=useRef(settings);cfg.current=settings;
 const reset=useCallback(()=>{center.current=null;filtered.current=0;history.current=[];raw.current.valid=false;setCalibrated(false);setStable(false)},[]);
 useEffect(()=>{
  if(!enabled||settings.controlMode==='touch')return;
  let live=true;let sub:{remove:()=>void}|undefined;let uiAt=0;
  reset();setStatus('loading');
  (async()=>{try{
   if(!(await DeviceMotion.isAvailableAsync())){if(live)setStatus('unavailable');return}
   const permission=await DeviceMotion.requestPermissionsAsync();if(!live)return;if(!permission.granted){setStatus('unavailable');return}
   DeviceMotion.setUpdateInterval(20);
   sub=DeviceMotion.addListener(e=>{
    const g=e.accelerationIncludingGravity,a=e.acceleration,now=Date.now();
    if(!g)return;
    const x=g.x-(a?.x??0),y=g.y-(a?.y??0);
    if(!Number.isFinite(x+y)||Math.hypot(x,y)<2){raw.current.valid=false;history.current=[];if(now-uiAt>120){uiAt=now;setStatus('flat');setStable(false)}return}
    // Sign must be validated on actual Android/iOS; invert option provides a fallback.
    const angle=Math.atan2(x,-y)*180/Math.PI;raw.current={angle,time:now,valid:true};
    history.current.push({angle,time:now});history.current=history.current.filter(v=>now-v.time<=900);
    if(now-uiAt>120){uiAt=now;setStatus('ready');const h=history.current;setStable(h.length>6&&now-h[0].time>=650&&h.every(v=>Math.abs(wrapAngle(v.angle-angle))<5))}
   });
  }catch{if(live)setStatus('unavailable')}})();
  return()=>{live=false;sub?.remove();raw.current.valid=false;touch.current=0;};
 },[enabled,settings.controlMode,reset]);
 const calibrate=()=>{const h=history.current,now=Date.now();if(!raw.current.valid||now-raw.current.time>250||h.length<7||now-h[0].time<650||!h.every(v=>Math.abs(wrapAngle(v.angle-raw.current.angle))<5))return false;
  const avg=Math.atan2(h.reduce((s,v)=>s+Math.sin(v.angle*Math.PI/180),0),h.reduce((s,v)=>s+Math.cos(v.angle*Math.PI/180),0))*180/Math.PI;
  center.current=avg;filtered.current=0;setCalibrated(true);return true;
 };
 const read=(dt:number)=>{const s=cfg.current;if(s.controlMode==='touch')return touch.current;
  const a=raw.current;if(center.current===null||!a.valid||Date.now()-a.time>250)return null;
  const target=normalizeTilt(a.angle,center.current,s.deadzone,s.fullTilt,s.sensitivity)*(s.invert?-1:1);
  filtered.current+=(target-filtered.current)*(1-Math.exp(-Math.min(.1,Math.max(0,dt))/.09));return filtered.current;};
 return {status,stable,calibrated,calibrate,reset,read,touch};
}
