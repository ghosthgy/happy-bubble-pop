/**
 * Vision Layer: MediaPipe Hands Integration
 * Handles webcam stream, runs inference, and reports hand position coordinates.
 */

class HandTracker {
  constructor(videoElement, onUpdateCallback) {
    this.video = videoElement;
    this.onUpdate = onUpdateCallback;
    this.hands = null;
    this.camera = null;
    this.isActive = false;
    
    // Smoothing properties (Exponential Moving Average)
    this.smoothLeft = { x: 0.5, y: 0.5 };
    this.smoothRight = { x: 0.5, y: 0.5 };
    this.lerpFactor = 0.25; // Smoothing intensity (lower = smoother but slightly more lag)
  }

  /**
   * Initializes MediaPipe Hands and the Camera
   * @param {Function} onStatusChange Callback to display loading progress
   */
  async init(onStatusChange) {
    onStatusChange("正在载入体感识别网络 (大约 5MB)...");
    
    if (typeof window.Hands === 'undefined' || typeof window.Camera === 'undefined') {
      throw new Error("MediaPipe SDK 载入失败，请刷新网页重试。");
    }

    // 1. Initialize Hands Model
    this.hands = new window.Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });

    this.hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1, // 0 = Lite (fastest), 1 = Full (recommended for normal play)
      minDetectionConfidence: 0.6,
      minTrackingConfidence: 0.5
    });

    // 2. Handle Hand Landmark Results
    this.hands.onResults((results) => {
      if (!this.isActive) return;

      const parsedHands = {
        left: null,
        right: null
      };

      if (results.multiHandLandmarks && results.multiHandedness) {
        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
          const landmarks = results.multiHandLandmarks[i];
          // MediaPipe classified handedness: 'Left' or 'Right'
          // Note: MediaPipe returns the actual physical hand, i.e., "Left" is the player's physical left hand
          const classification = results.multiHandedness[i];
          const label = classification.label.toLowerCase(); // 'left' or 'right'

          // Compute hand center: Average of Wrist (0) and Middle Finger Knuckle/MCP (9)
          const wrist = landmarks[0];
          const middleKnuckle = landmarks[9];
          const targetX = (wrist.x + middleKnuckle.x) / 2;
          const targetY = (wrist.y + middleKnuckle.y) / 2;

          // Compute pinch distance (Thumb tip 4 to Index tip 8) for extra interactions if needed
          const thumbTip = landmarks[4];
          const indexTip = landmarks[8];
          const dx = thumbTip.x - indexTip.x;
          const dy = thumbTip.y - indexTip.y;
          const pinchDist = Math.sqrt(dx * dx + dy * dy);

          if (label === 'left') {
            // Apply smoothing
            this.smoothLeft.x += (targetX - this.smoothLeft.x) * this.lerpFactor;
            this.smoothLeft.y += (targetY - this.smoothLeft.y) * this.lerpFactor;
            parsedHands.left = {
              x: this.smoothLeft.x,
              y: this.smoothLeft.y,
              isPinching: pinchDist < 0.08,
              landmarks: landmarks
            };
          } else {
            // Apply smoothing
            this.smoothRight.x += (targetX - this.smoothRight.x) * this.lerpFactor;
            this.smoothRight.y += (targetY - this.smoothRight.y) * this.lerpFactor;
            parsedHands.right = {
              x: this.smoothRight.x,
              y: this.smoothRight.y,
              isPinching: pinchDist < 0.08,
              landmarks: landmarks
            };
          }
        }
      }

      this.onUpdate(parsedHands);
    });

    onStatusChange("正在申请开启本地摄像头...");

    // 3. Request Camera permission & Bind stream
    try {
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user"
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = stream;
      this.video.classList.remove('hidden'); // Display the video once permission is granted

      // 4. Run Camera utilities frame sender
      this.camera = new window.Camera(this.video, {
        onFrame: async () => {
          if (this.isActive) {
            await this.hands.send({ image: this.video });
          }
        },
        width: 640,
        height: 480
      });

      this.isActive = true;
      await this.camera.start();
      onStatusChange("体感模块加载成功！");
    } catch (err) {
      console.error("Error setting up camera/hands: ", err);
      if (err.name === 'NotAllowedError' || err.message.includes('Permission denied')) {
        throw new Error("摄像头授权失败！此游戏需要摄像头才能运作，请在浏览器地址栏左侧允许网页使用您的摄像头。");
      } else {
        throw new Error("无法访问您的摄像头，或被其他应用程序占用。请检查设备连接并刷新重试。");
      }
    }
  }

  /**
   * Stop camera capture and releases webcam
   */
  stop() {
    this.isActive = false;
    if (this.camera) {
      try {
        this.camera.stop();
      } catch (e) {
        console.warn("Failed to stop MediaPipe camera smoothly: ", e);
      }
      this.camera = null;
    }
    
    if (this.video.srcObject) {
      const tracks = this.video.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      this.video.srcObject = null;
    }
    this.video.classList.add('hidden');
  }
}

// Make globally available
window.HandTracker = HandTracker;
