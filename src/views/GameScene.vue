<template>
  <div v-if="!gameStarted" class="start-screen">
    <h1>午夜回声</h1>
    <p>尝试次数: {{ attemptCount }}</p>
    <p>已解锁结局: {{ unlockedEndings.length }} / {{ totalEndings }}</p>
    <el-button @click="startGame" type="primary">开始游戏</el-button>
  </div>
  <div v-else class="game-scene">
    <div class="scene-description">
      {{ currentScene.description }}
    </div>
    <div v-if="currentScene.image" class="scene-image">
      <img :src="currentScene.image" alt="Scene Image" />
    </div>
    <div class="options">
      <el-button
          v-for="(option, index) in currentScene.options"
          :key="index"
          @click="chooseOption(option)"
          type="danger"
          class="option-button"
          text
          bg
      >
        {{ option.text }}
      </el-button>
    </div>
    <div v-if="isGameOver" class="game-over">
      <h2>{{ endingMessage }}</h2>
      <div style="margin-top: 20px;display: flex; justify-content: center">
        <el-button @click="restartGame" type="primary">重新开始</el-button>

      </div >
      <div style="margin-top: 20px;display: flex; justify-content: center" >
        <el-button @click="returnToMainMenu" type="primary">返回主界面</el-button>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref ,onMounted} from 'vue';
import amy from '../assets/img/amy.jpg';
import mouse from '../assets/img/mouse.jpg';
import {ElMessageBox} from "element-plus";

// 游戏场景数据
const scenes = {
  start: {
    description: '你躺在床上，突然被一阵低沉的敲击声惊醒。窗外的月光透过窗帘洒在地板上，映出诡异的影子。敲击声再次响起，似乎来自楼下的地下室。你感到一阵寒意，心跳加速。',
    options: [
      { text: '起身查看声音的来源', next: 'investigate' },
      { text: '假装没听见，继续睡觉', next: 'ignore' },
      { text: '打开手机，看看时间', next: 'checkPhone' },
    ],
  },
  investigate: {
    description: '你穿上拖鞋，拿起手电筒，轻轻打开房门。走廊里一片寂静，只有你的脚步声在回荡。你走向楼梯，敲击声越来越清晰。',
    options: [
      { text: '顺着楼梯下楼，前往地下室', next: 'basementDoor' },
      { text: '回到房间，锁上门', next: 'lockDoor' },
    ],
  },
  basementDoor: {
    description: '你走到地下室门口，发现门虚掩着。手电筒的光束照进门缝，你看到地上有一串湿漉漉的脚印，似乎刚刚有人经过。',
    options: [
      { text: '推开门，进入地下室', next: 'enterBasement' },
      { text: '转身逃跑，回到房间', next: 'returnToRoom' },
    ],
  },
  enterBasement: {
    description: '你推开地下室的门，空气中弥漫着一股霉味和铁锈的气息。手电筒的光束照亮了角落，你看到一个破旧的木箱，箱子上刻着奇怪的符号。敲击声突然停止了。',
    options: [
      { text: '打开木箱', next: 'openBox' },
      { text: '离开地下室，回到房间', next: 'returnToRoom' },
    ],
  },
  openBox: {
    description: '你打开木箱，发现里面是一本泛黄的日记和一把生锈的钥匙。日记的最后一页写着：“不要相信他，他已经不是人了……”突然，你听到身后传来脚步声。',
    options: [
      { text: '转身查看', next: 'badEnding1' },
      { text: '拿起钥匙，迅速离开', next: 'escapeBasement' },
    ],
  },
  badEnding1: {
    description: '你转过身，手电筒的光束照到一个苍白的面孔——那是你的邻居，但他的眼睛空洞无神，嘴角挂着诡异的微笑。他低声说道：“你终于来了……”',
    options: [],
    ending: '你被拖入黑暗，永远消失在地下室中。',
  },
  escapeBasement: {
    description: '你拿起钥匙，迅速逃离地下室。回到房间后，你锁上门，心跳依然无法平静。钥匙上刻着一个奇怪的符号，似乎与日记中的内容有关。',
    options: [
      { text: '查看日记', next: 'readDiary' },
      { text: '把钥匙藏起来，继续睡觉', next: 'hideKey' },
    ],
  },
  readDiary: {
    description: '你翻开日记，发现里面记录着公寓的历史。原来这座公寓曾是一个邪教组织的据点，他们在地下室进行过某种仪式。最后一页写着：“钥匙可以打开真相之门，但也会释放诅咒。”',
    options: [
      { text: '用钥匙打开地下室的门', next: 'openTruthDoor' },
      { text: '销毁钥匙，远离这一切', next: 'destroyKey' },
    ],
  },
  destroyKey: {
    description: '你决定销毁钥匙，远离这一切。你把钥匙扔进了河里，回到公寓后，敲击声再也没有出现。但你总觉得有人在暗中注视着你……',
    options: [],
    ending: '你逃过一劫，但诅咒并未消失。',
  },
  hideKey: {
    description: '你把钥匙藏在了衣柜的最深处，试图忘记这一切。然而，深夜的敲击声依然不时响起，你开始怀疑自己是否做出了正确的选择……',
    options: [],
    ending: '你选择逃避，但诅咒依然如影随形。',
  },
  returnToRoom: {
    description: '你回到房间，锁上门，试图让自己冷静下来。然而，敲击声依然在耳边回荡，仿佛在提醒你，有些事情无法逃避……',
    options: [
      { text: '再次前往地下室', next: 'enterBasement' },
      { text: '继续睡觉，假装一切正常', next: 'badEnding2' },
    ],
  },
  ignore: {
    description: '你试图忽略敲击声，闭上眼睛强迫自己入睡。然而，声音越来越大，仿佛就在你的耳边。你感到床下传来一阵轻微的震动。',
    options: [
      { text: '掀开床单，查看床下', next: 'underBed' },
      { text: '用被子蒙住头，继续睡觉', next: 'badEnding2' },
    ],
  },
  underBed: {
    description: '你掀开床单，手电筒的光束照向床下。你看到一双血红的眼睛正盯着你，一张扭曲的脸慢慢从黑暗中浮现。',
    options: [],
    ending: '你被拖入床下的深渊，永远无法逃脱。',
  },
  badEnding2: {
    description: '你用被子蒙住头，试图屏蔽一切声音。突然，你感到被子被一股力量掀开，一个黑影站在你床边，低声说道：“你逃不掉的……”',
    options: [],
    ending: '你被黑影拖入黑暗，永远消失。',
  },
  checkPhone: {
    description: '你打开手机，屏幕上显示凌晨3:15。突然，手机收到一条陌生号码发来的短信：“不要相信你所看到的。”',
    options: [
      { text: '回复短信，询问对方是谁', next: 'replyMessage' },
      { text: '删除短信，继续睡觉', next: 'ignoreMessage' },
    ],
  },
  replyMessage: {
    description: '你回复短信：“你是谁？”几秒后，手机再次震动：“我是你楼下的邻居，快逃，他来了……”',
    options: [
      { text: '起身查看窗外', next: 'lookOutWindow' },
      { text: '打电话给警察', next: 'callPolice' },
    ],
  },
  lookOutWindow: {
    description: '你走到窗边，拉开窗帘。楼下站着一个黑影，正抬头盯着你的窗户。他的脸隐藏在阴影中，但你感觉到他在笑。',
    options: [],
    ending: '你被黑影拖出窗外，消失在夜色中。',
  },
  callPolice: {
    description: '你拨打了警察的电话，但电话那头只有杂音。突然，你听到门外传来脚步声，似乎有人正在靠近你的房间。',
    options: [
      { text: '打开门查看', next: 'openDoor' },
      { text: '躲进衣柜', next: 'hideInCloset' },
    ],
  },
  openDoor: {
    description: '你打开门，发现门外空无一人。但当你转身时，一个黑影从背后扑向你……',
    options: [],
    ending: '你被黑影袭击，永远消失。',
  },
  hideInCloset: {
    description: '你躲进衣柜，屏住呼吸。门外的脚步声越来越近，最终停在了你的房间门口。你听到门被缓缓推开的声音……',
    options: [],
    ending: '你被发现并拖入黑暗，永远消失。',
  },
  ignoreMessage: {
    description: '你删除了短信，试图继续睡觉。但敲击声越来越大，你感到床下传来一阵轻微的震动。',
    options: [
      { text: '掀开床单，查看床下', next: 'underBed' },
      { text: '用被子蒙住头，继续睡觉', next: 'badEnding2' },
    ],
  },
  lockDoor: {
    description: '你回到房间，锁上门，试图让自己冷静下来。然而，敲击声依然在耳边回荡，仿佛在提醒你，有些事情无法逃避……',
    options: [
      { text: '再次前往地下室', next: 'enterBasement' },
      { text: '继续睡觉，假装一切正常', next: 'badEnding2' },
    ],
  },
  // 合并后的场景：邪教仪式与艾米的命运
  openTruthDoor: {
    description: '你再次来到地下室，用钥匙打开了那扇刻有符号的门。门后是一个黑暗的房间，墙上写满了奇怪的符号。房间中央有一个祭坛，上面摆放着一本厚重的古书和几根蜡烛。',
    options: [
      { text: '查看古书', next: 'readAncientBook' },
      { text: '点燃蜡烛', next: 'lightCandles' },
      { text: '离开房间', next: 'leaveRitualRoom' },
    ],
  },
  readAncientBook: {
    description: '你翻开古书，发现里面记载着一种古老的仪式。原来这座公寓曾是一个邪教组织的据点，他们试图通过仪式召唤某种不可名状的存在。最后一页写着：“只有献祭才能平息祂的愤怒。”',
    options: [
      { text: '继续阅读', next: 'findSacrificeClue' },
      { text: '合上书本，离开房间', next: 'leaveRitualRoom' },
    ],
  },
  leaveRitualRoom: {
    description: '你离开了房间，回到走廊。你感到诅咒的力量已经盯上了你，决定逃离公寓。',
    options: [
      { text: '前往出口', next: 'escapeApartment' },
      { text: '回到房间', next: 'returnToRoom' },
    ],
  },
  findSacrificeClue: {
    description: '你继续阅读，发现书中提到需要献祭一个“纯洁的灵魂”才能结束诅咒。书的夹层中掉出一张泛黄的照片，上面是一个年轻女孩，背面写着：“她是最合适的祭品。”',
    options: [
      { text: '带走照片', next: 'takePhoto' },
      { text: '将书放回原处', next: 'leaveRitualRoom' },
    ],
  },
  takePhoto: {
    description: '你拿起照片，突然听到身后传来低语声：“你找到了她……”你转过身，发现房间的门不知何时已经关上，蜡烛的火光开始摇曳。',
    options: [
      { text: '尝试打开门', next: 'tryOpenDoor' },
      { text: '吹灭蜡烛', next: 'blowOutCandles' },
    ],
  },
  tryOpenDoor: {
    description: '你冲向门，试图打开它，但门纹丝不动。低语声越来越近，你感到一股寒意从背后袭来。',
    options: [],
    ending: '你被困在房间中，成为了仪式的下一个祭品。',
  },
  blowOutCandles: {
    description: '你吹灭了蜡烛，房间陷入一片黑暗。低语声突然停止，门缓缓打开。你逃出了房间，但照片依然握在手中。',
    options: [
      { text: '回到房间，研究照片', next: 'researchPhoto' },
      { text: '将照片扔掉', next: 'throwPhoto' },
    ],
  },
  throwPhoto: {
    description: '你将照片扔进了垃圾桶，试图忘记这一切。然而，深夜的敲击声再次响起，你感到床下传来一阵轻微的震动。',
    options: [
      { text: '掀开床单，查看床下', next: 'underBed' },
      { text: '用被子蒙住头，继续睡觉', next: 'badEnding2' },
    ],
  },
  researchPhoto: {
    description: '你回到房间，仔细研究照片。你发现照片中的女孩似乎是你公寓的前住户，她的名字叫“艾米”。你决定调查她的下落。',
    options: [
      { text: '前往公寓管理处询问', next: 'askManagement' },
      { text: '在网上搜索艾米的信息', next: 'searchOnline' },
    ],
  },
  searchOnline: {
    description: '你在网上搜索艾米的信息，发现她在五年前神秘失踪，警方至今没有找到她的下落。你感到一阵不安，决定前往她的房间查看。',
    options: [
      { text: '前往艾米的房间', next: 'enterAmysRoom' },
      { text: '放弃调查', next: 'giveUpInvestigation' },
    ],
  },
  askManagement: {
    description: '你来到公寓管理处，管理员告诉你艾米在五年前神秘失踪，她的房间至今空置。你感到一阵不安，决定前往她的房间查看。',
    options: [
      { text: '前往艾米的房间', next: 'enterAmysRoom' },
      { text: '放弃调查', next: 'giveUpInvestigation' },
    ],
  },
  giveUpInvestigation: {
    description: '你决定放弃调查艾米的下落，回到自己的房间。然而，深夜的敲击声依然不时响起，你感到床下传来一阵轻微的震动。',
    options: [
      { text: '掀开床单，查看床下', next: 'underBed' },
      { text: '用被子蒙住头，继续睡觉', next: 'badEnding2' },
    ],
  },
  enterAmysRoom: {
    description: '你来到艾米的房间，发现门没有上锁。房间里布满了灰尘，墙上贴满了奇怪的符号。你看到桌上有一本日记，似乎是她留下的。',
    options: [
      { text: '查看日记', next: 'readAmysDiary' },
      { text: '离开房间', next: 'leaveAmysRoom' },
    ],
  },
  leaveAmysRoom: {
    description: '你离开了艾米的房间，回到走廊。然而，你总觉得有人在暗中注视着你，仿佛艾米的灵魂依然在徘徊。',
    options: [
      { text: '前往地下室', next: 'enterBasement' },
      { text: '回到房间', next: 'returnToRoom' },
    ],
  },
  readAmysDiary: {
    description: '你翻开日记，发现艾米曾是邪教组织的成员，但她试图逃离。最后一页写着：“他们找到了我，我知道我逃不掉了……”',
    options: [
      { text: '尝试与艾米的灵魂沟通', next: 'contactAmysSpirit' },
      { text: '合上日记，离开房间', next: 'leaveAmysRoom' },
    ],
  },
  contactAmysSpirit: {
    description: '你低声呼唤艾米的名字，房间的温度骤然下降。你看到墙上的符号开始发光，一个模糊的身影出现在你面前。她低声说道：“救救我……”',
    options: [
      { text: '询问如何救她', next: 'askHowToSaveHer' },
      { text: '逃离房间', next: 'fleeFromSpirit' },
    ],
  },
  askHowToSaveHer: {
    description: '艾米的灵魂低声说道：“只有完成仪式，才能结束诅咒。但你必须找到我的遗物，它们被藏在公寓的不同地方。”',
    options: [
      { text: '答应帮助她', next: 'agreeToHelp' },
      { text: '拒绝帮助她', next: 'refuseToHelp' },
    ],
  },
  agreeToHelp: {
    description: '你答应帮助艾米，她的灵魂递给你一张纸条，上面写着三个地点：洗衣房、储物室和屋顶。你需要找到她的遗物，才能完成仪式。',
    options: [
      { text: '前往洗衣房', next: 'goToLaundryRoom' },
      { text: '前往储物室', next: 'goToStorageRoom' },
      { text: '前往屋顶', next: 'goToRoof' },
    ],
  },
  takeBackpack: {
    description: '你拿起背包，准备前往下一个地点。突然，你听到身后传来低语声：“你找到了第一个……”',
    options: [
      { text: '前往储物室', next: 'goToStorageRoom' },
      { text: '前往屋顶', next: 'goToRoof' },
    ],
  },
  takeNecklace: {
    description: '你拿起项链，突然感到一阵寒意。低语声再次响起：“你找到了第二个……”',
    options: [
      { text: '前往屋顶', next: 'goToRoof' },
    ],
  },
  takeRing: {
    description: '你拿起戒指，突然听到艾米的声音：“谢谢你……现在，请完成仪式。”',
    options: [
      { text: '完成仪式', next: 'completeRitual' },
    ],
  },
  completeRitual: {
    description: '你回到地下室，将艾米的遗物放在祭坛上。墙上的符号开始发光，低语声越来越响。你感到一股强大的力量在房间中涌动。',
    options: [
      { text: '献祭艾米', next: 'sacrificeAmy' },
      { text: '拒绝献祭', next: 'refuseSacrifice' },
    ],
  },
  sacrificeAmy: {
    description: '你低声念出仪式的内容，艾米的灵魂逐渐消散。低语声停止了，房间恢复了平静。你感到诅咒已经被解除。',
    image: amy,
    options: [],
    ending: '你完成了仪式，诅咒被解除。艾米的灵魂被解救……',
  },
  refuseSacrifice: {
    description: '你拒绝献祭艾米，低语声突然变得愤怒。墙上的符号开始燃烧，你感到一股强大的力量将你拖入黑暗。',
    options: [],
    ending: '你被诅咒吞噬，永远消失在地下室中。',
  },
  fleeFromSpirit: {
    description: '你逃离了房间，回到自己的房间。然而，你总觉得有人在暗中注视着你，仿佛艾米的灵魂依然在徘徊。',
    options: [],
    ending: '你选择逃避，但诅咒依然如影随形。',
  },
  refuseToHelp: {
    description: '你拒绝了艾米的请求，她的灵魂发出一声凄厉的尖叫。房间的温度骤降，你感到一股强大的力量将你拖入黑暗。',
    options: [],
    ending: '你被诅咒吞噬，永远消失在地下室中。',
  },
  //洗衣房的秘密
  goToLaundryRoom: {
    description: '你来到洗衣房，发现角落里有一个破旧的背包。你打开背包，发现里面是艾米的日记本和一张照片。洗衣房的灯光忽明忽暗，你听到远处传来低沉的脚步声。',
    options: [
      { text: '查看日记本', next: 'readAmysDiary2' },
      { text: '带走背包', next: 'takeBackpack' },
      { text: '查看照片', next: 'examinePhoto' },
    ],
  },
  examinePhoto: {
    description: '你拿起照片，发现上面是艾米和一群人的合影，背景是公寓的地下室。照片背面写着：“我们无法逃脱……”突然，你听到洗衣机的门被缓缓打开。',
    options: [
      { text: '查看洗衣机', next: 'checkWasher' },
      { text: '离开洗衣房', next: 'leaveLaundryRoom' },
    ],
  },
  checkWasher: {
    description: '你打开洗衣机的门，发现里面有一件沾满血迹的衣服。衣服的口袋里有一张纸条，上面写着：“他们在看着我……”',
    options: [
      { text: '带走纸条', next: 'takeNote' },
      { text: '离开洗衣房', next: 'leaveLaundryRoom' },
    ],
  },
  takeNote: {
    description: '你拿起纸条，突然听到身后传来低语声：“你找到了线索……”你转过身，发现洗衣房的门不知何时已经关上。',
    options: [
      { text: '尝试打开门', next: 'tryOpenLaundryDoor' },
      { text: '查看背包', next: 'takeBackpack' },
    ],
  },
  tryOpenLaundryDoor: {
    description: '你冲向门，试图打开它，但门纹丝不动。低语声越来越近，你感到一股寒意从背后袭来。',
    options: [],
    ending: '你被困在洗衣房中，成为了下一个受害者。',
  },
  leaveLaundryRoom: {
    description: '你离开了洗衣房，回到走廊。然而，你总觉得有人在暗中注视着你，仿佛诅咒的力量已经盯上了你。',
    options: [
      { text: '前往储物室', next: 'goToStorageRoom' },
      { text: '前往屋顶', next: 'goToRoof' },
    ],
  },
  //储物室的恐怖
  goToStorageRoom: {
    description: '你来到储物室，发现角落里有一个锁着的箱子。你用艾米的钥匙打开箱子，发现里面是她的项链和一张纸条，上面写着：“屋顶是最后的线索。”储物室的灯光开始闪烁，你听到角落里传来低沉的呼吸声。',
    options: [
      { text: '带走项链', next: 'takeNecklace' },
      { text: '查看纸条', next: 'readStorageNote' },
      { text: '离开储物室', next: 'leaveStorageRoom' },
    ],
  },
  readStorageNote: {
    description: '你拿起纸条，发现上面写着：“他们在地下室等着我……”突然，你听到储物室的门被缓缓关上。',
    options: [
      { text: '尝试打开门', next: 'tryOpenStorageDoor' },
      { text: '查看项链', next: 'takeNecklace' },
    ],
  },
  tryOpenStorageDoor: {
    description: '你冲向门，试图打开它，但门纹丝不动。呼吸声越来越近，你感到一股寒意从背后袭来。',
    options: [],
    ending: '你被困在储物室中，成为了下一个受害者。',
  },
  leaveStorageRoom: {
    description: '你离开了储物室，回到走廊。然而，你总觉得有人在暗中注视着你，仿佛诅咒的力量已经盯上了你。',
    options: [
      { text: '前往屋顶', next: 'goToRoof' },
      { text: '前往洗衣房', next: 'goToLaundryRoom' },
    ],
  },
  //屋顶的真相
  goToRoof: {
    description: '你来到屋顶，发现角落里有一个破旧的盒子。你打开盒子，发现里面是艾米的戒指和一张纸条，上面写着：“完成仪式，结束诅咒。”屋顶的风声呼啸，你感到一阵不安。',
    options: [
      { text: '带走戒指', next: 'takeRing' },
      { text: '查看纸条', next: 'readRoofNote' },
      { text: '离开屋顶', next: 'leaveRoof' },
    ],
  },
  readRoofNote: {
    description: '你拿起纸条，发现上面写着：“他们在地下室等着我……”突然，你听到身后传来脚步声。',
    options: [
      { text: '转身查看', next: 'lookBehind' },
      { text: '带走戒指', next: 'takeRing' },
    ],
  },
  lookBehind: {
    description: '你转过身，发现一个黑影站在你身后，他的眼睛空洞无神，嘴角挂着诡异的微笑。他低声说道：“你终于来了……”',
    options: [],
    ending: '你被黑影拖入黑暗，永远消失在屋顶上。',
  },
  leaveRoof: {
    description: '你离开了屋顶，回到走廊。然而，你总觉得有人在暗中注视着你，仿佛诅咒的力量已经盯上了你。',
    options: [
      { text: '前往地下室', next: 'enterBasement' },
      { text: '回到房间', next: 'returnToRoom' },
    ],
  },
  //逃离公寓
  escapeApartment: {
    description: '你冲向公寓的出口，但门被锁上了。你听到身后传来低语声：“你逃不掉的……”',
    options: [
      { text: '寻找钥匙', next: 'findKey' },
      { text: '尝试破门', next: 'breakDoor' },
    ],
  },
  findKey: {
    description: '你在走廊的角落里找到了一把钥匙，迅速打开门逃离了公寓。你感到诅咒的力量逐渐消失。',
    options: [],
    ending: '你成功逃离了公寓，但诅咒依然如影随形。',
  },
  breakDoor: {
    description: '你试图破门，但门纹丝不动。低语声越来越近，你感到一股寒意从背后袭来。',
    options: [],
    ending: '你被困在公寓中，成为了下一个受害者。',
  },
};


// 当前场景
const currentScene = ref(scenes.start);
// 游戏是否结束
const isGameOver = ref(false);
// 结局信息
const endingMessage = ref('');
// 游戏是否开始
const gameStarted = ref(false);
// 尝试次数
const attemptCount = ref(0);
// 已解锁结局
const unlockedEndings = ref([]);
// 总结局数量
const totalEndings = Object.values(scenes).filter(scene => scene.ending).length;
//提示框
const hasShownAlert = ref(false);

// 开始游戏
const startGame = () => {
  gameStarted.value = true;
  attemptCount.value += 1;
  localStorage.setItem('attemptCount', attemptCount.value);
};

// 处理选项选择
const chooseOption = (option) => {
  const nextScene = scenes[option.next];
  if (nextScene) {
    currentScene.value = nextScene;
    if (nextScene.ending) {
      isGameOver.value = true;
      endingMessage.value = nextScene.ending;
      // 记录已解锁结局
      if (!unlockedEndings.value.includes(nextScene.ending)) {
        unlockedEndings.value.push(nextScene.ending);
        localStorage.setItem('unlockedEndings', JSON.stringify(unlockedEndings.value));
      }
    }
  }
  // 移除按钮的焦点状态
  event.target.blur();
};

// 重新开始游戏
const restartGame = () => {
  currentScene.value = scenes.start;
  isGameOver.value = false;
  endingMessage.value = '';
  attemptCount.value += 1;
  localStorage.setItem('attemptCount', attemptCount.value);
};
const returnToMainMenu = () => {
  gameStarted.value = false;
  isGameOver.value = false;
  endingMessage.value = '';
  currentScene.value = scenes.start;
};
// 初始化时加载尝试次数和已解锁结局
onMounted(() => {
  attemptCount.value = parseInt(localStorage.getItem('attemptCount')) || 0;
  unlockedEndings.value = JSON.parse(localStorage.getItem('unlockedEndings')) || [];
  if (!hasShownAlert.value) {
    ElMessageBox.alert('欢迎来到恐怖文字游戏！请小心选择，你的决定将影响结局。（测试版本如遇到bug请截图反馈）',  {
      confirmButtonText: '我知道了',
      callback: () => {
        hasShownAlert.value = true;
      },
    });
  }
});

</script>

<style scoped>
.start-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #1a1a1a;
  color: #fff;
  text-align: center;
}

.start-screen h1 {
  font-size: 3rem;
  margin-bottom: 20px;
}

.start-screen p {
  font-size: 1.2rem;
  margin: 10px 0;
}

.start-screen .el-button {
  margin-top: 20px;
}

.game-scene {
  width: 100vw;
  height: 100vh;
  margin: 0 auto;
  padding: 20px;
  background-color: #2a2a2a;
  color: #fff;
}

.scene-description {
  font-size: 18px;
  margin-bottom: 20px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-button {
  width: 100%;
}
.game-over {
  margin-top: 20px;
}

.el-button+.el-button {
  margin-left: 0px;
}
.scene-image{
  display: flex;
  justify-content: center;
}
.scene-image img {

  max-width: 180px;
  height: auto;
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
</style>
