<template>
  <div v-show="show" class="context-menu" :style="menuPosition" @mousedown.stop>
    <template v-if="customMenuItems">
      <div
        v-for="(item, index) in customMenuItems"
        :key="index"
        class="menu-item"
        @click="handleCustomAction(item)"
      >
        <span class="menu-item-text">{{ item.label }}</span>
      </div>
    </template>
    <template v-else>
      <!-- 添加搜索框 -->
      <div class="search-box" @mousedown.stop @click.stop @mouseup.stop>
        <input
          v-model="searchText"
          type="text"
          placeholder="搜索组件..."
          @input="handleSearch"
          @mousedown.stop
          @click.stop
          @mouseup.stop
          @keydown.stop
          class="search-input"
        />
      </div>

      <!-- 输入组 -->
      <div class="menu-sections">
        <template v-if="filteredInputUnits.length > 0">
          <div class="menu-category">输入自</div>
          <div
            v-for="unit in filteredInputUnits"
            :key="unit.en"
            class="menu-item"
            @click="selectUnit(unit)"
          >
            <div class="menu-item-zh-transform">
              <span class="menu-item-zh">{{ unit.zh }}</span>
              <div v-if="unit.transform.length > 0">
                <span :style="{ color: FILE_TYPE_COLOR[unit.transform[0]] }">{{
                  unit.transform[0]
                }}</span>
                <span :style="{ color: FILE_TYPE_COLOR[unit.transform[1]] }">{{
                  unit.transform[1]
                }}</span>
              </div>
            </div>
            <span class="menu-item-des">{{ unit.description }}</span>
          </div>
        </template>

        <!-- 处理组 -->
        <template v-if="filteredProcessUnits.length > 0">
          <div class="menu-category">处理模块</div>
          <div class="menu-section" @wheel.stop>
            <div
              v-for="unit in filteredProcessUnits"
              :key="unit.en"
              class="menu-item"
              @click="selectUnit(unit)"
            >
              <div class="menu-item-zh-transform">
                <span class="menu-item-zh">{{ unit.zh }}</span>
                <div v-if="unit.transform.length > 0">
                  <span
                    :style="{ color: FILE_TYPE_COLOR[unit.transform[0]] }"
                    >{{ unit.transform[0] }}</span
                  >
                  <span
                    :style="{ color: FILE_TYPE_COLOR[unit.transform[1]] }"
                    >{{ unit.transform[1] }}</span
                  >
                </div>
              </div>
              <span class="menu-item-des">{{ unit.description }}</span>
            </div>
          </div>
        </template>

        <!-- 输出组 -->
        <template v-if="filteredOutputUnits.length > 0">
          <div class="menu-category">输出至</div>
          <div class="menu-section">
            <div
              v-for="unit in filteredOutputUnits"
              :key="unit.en"
              class="menu-item"
              @click="selectUnit(unit)"
            >
              <div class="menu-item-zh-transform">
                <span class="menu-item-zh">{{ unit.zh }}</span>
                <div v-if="unit.transform.length > 0">
                  <span
                    :style="{ color: FILE_TYPE_COLOR[unit.transform[0]] }"
                    >{{ unit.transform[0] }}</span
                  >
                  <span
                    :style="{ color: FILE_TYPE_COLOR[unit.transform[1]] }"
                    >{{ unit.transform[1] }}</span
                  >
                </div>
              </div>
              <span class="menu-item-des">{{ unit.description }}</span>
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
import {
  UNIT_NAMES,
  FILE_TYPE_COLOR,
  UNIT_TYPE,
} from "./FileProcessingUnits/UnitNameList.js";

export default {
  name: "ContextMenu",
  data() {
    return {
      show: false,
      x: 0,
      y: 0,
      UNIT_NAMES,
      customMenuItems: null,
      FILE_TYPE_COLOR,
      searchText: "",
    };
  },
  computed: {
    inputUnits() {
      return UNIT_NAMES.filter((unit) => unit.type === UNIT_TYPE.input);
    },
    processUnits() {
      return UNIT_NAMES.filter((unit) => unit.type === UNIT_TYPE.process);
    },
    outputUnits() {
      return UNIT_NAMES.filter((unit) => unit.type === UNIT_TYPE.output);
    },
    filteredInputUnits() {
      return this.filterUnits(this.inputUnits);
    },
    filteredProcessUnits() {
      return this.filterUnits(this.processUnits);
    },
    filteredOutputUnits() {
      return this.filterUnits(this.outputUnits);
    },
    menuPosition() {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const position = {};

      // 处理垂直位置
      if (windowHeight - this.y < 500) {
        // 如果距离底部小于500px，向上展开
        position.bottom = `${windowHeight - this.y}px`;
      } else {
        position.top = `${this.y}px`;
      }

      // 处理水平位置
      if (windowWidth - this.x < 450) {
        // 如果距离右侧小于200px，向左展开
        position.right = `${windowWidth - this.x}px`;
      } else {
        position.left = `${this.x}px`;
      }

      return position;
    },
  },
  methods: {
    showMenu(x, y, customItems = null) {
      this.x = x;
      this.y = y;
      this.customMenuItems = customItems;
      this.show = true;
    },
    hideMenu() {
      if (document.activeElement !== document.querySelector(".search-input")) {
        this.show = false;
        this.customMenuItems = null;
        this.searchText = "";
      }
    },
    selectUnit(unit) {
      this.$emit("unit-selected", unit, { x: this.x, y: this.y });
      this.hideMenu();
    },
    handleCustomAction(item) {
      item.action();
      this.hideMenu();
    },
    filterUnits(units) {
      if (!this.searchText) return units;
      const searchLower = this.searchText.toLowerCase();
      return units.filter((unit) => {
        return (
          unit.zh.toLowerCase().includes(searchLower) ||
          unit.transform.some((t) => t.toLowerCase().includes(searchLower))
        );
      });
    },
    handleSearch(e) {
      e.preventDefault();
      e.stopPropagation();
    },
  },
  mounted() {
    document.addEventListener("mousedown", (e) => {
      if (
        this.show &&
        !e.target.closest(".context-menu") &&
        document.activeElement !== document.querySelector(".search-input")
      ) {
        this.hideMenu();
      }
    });
  },
  beforeDestroy() {
    document.removeEventListener("mousedown", this.hideMenu);
  },
};
</script>

<style scoped>
.context-menu {
  position: fixed;
  background: #252525;
  border-radius: 4px;
  padding: 4px 0;
  min-width: 200px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  max-height: calc(100vh - 20px);
  display: flex;
  flex-direction: column;
}

.menu-sections {
  overflow-y: auto;
}

.menu-section {
  max-height: 200px;
  overflow-y: auto;
  scrollbar-width: thin;
}

/* 自定义滚动条样式 */
.menu-section::-webkit-scrollbar {
  width: 4px;
}

.menu-section::-webkit-scrollbar-track {
  background: #252525;
}

.menu-section::-webkit-scrollbar-thumb {
  background: #383838;
  border-radius: 2px;
}

.menu-section::-webkit-scrollbar-thumb:hover {
  background: #444444;
}

.menu-item {
  display: flex;
  flex-direction: column;
  padding: 8px 16px;
  cursor: pointer;
  border-radius: 2px;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #2c2c2c;
}

.menu-item-zh-transform {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
}

.menu-item-zh-transform div {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 10px;
  color: #b3b3b3;
}

.menu-item-zh {
  font-size: 14px;
  color: #ffffff;
}

.menu-item-des {
  font-size: 12px;
  color: #8d8d8d;
  margin-top: 2px;
}

.menu-item-text {
  font-size: 14px;
  color: #ffffff;
}

.menu-category {
  margin-top: 4px;
  padding: 3px 12px;
  color: #666666;
  background-color: #2c2c2c;
  font-size: 12px;
  user-select: none;
}

.search-box {
  padding: 8px 12px;
  border-bottom: 1px solid #383838;
  position: sticky;
  top: 0;
  background: #252525;
  z-index: 1;
}

.search-input {
  width: 100%;
  height: 24px;
  background: #202020;
  border: 1px solid #333333;
  color: #b9b9b9;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 12px;
  outline: none;
  user-select: text;
}

.search-input:focus {
  border-color: #444444;
}
</style> 