<template>
  <div class="model-management" v-if="visible" @click.self="close" @wheel.stop>
    <div class="model-dialog">
      <div class="dialog-header">
        <div class="title">
          <img src="../../assets/icon/model.png" />
          <span>模型管理</span>
        </div>
        <span class="close-btn" @click="close"
          ><img src="../../assets/icon/close.png"
        /></span>
      </div>
      <div class="dialog-content">
        <div class="model-list">
          <div class="model-item" v-for="model in models" :key="model.name">
            <div class="model-info">
              <span class="model-name">{{ model.name }}</span>
              <span class="model-description">{{ model.description }}</span>
              <span class="model-status" :class="model.status">
                {{ getStatusText(model.status) }}
              </span>
            </div>
            <div class="model-actions">
              <button
                class="action-btn"
                :class="{ downloading: model.status === 'downloading' }"
                @click="handleModelAction(model)"
                :disabled="model.status === 'downloading'"
              >
                {{ getActionText(model.status) }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { modelList } from "./modelList";
const { ipcRenderer } = require("electron");

export default {
  name: "ModelManagement",
  data() {
    return {
      visible: false,
      models: modelList,
    };
  },
  methods: {
    show() {
      this.visible = true;
      this.checkModelsStatus();
    },
    close() {
      this.visible = false;
    },
    getStatusText(status) {
      const statusMap = {
        not_downloaded: "未下载",
        downloading: "下载中",
        downloaded: "已下载",
      };
      return statusMap[status] || status;
    },
    getActionText(status) {
      const actionMap = {
        not_downloaded: "下载",
        downloading: "下载中...",
        downloaded: "删除",
      };
      return actionMap[status] || "下载";
    },
    async checkModelsStatus() {
      try {
        // 检查每个模型文件是否存在
        for (const model of this.models) {
          console.log("Checking model:", model.path); // 添加日志
          const exists = await ipcRenderer.invoke(
            "check-model-exists",
            model.path
          );
          console.log("Model exists:", exists); // 添加日志
          model.status = exists ? "downloaded" : "not_downloaded";
        }
      } catch (error) {
        console.error("检查模型状态失败:", error);
      }
    },
    async handleModelAction(model) {
      if (model.status === "not_downloaded") {
        await this.downloadModel(model);
      } else if (model.status === "downloaded") {
        await this.deleteModel(model);
      }
    },
    async downloadModel(model) {
      try {
        model.status = "downloading";
        await ipcRenderer.invoke("download-model", {
          url: model.download,
          path: model.path,
        });
        model.status = "downloaded";
      } catch (error) {
        console.error("下载模型失败:", error);
        model.status = "not_downloaded";
      }
    },
    async deleteModel(model) {
      try {
        await ipcRenderer.invoke("delete-model", model.path);
        model.status = "not_downloaded";
      } catch (error) {
        console.error("删除模型失败:", error);
      }
    },
  },
};
</script>

<style scoped>
.model-management {
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

.model-dialog {
  width: 600px;
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
  transition: color 0.2s;
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

.model-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.model-item {
  padding: 16px;
  background: #333;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #383838;
  transition: all 0.2s;
}

.model-item:hover {
  background: #383838;
  border-color: #444;
}

.model-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.model-name {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.model-description {
  font-size: 12px;
  user-select: none;
  color: #888;
}

.model-status {
  user-select: none;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.model-status::before {
  content: "";
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.model-status.not_downloaded {
  color: #888;
}

.model-status.not_downloaded::before {
  background: #888;
}

.model-status.downloading {
  color: #00a8ff;
}

.model-status.downloading::before {
  background: #00a8ff;
}

.model-status.downloaded {
  color: #4de639;
}

.model-status.downloaded::before {
  background: #4de639;
}

.action-btn {
  user-select: none;
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  background: #444;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 13px;
  min-width: 80px;
}

.action-btn:hover:not(:disabled) {
  background: #505050;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-btn.downloading {
  background: #00a8ff;
  position: relative;
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