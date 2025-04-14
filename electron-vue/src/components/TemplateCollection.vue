<template>
  <div class="template-dialog" v-if="visible" @wheel.stop>
    <div class="template-overlay" @click="hide"></div>
    <div class="template-content">
      <div class="template-header">
        <h3>收藏模板</h3>
        <button class="close-btn" @click="hide">×</button>
      </div>
      <div class="template-body">
        <div class="template-list">
          <div
            v-for="template in collectList"
            :key="template.mykey"
            class="template-item"
          >
            <img
              :src="
                require(`@/assets/img/model_cover/${template.cover_img}.jpg`)
              "
              class="template-bg"
            />
            <div class="template-info">
              <h4>{{ template.title }}</h4>
              <p class="template-description">{{ template.description }}</p>
              <span class="template-time"
                >最后更新: {{ template.last_update }}</span
              >
            </div>
            <button class="import-btn" @click="importTemplate(template)">
              导入
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "TemplateCollection",
  props: ["collectList"],
  data() {
    return {
      visible: false,
    };
  },
  methods: {
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    importTemplate(template) {
      // 这里添加导入模板的逻辑
      this.$emit("import-template", template);
      this.hide();
    },
  },
};
</script>

<style scoped>
.template-dialog {
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

.template-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.template-content {
  position: relative;
  width: 600px;
  max-height: 80vh;
  background: #2a2a2a;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid #383838;
  display: flex;
  flex-direction: column;
}

.template-header {
  padding: 20px 24px;
  border-bottom: 1px solid #383838;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-header h3 {
  margin: 0;
  color: #fff;
  font-size: 18px;
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

.template-body {
  padding: 20px 24px;
  overflow-y: auto;
  flex: 1;
}

.template-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.template-item {
  background-color: #252525;
  border-radius: 6px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #444;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.template-bg {
  height: 100%;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 0;
  -webkit-mask-image: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.35),
    rgba(0, 0, 0, 0)
  );
  mask-image: linear-gradient(to right, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0));
}

.template-item:hover {
  border-color: #666;
  background-color: #303030;
}

.template-info {
  position: relative;
  z-index: 9;
  flex: 1;
  margin-right: 16px;
}

.template-info h4 {
  margin: 0 0 8px 0;
  color: #fff;
  font-size: 16px;
}

.template-description {
  margin: 0 0 8px 0;
  color: #b9b9b9;
  font-size: 14px;
  line-height: 1.4;
}

.template-time {
  color: #888;
  font-size: 12px;
}

.import-btn {
  background: #008dd6;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  white-space: nowrap;
}

.import-btn:hover {
  background: #0076b1;
}

/* 自定义滚动条样式 */
.template-body::-webkit-scrollbar {
  width: 6px;
}

.template-body::-webkit-scrollbar-track {
  background: transparent;
  margin: 4px;
}

.template-body::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
  transition: background 0.2s;
}

.template-body::-webkit-scrollbar-thumb:hover {
  background: #505050;
}
</style> 