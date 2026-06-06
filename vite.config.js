import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,        // 默认开发服务器端口
    strictPort: false, // 如果 5173 端口被占用，自动尝试下一个可用端口（如 5174）
    open: true,        // 启动时自动在浏览器中打开游戏页面
    host: true         // 支持局域网内其他设备访问（如手机体感调试）
  }
});
