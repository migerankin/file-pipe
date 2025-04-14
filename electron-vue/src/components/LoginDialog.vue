<template>
  <div class="login-dialog" v-if="visible">
    <div class="login-overlay" @click="hide"></div>
    <div class="login-content">
      <div style="z-index: 9; position: relative">
        <div class="login-header">
          <h3><img src="../assets/icon/logo/logo_white_nobg.png" />登录</h3>
          <button class="close-btn" @click="hide">×</button>
        </div>
        <div class="login-body">
          <div class="input-group">
            <label>用户名</label>
            <input type="text" v-model="username" placeholder="请输入用户名" />
          </div>
          <div class="input-group">
            <label>密码</label>
            <input
              type="password"
              v-model="password"
              placeholder="请输入密码"
            />
          </div>
          <div class="error-message">
            {{ errorMessage }}
          </div>
        </div>
        <div class="login-footer">
          <button class="cancel-btn" @click="hide">取消</button>
          <button class="login-btn" @click="handleLogin" :disabled="isLoading">
            {{ isLoading ? "登录中..." : "登录" }}
          </button>
        </div>
      </div>
      <img src="../assets/icon/logo/logo_white_nobg.png" class="bg-logo" />
    </div>
  </div>
</template>

<script>
const { ipcRenderer } = require("electron");
import crypto from "crypto-js";
import { log } from "../api/user.js";

export default {
  name: "LoginDialog",
  data() {
    return {
      visible: false,
      username: "",
      password: "",
      errorMessage: "",
      isLoading: false,
    };
  },
  methods: {
    show() {
      this.visible = true;
      this.username = "";
      this.password = "";
      this.errorMessage = "";
    },
    hide() {
      this.visible = false;
    },
    async handleLogin() {
      if (!this.username || !this.password) {
        this.errorMessage = "请输入用户名和密码";
        return;
      }

      this.isLoading = true;
      this.errorMessage = "";

      try {
        const hashedPassword = crypto.SHA256(this.password).toString();
        // 调用注册接口
        const response = await log({
          id: this.username,
          password: hashedPassword,
        });

        if (response.code === 200) {
          this.$emit("login-success", response.data);
          this.hide();
        } else {
          this.errorMessage = "登录失败，请检查用户名和密码";
        }
      } catch (error) {
        this.errorMessage = "登录失败，请稍后重试";
        console.error("登录错误:", error);
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.login-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.login-content {
  position: relative;
  width: 400px;
  background: #2a2a2a;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid #383838;
  overflow: hidden;
}

.bg-logo {
  position: absolute;
  bottom: -50px;
  left: -5px;
  height: 200px;
  opacity: 0.025;
  z-index: 0;
}

.login-header {
  padding: 20px 24px;
  border-bottom: 1px solid #383838;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-header h3 {
  margin: 0;
  color: #fff;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.login-header h3 img {
  height: 24px;
}

.close-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-btn:hover {
  color: #fff;
}

.login-body {
  padding: 24px 24px 12px;
}

.input-group {
  margin-bottom: 18px;
}

.input-group label {
  display: block;
  color: #b9b9b9;
  margin-bottom: 8px;
  font-size: 14px;
}

.input-group input {
  width: 100%;
  padding: 8px 12px;
  background: #333;
  border: 1px solid #444;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
}

.input-group input:focus {
  outline: none;
  border-color: #00a8ff;
}

.error-message {
  color: #ff6b6b;
  font-size: 14px;
  margin-top: 8px;
  height: 20px;
}

.login-footer {
  padding: 16px 24px;
  border-top: 1px solid #383838;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.login-btn,
.cancel-btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
}

.cancel-btn {
  background: #444;
  color: #fff;
  transition: 0.3s;
}

.cancel-btn:hover {
  background: #363636;
}

.login-btn {
  background: #00a8ff;
  color: #fff;
  transition: 0.3s;
}

.login-btn:hover:not(:disabled) {
  background: #007ab8;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style> 