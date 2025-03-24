<template>
  <div class="game-scene">
    <div class="scene-description">
      {{ currentScene.description }}
    </div>

    <div class="options">
      <el-button
          v-for="(option, index) in currentScene.options"
          :key="index"
          @click="chooseOption(option)"
          type="danger"
          class="option-button"
      >
        {{ option.text }}
      </el-button>
    </div>

    <div v-if="isGameOver" class="game-over">
      <h2>{{ endingMessage }}</h2>
      <el-button @click="restartGame" type="primary">重新开始</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

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
  openTruthDoor: {
    description: '你再次来到地下室，用钥匙打开了那扇刻有符号的门。门后是一个黑暗的房间，墙上写满了奇怪的符号。突然，一个黑影从角落扑向你……',
    options: [],
    ending: '你被黑影吞噬，成为了诅咒的一部分。',
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
};

// 当前场景
const currentScene = ref(scenes.start);
// 游戏是否结束
const isGameOver = ref(false);
// 结局信息
const endingMessage = ref('');

// 处理选项选择
const chooseOption = (option) => {
  const nextScene = scenes[option.next];
  if (nextScene) {
    currentScene.value = nextScene;
    if (nextScene.ending) {
      isGameOver.value = true;
      endingMessage.value = nextScene.ending;
    }
  }
};

// 重新开始游戏
const restartGame = () => {
  currentScene.value = scenes.start;
  isGameOver.value = false;
  endingMessage.value = '';
};
</script>

<style scoped>
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
</style>
