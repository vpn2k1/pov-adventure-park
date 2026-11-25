import type { ReactNode } from 'react';
import { Pressable,StyleSheet,Text,View } from 'react-native';
export const palette={bg:'#071E2C',panel:'#123649',text:'#F4FBFF',muted:'#A5C7D3',accent:'#40D8E2',warn:'#FFC66D',danger:'#FF8C85',green:'#7AE5AA'};
export function Action({title,onPress,secondary=false,disabled=false}:{title:string;onPress:()=>void;secondary?:boolean;disabled?:boolean}){
 return <Pressable accessibilityRole="button" accessibilityState={{disabled}} disabled={disabled} onPress={onPress} style={({pressed})=>[styles.button,secondary&&styles.secondary,disabled&&{opacity:.42},pressed&&{opacity:.76}]}><Text style={[styles.buttonText,secondary&&{color:palette.text}]}>{title}</Text></Pressable>
}
export function Heading({children}:{children:ReactNode}){return <Text style={styles.heading}>{children}</Text>}
export function Body({children}:{children:ReactNode}){return <Text style={styles.body}>{children}</Text>}
export function Panel({children}:{children:ReactNode}){return <View style={styles.panel}>{children}</View>}
export const styles=StyleSheet.create({screen:{flex:1,backgroundColor:palette.bg},page:{padding:20,gap:16},heading:{fontSize:30,fontWeight:'800',color:palette.text},body:{fontSize:15,color:palette.muted,lineHeight:22},panel:{padding:16,gap:10,backgroundColor:palette.panel,borderRadius:18},button:{paddingVertical:14,paddingHorizontal:20,minHeight:48,justifyContent:'center',alignItems:'center',backgroundColor:palette.accent,borderRadius:14},secondary:{backgroundColor:palette.panel,borderWidth:1,borderColor:'#527785'},buttonText:{color:palette.bg,fontSize:16,fontWeight:'800'}});
