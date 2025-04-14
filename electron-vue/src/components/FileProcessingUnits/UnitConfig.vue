<template>
  <div class="unit-config">
    <div v-if="configItem.type === UNIT_CONFIG.path" class="cfgbox-filepath">
      <input
        type="text"
        v-model="Value_filePath"
        readonly
        placeholder="选择路径..."
        class="path-display"
        dir="rtl"
      />
      <button @click="selectFile('folder')" class="select-btn">选择</button>
    </div>
    <div
      v-else-if="configItem.type === UNIT_CONFIG.file"
      class="cfgbox-filepath"
    >
      <input
        type="text"
        v-model="Value_filePath"
        readonly
        placeholder="选择文件..."
        class="path-display"
        dir="rtl"
      />
      <button @click="selectFile('file')" class="select-btn">选择</button>
    </div>
    <!-- 为configItem.type === UNIT_CONFIG.input 添加选择文件 -->

    <div v-else-if="configItem.type === UNIT_CONFIG.input" class="cfgbox-input">
      <input
        type="text"
        v-model="Value_input"
        :placeholder="configItem.des || '输入文本'"
        @input="handleInputChange"
      />
    </div>
    <div
      v-else-if="configItem.type === UNIT_CONFIG.textarea"
      class="cfgbox-textarea"
    >
      <textarea
        v-model="Value_textarea"
        :placeholder="configItem.des || '输入文本...'"
        @input="handleTextareaChange"
        rows="8"
      ></textarea>
    </div>
    <div
      v-else-if="configItem.type === UNIT_CONFIG.select"
      class="cfgbox-select"
      :class="{ 'with-des': configItem.des }"
    >
      <div class="select-arrow left" @click="prevOption">◀</div>
      <div class="select-content" :class="{ 'with-des': configItem.des }">
        <span v-if="configItem.des" class="select-des">{{
          configItem.des
        }}</span>
        <span class="select-value">{{ currentOptionLabel }}</span>
      </div>
      <div class="select-arrow right" @click="nextOption">▶</div>
    </div>
  </div>
</template>

<script>
import { UNIT_CONFIG } from "./UnitNameList.js";
import { ipcRenderer } from "electron";
import { UNIT_NAMES } from "./UnitNameList.js";

export default {
  name: "UnitConfig",
  props: {
    configItem: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      UNIT_CONFIG,
      Value_filePath: this.configItem.val || "",
      Value_input: this.configItem.val || "",
      currentOptionIndex: 0,
      Value_textarea: this.configItem.val || "",
    };
  },
  created() {
    if (
      this.configItem.type === UNIT_CONFIG.select &&
      this.configItem.options?.length > 0
    ) {
      this.configItem.val = this.configItem.options[0].value;
      this.$emit("update:value", this.configItem.val);
    }
  },
  computed: {
    currentOptionLabel() {
      if (this.configItem.val) {
        // 从 UNIT_NAMES 中找到对应组件的配置选项
        const parentUnit = this.$parent;

        const unitDef = UNIT_NAMES.find(
          (unit) => unit.component === parentUnit.type
        );

        // 找到对应的配置项
        const configDef = unitDef.config.find(
          (config) => config.des === this.configItem.des
        );

        // 在原始配置的选项中查找
        const selectedOption = configDef.options.find(
          (option) => option.value === this.configItem.val
        );

        if (selectedOption) {
          this.currentOptionIndex = configDef.options.findIndex(
            (option) => option.value === this.configItem.val
          );
        }

        return selectedOption ? selectedOption.label : this.configItem.val;
      }
      return "";
    },
  },
  watch: {
    "configItem.val": {
      immediate: true,
      handler(newVal) {
        if (this.configItem.type === UNIT_CONFIG.path) {
          this.Value_filePath = newVal || "";
        } else if (this.configItem.type === UNIT_CONFIG.input) {
          this.Value_input = newVal || "";
        } else if (this.configItem.type === UNIT_CONFIG.textarea) {
          this.Value_textarea = newVal || "";
        }
      },
    },
  },
  methods: {
    async selectFile(type) {
      try {
        if (type === "folder") {
          const result_folder = await ipcRenderer.invoke("select-folder");
          this.Value_filePath = result_folder.filePaths[0];
          this.$emit("update:value", {
            path: this.Value_filePath,
            type: result_folder.fileType,
          });
        } else {
          const result_file = await ipcRenderer.invoke(
            "select-file",
            this.configItem.fileType
          );
          if (result_file.filePaths.length > 0) {
            this.Value_filePath = result_file.filePaths[0];
            this.$emit("update:value", {
              path: this.Value_filePath,
              type: result_file.fileType,
            });
          }
        }
      } catch (error) {
        console.error("Failed to select:", error);
      }
    },
    handleInputChange() {
      this.$emit("update:value", this.Value_input);
    },
    prevOption() {
      // 获取原始配置的选项
      const unitDef = UNIT_NAMES.find(
        (unit) => unit.component === this.$parent.type
      );
      const configDef = unitDef.config.find(
        (config) => config.des === this.configItem.des
      );
      if (!configDef?.options?.length) return;

      this.currentOptionIndex =
        (this.currentOptionIndex - 1 + configDef.options.length) %
        configDef.options.length;
      this.configItem.val = configDef.options[this.currentOptionIndex].value;
      this.$emit("update:value", this.configItem.val);
    },
    nextOption() {
      // 获取原始配置的选项
      const unitDef = UNIT_NAMES.find(
        (unit) => unit.component === this.$parent.type
      );
      const configDef = unitDef.config.find(
        (config) => config.des === this.configItem.des
      );
      if (!configDef?.options?.length) return;

      this.currentOptionIndex =
        (this.currentOptionIndex + 1) % configDef.options.length;
      this.configItem.val = configDef.options[this.currentOptionIndex].value;
      this.$emit("update:value", this.configItem.val);
    },
    handleTextareaChange() {
      this.$emit("update:value", this.Value_textarea);
    },
  },
};
</script>

<style scoped>
.unit-config {
  min-height: 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.cfgbox-filepath {
  display: flex;
}
.cfgbox-input input {
  width: 100%;
  background: #202020;
  border: 1px solid #333333;
  color: #a0a0a0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  outline: none;
}

.cfgbox-input input:focus {
  border: 1px solid #333333;
  outline: none;
}

.cfgbox-input input:focus-visible {
  outline: none;
}

.path-display {
  flex: 1;
  background: #202020;
  border: 1px solid #333333;
  color: #a0a0a0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: default;
  text-align: right;
  direction: rtl;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.select-btn {
  width: 50px;
  background: #202020;
  border: 1px solid #333333;
  color: #a0a0a0;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
}

.cfgbox-select {
  width: 100%;
  height: 24px;
  display: flex;
  align-items: center;
  background: #202020;
  border: 1px solid #333333;
  border-radius: 20px;
  overflow: hidden;
}

.cfgbox-select.with-des {
  padding: 0 4px;
}

.select-content {
  flex: 1;
  text-align: center;
  color: #b9b9b9;
  font-size: 12px;
  padding: 0 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.select-content.with-des {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px 0 4px;
}

.select-des {
  color: #666666;
  font-size: 12px;
}

.select-value {
  color: #b9b9b9;
  font-size: 12px;
}

.select-arrow {
  width: 24px;
  line-height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  color: #666666;
  font-size: 14px;
  transition: all 0.2s;
}

.select-arrow:hover {
  color: #b9b9b9;
}

.cfgbox-textarea {
  height: 180px;
  position: relative;
  width: 100%;
  display: flex;
  flex: 1;
}

.cfgbox-textarea textarea {
  width: 100%;
  height: 100%;
  resize: none;
  background: #202020;
  border: 1px solid #333333;
  color: #b9b9b9;
  padding: 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
  outline: none;
  font-family: inherit;
}

.cfgbox-textarea textarea:focus {
  border: 1px solid #333333;
  outline: none;
}

.cfgbox-textarea textarea:focus-visible {
  outline: none;
}

/* 自定义滚动条样式 */
.cfgbox-textarea textarea::-webkit-scrollbar {
  width: 4px;
}

.cfgbox-textarea textarea::-webkit-scrollbar-track {
  background: #202020;
}

.cfgbox-textarea textarea::-webkit-scrollbar-thumb {
  background: #383838;
  border-radius: 2px;
}

.cfgbox-textarea textarea::-webkit-scrollbar-thumb:hover {
  background: #444444;
}
</style>
