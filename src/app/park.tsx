import { router } from 'expo-router';
import { ScrollView,Text,View } from 'react-native';
import { levels,descriptions,familyNames } from '@/domain/levels';
import { useGame,unlocked } from '@/stores/game-store';
import { Action,Body,Heading,Panel,palette,styles } from '@/components/ui';
export default function Park(){const records=useGame(s=>s.records);
 return <ScrollView style={styles.screen} contentContainerStyle={styles.page}><Heading>12 thử thách</Heading><Body>Hoàn thành màn trước để mở màn kế tiếp.</Body>{levels.map((l,i)=>{const open=unlocked(l.id,records);return <Panel key={l.id}><View style={{flexDirection:'row',justifyContent:'space-between'}}><Text style={{color:palette.accent,fontWeight:'800'}}>{String(i+1).padStart(2,'0')} • {familyNames[l.family]}</Text><Text style={{color:palette.warn}}>{records[l.id]?'★'.repeat(records[l.id].stars):'Độ khó '+l.difficulty+'/5'}</Text></View><Text style={{color:palette.text,fontSize:22,fontWeight:'800'}}>{l.name}</Text><Body>{descriptions[l.id]} · {l.lengthM} m</Body>{records[l.id]&&<Body>Kỷ lục: {records[l.id].bestTime.toFixed(1)} s</Body>}<Action title={open?'Trải nghiệm':'🔒 Chưa mở khóa'} disabled={!open} onPress={()=>router.push({pathname:'/ride/[id]',params:{id:l.id}})}/></Panel>})}</ScrollView>
}
