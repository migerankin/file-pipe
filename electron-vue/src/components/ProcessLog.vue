<template>
  <div class="process-log" :style="{ height: height + 'px' }">
    <div class="resize-handle" @mousedown="startResize"></div>
    <div class="log-header">
      <div class="title">
        <img src="../assets/icon/log.png" />
        <span>处理日志</span>
      </div>
      <div class="header-actions">
        <button class="clear-btn" @click="clearLogs">清空</button>
      </div>
    </div>
    <div class="log-content" ref="logContent" @wheel.stop>
      <div
        v-for="(log, index) in logs"
        :key="index"
        class="log-item"
        :class="log.type"
      >
        <span class="log-time">{{ log.time }}</span>
        <span class="log-text">{{ log.message }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProcessLog",
  data() {
    return {
      logs: [],
      height: 375,
      isResizing: false,
      initialY: 0,
      initialHeight: 0,
    };
  },
  mounted() {
    window.addEventListener("mousemove", this.handleResize);
    window.addEventListener("mouseup", this.stopResize);
  },
  beforeDestroy() {
    window.removeEventListener("mousemove", this.handleResize);
    window.removeEventListener("mouseup", this.stopResize);
  },
  methods: {
    startResize(event) {
      this.isResizing = true;
      this.initialY = event.clientY;
      this.initialHeight = this.height;
      document.body.style.cursor = "ns-resize";
      this.$el.classList.add("resizing");
    },
    handleResize(event) {
      if (!this.isResizing) return;

      const deltaY = this.initialY - event.clientY;
      const newHeight = Math.min(
        Math.max(200, this.initialHeight + deltaY),
        window.innerHeight - 100
      );
      this.height = newHeight;
    },
    stopResize() {
      this.isResizing = false;
      document.body.style.cursor = "";
      this.$el.classList.remove("resizing");
    },
    addLog(message, type = "info") {
      const now = new Date();
      const time = now.toLocaleTimeString("zh-CN", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      this.logs.push({ message, type, time });
      console.log(`[${type.toUpperCase()}] ${message}`);
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },
    clearLogs() {
      this.logs = [];
    },
    scrollToBottom() {
      const logContent = this.$refs.logContent;
      logContent.scrollTop = logContent.scrollHeight;
    },
  },
};
</script>

<style scoped>
.process-log {
  border-top: 1px solid #383838;
  background: #2a2a2a;
  display: flex;
  flex-direction: column;
  position: relative;
}

.resize-handle {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 4px;
  cursor: ns-resize;
  background: transparent;
  transition: background-color 0.2s;
  z-index: 10;
}

.resize-handle:hover,
.resize-handle:active {
  background-color: #00a8ff33;
}

/* 当正在拖拽时，添加一个遮罩防止选中其他内容 */
.process-log::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: none;
}

.process-log.resizing::before {
  display: block;
}

.log-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}
.log-header .title img {
  height: 18px;
}
.title span {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 1px;
  color: #b9b9b9;
  user-select: none;
}
.title {
  display: flex;
  align-items: center;
  gap: 6px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.clear-btn {
  user-select: none;
  padding: 4px 8px;
  border: none;
  background: #383838;
  color: #b9b9b9;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #444;
  color: #fff;
}

.log-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 8px 16px;
  font-family: "Consolas", monospace;
  font-size: 12px;
}

.log-item {
  margin-bottom: 4px;
  display: flex;
  gap: 8px;
  line-height: 1.5;
}

.log-time {
  color: #666;
  flex-shrink: 0;
}

.log-text {
  color: #b9b9b9;
  word-break: break-all;
}

.log-item.error .log-text {
  color: #ff4444;
}

.log-item.success-end .log-text {
  color: #4de639;
}

.log-item.warning .log-text {
  color: #ff9800;
}

/* 自定义滚动条 */
.log-content::-webkit-scrollbar {
  width: 5px;
}

.log-content::-webkit-scrollbar-track {
  background: transparent;
}

.log-content::-webkit-scrollbar-thumb {
  background: #666;
  border-radius: 2px;
}
</style> 