<template>
  <div class="connect-box">
    <div class="connect-box-input">
      <div
        v-for="(input, index) in unitInfo.circleInput"
        :key="'input-' + index"
        class="circle-box"
        :class="{
          disabled:
            isCircleDisabled('input', index) ||
            !isCircleTypeAllowed(input.type),
        }"
      >
        <span
          class="circle"
          :style="{ backgroundColor: input.color }"
          :data-circle-id="`input-${index}`"
          @mousedown.stop="startConnection($event, `input-${index}`)"
          @mouseup.stop="endConnection($event, `input-${index}`)"
        ></span>
        <span>{{ input.type }}</span>
      </div>
    </div>
    <div class="connect-box-output">
      <div
        v-for="(output, index) in unitInfo.circleOutput"
        :key="'output-' + index"
        class="circle-box"
        :class="{
          disabled:
            isCircleDisabled('output', index) ||
            !isCircleTypeAllowed(output.type),
        }"
      >
        <span>{{ output.type }}</span>
        <span
          class="circle"
          :style="{ backgroundColor: output.color }"
          :data-circle-id="`output-${index}`"
          @mousedown.stop="startConnection($event, `output-${index}`)"
          @mouseup.stop="endConnection($event, `output-${index}`)"
        ></span>
      </div>
    </div>
  </div>
</template>

<script>
import { connectionStore, connectionMethods } from "../../store/connections";
import { UNIT_NAMES, FILE_TYPE } from "./UnitNameList.js";

export default {
  name: "UnitConnect",
  props: {
    type: String,
    localConfig: {
      type: Array,
      default: () => [],
    },
    selectedFileType: String,
  },
  computed: {
    unitInfo() {
      return (
        UNIT_NAMES.find((unit) => unit.component === this.type) || {
          circleInput: [],
          circleOutput: [],
        }
      );
    },
    unitId() {
      return this.$parent.$attrs["data-unit-id"];
    },
    connectedCircles() {
      return connectionStore.connections.filter(
        (conn) =>
          conn.from.unitId === this.unitId || conn.to.unitId === this.unitId
      );
    },
  },
  methods: {
    startConnection(event, circleId) {
      if (
        event.button === 0 &&
        !this.isCircleDisabled(circleId.split("-")[0], circleId.split("-")[1])
      ) {
        const unitId = this.findParentUnitId(event.target);
        if (unitId) {
          connectionMethods.startConnection(unitId, circleId, event);
        }
      }
    },
    endConnection(event, circleId) {
      if (event.button === 0) {
        const unitId = this.findParentUnitId(event.target);
        if (unitId) {
          connectionMethods.endConnection(unitId, circleId);
        }
      }
    },
    findParentUnitId(element) {
      let current = element;
      while (current) {
        if (current.hasAttribute("data-unit-id")) {
          return current.getAttribute("data-unit-id");
        }
        current = current.parentElement;
      }
      return null;
    },
    isCircleDisabled(side, index) {
      const circleId = `${side}-${index}`;
      const hasConnectionOnSameSide = this.connectedCircles.some((conn) => {
        if (conn.from.unitId === this.unitId) {
          return (
            conn.from.circleId.startsWith(side) &&
            conn.from.circleId !== circleId
          );
        }
        if (conn.to.unitId === this.unitId) {
          return (
            conn.to.circleId.startsWith(side) && conn.to.circleId !== circleId
          );
        }
        return false;
      });

      return hasConnectionOnSameSide;
    },
    isCircleTypeAllowed(type) {
      // 如果父组件没有选择文件，允许所有类型
      if (this.unitInfo.circleOutput.length === 0) return true;

      if (!this.selectedFileType) return true;

      // 如果选择了文件夹，只允许 FOLDER 类型
      if (this.$parent.selectedFileType === "folder") {
        return type === FILE_TYPE.folder;
      }
      // console.log(this.selectedFileType);

      // 根据文件扩展名判断允许的类型
      const typeMap = {
        TXT: FILE_TYPE.txt,
        IMG: FILE_TYPE.img,
        MP3: FILE_TYPE.audio,
        MP4: FILE_TYPE.video,
        XLSX: FILE_TYPE.xlsx,
        PDF: FILE_TYPE.pdf,
        JSON: FILE_TYPE.json,
      };

      return type === typeMap[this.selectedFileType];
    },
  },
};
</script>

<style scoped>
.connect-box {
  margin: 4px 0;
  width: 100%;
  height: auto;
  display: flex;
  justify-content: space-between;
}

.connect-box-input,
.connect-box-output {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.connect-box-input {
  align-items: flex-start;
}

.connect-box-output {
  align-items: flex-end;
}

.circle-box {
  display: flex;
  align-items: center;
  gap: 8px;
  transition: opacity 0.3s ease;
}

.circle-box span {
  font-size: 12px;
  color: #838383;
}

.circle {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
  position: relative;
}

.circle::after {
  content: "";
  position: absolute;
  top: -5px;
  left: -5px;
  right: -5px;
  bottom: -5px;
  border-radius: 50%;
}

.circle:hover {
  transform: scale(1.2);
}

.circle-box.disabled {
  opacity: 0.3;
  pointer-events: none;
}

.circle-box.disabled .circle {
  cursor: not-allowed;
}
</style> 