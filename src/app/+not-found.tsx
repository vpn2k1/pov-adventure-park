import { router } from 'expo-router';import { View } from 'react-native';import { Action,Heading,styles } from '@/components/ui';
export default function NotFound(){return <View style={[styles.screen,styles.page]}><Heading>Không tìm thấy màn hình</Heading><Action title="Về công viên" onPress={()=>router.replace('/')}/></View>}
