<template>
  <div
    class="processing-unit"
    :data-unit-id="$attrs['data-unit-id']"
    @mousedown.stop="$emit('mousedown', $event)"
  >
    <div
      class="unit-header"
      @mousedown.stop="$emit('header-mousedown', $event)"
      @contextmenu.prevent.stop="$emit('header-contextmenu', $event)"
    >
      <span class="circle"></span>
      <span class="zh">{{ unitInfo.zh }}</span>
    </div>
    <div class="unit-configAndContent">
      <UnitConfig
        v-for="(config, index) in unitInfo.config"
        :key="index"
        :config-item="config"
        @update:value="updateConfig(index, $event)"
      />
      <UnitConnect
        :type="type"
        :localConfig="localConfig"
        :selectedFileType="selectedFileType"
      />
    </div>
  </div>
</template>

<script>
import { UNIT_NAMES, UNIT_CONFIG } from "./UnitNameList.js";
import UnitConfig from "./UnitConfig.vue";
import UnitConnect from "./UnitConnect.vue";

export default {
  name: "ProcessingUnit",
  components: {
    UnitConfig,
    UnitConnect,
  },
  props: {
    type: {
      type: String,
      required: true,
    },
    initialConfig: {
      type: Array,
      default: null,
    },
  },
  data() {
    return {
      localConfig: null,
      unitName: UNIT_NAMES.find((unit) => unit.component === this.type).zh,
      unitEn: UNIT_NAMES.find((unit) => unit.component === this.type).en,
      selectedFileType: null,
    };
  },
  created() {
    const unitDef = UNIT_NAMES.find((unit) => unit.component === this.type);
    this.localConfig = this.initialConfig
      ? JSON.parse(JSON.stringify(this.initialConfig))
      : JSON.parse(JSON.stringify(unitDef.config));
  },
  computed: {
    unitInfo() {
      return {
        zh: this.unitName,
        en: this.unitEn,
        config: this.localConfig,
      };
    },
  },
  watch: {
    initialConfig: {
      handler(newConfig) {
        if (newConfig) {
          this.localConfig = JSON.parse(JSON.stringify(newConfig));
        }
      },
    },
  },
  methods: {
    updateConfig(index, value) {
      if (this.localConfig[index]) {
        if (
          this.localConfig[index].type === UNIT_CONFIG.path ||
          this.localConfig[index].type === UNIT_CONFIG.file
        ) {
          this.localConfig[index].val = value.path;
          this.selectedFileType = value.type;
        } else {
          this.localConfig[index].val = value;
        }
      }
    },
  },
  inheritAttrs: false,
};
</script>

<style scoped>
.processing-unit {
  width: 300px;
  height: auto;
  min-height: 100px;
  background-color: #333333;
  border-radius: 8px;
  border: 2px solid transparent;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  position: relative;
  transition: box-shadow 0.2s, all 0.2s, border-color 0s;
  cursor: move;
  pointer-events: all;
  border: 2px solid transparent;
  transition: all 0.3s ease-in-out;
}

.processing-unit > div {
  padding: 10px 12px;
}

.processing-unit > div:not(:last-child) {
  border-bottom: 1px solid #0f0f0f;
}

.processing-unit:hover {
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.7);
}

.processing-unit:active {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.unit-header {
  display: flex;
  gap: 5px;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: move;
  user-select: none;
}

.circle {
  height: 11px;
  width: 11px;
  margin-right: 5px;
  border-radius: 50%;
  background-color: #838383;
}

.en {
  font-size: 12px;
  color: #838383;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-size: 14px;
}

.zh {
  font-size: 14px;
  color: #a0a0a0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.unit-configAndContent {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.unit-configAndContent > * {
  flex-shrink: 0;
}

.unit-configAndContent-item {
  height: 20px;
}
</style> 