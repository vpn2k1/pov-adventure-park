import { Component,type ReactNode } from 'react';
import { View } from 'react-native';
import { Action,Body,Heading,styles } from '@/components/ui';
export class RideBoundary extends Component<{children:ReactNode;onExit:()=>void},{failed:boolean}> {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true}}
 render(){return this.state.failed?<View style={[styles.screen,styles.page]}><Heading>Không khởi tạo được đồ họa</Heading><Body>Thiết bị hoặc bản build chưa hỗ trợ GL. Hãy thử dev build và kiểm tra expo-gl.</Body><Action title="Về công viên" onPress={this.props.onExit}/></View>:this.props.children}
}
