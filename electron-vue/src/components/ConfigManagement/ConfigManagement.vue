<template>
  <div class="config-management" v-if="visible" @click.self="close" @wheel.stop>
    <div class="config-dialog">
      <div class="dialog-header">
        <div class="title">
          <img src="../../assets/icon/config.png" />
          <span>配置项</span>
        </div>
        <span class="close-btn" @click="close">
          <img src="../../assets/icon/close.png" />
        </span>
      </div>
      <div class="dialog-content">
        <div class="config-list">
          <div class="config-item" v-for="config in configs" :key="config.key">
            <div class="config-info">
              <span class="config-name">{{ config.name }}</span>
              <span class="config-description">{{ config.description }}</span>
            </div>
            <div class="config-action">
              <label class="switch" v-if="config.type === 'boolean'">
                <input
                  type="checkbox"
                  :checked="configValues[config.key]"
                  @change="updateConfig(config.key, $event.target.checked)"
                />
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { configList } from "./configList";
const { ipcRenderer } = require("electron");

export default {
  name: "ConfigManagement",
  data() {
    return {
      visible: false,
      configs: configList,
      configValues: {},
    };
  },
  methods: {
    async show() {
      this.visible = true;
      await this.loadConfigs();
    },
    close() {
      this.visible = false;
    },
    async loadConfigs() {
      try {
        this.configValues = await ipcRenderer.invoke("get-configs");
      } catch (error) {
        console.error("加载配置失败:", error);
      }
    },
    async updateConfig(key, value) {
      try {
        await ipcRenderer.invoke("update-config", { key, value });
        this.configValues[key] = value;
      } catch (error) {
        console.error("更新配置失败:", error);
      }
    },
  },
};
</script>

<style scoped>
.config-management {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.config-dialog {
  width: 500px;
  max-height: 80vh;
  background: #2a2a2a;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
}

.dialog-header {
  padding: 20px 24px;
  border-bottom: 1px solid #383838;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title img {
  height: 18px;
}

.title span {
  font-size: 18px;
  font-weight: 500;
  color: #fff;
  user-select: none;
}

.close-btn {
  user-select: none;
  cursor: pointer;
  transition: all 0.2s;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}

.close-btn img {
  transition: opacity 0.2s;
  opacity: 0.6;
  width: 18px;
  height: 18px;
}

.close-btn:hover {
  background: #383838;
}

.close-btn:hover img {
  opacity: 1;
}

.dialog-content {
  padding: 20px 24px;
  overflow-y: auto;
  flex-grow: 1;
}

.config-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-item {
  padding: 16px;
  background: #333;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #383838;
  transition: all 0.2s;
}

.config-item:hover {
  background: #383838;
  border-color: #444;
}

.config-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.config-name {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  user-select: none;
}

.config-description {
  font-size: 12px;
  color: #888;
  user-select: none;
}

/* Switch 开关样式 */
.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #444;
  transition: 0.4s;
  border-radius: 20px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background-color: #fff;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #00a8ff;
}

input:checked + .slider:before {
  transform: translateX(20px);
}

/* 自定义滚动条样式 */
.dialog-content::-webkit-scrollbar {
  width: 6px;
}

.dialog-content::-webkit-scrollbar-track {
  background: transparent;
  margin: 4px;
}

.dialog-content::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
  transition: background 0.2s;
}

.dialog-content::-webkit-scrollbar-thumb:hover {
  background: #505050;
}
</style> 