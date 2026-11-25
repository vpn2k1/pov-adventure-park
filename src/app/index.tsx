import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text,View,ScrollView } from 'react-native';
import { Action,Body,Heading,Panel,palette,styles } from '@/components/ui';
import { levels } from '@/domain/levels';
import { unlocked,useGame } from '@/stores/game-store';
export default function Home(){
 const records=useGame(s=>s.records),error=useGame(s=>s.error);const next=levels.find(l=>unlocked(l.id,records)&&!records[l.id])??levels[0];
 return <SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={[styles.page,{flexGrow:1,justifyContent:'center'}]}><Text style={{color:palette.accent,fontWeight:'800',letterSpacing:4}}>POV • 2.5D</Text><Heading>ADVENTURE PARK</Heading><Body>Nghiêng máy. Giữ thăng bằng. Chinh phục công viên.</Body><Panel><Text style={{color:palette.text,fontSize:20,fontWeight:'800'}}>Hành trình của bạn</Text><Body>{Object.keys(records).length} / 12 trò đã chinh phục</Body><View style={{height:8,borderRadius:4,backgroundColor:palette.bg}}><View style={{height:8,borderRadius:4,backgroundColor:palette.accent,width:(Object.keys(records).length/12*100)+'%' as `${number}%`}}/></View>{error&&<Body>Không đọc được dữ liệu đã lưu; đang dùng phiên tạm.</Body>}</Panel><Action title={'Tiếp tục · '+next.name} onPress={()=>router.push({pathname:'/ride/[id]',params:{id:next.id}})}/><Action title="Chọn trò chơi" secondary onPress={()=>router.push('/park')}/><Action title="Cài đặt" secondary onPress={()=>router.push('/settings')}/><Body>Prototype • Nên chơi khi ngồi yên. Dừng nếu chóng mặt.</Body></ScrollView></SafeAreaView>
}
