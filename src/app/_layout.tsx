import { Stack } from 'expo-router/stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator,View } from 'react-native';
import { useGame } from '@/stores/game-store';
import { palette } from '@/components/ui';
export default function Layout(){
 const ready=useGame(s=>s.ready);
 if(!ready)return <View style={{flex:1,backgroundColor:palette.bg,justifyContent:'center'}}><ActivityIndicator color={palette.accent}/></View>;
 return <><StatusBar style="light"/><Stack screenOptions={{headerStyle:{backgroundColor:palette.bg},headerTintColor:palette.text,contentStyle:{backgroundColor:palette.bg}}}><Stack.Screen name="index" options={{headerShown:false}}/><Stack.Screen name="park" options={{title:'Công viên'}}/><Stack.Screen name="settings" options={{title:'Cài đặt'}}/><Stack.Screen name="ride/[id]" options={{headerShown:false,gestureEnabled:false,animation:'none'}}/></Stack></>;
}
