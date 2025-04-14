<template>
  <div class="toast-container">
    <transition-group name="toast">
      <div
        v-for="message in messages"
        :key="message.id"
        class="toast-message"
        :class="message.type"
      >
        <div class="toast-content">{{ message.text }}</div>
        <div class="toast-icon">
          <img
            v-if="message.type === 'success'"
            src="../assets/icon/success.png"
            alt="成功"
          />
          <img
            v-else-if="message.type === 'error'"
            src="../assets/icon/error.png"
            alt="错误"
          />
          <img
            v-else-if="message.type === 'warning'"
            src="../assets/icon/warning.png"
            alt="警告"
          />
          <img v-else src="../assets/icon/info.png" alt="信息" />
        </div>
        <!-- <div class="toast-close" @click="removeMessage(index)">
          <img src="../assets/icon/close.png" alt="关闭" />
        </div> -->
      </div>
    </transition-group>
  </div>
</template>
  
  <script>
export default {
  name: "MessageToast",
  data() {
    return {
      messages: [],
      counter: 0,
    };
  },
  methods: {
    addMessage(type, text, duration = 3000) {
      const id = this.counter++;
      const message = { id, type, text };
      this.messages.push(message);

      // 自动移除消息
      setTimeout(() => {
        this.removeMessageById(id);
      }, duration);
    },
    removeMessage(index) {
      this.messages.splice(index, 1);
    },
    removeMessageById(id) {
      const index = this.messages.findIndex((msg) => msg.id === id);
      if (index !== -1) {
        this.removeMessage(index);
      }
    },
    // 提供便捷方法
    success(text, duration) {
      this.addMessage("success", text, duration);
    },
    error(text, duration) {
      this.addMessage("error", text, duration);
    },
    warning(text, duration) {
      this.addMessage("warning", text, duration);
    },
    info(text, duration) {
      this.addMessage("info", text, duration);
    },
  },
};
</script>
  
  <style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  z-index: 2000;
  pointer-events: none;
}

.toast-message {
  background-color: rgba(35, 35, 35, 0.95);
  color: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  min-width: 300px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  backdrop-filter: blur(5px);
  pointer-events: auto;
  border-left: 4px solid;
  animation: toast-container-ani 4s linear;
}

@keyframes toast-container-ani {
  0% {
    transform: translateY(-20px);
    opacity: 0;
  }
  5% {
    transform: translateY(0px);
    opacity: 1;
  }
  95% {
    transform: translateY(0px);
    opacity: 1;
  }
  100% {
    transform: translateY(-20px);
    opacity: 0;
  }
}

.toast-message.success {
  border-color: #4caf50;
}

.toast-message.error {
  border-color: #f44336;
}

.toast-message.warning {
  border-color: #ff9800;
}

.toast-message.info {
  border-color: #2196f3;
}

.toast-icon {
  flex: 0 0 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-icon img {
  width: 20px;
  height: 20px;
}

.toast-content {
  flex: 1;
  font-size: 15px;
}

.toast-close {
  flex: 0 0 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.toast-close:hover {
  opacity: 1;
}

.toast-close img {
  width: 16px;
  height: 16px;
}
</style> 