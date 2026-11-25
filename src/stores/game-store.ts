import { create } from 'zustand';
import { persist,createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';
import { levels } from '@/domain/levels';
export const settingsSchema=z.object({controlMode:z.enum(['tilt','touch']),sensitivity:z.number().min(.7).max(1.4),deadzone:z.number().min(2).max(8),fullTilt:z.number().min(20).max(35),comfort:z.boolean(),haptics:z.boolean(),invert:z.boolean(),sfxVolume:z.number().min(0).max(1)}).refine(v=>v.fullTilt>v.deadzone+10,{path:['fullTilt'],message:'Góc tối đa phải lớn hơn vùng chết ít nhất 10 độ.'});
export type Settings=z.infer<typeof settingsSchema>;
export const defaults:Settings={controlMode:'tilt',sensitivity:1,deadzone:4,fullTilt:28,comfort:true,haptics:true,invert:false,sfxVolume:.7};
const recordSchema=z.object({stars:z.number().int().min(1).max(3),bestTime:z.number().positive().finite()});
type RecordValue=z.infer<typeof recordSchema>;
type Game={settings:Settings;records:Record<string,RecordValue>;ready:boolean;error:boolean;setReady:(error?:boolean)=>void;saveSettings:(s:Settings)=>void;complete:(id:string,stars:number,time:number)=>void;resetProgress:()=>void};
export const unlocked=(id:string,records:Game['records'])=>{const i=levels.findIndex(l=>l.id===id);return i===0||(i>0&&levels.slice(0,i).every(l=>!!records[l.id]));};
export const useGame=create<Game>()(persist((set,get)=>({settings:defaults,records:{},ready:false,error:false,
 setReady:(error=false)=>set({ready:true,error}),
 saveSettings:s=>set({settings:settingsSchema.parse(s)}),
 complete:(id,stars,time)=>{if(!unlocked(id,get().records))return;const v=recordSchema.safeParse({stars,bestTime:time});if(!v.success)return;set(s=>{const old=s.records[id];return {records:{...s.records,[id]:{stars:Math.max(stars,old?.stars??0),bestTime:Math.min(time,old?.bestTime??Infinity)}}}})},
 resetProgress:()=>set({records:{}})
}),{name:'pov-park-v1',version:1,storage:createJSONStorage(()=>AsyncStorage),partialize:s=>({settings:s.settings,records:s.records}),merge:(p,c)=>{
 const v=p as Partial<Game>|undefined;const settings=settingsSchema.safeParse(v?.settings);
 const records:Game['records']={};for(const l of levels){const r=recordSchema.safeParse(v?.records?.[l.id]);if(r.success&&unlocked(l.id,records))records[l.id]=r.data;else break;}
 return {...c,settings:settings.success?settings.data:defaults,records};
},onRehydrateStorage:()=>()=>{setTimeout(()=>useGame.getState().setReady(!useGame.persist.hasHydrated()),0)}}));
