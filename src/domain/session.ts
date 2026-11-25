import { DT,initialState,step,type Level,type State,type RideEvent } from '../../reference-engine/src/engine';
export type Session={state:State;acc:number;paused:boolean};
export function newSession(l:Level):Session{return {state:initialState(l),acc:0,paused:true}}
export function advance(l:Level,session:Session,delta:number,u:number):RideEvent[]{
 if(session.paused||session.state.status!=='riding'){session.acc=0;return []}
 if(!Number.isFinite(delta)||delta<0||!Number.isFinite(u))return [];
 session.acc+=Math.min(.1,delta);const events:RideEvent[]=[];
 for(let n=0;n<6&&session.acc>=DT&&session.state.status==='riding';n++){events.push(...step(l,session.state,u));session.acc-=DT;}
 if(session.acc>=DT||session.state.status!=='riding')session.acc=0;
 return events;
}
