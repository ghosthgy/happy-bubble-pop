# 🎈 欢乐拍泡泡 (Bubble Pop Fun!) - 4岁幼儿体感互动游戏

[![Live Demo](https://img.shields.io/badge/Live_Demo-Play_Now-orange.svg)](https://ghosthgy.github.io/happy-bubble-pop/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](file:///f:/happy-bubble-pop/LICENSE)
[![Privacy: 100% Local](https://img.shields.io/badge/Privacy-100%25_Local-brightgreen.svg)](#-隐私声明-privacy-security)
[![Tech: MediaPipe](https://img.shields.io/badge/Vision-MediaPipe_Hands-red.svg)](https://google.github.io/mediapipe/solutions/hands.html)
[![Bundler: Vite](https://img.shields.io/badge/Bundler-Vite-purple.svg)](https://vitejs.dev/)

本项目是一个专为 **4岁左右幼儿** 设计的网页端体感互动游戏。通过调用本地摄像头，孩子们可以直接在屏幕前挥动双手，用可爱的“猫爪”或“魔法棒”拍碎屏幕上不断飘出的七彩大泡泡。

游戏贯彻 **“零挫败感”** 设计理念，无任何限时、惩罚或生命扣减机制，纯粹带给孩子探索与操控的快乐。

---

## 🚀 快速体验 (Quick Start & Demo)

> ## **👉 🚀 [【点击这里立即在线试玩体感游戏】](https://ghosthgy.github.io/happy-bubble-pop/)**
>
> [!NOTE]
> 提示：请确保设备带有摄像头并授予浏览器摄像头权限。如果没有摄像头，游戏会自动降级为鼠标/触摸模式，同样可以游玩！

---

## 🔒 隐私声明 (Privacy & Security)

> [!IMPORTANT]
> **本游戏极为重视用户隐私，特别是儿童的隐私安全：**
> - **零数据上传**：所有摄像头视频流的采集、手势识别与位置追踪均**在本地浏览器中实时完成**。
> - **无后端服务器**：项目不包含任何后端数据接收端，视频数据不会被保存、上传或共享给任何第三方。
> - **离线可用**：在加载完静态资源后，即使断开网络连接，游戏的核心体感交互功能仍能完全正常运行。

---

## 🛠️ 技术栈 (Technology Stack)

本系统采用纯前端技术构建，具有极高的响应速度和极轻的依赖体积：

| 技术/库 | 用途说明 | 引入/集成方式 |
| :--- | :--- | :--- |
| **Vite** | 极速的前端开发与构建工具 | 开发依赖 (npm) |
| **MediaPipe Hands** | 谷歌高性能轻量级手势识别神经网络，实现手部骨骼检测 | CDN 引入 (通过 WASM 本地加速) |
| **HTML5 Canvas** | 游戏画面渲染（渐变气泡、猫爪光标、彩色粒子拖尾、勋章雨） | 原生 API 绘制 |
| **Web Audio API** | 无需音频资源文件，动态算法合成儿歌风 BGM 旋律与音效 | 原生 API 编程合成 |
| **Vanilla CSS & JS** | 界面布局、按钮微动画以及游戏主逻辑控制 | 原生开发 |

---

## 🚀 快速开始 (Getting Started)

确保您的电脑已安装 [Node.js](https://nodejs.org/)（建议 v16+）。

### 1. 安装依赖
在项目根目录下运行以下命令安装开发服务器依赖：
```bash
npm install
```

### 2. 启动本地开发服务器
运行以下命令启动 Vite 开发服务器：
```bash
npm run dev
```
启动后，终端会输出本地访问链接（通常为 `http://localhost:5173/`）。在浏览器中打开该链接，并**授权摄像头访问权限**即可开始游戏。

### 3. 项目打包 (可选)
如果需要打包成静态网页，运行：
```bash
npm run build
```
打包产物将输出在 `dist/` 目录下。

---

## 📐 核心实现原理 (Core Principles)

摄像机捕捉的原始视频流，转换为屏幕上活灵活现的“猫爪”和“魔法棒”的计算步骤如下：

```
[摄像头视频帧] -> [MediaPipe Hands 神经网络] -> [21个归一化三维手部骨骼关节点]
                                                        |
[平滑滤波 (Lerp) 算法] <- [映射至屏幕镜像坐标] <- [计算手掌中心点 (Wrist & Knuckle)]
         |
[渲染 Canvas: 绘制猫爪 + 粒子星尘轨迹] -> [多关节点碰撞检测 -> 气泡破裂]
```

### 1. 骨骼关节点识别
当摄像头画面被送入 MediaPipe 神经网络后，它会返回一个包含 21 个骨骼关节点（Landmarks）的数组。每个点都包含 `x` 和 `y` 的归一化坐标值（范围为 `0.0` 到 `1.0`，对应画面左上角到极右下角）。

### 2. 计算手掌中心点
我们通过取 **手腕起点 (Landmark 0)** 和 **中指根部关节点 (Landmark 9)** 坐标的平均值，计算出手掌的绝对物理中心：
$$\text{CenterX} = \frac{\text{Wrist.x} + \text{MiddleKnuckle.x}}{2}$$
$$\text{CenterY} = \frac{\text{Wrist.y} + \text{MiddleKnuckle.y}}{2}$$

### 3. 平滑抖动滤波 (EMA / Lerp)
为了避免孩子因为手部细微颤抖或摄像头噪点导致屏幕上的指针剧烈跳动，我们在 [vision.js](file:///f:/happy-bubble-pop/js/vision.js) 中使用 **指数移动平均算法 (Exponential Moving Average / Lerp)** 对坐标做平滑过渡：
```javascript
// lerpFactor 越低越平滑，响应稍有延迟；这里取 0.25 保证平滑且反应迅速
this.smoothLeft.x += (targetX - this.smoothLeft.x) * this.lerpFactor;
this.smoothLeft.y += (targetY - this.smoothLeft.y) * this.lerpFactor;
```

### 4. 坐标映射与碰撞检测
- **水平镜像翻转**：因为摄像头拍摄的画面是面对玩家的，我们需要对其进行水平镜像翻转，确保孩子举起左手时，屏幕左侧的指针跟随移动。
  $$\text{CanvasX} = (1 - \text{LandmarkX}) \times \text{CanvasWidth}$$
  $$\text{CanvasY} = \text{LandmarkY} \times \text{CanvasHeight}$$
- **21点多关节点碰撞检测**：为了配合幼儿较为粗大的手势挥动，提升挥击的灵敏度，我们放弃了只检测“手掌中心”的单点碰撞，改为**对全部 21 个手部骨骼节点进行独立检测**。当任意一个节点与泡泡中心点的距离小于气泡半径的 **1.5 倍**时，气泡立即判定为拍碎。
  $$d = \sqrt{(x_{\text{bubble}} - x_{\text{joint}})^2 + (y_{\text{bubble}} - y_{\text{joint}})^2}$$

---

## 📂 项目结构说明 (File Structure)

- 📄 [index.html](file:///f:/happy-bubble-pop/index.html) - 主页面入口。包含儿童化 HUD 界面（静音控件、十颗爱心/星星关卡进度槽、极简开始菜单）。
- 📂 [css/style.css](file:///f:/happy-bubble-pop/css/style.css) - 界面样式与动画。包含儿童化按钮动效、星空背景闪烁及毛玻璃卡片样式。
- 📂 [js/](file:///f:/happy-bubble-pop/js) - 核心逻辑代码：
  - 📄 [js/game.js](file:///f:/happy-bubble-pop/js/game.js) - 游戏状态机与渲染循环。负责 3D 拟真气泡渲染、卡通猫爪光标绘制、星星拖尾粒子效果、赞美词弹出、关卡升级勋章系统以及基于 Web Audio API 的 BGM 合成器。
  - 📄 [js/vision.js](file:///f:/happy-bubble-pop/js/vision.js) - MediaPipe 摄像头数据接入与手势平滑滤波计算。
- 📄 [LICENSE](file:///f:/happy-bubble-pop/LICENSE) - MIT 开源许可证。
