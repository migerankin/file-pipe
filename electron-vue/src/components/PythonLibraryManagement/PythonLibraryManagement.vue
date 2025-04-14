<template>
  <div class="model-management" v-if="visible" @click.self="close" @wheel.stop>
    <div class="model-dialog">
      <div class="dialog-header">
        <div class="title">
          <img src="../../assets/icon/pythonLibraryList.png" />
          <span>依赖库检测</span>
        </div>
        <span class="close-btn" @click="close"
          ><img src="../../assets/icon/close.png"
        /></span>
      </div>
      <div class="dialog-content">
        <div class="action-area">
          <button
            class="check-btn"
            :class="{ checking: isChecking, 'stop-btn': isChecking }"
            @click="handleButtonClick"
          >
            {{ isChecking ? "停止检测" : "检测Python环境" }}
          </button>
          <div class="status-message">
            <span v-if="isChecking && !stopRequested">
              正在检测: {{ currentCheckingLib }}...
            </span>
            <span v-else-if="isChecking && stopRequested">
              正在停止检测...
            </span>
            <span v-else>
              {{ '点击"检测Python环境"按钮开始检查你的Python库' }}
            </span>
          </div>
        </div>

        <div class="results-area" v-if="isChecking || hasChecked">
          <template
            v-if="notInstalledLibs.length > 0 || installedLibs.length > 0"
          >
            <div
              class="result-section not-installed"
              v-if="notInstalledLibs.length > 0"
            >
              <div class="section-header">
                <h3>未安装的库 ({{ notInstalledLibs.length }})</h3>
                <span>请在使用前安装，否则某些功能可能无法正常使用</span>
              </div>
              <div class="lib-list">
                <div
                  class="lib-item missing"
                  v-for="lib in notInstalledLibs"
                  :key="lib.name"
                >
                  <span class="lib-name">{{ lib.name }}</span>
                  <span class="lib-status">未安装</span>
                </div>
              </div>
            </div>

            <div
              class="result-section installed"
              v-if="installedLibs.length > 0"
            >
              <div class="section-header">
                <h3>已安装的库 ({{ installedLibs.length }})</h3>
              </div>
              <div class="lib-list">
                <div
                  class="lib-item"
                  v-for="lib in installedLibs"
                  :key="lib.name"
                >
                  <span class="lib-name">{{ lib.name }}</span>
                  <span class="lib-version">{{
                    lib.version == "Unknown" ? "-" : lib.version
                  }}</span>
                </div>
              </div>
            </div>
          </template>

          <div class="empty-state" v-else-if="hasChecked && !isChecking">
            <p>没有检测到任何Python库的信息</p>
            <button class="check-btn" @click="checkPythonLibraries">
              重新检测
            </button>
          </div>

          <div class="empty-state" v-else-if="!isChecking">
            <p>点击"检测Python环境"按钮开始检查你的Python库</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
  
<script>
import { pythonLibraryList } from "./pythonLibraryList";
const { ipcRenderer } = require("electron");

export default {
  name: "ModelManagement",
  data() {
    return {
      visible: false,
      pythonLibraryList: pythonLibraryList,
      isChecking: false,
      stopRequested: false,
      currentCheckingLib: "",
      hasChecked: false,
      installedLibs: [],
      notInstalledLibs: [],
      hasPython: false,
    };
  },
  methods: {
    show() {
      this.visible = true;
      this.isChecking = false;
      this.stopRequested = false;
      this.hasChecked = false;
      this.installedLibs = [];
      this.notInstalledLibs = [];
      this.currentCheckingLib = "";
    },
    close() {
      this.visible = false;
      if (this.isChecking) {
        this.stopRequested = true;
      }
    },
    handleButtonClick() {
      if (this.isChecking) {
        this.stopRequested = true;
      } else {
        this.checkPythonLibraries();
      }
    },
    async checkPythonLibraries() {
      this.isChecking = true;
      this.stopRequested = false;
      this.hasChecked = false;
      this.installedLibs = [];
      this.notInstalledLibs = [];
      this.hasPython = false;

      this.currentCheckingLib = "Python环境";
      try {
        await ipcRenderer.invoke("check-python");
        this.hasPython = true;

        if (this.stopRequested) {
          this.isChecking = false;
          this.currentCheckingLib = "";
          return;
        }

        for (const lib of this.pythonLibraryList) {
          if (this.stopRequested) {
            break;
          }

          this.currentCheckingLib = lib.name;
          try {
            const version = await ipcRenderer.invoke(
              "check-python-lib",
              lib.name
            );
            this.installedLibs.push({
              name: lib.name,
              version: version,
            });
          } catch (error) {
            if (this.hasPython) {
              this.notInstalledLibs.push({
                name: lib.name,
              });
            }
          }

          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      } catch (error) {
        this.hasPython = false;
        if (!this.stopRequested) {
          this.notInstalledLibs = this.pythonLibraryList.map((lib) => ({
            name: lib.name,
          }));
        }
      } finally {
        this.isChecking = false;
        this.hasChecked = true;
        this.currentCheckingLib = "";
        this.stopRequested = false;
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
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.action-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding-bottom: 15px;
  border-bottom: 1px solid #383838;
}

.check-btn {
  padding: 10px 20px;
  background: #2a2a2a;
  border: 1px solid #00a8ff;
  color: #00a8ff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  width: 100%;
  min-width: 200px;
}

.check-btn:hover:not(:disabled) {
  background: #0083ca;
  color: #ffffff;
}

.check-btn:disabled {
  background: #444;
  cursor: not-allowed;
  opacity: 0.7;
}

.check-btn.checking {
  background: #444;
  position: relative;
  padding-right: 30px;
}

.check-btn.checking:after {
  content: "";
  position: absolute;
  right: 10px;
  top: 50%;
  width: 15px;
  height: 15px;
  margin-top: -7.5px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.check-btn.stop-btn {
  background: #ab3636;
  border-color: #ab3636;
  color: #fff;
}

.check-btn.stop-btn:hover {
  background: #d33737;
  border-color: #d33737;
}

.check-btn.stop-btn:after {
  display: none;
}

.status-message {
  min-height: 16px;
  font-size: 12px;
  color: #b9b9b9;
  text-align: center;
}

.results-area {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: scroll;
  height: 300px;
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.section-header {
  padding-bottom: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-header span {
  font-size: 12px;
  padding-right: 16px;
  color: #777;
}
.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #b9b9b9;
}

.lib-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 12px 0 6px;
}

.lib-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: #333;
  border-radius: 4px;
  color: #fff;
}

.lib-item.missing {
  background: #3d2f2f;
  border-left: 3px solid #e74c3c;
}

.lib-name {
  font-weight: 500;
}

.lib-version {
  color: #2ecc71;
  font-size: 14px;
}

.lib-status {
  color: #e74c3c;
  font-size: 14px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 30px;
  border-radius: 8px;
  text-align: center;
  height: 100%;
}

.empty-state p {
  color: #b9b9b9;
  margin: 0;
}
/* 自定义滚动条样式 */
.results-area::-webkit-scrollbar {
  width: 6px;
}

.results-area::-webkit-scrollbar-track {
  background: transparent;
  margin: 4px;
}

.results-area::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
  transition: background 0.2s;
}

.results-area::-webkit-scrollbar-thumb:hover {
  background: #505050;
}
</style> 