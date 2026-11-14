/** NPC dialogue content and game-facing services, in natural Vietnamese. */
export const NPCS = Object.freeze([
  {id:'elder',zone:0,name:'Già Làng Nấm',job:'Trưởng làng · giao nhiệm vụ',color:'#eac477',robe:'#a2bd8d',face:'🧙',x:-6,z:7,action:'quest',actionLabel:'📜 Xem nhiệm vụ',price:0},
  {id:'healer',zone:0,name:'Thầy thuốc Lá Xanh',job:'Dược sư · trị thương',color:'#75c7a8',robe:'#d6efe5',face:'🌿',x:6,z:7.6,action:'heal',actionLabel:'💚 Trị thương · 18 xu',price:18},
  {id:'merchant',zone:0,name:'Thương nhân Hạt Sương',job:'Cửa hàng · bình hồi máu',color:'#ec8c9f',robe:'#e4c59e',face:'🪙',x:10.5,z:13,action:'potion',actionLabel:'🧪 Mua bình máu · 25 xu',price:25},
  {id:'ranger',zone:1,name:'Kiểm lâm Đom Đóm',job:'Thợ săn · chiến thuật',color:'#83c9b0',robe:'#9dbf79',face:'🏹',x:-7,z:7,action:'guard',actionLabel:'🛡️ Nhận bảo hộ · 15 xu',price:15},
  {id:'fairy',zone:1,name:'Tiên nữ Ánh Lửa',job:'Tiên thuật · phục hồi pháp lực',color:'#c6a9f1',robe:'#e8cafa',face:'🧚',x:8,z:7,action:'mana',actionLabel:'✨ Nhận phước lành',price:0},
  {id:'scholar',zone:2,name:'Học giả Pha Lê',job:'Tri thức · hướng dẫn đầm pha lê',color:'#8ccfff',robe:'#bddced',face:'📖',x:-7,z:7,action:'knowledge',actionLabel:'💎 Hỏi về quái pha lê',price:0},
  {id:'smith',zone:2,name:'Thợ rèn Thạch Anh',job:'Rèn luyện · cường hóa tấn công',color:'#f2af77',robe:'#b9a2a3',face:'⚒️',x:8,z:7,action:'upgrade',actionLabel:'⚔️ Cường hóa · 40 xu',price:40}
]);
export const npcsForZone = (zone) => NPCS.filter(n=>n.zone===zone);
export function getNpcLines(npc,state){
  const quest=state.quests?.[npc.zone]||0,completed=!!state.completed?.[npc.zone];
  switch(npc.id){
    case 'elder':return completed?[
      'Chào mừng chiến binh nấm đã trở về! Cháu đã bảo vệ làng rất dũng cảm.',
      'Hãy đi theo con đường đá, tới cổng ánh sáng. Khi đạt cấp ba, cháu có thể tiến vào Rừng Đom Đóm.'
    ]:[
      `Chào cháu! Ta là già làng Nấm. Quanh làng có sinh vật tinh nghịch đang phá hoại. Cháu hãy giúp đánh bại năm con. Hiện cháu đã đánh bại ${quest} con rồi.`,
      'Hãy dùng kiếm để đánh gần, dùng phép để đánh từ xa. Khi thấy đòn mạnh có vòng đỏ, lập tức lướt né.'
    ];
    case 'healer':return [
      'Chào con, ta là thầy thuốc Lá Xanh. Lá bạc và sương sớm giúp hồi phục sinh lực.',
      'Ta có thể phục hồi máu và pháp lực với mười tám xu tinh linh. Nhớ giữ vài bình máu khi vào rừng sâu nhé.'
    ];
    case 'merchant':return [
      'Lại đây xem hàng nào! Ta là thương nhân Hạt Sương, chuyên bán đồ dùng cho những nhà thám hiểm.',
      `Một bình hồi máu giá hai mươi lăm xu. Hiện con có ${Math.floor(state.coins||0)} xu. Chọn mua khi cần nhé.`
    ];
    case 'ranger':return [
      'Ta là kiểm lâm Đom Đóm. Bọn quái trong khu rừng này rất nhanh và biết mai phục.',
      'Đừng đứng trong vòng cảnh báo màu đỏ! Ta có thể ban một lớp bảo hộ trong bốn mươi lăm giây, đổi lấy mười lăm xu.'
    ];
    case 'fairy':return [
      'Xin chào! Ta là tiên nữ Ánh Lửa. Mỗi con đom đóm là một ánh sao của khu rừng.',
      'Phép thuật cần thời gian hồi lại. Ta sẽ giúp con phục hồi pháp lực miễn phí, nhưng chỉ một lần mỗi ba mươi giây.'
    ];
    case 'scholar':return completed?[
      'Các tinh thể đã trong sáng trở lại. Con đã giúp vùng đầm thoát khỏi sự hỗn loạn.',
      'Khi kết thúc chuyến đi, hãy ghé làng Nấm và kể lại hành trình cho già làng nghe nhé.'
    ]:[
      'Ta là học giả Pha Lê. Quái tinh thể có lớp vỏ cứng, và sức tấn công đặc biệt nguy hiểm ở cự ly gần.',
      'Hãy dùng phép từ xa để bào mòn lớp vỏ, lướt né khi lõi phát sáng, rồi tranh thủ tấn công lúc chúng hồi sức.'
    ];
    case 'smith':return [
      'Chào chiến binh! Ta là thợ rèn Thạch Anh. Từ tinh thạch nguyên chất, ta rèn nên sức mạnh của những vì sao.',
      'Với bốn mươi xu, ta sẽ cường hóa tạm thời sức đánh của con trong một phút. Hãy tận dụng để đấu với quái tinh anh.'
    ];
    default:return ['Chào mừng con đến với khu rừng tinh linh!'];
  }
}