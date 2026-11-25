import { useCallback,useEffect,useRef,useState } from 'react';
import { AppState,BackHandler,Pressable,StyleSheet,Text,View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { useAudioPlayer } from 'expo-audio';
import { initialState,score,sample,type Level,type RideEvent,type Reason } from '../../reference-engine/src/engine';
import { descriptions,nextLevel } from '@/domain/levels';
import { newSession } from '@/domain/session';
import { useGame,unlocked } from '@/stores/game-store';
import { useMotionInput } from '@/hooks/use-motion-input';
import { RideScene } from '@/components/ride-scene';
import { RideBoundary } from '@/components/ride-boundary';
import { Action,Body,Heading,Panel,palette } from '@/components/ui';
const reasonNames:Record<Reason,string>={EJECT_SLIDE:'Văng khỏi máng',HIT_WALL:'Va thành ống',DERAIL:'Mất cân bằng trên ray',CAPSIZE:'Lật bè',HIT_ROCK:'Va đá',OFF_TRACK:'Trượt khỏi đường',WRONG_GATE:'Chọn sai cổng',UNSTABLE_LANDING:'Mất cân bằng khi hãm'};
type Phase='prepare'|'countdown'|'ride'|'pause'|'impact'|'result';
export function RideScreen({level}:{level:Level}){
 useKeepAwake();
 const settings=useGame(s=>s.settings),complete=useGame(s=>s.complete),records=useGame(s=>s.records);
 const [mode,setMode]=useState(settings.controlMode),[active,setActive]=useState(AppState.currentState==='active');
 const [phase,setPhase]=useState<Phase>('prepare'),[count,setCount]=useState(3),[hud,setHud]=useState(()=>initialState(level));
 const [notice,setNotice]=useState(''),[attempt,setAttempt]=useState(0);
 const session=useRef(newSession(level));const terminal=useRef(false);const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const motion=useMotionInput({...settings,controlMode:mode},active&&phase!=='result');
 const latest=useRef(motion);latest.current=motion;const insets=useSafeAreaInsets();
 const cue=useAudioPlayer(require('../../assets/prototype/cue.wav'));
 const impact=useAudioPlayer(require('../../assets/prototype/impact.wav'));
 const win=useAudioPlayer(require('../../assets/prototype/finish.wav'));
 const playCue=useCallback((player:typeof cue)=>{if(settings.sfxVolume>0){try{player.volume=settings.sfxVolume;void player.seekTo(0).then(()=>player.play()).catch(()=>{})}catch{}}},[settings.sfxVolume]);
 const read=useCallback((dt:number)=>latest.current.read(dt),[]);
 const pause=useCallback((message='Đã tạm dừng. Hiệu chỉnh lại trước khi tiếp tục.')=>{
  if(terminal.current)return;session.current.paused=true;session.current.acc=0;latest.current.touch.current=0;latest.current.reset();setNotice(message);setPhase('pause');
 },[]);
 useEffect(()=>{const sub=AppState.addEventListener('change',s=>{setActive(s==='active');if(s!=='active')pause('Ứng dụng đã chuyển nền.');});return()=>sub.remove()},[pause]);
 useEffect(()=>{const sub=BackHandler.addEventListener('hardwareBackPress',()=>{if(phase==='result'||phase==='prepare'){router.back();return true}pause();return true});return()=>sub.remove()},[phase,pause]);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current)},[]);
 useEffect(()=>{if(phase!=='countdown')return;if(!active){pause();return}if(count===0){session.current.paused=false;setPhase('ride');return}
  const t=setTimeout(()=>setCount(c=>c-1),1000);return()=>clearTimeout(t);
 },[phase,count,active,pause]);
 const retry=()=>{if(timer.current)clearTimeout(timer.current);session.current=newSession(level);terminal.current=false;latest.current.reset();latest.current.touch.current=0;setHud(initialState(level));setAttempt(a=>a+1);setNotice('');setPhase('prepare')};
 const start=()=>{if(!active)return;if(mode==='tilt'&&(!motion.calibrated||motion.read(.02)===null)){setNotice('Cần giữ máy ổn định và hiệu chỉnh trước.');return}session.current.paused=true;setCount(3);setNotice('');setPhase('countdown')};
 const onEvents=useCallback((events:RideEvent[])=>{
  for(const e of events){
   if(e.type==='WARNING_ENTER'){if(settings.haptics)void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(()=>{});playCue(cue)}
   if(e.type==='FAIL'||e.type==='FINISH'){
    if(terminal.current)return;terminal.current=true;
    const a=session.current.state;latest.current.touch.current=0;
    if(e.type==='FINISH'){complete(level.id,score(a).stars,a.elapsed);playCue(win)}
    else playCue(impact);
    if(settings.haptics)void Haptics.notificationAsync(e.type==='FINISH'?Haptics.NotificationFeedbackType.Success:Haptics.NotificationFeedbackType.Error).catch(()=>{});
    setHud({...a,routes:[...a.routes]});setPhase('impact');timer.current=setTimeout(()=>setPhase('result'),settings.comfort?220:600);
   }
  }
 },[level.id,complete,settings.haptics,settings.comfort,cue,win,impact,playCue]);
 const onLost=useCallback(()=>pause('Mất tín hiệu cảm biến. Hãy hiệu chỉnh hoặc dùng chạm.'),[pause]);
 const leave=()=>router.replace('/park');
 const next=nextLevel(level.id),result=score(hud),p=sample(level,hud.s);
 const nextEvent=level.events[hud.eventCursor];const near=nextEvent&&nextEvent.atM-hud.s<Math.max(12,hud.v*3);
 const corrective=level.family==='rail'||level.family==='fall'?hud.balance:hud.x;
 const hint=hud.warning?(corrective>0?'Nghiêng trái để phục hồi':'Nghiêng phải để phục hồi'):near?(nextEvent.kind==='gate'?(nextEvent.zones.length>1?'Chọn cổng trái hoặc phải':nextEvent.zones[0].route==='left'?'Cổng trái phía trước':'Cổng phải phía trước'):nextEvent.kind==='rock'?(nextEvent.minX<0?'Đá bên trái — tránh sang phải':'Đá bên phải — tránh sang trái'):'Giữ máy cân bằng khi hãm'):Math.abs(p.curvature)>.01?(p.curvature>0?'Cua phải phía trước':'Cua trái phía trước'):'Giữ máy cân bằng';
 const chooseTouch=()=>{latest.current.reset();setMode('touch');setNotice('')};
 const prepare=phase==='prepare'||phase==='pause';
 return <View style={s.root}>
  <RideBoundary key={attempt} onExit={leave}><RideScene level={level} session={session} read={read} comfort={settings.comfort} onHud={setHud} onEvents={onEvents} onLost={onLost}/></RideBoundary>
  <View pointerEvents="box-none" style={[s.hud,{top:insets.top+10}]}><View style={s.hudRow}><Text style={s.label}>{level.id} • {level.name}</Text>{(phase==='ride'||phase==='countdown')&&<Pressable accessibilityRole="button" accessibilityLabel="Tạm dừng" onPress={()=>pause()} style={s.pause}><Text style={s.label}>Ⅱ</Text></Pressable>}</View><View style={s.bar}><View style={[s.fill,{width:(hud.s/level.lengthM*100)+'%' as `${number}%`}]}/></View><Text style={s.label}>{Math.round(hud.v*3.6)} km/h · {Math.floor(hud.s)}/{level.lengthM} m</Text></View>
  {(phase==='ride'||phase==='countdown')&&<View pointerEvents="none" style={[s.hint,{bottom:insets.bottom+(mode==='touch'?116:30),backgroundColor:hud.warning?'#7C2E28E8':'#08283BDB'}]}><Text style={s.label}>{hint}</Text><View style={s.bar}><View style={[s.fill,{backgroundColor:hud.warning?palette.danger:palette.green,width:Math.min(100,hud.risk*100)+'%' as `${number}%`}]}/></View></View>}
  {phase==='ride'&&mode==='touch'&&<View style={[s.controls,{bottom:insets.bottom+18}]}>{[-1,1].map(dir=><Pressable key={dir} accessibilityRole="button" accessibilityLabel={dir<0?'Nghiêng trái':'Nghiêng phải'} onPressIn={()=>{latest.current.touch.current=dir}} onPressOut={()=>{if(latest.current.touch.current===dir)latest.current.touch.current=0}} style={s.control}><Text style={s.controlText}>{dir<0?'←':'→'}</Text></Pressable>)}</View>}
  {phase==='countdown'&&<View pointerEvents="none" style={s.count}><Text style={s.countText}>{count||'GO'}</Text></View>}
  {prepare&&<View style={s.overlay}><Panel><Text style={{color:palette.accent,fontWeight:'800'}}>{level.id} · {phase==='pause'?'TẠM DỪNG':'SẴN SÀNG'}</Text><Heading>{level.name}</Heading><Body>{descriptions[level.id]}</Body>{notice!==''&&<Text style={{color:palette.warn}}>{notice}</Text>}
   {mode==='tilt'?<><Body>{motion.status==='unavailable'?'Không có quyền hoặc không có cảm biến.':motion.status==='flat'?'Giữ máy dọc, không đặt nằm phẳng.':motion.calibrated?'Đã hiệu chỉnh.':motion.stable?'Giữ ổn định và xác nhận.':'Giữ điện thoại dọc, yên trong 1 giây.'}</Body><Action title={motion.calibrated?'Hiệu chỉnh lại':'Hiệu chỉnh'} disabled={!motion.stable} onPress={()=>{if(!motion.calibrate())setNotice('Giữ máy yên rồi thử lại.');else setNotice('Đã hiệu chỉnh thành công.')}}/><Action title="Dùng nút chạm" secondary onPress={chooseTouch}/></>:<Body>Nhấn giữ trái hoặc phải, thả để về giữa.</Body>}
   <Action title={phase==='pause'?'Tiếp tục':'Bắt đầu'} disabled={!active||(mode==='tilt'&&!motion.calibrated)} onPress={start}/>{phase==='pause'&&<Action title="Chơi lại từ đầu" secondary onPress={retry}/>}<Action title="Về công viên" secondary onPress={leave}/>
  </Panel></View>}
  {phase==='impact'&&<View pointerEvents="none" style={[s.overlay,{backgroundColor:hud.status==='failed'?'#6B25288C':'#14563A66'}]}><Text style={s.countText}>{hud.status==='failed'?'Mất thăng bằng':'Về đích!'}</Text></View>}
  {phase==='result'&&<View style={s.overlay}><Panel><Text style={{color:hud.status==='finished'?palette.green:palette.danger,fontWeight:'900'}}>{hud.status==='finished'?'HOÀN THÀNH':'THẤT BẠI'}</Text><Heading>{hud.status==='finished'?'★'.repeat(result.stars):reasonNames[hud.reason??'EJECT_SLIDE']}</Heading><Body>{hud.elapsed.toFixed(1)} giây · {Math.round(hud.peakSpeed*3.6)} km/h · cân bằng {Math.round(result.balanceScore)}%</Body>{hud.routes.length>0&&<Body>Hướng đã chọn: {hud.routes.map(r=>r==='left'?'trái':'phải').join(' → ')}</Body>}<Action title="Chơi lại" onPress={retry}/>{hud.status==='finished'&&next&&unlocked(next.id,records)&&<Action title={'Tiếp theo · '+next.name} onPress={()=>router.replace({pathname:'/ride/[id]',params:{id:next.id}})}/>}<Action title="Về công viên" secondary onPress={leave}/></Panel></View>}
 </View>
}
const s=StyleSheet.create({root:{flex:1,backgroundColor:palette.bg},hud:{position:'absolute',left:16,right:16,gap:7,padding:12,borderRadius:16,backgroundColor:'#08283BDB'},hudRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8},label:{color:'#FFFFFF',fontWeight:'700',fontSize:14,flexShrink:1},pause:{minWidth:48,minHeight:48,borderRadius:12,alignItems:'center',justifyContent:'center',backgroundColor:'#315768'},bar:{height:6,borderRadius:3,backgroundColor:'#4A6875',overflow:'hidden'},fill:{height:6,backgroundColor:palette.accent,borderRadius:3},hint:{position:'absolute',left:16,right:16,borderRadius:14,padding:12,gap:8},controls:{position:'absolute',left:16,right:16,flexDirection:'row',gap:16},control:{flex:1,height:80,backgroundColor:'#0E3F55DD',borderRadius:20,alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#86D6DE'},controlText:{fontSize:36,fontWeight:'900',color:'#FFF'},overlay:{...StyleSheet.absoluteFillObject,backgroundColor:'#05202CD9',justifyContent:'center',padding:24},count:{...StyleSheet.absoluteFillObject,alignItems:'center',justifyContent:'center'},countText:{fontSize:36,fontWeight:'900',color:'#FFF',textAlign:'center'}});
