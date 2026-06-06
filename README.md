# 🎈 欢乐拍泡泡 (Bubble Pop Fun!) - 4岁幼儿体感互动游戏

本项目是一个专为 **4岁左右幼儿** 设计的网页体感互动游戏。通过调用本地摄像头，孩子们可以直接在屏幕前挥动双手，用可爱的“猫爪”或“魔法棒”拍碎屏幕上不断飘出的七彩大泡泡。游戏贯彻 **“零挫败感”** 设计理念，无任何限时、惩罚或生命扣减机制，纯粹带给孩子探索与操控的快乐。

---

## 1. 体感识别技术底座 (Vision Technology Base)

本项目选用了 Google 推出的高性能轻量级视觉识别库 **MediaPipe Hands**。

### CDN 引入方式
在 `index.html` 的 `<head>` 部分，我们通过加载官方 CDN 资源，快速集成了手势检测网络：

```html
<!-- 引入 MediaPipe 摄像头采集和手势检测模块 -->
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
```

### 初始化逻辑 (`js/vision.js`)
通过 JavaScript 动态实例化 `Hands` 模型，指定本地/CDN 资源定位，并配置优化参数：
```javascript
this.hands = new window.Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

this.hands.setOptions({
  maxNumHands: 2,           // 最大追踪双手数量
  modelComplexity: 1,       // 模型复杂度 (1 = 适合正常光线与玩耍)
  minDetectionConfidence: 0.6, // 最小检测置信度
  minTrackingConfidence: 0.5   // 最小追踪置信度
});
```

---

## 2. 核心原理通俗解释 (How it works)

摄像机捕捉的原始视频流，转换为屏幕上活灵活现的“猫爪”和“魔法棒”的计算步骤如下：

```
[摄像头视频帧] -> [MediaPipe Hands 神经网络] -> [21个归一化三维手部骨骼关节点]
                                                       |
[平滑滤波 (Lerp) 算法] <- [映射至屏幕镜像坐标] <- [计算手掌中心点 (Wrist & Knuckle)]
         |
[渲染 Canvas: 绘制猫爪 + 粒子星尘轨迹] -> [多关节点碰撞检测 -> 气泡破裂]
```

### (1) 骨骼关节点识别
当摄像头画面被送入 MediaPipe 神经网络后，它会返回一个包含 21 个骨骼关节点（Landmarks）的数组。每个点都包含 `x` 和 `y` 的归一化坐标值（范围为 `0.0` 到 `1.0`，对应画面左上角到右下角）。

### (2) 计算手掌中心点
我们通过取 **手腕起点 (Landmark 0)** 和 **中指根部关节点 (Landmark 9)** 坐标的平均值，计算出手掌的绝对物理中心：
$$\text{CenterX} = \frac{\text{Wrist.x} + \text{MiddleKnuckle.x}}{2}$$
$$\text{CenterY} = \frac{\text{Wrist.y} + \text{MiddleKnuckle.y}}{2}$$

### (3) 平滑抖动滤波 (EMA / Lerp)
为了避免孩子因为手部细微颤抖或摄像头噪点导致屏幕上的指针剧烈跳动，我们在 `js/vision.js` 中使用 **指数移动平均算法 (Exponential Moving Average / Lerp)** 对坐标做平滑过渡：
```javascript
// lerpFactor 越低越平滑，响应稍有延迟；这里取 0.25 保证平滑且反应迅速
this.smoothLeft.x += (targetX - this.smoothLeft.x) * this.lerpFactor;
this.smoothLeft.y += (targetY - this.smoothLeft.y) * this.lerpFactor;
```

---

## 3. 坐标映射与碰撞检测 (Mapping & Collisions)

### (1) 水平镜像翻转与等比例映射
因为摄像头拍摄的画面是面对玩家的，我们需要对其进行**水平镜像翻转**，确保孩子举起左手时，屏幕左侧的指针跟随移动。
- **镜像公式**：$x_{\text{canvas}} = (1 - x_{\text{landmark}}) \times \text{CanvasWidth}$
- **Y轴映射**：$y_{\text{canvas}} = y_{\text{landmark}} \times \text{CanvasHeight}$

```javascript
// 将 0.0~1.0 的归一化坐标等比放大映射到 Canvas 像素坐标上
const px = (1 - handData.x) * canvasWidth;
const py = handData.y * canvasHeight;
```

### (2) 21点多关节点碰撞检测 (Euclidean Distance)
为了配合 4 岁幼儿较为粗大的手势挥动，提升挥击的灵敏度，我们放弃了只检测“手掌中心”的单点碰撞，改为**对全部 21 个手部骨骼节点进行独立检测**。
当任意一个节点与泡泡中心点的距离小于气泡半径的 **1.5 倍**（判定范围调大 1.5 倍）时，气泡立即被判定为拍碎。

我们使用 **欧几里得距离公式 (Euclidean Distance)** 计算两点距离：
$$d = \sqrt{(x_{\text{bubble}} - x_{\text{joint}})^2 + (y_{\text{bubble}} - y_{\text{joint}})^2}$$

```javascript
// 代码中的数学实现
const dx = bubble.x - joint.x;
const dy = bubble.y - joint.y;
const distance = Math.sqrt(dx * dx + dy * dy);

if (distance < bubble.radius * 1.5) {
  // 气泡破裂！
}
```

---

## 4. 当前项目进度与优化汇总 (Current Progress)

### 已修改文件清单
- 📂 [index.html](file:///f:/test/index.html) - 升级为儿童化 HUD（取消数字计分板，替换为十颗爱心/星星插槽、BGM 播放/静音控件以及精简后的极简开始菜单）。
- 📂 [style.css](file:///f:/test/css/style.css) - 新增儿童化按钮动画、星空闪烁和卡片放大效果。
- 📂 [game.js](file:///f:/test/js/game.js) - 重写游戏循环与状态机。剔除生命限制、掉落伤害和炸弹；实现 3D 拟真气泡渲染、猫爪光标和魔棒星星拖尾；并实现了 Web Audio Procedural BGM 合成器。

### 当前已实现的功能特点
1. **趣味气泡**：七彩高饱和马卡龙色气泡自屏幕下方缓缓升起，自带正弦波左右晃动，视觉效果极其生动。
2. **卡通猫爪与拖尾**：手掌位置绘制成超萌的猫爪，挥动时带出粉色/蓝色的闪烁星星魔棒光效。
3. **极高容错**：只要手指、指尖或手腕扫过泡泡，即可瞬间“啪”地一声破裂，飞溅出漂亮的五彩星尘。
4. **正向激励**：拍碎泡泡时屏幕随机弹出中文赞美词如“真棒！”、“太酷啦！”等字样；集齐 10 个泡泡即升级下一关，伴随彩带雨和可爱的动物勋章变换（🐰 ➡️ 🐱 ➡️ 🐶）。
5. ** procedural BGM**：采用 Web Audio API 动态合成儿歌风旋律，无需下载音频文件即可运行。

### 下一步可优化方向
- **手势彩蛋**：当识别到孩子做出特定手势（如“剪刀手”或“比心”）时，触发屏幕满屏气泡雨或特殊音效。
- **自定义配音**：允许家长在游戏开始前录制一段鼓励的声音，在关卡升级时替代合成 chime 播放，增加亲子互动感。
- **更多卡通光标**：在 HUD 中增加光标选择（如“大猫爪”、“魔法棒”、“七彩网兜”），让孩子自行挑选喜爱的“球拍”。
