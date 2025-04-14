<template>
  <div class="process-overview" :style="{ width: width + 'px' }" @wheel.stop>
    <div class="resize-handle" @mousedown="startResize"></div>
    <div class="overview-content" @wheel.stop>
      <div class="overview-title">
        <img src="../assets/icon/process.png" />
        <span>处理流程</span>
      </div>
      <div class="connections-list">
        <div
          v-for="(flow, flowIndex) in processFlows"
          :key="flowIndex"
          class="connection-item"
        >
          <div class="connection-number">
            <span>流程{{ flowIndex + 1 }}</span>
            <div class="bar-item">
              <span
                class="start-btn"
                :class="{
                  'pause-btn': processingFlows.has(flowIndex),
                  disabled:
                    processingFlows.size > 0 && !processingFlows.has(flowIndex),
                }"
                @click="
                  processingFlows.has(flowIndex)
                    ? stopProcess(flow, flowIndex)
                    : !processingFlows.size && validateAndRun(flow, flowIndex)
                "
              >
                {{ processingFlows.has(flowIndex) ? "STOP" : "RUN" }}
              </span>
              <!-- <div
                class="delete"
                :class="{ disabled: processingFlows.has(flowIndex) }"
                @click="
                  !processingFlows.has(flowIndex) && deleteFlow(flowIndex)
                "
              >
                <img src="../assets/icon/delete.png" />
              </div> -->
            </div>
          </div>
          <div class="connection-content">
            <div
              v-for="(unitId, unitIndex) in flow"
              :key="unitId"
              class="flow-item"
            >
              <div class="unit-box" @click="highlightComponent(unitId)">
                <img
                  :src="getStepIcon(flowIndex, unitIndex)"
                  class="step-icon"
                />
                <span>{{ getUnitInfo(unitId).zh }}</span>
              </div>
              <img
                v-if="unitIndex < flow.length - 1"
                src="../assets/icon/next.png"
                class="next-icon"
              />
            </div>
          </div>
          <div class="operate-bar">
            <div
              class="circulatorValueBox"
              v-if="getCirculatorState(flowIndex).haveCirculator"
            >
              <div class="circulator-info">
                <div class="circulator-type-tag">
                  循环器<span>{{
                    getCirculatorState(flowIndex).circulatorType === "interval"
                      ? "间隔"
                      : getCirculatorState(flowIndex).circulatorType === "time"
                      ? "时刻"
                      : "文件夹"
                  }}</span>
                </div>
                <!-- 间隔模式的显示 -->
                <div
                  v-if="
                    getCirculatorState(flowIndex).circulatorType === 'interval'
                  "
                  class="time-display"
                >
                  {{ formatTime(getCirculatorState(flowIndex).interval) }}
                </div>
                <!-- 时刻模式的显示 -->
                <div
                  v-else-if="
                    getCirculatorState(flowIndex).circulatorType === 'time'
                  "
                  class="times-display"
                >
                  <div
                    v-for="(time, index) in getCirculatorState(flowIndex).times"
                    :key="index"
                    class="time-tag"
                  >
                    {{ formatTime(time) }}
                  </div>
                </div>
                <!-- 文件夹模式不需要额外显示内容 -->
                <!-- 最大次数显示（仅在间隔模式下显示） -->
                <div
                  class="max-times-display"
                  v-if="
                    getCirculatorState(flowIndex).circulatorType === 'interval'
                  "
                >
                  <span
                    >{{
                      getCirculatorState(flowIndex).maxTimes -
                      NumberOfCompleted
                    }}次</span
                  >
                </div>
              </div>
              <div
                class="circulator-edit"
                @click="getCirculatorState(flowIndex).openCirculator = true"
              >
                <img src="../assets/icon/edit.png" alt="编辑" />
              </div>
            </div>
            <div class="bar-item circulator-box">
              <div
                class="circulator"
                @click="clickCirculator(flowIndex)"
                v-if="
                  !getCirculatorState(flowIndex).openCirculator &&
                  !getCirculatorState(flowIndex).haveCirculator
                "
              >
                <img src="../assets/icon/add.png" /> <span>循环器</span>
              </div>
              <div
                v-if="getCirculatorState(flowIndex).openCirculator"
                class="circulator-panel"
              >
                <div class="circulator-title">循环器设置</div>
                <div class="circulator-type">
                  <div
                    class="type-item"
                    :class="{
                      active:
                        getCirculatorState(flowIndex).circulatorType ===
                        'interval',
                    }"
                    @click="
                      getCirculatorState(flowIndex).circulatorType = 'interval'
                    "
                  >
                    间隔
                  </div>
                  <div
                    class="type-item"
                    :class="{
                      active:
                        getCirculatorState(flowIndex).circulatorType === 'time',
                    }"
                    @click="
                      getCirculatorState(flowIndex).circulatorType = 'time'
                    "
                  >
                    &nbsp;&nbsp;时刻<font style="font-size: 10px">（24H）</font>
                  </div>
                  <div
                    class="type-item"
                    :class="{
                      active:
                        getCirculatorState(flowIndex).circulatorType ===
                        'folder',
                    }"
                    @click="
                      getCirculatorState(flowIndex).circulatorType = 'folder'
                    "
                  >
                    文件夹
                  </div>
                </div>
                <!-- 添加文件夹模式的说明文字 -->
                <div
                  v-if="
                    getCirculatorState(flowIndex).circulatorType === 'folder'
                  "
                  class="folder-description"
                >
                  <p>
                    *
                    选择按文件夹循环将捕获"本地文件"输入节点的目录下所有与所选文件相同后缀的文件，并对他们执行相同的流程处理操作
                  </p>
                </div>
                <div
                  class="max-times-input"
                  v-if="
                    getCirculatorState(flowIndex).circulatorType === 'interval'
                  "
                >
                  <label>最大执行次数</label>
                  <input
                    type="number"
                    v-model="getCirculatorState(flowIndex).maxTimes"
                    min="1"
                    placeholder="最大执行次数"
                  />
                </div>

                <!-- 间隔设置 -->
                <div
                  v-if="
                    getCirculatorState(flowIndex).circulatorType === 'interval'
                  "
                  class="time-input"
                >
                  <input
                    type="number"
                    v-model="getCirculatorState(flowIndex).interval.hours"
                    min="0"
                    max="23"
                    placeholder="时"
                  />
                  <span>:</span>
                  <input
                    type="number"
                    v-model="getCirculatorState(flowIndex).interval.minutes"
                    min="0"
                    max="59"
                    placeholder="分"
                  />
                  <span>:</span>
                  <input
                    type="number"
                    v-model="getCirculatorState(flowIndex).interval.seconds"
                    min="0"
                    max="59"
                    placeholder="秒"
                  />
                </div>

                <!-- 时刻设置 -->
                <div
                  v-else-if="
                    getCirculatorState(flowIndex).circulatorType === 'time'
                  "
                  class="time-list"
                >
                  <div
                    class="time-item"
                    v-for="(time, index) in getCirculatorState(flowIndex).times"
                    :key="index"
                  >
                    <div class="time-input">
                      <input
                        type="number"
                        v-model="time.hours"
                        min="0"
                        max="23"
                        placeholder="时"
                      />
                      <span>:</span>
                      <input
                        type="number"
                        v-model="time.minutes"
                        min="0"
                        max="59"
                        placeholder="分"
                      />
                      <span>:</span>
                      <input
                        type="number"
                        v-model="time.seconds"
                        min="0"
                        max="59"
                        placeholder="秒"
                      />
                    </div>
                    <div
                      class="time-delete"
                      @click="removeTime(flowIndex, index)"
                    ></div>
                  </div>
                  <div class="add-time" @click="addTime(flowIndex)">
                    + 添加时间点
                  </div>
                </div>

                <div class="circulator-footer">
                  <button
                    class="confirm-btn"
                    @click="confirmCirculator(flowIndex)"
                  >
                    {{
                      getCirculatorState(flowIndex).haveCirculator
                        ? "确认"
                        : "创建"
                    }}
                  </button>
                  <button
                    class="cancel-btn"
                    @click="cancelCirculator(flowIndex)"
                  >
                    {{
                      getCirculatorState(flowIndex).haveCirculator
                        ? "关闭循环器"
                        : "取消"
                    }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ProcessLog ref="processLog" />
  </div>
</template>

<script>
import { connectionStore, connectionMethods } from "../store/connections";
import { UNIT_NAMES, UNIT_TYPE } from "./FileProcessingUnits/UnitNameList";
import { ipcRenderer } from "electron";
import point from "../assets/svg/point.svg";
import loading from "../assets/svg/loading.svg";
import success from "../assets/svg/success.svg";
import error from "../assets/svg/error.svg";
import ProcessLog from "./ProcessLog.vue";

export default {
  name: "ProcessOverview",
  props: ["showMessage"],
  components: {
    ProcessLog,
  },
  data() {
    return {
      width: 280,
      isResizing: false,
      initialX: 0,
      initialWidth: 0,
      currentStep: 0,
      startTime: null,
      stepStatuses: {}, // 存储每个步骤的状态
      processingFlows: new Set(), // 使用 Set 来存储正在处理的流程索引
      circulatorStates: {}, // 改为普通对象
      SecondsToCompletion: 0, //距离上次完成过去的秒数
      NumberOfCompleted: 0, //已完成的次数
      intervalTimer: null, // 添加一个计时器变量
    };
  },
  mounted() {
    window.addEventListener("mousemove", this.handleResize);
    window.addEventListener("mouseup", this.stopResize);
  },
  beforeDestroy() {
    window.removeEventListener("mousemove", this.handleResize);
    window.removeEventListener("mouseup", this.stopResize);
  },
  computed: {
    connections() {
      return connectionStore.connections;
    },
    processFlows() {
      const flows = [];
      const usedConnections = new Set();

      // 找到所有起点
      const startPoints = this.findStartPoints();

      // 从每个起点开始构建流程
      startPoints.forEach((startId) => {
        const flow = this.buildFlow(startId, usedConnections);
        if (flow.length > 0 && this.isValidFlow(flow)) {
          flows.push(flow);
        }
      });

      return flows;
    },
  },
  methods: {
    getCirculatorState(flowIndex) {
      if (!this.circulatorStates[flowIndex]) {
        this.$set(this.circulatorStates, flowIndex, {
          openCirculator: false,
          circulatorType: "interval",
          interval: { hours: "", minutes: "", seconds: "" },
          times: [{ hours: "", minutes: "", seconds: "" }],
          haveCirculator: false,
          maxTimes: 999,
        });
      }
      return this.circulatorStates[flowIndex];
    },

    clickCirculator(flowIndex) {
      const state = this.getCirculatorState(flowIndex);
      this.$set(state, "openCirculator", !state.openCirculator);
    },

    addTime(flowIndex) {
      const state = this.getCirculatorState(flowIndex);
      state.times.push({ hours: "", minutes: "", seconds: "" });
    },

    removeTime(flowIndex, timeIndex) {
      const state = this.getCirculatorState(flowIndex);
      if (state.times.length > 1) {
        state.times.splice(timeIndex, 1);
      }
    },

    confirmCirculator(flowIndex) {
      const state = this.getCirculatorState(flowIndex);
      let isError = false;

      if (state.circulatorType === "folder") {
        // 文件夹模式不需要验证，直接设置状态
        this.$set(state, "haveCirculator", true);
        this.$set(state, "openCirculator", false);
        return;
      }

      // 其他模式的验证逻辑保持不变
      if (state.circulatorType === "interval") {
        const { hours, minutes, seconds } = state.interval;
        if (
          (hours === "" || hours === "0" || hours === 0) &&
          (minutes === "" || minutes === "0" || minutes === 0) &&
          (seconds === "" || seconds === "0" || seconds === 0)
        ) {
          this.showMessage("error", "循环器设置不可为空");
          return;
        }

        // 处理进位
        let totalSeconds = parseInt(seconds) || 0;
        let totalMinutes =
          (parseInt(minutes) || 0) + Math.floor(totalSeconds / 60);
        let totalHours = (parseInt(hours) || 0) + Math.floor(totalMinutes / 60);

        totalSeconds = totalSeconds % 60;
        totalMinutes = totalMinutes % 60;

        // 更新规范化后的值
        this.$set(state.interval, "seconds", totalSeconds.toString());
        this.$set(state.interval, "minutes", totalMinutes.toString());
        this.$set(state.interval, "hours", totalHours.toString());
      } else {
        state.times.forEach((time) => {
          // 处理每个时间点的进位
          let totalSeconds = parseInt(time.seconds) || 0;
          let totalMinutes =
            (parseInt(time.minutes) || 0) + Math.floor(totalSeconds / 60);
          let totalHours =
            (parseInt(time.hours) || 0) + Math.floor(totalMinutes / 60);
          // 检查是否至少有一个有效时间点
          if (time.hours > 24) {
            isError = true;
            this.showMessage("error", "时刻小时不应大于23时");
            return;
          }
          totalSeconds = totalSeconds % 60;
          totalMinutes = totalMinutes % 60;

          // 更新规范化后的值
          time.seconds = totalSeconds.toString();
          time.minutes = totalMinutes.toString();
          time.hours = totalHours.toString();

          // 检查是否至少有一个有效时间点
          if (totalHours <= 0 && totalMinutes <= 0 && totalSeconds <= 0) {
            isError = true;
            this.showMessage("error", "循环器设置不可为空");
            return;
          }
        });
      }

      if (isError) return;
      this.$set(state, "haveCirculator", true);
      this.$set(state, "openCirculator", false);
    },

    cancelCirculator(flowIndex) {
      const state = this.getCirculatorState(flowIndex);
      this.$set(state, "haveCirculator", false);
      this.$set(state, "openCirculator", false);
      this.$set(state, "circulatorType", "interval");
      this.$set(state, "interval", { hours: "", minutes: "", seconds: "" });
      this.$set(state, "times", [{ hours: "", minutes: "", seconds: "" }]);
      this.$set(state, "maxTimes", "999");
    },

    getUnitInfo(unitId) {
      const type = document.querySelector(`[data-unit-id="${unitId}"]`)?.__vue__
        ?.type;
      return (
        UNIT_NAMES.find((unit) => unit.component === type) || { zh: "未知组件" }
      );
    },

    findStartPoints() {
      // 找到最左边的组件作为起点
      const allComponents = new Set([
        ...this.connections.map((conn) => ({
          id: conn.from.unitId,
          el: document.querySelector(`[data-unit-id="${conn.from.unitId}"]`),
        })),
        ...this.connections.map((conn) => ({
          id: conn.to.unitId,
          el: document.querySelector(`[data-unit-id="${conn.to.unitId}"]`),
        })),
      ]);

      return Array.from(allComponents)
        .sort((a, b) => {
          const rectA = a.el?.getBoundingClientRect();
          const rectB = b.el?.getBoundingClientRect();
          return (rectA?.left || 0) - (rectB?.left || 0);
        })
        .map((comp) => comp.id)
        .filter((id) => {
          // 确保这个组件不是其他组件的目标
          return !this.connections.some(
            (conn) => conn.to.unitId === id && conn.from.unitId !== id
          );
        });
    },

    buildFlow(startId, usedConnections, flow = []) {
      flow.push(startId);

      // 查找下一个连接
      const nextConnection = this.connections.find((conn) => {
        const isFromThisUnit = conn.from.unitId === startId;
        const isToThisUnit = conn.to.unitId === startId;
        const notUsed = !usedConnections.has(conn);

        // 如果是从右到左的连接，交换 from 和 to
        if (isToThisUnit && notUsed) {
          // 交换连接的方向
          const temp = conn.from;
          conn.from = conn.to;
          conn.to = temp;
        }

        return isFromThisUnit && notUsed;
      });

      if (nextConnection) {
        usedConnections.add(nextConnection);
        return this.buildFlow(nextConnection.to.unitId, usedConnections, flow);
      }

      return flow;
    },

    highlightComponent(unitId) {
      const component = document.querySelector(`[data-unit-id="${unitId}"]`);
      if (component) {
        component.classList.add("highlight-component");
        setTimeout(() => {
          component.classList.remove("highlight-component");
          component.classList.add("highlight-component-org");
          setTimeout(() => {
            component.classList.remove("highlight-component-org");
          }, 300);
        }, 1000); // 1秒后移除高亮
      }
    },

    getStepIcon(flowIndex, unitIndex) {
      const stepKey = `${flowIndex}-${unitIndex}`;
      const status = this.stepStatuses[stepKey];

      switch (status) {
        case "loading":
          return loading;
        case "success":
          return success;
        case "error":
          return error;
        default:
          return point;
      }
    },

    // 添加一个新方法来处理时间转换为秒
    convertToSeconds(timeObj) {
      return (
        (parseInt(timeObj.hours) || 0) * 3600 +
        (parseInt(timeObj.minutes) || 0) * 60 +
        (parseInt(timeObj.seconds) || 0)
      );
    },

    // 添加一个新方法来检查当前时间是否匹配时间点
    checkTimeMatch(timeObj) {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentSeconds = now.getSeconds();

      return (
        parseInt(timeObj.hours) === currentHours &&
        parseInt(timeObj.minutes) === currentMinutes &&
        parseInt(timeObj.seconds) === currentSeconds
      );
    },

    // 修改 validateAndRun 方法
    async validateAndRun(flow, flowIndex) {
      // 使用 Vue.set 来确保响应式更新
      this.$set(this, "stepStatuses", {});
      this.currentStep = 0;
      this.startTime = Date.now();

      let hasInvalidConfig = false;

      // 收集每个组件的配置和路径
      const flowConfigs = flow
        .map((unitId) => {
          const el = document.querySelector(`[data-unit-id="${unitId}"]`);
          if (el && el.__vue__) {
            const component = el.__vue__;
            const unitInfo = UNIT_NAMES.find(
              (unit) => unit.component === component.type
            );
            if (!unitInfo) return null;

            // 构建完整的 Python 脚本路径
            const scriptPath = `utils${unitInfo.path}.py`;

            return {
              path: scriptPath,
              configs: component.localConfig.map((cfg) => cfg.val),
            };
          }
          return null;
        })
        .filter(Boolean);

      // 验证配置
      flow.forEach((unitId) => {
        const el = document.querySelector(`[data-unit-id="${unitId}"]`);
        if (el && el.__vue__) {
          const component = el.__vue__;

          component.localConfig.forEach((cfg, index) => {
            if (!cfg.required) return;

            const val = cfg.val;
            const isEmpty =
              val === "" ||
              (Array.isArray(val) && val.length === 0) ||
              (val && typeof val === "object" && Object.keys(val).length === 0);

            if (isEmpty) {
              hasInvalidConfig = true;
              const configEl = el.querySelectorAll(".unit-config")[index];
              if (configEl) {
                configEl.classList.add("config-error");
                this.showMessage("error", "关键数据未填写");
                setTimeout(() => {
                  configEl.classList.remove("config-error");
                  configEl.classList.add("config-error-out");
                  setTimeout(() => {
                    configEl.classList.remove("config-error-out");
                  }, 300);
                }, 1000);
              }
            }
          });
        }
      });

      if (hasInvalidConfig) {
        return;
      }

      const runProcess = async () => {
        try {
          // 检查是否是文件夹循环器模式
          const circulatorState = this.getCirculatorState(flowIndex);
          if (
            circulatorState.haveCirculator &&
            circulatorState.circulatorType === "folder"
          ) {
            // 获取第一个组件
            const firstUnitId = flow[0];
            const firstUnit = document.querySelector(
              `[data-unit-id="${firstUnitId}"]`
            )?.__vue__;

            // 检查是否为 InputLocalFile 组件
            if (!firstUnit || firstUnit.type !== "InputLocalFile") {
              this.showMessage("error", "文件夹循环器无法正确获取文件夹路径");
              this.processingFlows.delete(flowIndex);
              return;
            }

            // 获取选中的文件路径
            const selectedFilePath = firstUnit.localConfig[0].val;
            if (!selectedFilePath) {
              this.showMessage("error", "请先选择一个文件");
              this.processingFlows.delete(flowIndex);
              return;
            }

            try {
              // 获取同文件夹下所有相同后缀的文件
              const files = await ipcRenderer.invoke(
                "get-similar-files",
                selectedFilePath
              );

              // 对每个文件执行处理流程
              for (const filePath of files) {
                if (!this.processingFlows.has(flowIndex)) return; // 如果流程被停止，则退出

                // 更新第一个组件（InputLocalFile）的文件路径
                firstUnit.localConfig[0].val = filePath;

                // 重新构建 flowConfigs，确保使用最新的配置
                const currentFlowConfigs = flow
                  .map((unitId) => {
                    const el = document.querySelector(
                      `[data-unit-id="${unitId}"]`
                    );
                    if (el && el.__vue__) {
                      const component = el.__vue__;
                      const unitInfo = UNIT_NAMES.find(
                        (unit) => unit.component === component.type
                      );
                      if (!unitInfo) return null;

                      // 构建完整的 Python 脚本路径
                      const scriptPath = `utils${unitInfo.path}.py`;

                      return {
                        path: scriptPath,
                        configs: component.localConfig.map((cfg) => cfg.val),
                      };
                    }
                    return null;
                  })
                  .filter(Boolean);

                // 执行常规的处理流程
                this.$refs.processLog.addLog(`开始处理文件: ${filePath}`);

                // 执行 delete_transfer.py
                this.$refs.processLog.addLog("开始清理 transfer 目录...");
                await ipcRenderer.invoke("run-python", {
                  script: "utils/common/delete_transfer.py",
                });
                this.$refs.processLog.addLog(
                  "transfer 目录清理完成",
                  "success"
                );

                // 执行每个步骤
                let step = 1;
                for (const [index, config] of currentFlowConfigs.entries()) {
                  if (!this.processingFlows.has(flowIndex)) return;

                  const stepKey = `${flowIndex}-${index}`;
                  this.$set(this.stepStatuses, stepKey, "loading");

                  this.$refs.processLog.addLog(
                    `开始执行步骤 ${step}: ${config.path}`
                  );
                  try {
                    const result = await ipcRenderer.invoke("run-python", {
                      script: config.path,
                      args: [step.toString(), ...config.configs],
                    });
                    if (!this.processingFlows.has(flowIndex)) return;
                    this.$refs.processLog.addLog(
                      `步骤 ${step} 执行完成: ${result}`,
                      "success"
                    );
                    this.$set(this.stepStatuses, stepKey, "success");
                    step++;
                  } catch (error) {
                    this.$refs.processLog.addLog(
                      `步骤 ${step} 执行失败: ${error.message}`,
                      "error"
                    );
                    this.$set(this.stepStatuses, stepKey, "error");
                    throw error;
                  }
                }
              }

              // 所有文件处理完成后
              this.processingFlows.delete(flowIndex);

              const endTime = Date.now();
              const duration = ((endTime - this.startTime) / 1000).toFixed(2);
              this.$refs.processLog.addLog(
                `所有文件处理完成 | 总耗时 ${duration}s`,
                "success-end"
              );
            } catch (error) {
              this.showMessage("error", "获取文件列表失败: " + error.message);
              this.processingFlows.delete(flowIndex);
              return;
            }

            return; // 文件夹模式处理完成后直接返回
          }

          // 原有的处理逻辑
          this.$refs.processLog.addLog(`开始执行流程...`);
          // 1. 执行 delete_transfer.py
          this.$refs.processLog.addLog("开始清理 transfer 目录...");
          await ipcRenderer.invoke("run-python", {
            script: "utils/common/delete_transfer.py",
          });
          this.$refs.processLog.addLog("transfer 目录清理完成", "success");

          // 2. 依次执行每个步骤
          let step = 1;
          for (const [index, config] of flowConfigs.entries()) {
            if (!this.processingFlows.has(flowIndex)) return;

            const stepKey = `${flowIndex}-${index}`;
            this.$set(this.stepStatuses, stepKey, "loading");

            this.$refs.processLog.addLog(
              `开始执行步骤 ${step}: ${config.path}`
            );
            try {
              const result = await ipcRenderer.invoke("run-python", {
                script: config.path,
                args: [step.toString(), ...config.configs],
              });
              if (!this.processingFlows.has(flowIndex)) return;
              this.$refs.processLog.addLog(
                `步骤 ${step} 执行完成: ${result}`,
                "success"
              );
              this.$set(this.stepStatuses, stepKey, "success");
              step++;
            } catch (error) {
              this.$refs.processLog.addLog(
                `步骤 ${step} 执行失败: ${error.message}`,
                "error"
              );
              this.$set(this.stepStatuses, stepKey, "error");
              throw error;
            }
          }

          const endTime = Date.now();
          const duration = ((endTime - this.startTime) / 1000).toFixed(2);
          this.$refs.processLog.addLog(
            `流程执行完成 | 总耗时 ${duration}s`,
            "success-end"
          );
          if (circulatorState.haveCirculator) {
            if (circulatorState.circulatorType === "interval") {
              // 间隔模式的处理逻辑
              this.NumberOfCompleted++;

              if (
                this.NumberOfCompleted >= parseInt(circulatorState.maxTimes)
              ) {
                this.NumberOfCompleted = 0;
                this.SecondsToCompletion = 0;
                this.processingFlows.delete(flowIndex);
                return;
              }

              // 启动间隔计时器
              this.SecondsToCompletion = 0;
              const targetSeconds = this.convertToSeconds(
                circulatorState.interval
              );

              return new Promise((resolve) => {
                this.intervalTimer = setInterval(() => {
                  if (!this.processingFlows.has(flowIndex)) {
                    clearInterval(this.intervalTimer);
                    this.intervalTimer = null;
                    resolve();
                    return;
                  }

                  this.SecondsToCompletion++;

                  if (this.SecondsToCompletion >= targetSeconds) {
                    clearInterval(this.intervalTimer);
                    this.intervalTimer = null;
                    this.SecondsToCompletion = 0;
                    resolve();
                    // 重新执行流程
                    runProcess();
                  }
                }, 1000);
              });
            } else {
              // 时刻模式的处理逻辑
              return new Promise((resolve) => {
                this.intervalTimer = setInterval(() => {
                  if (!this.processingFlows.has(flowIndex)) {
                    clearInterval(this.intervalTimer);
                    this.intervalTimer = null;
                    resolve();
                    return;
                  }

                  // 检查当前时间是否匹配任何设定的时间点
                  const matchFound = circulatorState.times.some((timePoint) =>
                    this.checkTimeMatch(timePoint)
                  );

                  if (matchFound) {
                    clearInterval(this.intervalTimer);
                    this.intervalTimer = null;
                    resolve();
                    // 重新执行流程
                    runProcess();
                  }
                }, 1000);
              });
            }
          } else {
            this.processingFlows.delete(flowIndex);
          }
        } catch (error) {
          this.$refs.processLog.addLog(
            `流程执行失败: ${error.message}`,
            "error"
          );
          console.error("执行过程中出错:", error);
          this.processingFlows.delete(flowIndex);
        }
      };

      // 将当前流程添加到处理集合中
      this.processingFlows.add(flowIndex);
      // 开始执行流程
      await runProcess();
    },

    isValidFlow(flow) {
      // 检查最后一个组件是否为输出类型
      const lastUnit = this.getUnitInfo(flow[flow.length - 1]);
      if (lastUnit.type !== UNIT_TYPE.output) return false;

      // 检查第一个组件是否为输入类型，如果是SendApiRequest则直接返回true
      const firstUnit = this.getUnitInfo(flow[0]);
      if (firstUnit.en === "SendApiRequest") return true;
      if (firstUnit.type !== UNIT_TYPE.input) return false;

      // 检查中间的组件是否都是处理类型
      for (let i = 1; i < flow.length - 1; i++) {
        const unit = this.getUnitInfo(flow[i]);
        if (unit.type !== UNIT_TYPE.process) return false;
      }

      return true;
    },

    startResize(e) {
      this.isResizing = true;
      this.initialX = e.clientX;
      this.initialWidth = this.width;
      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
    },

    handleResize(e) {
      if (!this.isResizing) return;

      const dx = this.initialX - e.clientX;
      let newWidth = this.initialWidth + dx;

      // 限制最小和最大宽度
      newWidth = Math.min(1000, Math.max(230, newWidth));

      // 使用 requestAnimationFrame 提高性能
      requestAnimationFrame(() => {
        this.width = newWidth;
      });
    },

    stopResize() {
      this.isResizing = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    },

    formatTime(timeObj) {
      const pad = (num) => String(num || "00").padStart(2, "0");
      const hours = pad(timeObj.hours);
      const minutes = pad(timeObj.minutes);
      const seconds = pad(timeObj.seconds);
      return `${hours}:${minutes}:${seconds}`;
    },

    // 修改 stopProcess 方法，确保它能处理两种模式
    stopProcess(flow, flowIndex) {
      // 清除计时器
      if (this.intervalTimer) {
        clearInterval(this.intervalTimer);
        this.intervalTimer = null;
      }

      // 重置计数器（仅在间隔模式下使用）
      this.NumberOfCompleted = 0;
      this.SecondsToCompletion = 0;

      // 从处理集合中移除当前流程
      this.processingFlows.delete(flowIndex);

      // 重置相关状态
      this.$set(this, "stepStatuses", {});
      this.currentStep = 0;
      this.startTime = null;
      this.$refs.processLog.addLog("流程已手动停止", "warning");
    },
  },
  // 添加 watch 来监听状态变化
  watch: {
    stepStatuses: {
      handler(newVal) {
        console.log("stepStatuses changed:", newVal);
      },
      deep: true,
    },
  },
};
</script>

<style>
/* 移除原有的组件高亮样式 */
.highlight-component {
  transition: all 0.3s ease-in-out !important;
  border: 2px solid #00a8ff !important;
}

.highlight-component-org {
  transition: all 0.3s ease-in-out !important;
  border: 2px solid #333333 !important;
}

/* 添加配置项错误样式 */
.config-error {
  animation: shake 0.3s ease-in-out;
}

.config-error input,
.config-error textarea,
.config-error .cfgbox-select {
  border-color: #ff4444 !important;
  background-color: rgba(255, 68, 68, 0.1) !important;
  transition: all 0.3s ease-in-out !important;
}

.config-error-out input,
.config-error-out textarea,
.config-error-out .cfgbox-select {
  border-color: #333333 !important;
  background-color: #202020 !important;
  transition: all 0.3s ease-in-out !important;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
}
</style>

<style scoped>
.operate-bar {
  gap: 6px;
  padding: 4px 10px 12px 10px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.bar-item {
  display: flex;
  align-items: center;
  gap: 10px;
  transition: 0.5s ease-in-out;
}
.bar-item .circulator {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: black;
  font-size: 12px;
  padding: 1px 6px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;
  gap: 2px;
}
.circulator-box {
  border-radius: 8px;
  flex-direction: column;
  background-color: #ececec;
  gap: 12px;
  transition: 0.5s ease-in-out;
  position: relative;
  width: 100%;
}
.bar-item .circulator img {
  height: 10px;
}
.delete {
  height: 12px;
  width: 12px;
  display: flex;
  align-items: center;
  cursor: pointer;
  background-color: rgba(211, 55, 55, 0.75);
  border-radius: 100%;
  transition: 0.3s;
}
.delete:hover {
  background-color: rgba(211, 55, 55);
}
.delete img {
  height: 12px;
}
.start-btn {
  user-select: none;
  cursor: pointer;
  font-size: 10px;
  border-radius: 2px;
  padding: 0px 4px;
  border: 1px solid #00a8ff;
  color: #00a8ff;
  background: #333333;
  opacity: 0.8;
  transition: all 0.3s;
}

.start-btn:hover {
  opacity: 1;
  background: #00a8ff;
  color: #181818;
}

.start-btn.pause-btn {
  border-color: #ff9800;
  color: #ff9800;
}

.start-btn.pause-btn:hover {
  background: #ff9800;
  color: #181818;
}

.process-overview {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  background-color: #25252556;
  backdrop-filter: blur(8px);
  border-left: 1px solid #383838;
  overflow-y: auto;
  z-index: 1000;
  transition: width 0.05s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.overview-title {
  padding: 14px 16px;
  user-select: none;
  border-bottom: 1px solid #383838;
  background-color: #2c2c2c;
  position: sticky;
  top: 0;
  z-index: 999;
  display: flex;
  align-items: center;
  gap: 6px;
}
.overview-title img {
  height: 18px;
}
.overview-title span {
  font-size: 14px;
  font-weight: 500;
  color: #b9b9b9;
}

.connections-list {
  padding: 8px;
  min-height: min-content;
}

.connection-item {
  margin-bottom: 12px;
  background: #2a2a2a;
  border-radius: 4px;
  overflow: hidden;
}

.connection-number {
  user-select: none;
  padding: 7px 8px 5px;
  background: #333333;
  color: #b9b9b9;
  font-size: 12px;
  border-bottom: 1px solid #383838;
  display: flex;
  justify-content: space-between;
}

.connection-content {
  padding: 14px 8px 11px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
}

.unit-box {
  width: 100%;
  cursor: pointer;
  padding: 6px 8px;
  background: #333333;
  border-radius: 2px;
  font-size: 14px;
  color: #b9b9b9;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.2s;
  display: flex;
  gap: 10px;
  align-items: center;
}

.next-icon {
  height: 10px;
}

/* 滚动条样式 */
.process-overview::-webkit-scrollbar {
  width: 4px;
}

.process-overview::-webkit-scrollbar-track {
  background: #252525;
}

.process-overview::-webkit-scrollbar-thumb {
  background: #383838;
  border-radius: 2px;
}

.process-overview::-webkit-scrollbar-thumb:hover {
  background: #444444;
}

.flow-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  user-select: none;
  gap: 2px;
  width: 100%;
  transition: opacity 0.2s;
}

.unit-box:hover {
  opacity: 0.8;
}

.unit-box:hover .unit-box {
  background: #3a3a3a;
}

/* 添加拖拽条样式 */
.resize-handle {
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  cursor: ew-resize;
  background: transparent;
  transition: background-color 0.2s;
}

.resize-handle:hover,
.resize-handle:active {
  background-color: #00a8ff33;
}

/* 当正在拖拽时，添加一个遮罩防止选中其他内容 */
.process-overview::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: none;
}

.process-overview.resizing::before {
  display: block;
}

.step-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.overview-content {
  flex-grow: 1;
  overflow-y: auto;
  height: 0;
}
/* 自定义滚动条样式 */
.overview-content::-webkit-scrollbar {
  width: 0px;
}

.overview-content::-webkit-scrollbar-track {
  background: transparent;
}

.overview-content::-webkit-scrollbar-thumb:hover {
  background: #505050;
}
.start-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.delete.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
  background-color: rgba(211, 55, 55, 0.3);
}

.circulator-panel {
  width: 100%;
  background: #333;
  border-radius: 4px;
  padding: 12px;
  border: 1px solid #444;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}
.circulator-title {
  font-size: 13px;
  padding-bottom: 12px;
  color: #7e7e7e;
}
.circulator-type {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.type-item {
  flex: 1;
  padding: 4px;
  font-size: 13px;
  text-align: center;
  background: #2a2a2a;
  border-radius: 4px;
  color: #797979;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.type-item.active {
  background: #0097e6;
  color: #ebebeb;
}

.time-input {
  display: flex;
  gap: 4px;
  width: 100%;
}

.time-input input {
  text-align: center;
  width: 30%;
  padding: 4px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 2px;
  color: #fff;
  text-align: center;
}

.time-input span {
  color: #b9b9b9;
}

.time-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  margin-bottom: 12px;
}

.time-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}

.time-delete {
  cursor: pointer;
  height: 10px;
  width: 10px;
  border-radius: 100%;
  background-color: #ab3636;
  transition: 0.3s;
}
.time-delete:hover {
  background-color: #d33737;
}

.time-delete img {
  height: 12px;
}

.add-time {
  color: #009eec;
  cursor: pointer;
  padding: 4px;
  text-align: center;
  font-size: 12px;
}

.circulator-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
}

.confirm-btn,
.cancel-btn {
  padding: 4px 24px;
  border-radius: 2px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.confirm-btn {
  background: #0097e6;
  color: #fff;
}

.confirm-btn:hover {
  background: #0083ca;
}

.cancel-btn {
  background: #444;
  color: #fff;
}

.cancel-btn:hover {
  background: #555;
}
.circulatorValueBox {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.circulator-info {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
  gap: 4px;
}

.circulator-type-tag {
  line-height: 20px;
  flex: 1;
  min-width: 90px;
  display: flex;
  border-radius: 4px;
  gap: 4px;
  color: #b9b9b9;
  font-size: 14px;
  align-items: center;
}
.circulator-type-tag span {
  font-size: 11px;
  border-radius: 4px;
  padding: 1px 6px;
  background: #444;
}

.time-display {
  line-height: 20px;
  width: 60px;
  color: #00a8ff;
  display: flex;
  justify-content: center;
  font-size: 11px;
}

.times-display {
  display: flex;
  flex-wrap: wrap;
  line-height: 20px;
  width: 60px;
  gap: 4px;
  justify-content: center;
}

.time-tag {
  color: #00a8ff;
  /* padding: 2px 6px; */
  border-radius: 4px;
  font-size: 11px;
}

.circulator-edit {
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.3s;
}

.circulator-edit:hover {
  opacity: 1;
}

.circulator-edit img {
  width: 12px;
  height: 12px;
}

.max-times-input {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.max-times-input label {
  font-size: 13px;
  color: #b9b9b9;
  flex-shrink: 0;
}

.max-times-input input {
  flex: 1;
  padding: 4px;
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 2px;
  color: #fff;
  text-align: center;
  width: 100%;
}

.max-times-display {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2a2a2a;
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 11px;
  color: #00a8ff;
  margin-left: 6px;
  background-color: #444;
}

.folder-description {
  border-radius: 4px;
  padding: 0 4px;
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.folder-description .info-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #444;
  color: #b9b9b9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
}

.folder-description p {
  margin: 0;
  font-size: 12px;
  color: #b9b9b9;
  line-height: 1.5;
}
</style>
