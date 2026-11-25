import { validateLevel, type Level } from '../../reference-engine/src/engine';
import l01 from '../../levels/L01.json';
import l02 from '../../levels/L02.json';
import l03 from '../../levels/L03.json';
import l04 from '../../levels/L04.json';
import l05 from '../../levels/L05.json';
import l06 from '../../levels/L06.json';
import l07 from '../../levels/L07.json';
import l08 from '../../levels/L08.json';
import l09 from '../../levels/L09.json';
import l10 from '../../levels/L10.json';
import l11 from '../../levels/L11.json';
import l12 from '../../levels/L12.json';
export const levels=[l01,l02,l03,l04,l05,l06,l07,l08,l09,l10,l11,l12] as Level[];
levels.forEach(validateLevel);
export const findLevel=(id:string)=>levels.find(l=>l.id===id);
export const nextLevel=(id:string)=>levels[levels.findIndex(l=>l.id===id)+1];
export const descriptions:Record<string,string>={
 L01:'Nghiêng vào hướng cua để giữ người trong lòng máng.',L02:'Giữ thăng bằng trong đường ống; tránh va thành.',
 L03:'Giữ xe cân bằng theo đường ray.',L04:'Điều hướng bè, né các tảng đá.',L05:'Băng trơn, hãy sửa hướng sớm.',
 L06:'Chọn một trong hai cổng trái/phải.',L07:'Cua gắt và ngưỡng cân bằng hẹp hơn.',L08:'Dòng xiết thay đổi và đá chắn.',
 L09:'Đi qua cổng tuyết theo thứ tự.',L10:'Giữ tư thế ổn định khi hãm.',L11:'Cân bằng qua các khúc ray khó.',
 L12:'Kết hợp đường ống và cổng chọn hướng.'
};
export const familyNames={slide:'Trượt nước',rail:'Tàu lượn',raft:'Vượt thác',ice:'Trượt băng',fall:'Rơi tự do'};
