import { Redirect,useLocalSearchParams } from 'expo-router';
import { findLevel } from '@/domain/levels';
import { unlocked,useGame } from '@/stores/game-store';
import { RideScreen } from '@/screens/ride';
export default function RideRoute(){const {id}=useLocalSearchParams<{id:string}>();const records=useGame(s=>s.records);const l=typeof id==='string'?findLevel(id):undefined;if(!l||!unlocked(l.id,records))return <Redirect href="/park"/>;return <RideScreen key={l.id} level={l}/>;}
