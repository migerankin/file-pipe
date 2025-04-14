<template>
  <div
    class="main-content"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @wheel="zoom"
    @mouseleave="handleMouseLeave"
    @click="hideContextMenu"
    :class="{ panning: isPanning }"
    ref="mainContent"
    @dragenter="handleDragEnter"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <div class="toolbar">
      <div class="toolbar-group">
        <div class="settings-dropdown">
          <button class="toolbar-btn" @click="toggleDropdown" title="设置">
            <img src="../assets/icon/settings.png" alt="设置" />
          </button>
          <div class="dropdown-menu" v-if="showDropdown">
            <div class="dropdown-item" @click="logConnectionsInfo">
              <img src="../assets/icon/connection.png" alt="连接" />
              <span>查看连接</span>
            </div>
            <div class="dropdown-item" @click="showModelManagement">
              <img src="../assets/icon/model.png" alt="模型" />
              <span>模型管理</span>
            </div>
            <div class="dropdown-item" @click="showPythonLibraryManagement">
              <img src="../assets/icon/pythonLibraryList.png" alt="依赖库" />
              <span>依赖库检测</span>
            </div>
            <div class="dropdown-item" @click="showConfigManagement">
              <img src="../assets/icon/config.png" alt="配置" />
              <span>配置项</span>
            </div>
          </div>
        </div>
        <div class="toolbar-divider"></div>
        <button
          class="toolbar-btn"
          @click="exportConnections"
          title="保存工作流"
        >
          <img src="../assets/icon/export.png" alt="导出" />
        </button>
        <button
          class="toolbar-btn"
          @click="importConnections"
          title="打开工作流"
        >
          <img src="../assets/icon/import.png" alt="导入" />
        </button>
        <div class="toolbar-divider"></div>
        <div class="settings-dropdown">
          <button
            class="toolbar-btn"
            @click="login"
            :title="userInfo.username || '登录'"
          >
            <img
              :src="require(`@/assets/avatar/${userInfo.avatar}.png`)"
              v-if="userInfo.islogin"
              :style="{ width: '22px' }"
            />
            <img src="../assets/icon/login.png" alt="登录" v-else />
          </button>
          <div class="dropdown-menu" v-if="showLoginDropdown">
            <div class="dropdown-item" @click="showTemplateCollection">
              <img src="../assets/icon/template.png" alt="模板" />
              <span>我的收藏</span>
            </div>
            <div class="dropdown-item" @click="logout">
              <img src="../assets/icon/logout.png" alt="登出" />
              <span>退出登录</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <canvas ref="gridCanvas" class="grid-canvas"></canvas>
    <div
      class="content-wrapper"
      :style="{
        transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
        transformOrigin: '0 0',
      }"
    >
      <component
        v-for="(component, index) in components"
        :key="component.id"
        :is="ProcessingUnits"
        :type="component.type"
        :initial-config="component.config"
        :data-unit-id="'unit-' + index"
        class="processing-component"
        :style="{
          position: 'absolute',
          left: component.x + 'px',
          top: component.y + 'px',
          cursor: draggingComponent === index ? 'grabbing' : 'default',
          zIndex: component.zIndex || 2,
        }"
        :data-index="index"
        @header-mousedown="handleComponentMouseDown($event, index)"
        @header-contextmenu="handleComponentContextMenu($event, index)"
      />
    </div>

    <!-- 添加坐标显示 -->
    <div class="coordinates-display">
      <span>{{ mouseCoordinates }}</span>
    </div>

    <div class="zoom-controller">
      <button
        class="zoom-btn"
        @click="adjustScale(-0.05)"
        :disabled="scale <= 0.6"
      >
        -
      </button>
      <div class="zoom-input-wrapper">
        <input
          type="number"
          v-model.number="scalePercent"
          @change="handleScaleInput"
          class="zoom-input"
          min="60"
          max="150"
          step="10"
        />
        <span class="zoom-symbol">%</span>
      </div>
      <button
        class="zoom-btn"
        @click="adjustScale(0.05)"
        :disabled="scale >= 1.5"
      >
        +
      </button>
    </div>

    <ContextMenu ref="contextMenu" @unit-selected="addComponent" />

    <!-- 添加 SVG 连线层 -->
    <svg class="connections-layer">
      <!-- 已存在的连线 -->
      <path
        v-for="(connection, index) in connections"
        :key="index"
        :d="getConnectionPath(connection)"
        class="connection-path"
        :style="{ stroke: connection.color }"
      />
      <!-- 正在拖拽的连线 -->
      <path
        v-if="draggingConnection && mousePosition"
        :d="getDraggingPath()"
        class="connection-path dragging"
        :style="{ stroke: connectionStore.connectionColor }"
      />
    </svg>

    <ProcessOverview :showMessage="showMessage" />
    <ModelManagement ref="modelManagement" />
    <PythonLibraryManagement ref="pythonLibraryManagement" />
    <ConfigManagement ref="configManagement" />
    <MessageBox ref="toast" />
    <LoginDialog ref="loginDialog" @login-success="handleLoginSuccess" />
    <TemplateCollection
      ref="templateCollection"
      @import-template="handleImportTemplate"
      :collectList="collectList"
      :importStringToModel="importStringToModel"
    />

    <!-- 添加拖拽遮罩层 -->
    <div v-if="isDraggingFile" class="drag-overlay">
      <div class="drag-message">
        <img src="../assets/icon/import.png" alt="导入" />
        <span>释放以导入 JSON 文件</span>
      </div>
    </div>
  </div>
</template>

<script>
import ProcessingUnit from "./FileProcessingUnits/ProcessingUnit.vue";
import ContextMenu from "./ContextMenu.vue";
import { connectionStore, connectionMethods } from "../store/connections";
import { UNIT_NAMES } from "./FileProcessingUnits/UnitNameList.js";
import ProcessOverview from "./ProcessOverview.vue";
import ModelManagement from "./ModelManagement/ModelManagement.vue";
import PythonLibraryManagement from "./PythonLibraryManagement/PythonLibraryManagement.vue";
import ConfigManagement from "./ConfigManagement/ConfigManagement.vue";
import MessageBox from "./MessageBox.vue";
import LoginDialog from "./LoginDialog.vue";
import TemplateCollection from "./TemplateCollection.vue";
import { getUserData } from "../api/user.js";
const { ipcRenderer } = require("electron");

export default {
  name: "MainContent",
  components: {
    ProcessingUnit,
    ContextMenu,
    ProcessOverview,
    ModelManagement,
    PythonLibraryManagement,
    ConfigManagement,
    MessageBox,
    LoginDialog,
    TemplateCollection,
  },
  data() {
    return {
      scale: 1,
      position: { x: 0, y: 0 },
      isPanning: false,
      lastPosition: { x: 0, y: 0 },
      canvas: null,
      ctx: null,
      // 可拖拽元素数据
      elements: [
        { x: 100, y: 100 },
        { x: 300, y: 200 },
      ],
      draggedElement: null,
      isDragging: false,
      dragStartPos: { x: 0, y: 0 },
      scalePercent: 100, // 新增：用于显示百分比
      selectedComponent: null,
      components: [], // 存储所有添加的组件
      draggingComponent: null,
      componentDragStart: { x: 0, y: 0 },
      ProcessingUnits: "ProcessingUnit",
      mousePosition: null,
      UNIT_NAMES,
      maxZIndex: 2, // 添加这行，跟踪最大的 z-index
      connectionStore,
      nextComponentId: 0, // 添加这行，用于生成唯一ID
      showDropdown: false,
      mouseX: 0,
      mouseY: 0,
      centerOffset: { x: 0, y: 0 }, // 中心点偏移
      userInfo: {
        avatar: "",
        id: null,
        islogin: false,
        username: "",
      },
      showLoginDropdown: false,
      collectList: [
        {
          mykey: null,
          title: "",
          description: "",
          last_update: "",
          cover_img: "",
        },
      ],
      isDraggingFile: false, // 添加这个来控制遮罩层显示
    };
  },
  computed: {
    connections() {
      return connectionStore.connections;
    },
    draggingConnection() {
      return connectionStore.draggingConnection;
    },
    mouseCoordinates() {
      // 计算相对于中心点的坐标
      const x = Math.round(this.mouseX - this.centerOffset.x);
      const y = Math.round(this.mouseY - this.centerOffset.y);
      return `x: ${x}, y: ${y}`;
    },
  },
  mounted() {
    this.initCanvas();
    this.loadUserInfo();
    window.addEventListener("resize", this.handleResize);
    // 添加清除鼠标位置的事件监听
    document.addEventListener("clearMousePosition", () => {
      this.mousePosition = null;
    });
    // 点击外部关闭下拉菜单
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".settings-dropdown")) {
        this.showDropdown = false;
      }
    });
    this.initializeCenterPoint();
    window.addEventListener("resize", this.initializeCenterPoint);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize);
    // 移除事件监听
    document.removeEventListener("clearMousePosition", () => {
      this.mousePosition = null;
    });
    window.removeEventListener("resize", this.initializeCenterPoint);
  },
  methods: {
    showMessage(type, message) {
      this.$refs.toast[type](message);
    },
    initCanvas() {
      this.canvas = this.$refs.gridCanvas;
      this.ctx = this.canvas.getContext("2d");
      this.handleResize();
      this.drawGrid();
    },
    handleResize() {
      const rect = this.canvas.parentElement.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
      this.drawGrid();
    },
    drawGrid() {
      const { width, height } = this.canvas;
      const ctx = this.ctx;
      const gridSize = 14 * this.scale;
      const offsetX = this.position.x % gridSize;
      const offsetY = this.position.y % gridSize;

      // 清除画布
      ctx.clearRect(0, 0, width, height);

      // 设置网格样式
      ctx.strokeStyle = "#272727";
      ctx.lineWidth = 1;

      // 绘制垂直线
      for (let x = offsetX; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // 绘制水平线
      for (let y = offsetY; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    },
    startPan(e) {
      // 如果点击的是可拖拽元素，不启动画布平移
      if (e.target.classList.contains("draggable-element")) return;

      // 改为只响应左键拖拽
      if (e.button !== 0) return;

      // 检查是否点击在内容元素上
      const target = e.target;
      if (target !== this.canvas && target !== this.$el) return;

      this.isPanning = true;
      this.lastPosition = { x: e.clientX, y: e.clientY };
      e.preventDefault();
    },
    pan(e) {
      if (!this.isPanning) return;

      // 考虑缩放因素，移动距离需要除以当前缩放比例
      const deltaX = (e.clientX - this.lastPosition.x) / this.scale;
      const deltaY = (e.clientY - this.lastPosition.y) / this.scale;

      this.position.x += deltaX;
      this.position.y += deltaY;

      this.lastPosition = { x: e.clientX, y: e.clientY };
      this.drawGrid();
    },
    stopPan() {
      this.isPanning = false;
    },
    zoom(e) {
      // 检查事件源是否是输入元素
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.closest(".cfgbox-input") ||
        e.target.closest(".cfgbox-textarea")
      ) {
        return; // 如果是输入元素，不执行缩放
      }

      e.preventDefault();

      const delta = -Math.sign(e.deltaY) * 0.1;
      const newScale = Math.max(0.6, Math.min(1.5, this.scale + delta));

      const rect = this.$el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const contentX = (mouseX - this.position.x) / this.scale;
      const contentY = (mouseY - this.position.y) / this.scale;

      this.position.x = mouseX - contentX * newScale;
      this.position.y = mouseY - contentY * newScale;
      this.scale = newScale;
      this.scalePercent = Math.round(newScale * 100);

      // 更新网格和连线
      this.$nextTick(() => {
        this.drawGrid();
        this.updateConnections();
      });
    },
    // 新增：更新所有连线
    updateConnections() {
      // 更新现有连线
      this.connections.forEach((_, index) => {
        const path = document.querySelector(
          `.connection-path:nth-child(${index + 1})`
        );
        if (path && path.__vue__) {
          path.__vue__.$forceUpdate();
        }
      });

      // 更新正在拖拽的连线
      const draggingPath = document.querySelector(".connection-path.dragging");
      if (draggingPath && draggingPath.__vue__) {
        draggingPath.__vue__.$forceUpdate();
      }
    },
    // 开始拖拽元素
    startDrag(e, index) {
      if (e.button !== 0) return; // 改为只响应左键
      this.isDragging = true;
      this.draggedElement = index;
      this.dragStartPos = {
        x: e.clientX - this.elements[index].x,
        y: e.clientY - this.elements[index].y,
      };
      e.preventDefault();
    },
    // 拖拽元素
    dragElement(e, index) {
      if (!this.isDragging || this.draggedElement !== index) return;

      // 计算新位置（考虑缩放）
      const newX = (e.clientX - this.dragStartPos.x) / this.scale;
      const newY = (e.clientY - this.dragStartPos.y) / this.scale;

      this.elements[index].x = newX;
      this.elements[index].y = newY;
    },
    // 停止拖拽
    stopDrag() {
      this.isDragging = false;
      this.draggedElement = null;
    },
    // 新增：更新缩放值
    updateScale(newScale) {
      this.scale = newScale;
      this.scalePercent = Math.round(newScale * 100);
      this.drawGrid();
      // 强制重新计算连线
      this.$forceUpdate();
    },
    // 新增：通过按钮调整缩
    adjustScale(delta) {
      const newScale = Math.max(0.6, Math.min(1.5, this.scale + delta));
      this.updateScale(newScale);
    },
    // 新增：处理输入框的值
    handleScaleInput() {
      let newScale = this.scalePercent / 100;
      newScale = Math.max(0.6, Math.min(1.5, newScale));
      this.scalePercent = Math.round(newScale * 100);
      this.updateScale(newScale);
    },
    setSelectedUnit(unit) {
      console.log("Setting selected unit:", unit);
      this.selectedComponent = unit.component;
      console.log("Selected component:", this.selectedComponent);
      // 重置位置和缩放
      this.scale = 1;
      this.scalePercent = 100;
      this.position = { x: 0, y: 0 };
      this.drawGrid();
    },
    handleMouseDown(e) {
      // 先检查是否点击在连接点上
      if (e.target.closest(".circle")) {
        return;
      }

      // 如果不是右键，且不是点击组件，开始画布拽
      if (e.button === 0 && !e.target.closest(".processing-component")) {
        this.startPan(e);
      }
    },
    handleMouseMove(e) {
      if (this.draggingComponent !== null) {
        this.dragComponent(e);
        e.preventDefault();
        e.stopPropagation();
      } else if (this.isPanning) {
        this.pan(e);
      }

      if (this.draggingConnection) {
        this.mousePosition = { x: e.clientX, y: e.clientY };
      }

      // 更新鼠标坐标
      const rect = this.$refs.mainContent.getBoundingClientRect();
      this.mouseX = e.clientX - rect.left;
      this.mouseY = e.clientY - rect.top;
    },
    handleMouseUp(e) {
      if (this.draggingComponent !== null) {
        this.stopComponentDrag();
      }
      this.stopPan();

      // 如果正在拖拽连线，且在空白处松开，取消连线
      if (this.draggingConnection) {
        const target = e.target;
        if (!target.closest(".circle")) {
          connectionMethods.cancelConnection();
        }
        // 清除鼠标位置
        this.mousePosition = null;
      }

      // 右键菜单
      if (e.button === 2 && !e.target.closest(".processing-component")) {
        this.$refs.contextMenu.showMenu(e.clientX, e.clientY);
      }
    },
    handleMouseLeave() {
      this.stopComponentDrag();
      this.stopPan();
    },
    hideContextMenu() {
      this.$refs.contextMenu.hideMenu();
    },
    addComponent(unit, position) {
      const rect = this.$el.getBoundingClientRect();
      const x = (position.x - rect.left - this.position.x) / this.scale;
      const y = (position.y - rect.top - this.position.y) / this.scale;

      this.maxZIndex++;
      this.components.push({
        id: `component-${this.nextComponentId++}`, // 添加唯一ID
        type: unit.component,
        x,
        y,
        zIndex: this.maxZIndex,
        config: unit.config,
      });
    },
    startComponentDrag(e, index) {
      if (!this.components[index]) return;
      this.draggingComponent = index;
      const component = this.components[index];
      const rect = this.$el.getBoundingClientRect();

      // 简化计算方式
      this.componentDragStart = {
        x: e.clientX - (rect.left + this.position.x + component.x * this.scale),
        y: e.clientY - (rect.top + this.position.y + component.y * this.scale),
      };
    },

    dragComponent(e) {
      if (
        this.draggingComponent === null ||
        !this.components[this.draggingComponent]
      )
        return;

      const rect = this.$el.getBoundingClientRect();
      const component = this.components[this.draggingComponent];

      // 简化计算方式
      const newX =
        (e.clientX - rect.left - this.position.x - this.componentDragStart.x) /
        this.scale;
      const newY =
        (e.clientY - rect.top - this.position.y - this.componentDragStart.y) /
        this.scale;

      component.x = newX;
      component.y = newY;
    },

    stopComponentDrag() {
      this.draggingComponent = null;
    },
    getConnectionPath(connection) {
      const fromEl = document.querySelector(
        `[data-unit-id="${connection.from.unitId}"] [data-circle-id="${connection.from.circleId}"]`
      );
      const toEl = document.querySelector(
        `[data-unit-id="${connection.to.unitId}"] [data-circle-id="${connection.to.circleId}"]`
      );

      if (!fromEl || !toEl) return "";

      const rect = this.$el.getBoundingClientRect();
      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      // 计算连接点的实际位置
      const fromX = fromRect.left + fromRect.width / 2;
      const fromY = fromRect.top + fromRect.height / 2;
      const toX = toRect.left + toRect.width / 2;
      const toY = toRect.top + toRect.height / 2;

      // 转换为相对于画布的坐标
      const x1 = (fromX - rect.left - this.position.x) / this.scale;
      const y1 = (fromY - rect.top - this.position.y) / this.scale;
      const x2 = (toX - rect.left - this.position.x) / this.scale;
      const y2 = (toY - rect.top - this.position.y) / this.scale;

      // 创建贝塞尔曲线路径
      return this.createBezierPath(
        x1 * this.scale + this.position.x,
        y1 * this.scale + this.position.y,
        x2 * this.scale + this.position.x,
        y2 * this.scale + this.position.y
      );
    },
    getDraggingPath() {
      if (!this.draggingConnection || !this.mousePosition) return "";

      const fromEl = document.querySelector(
        `[data-unit-id="${this.draggingConnection.unitId}"] [data-circle-id="${this.draggingConnection.circleId}"]`
      );

      if (!fromEl) return "";

      const rect = this.$el.getBoundingClientRect();
      const fromRect = fromEl.getBoundingClientRect();

      // 计算连接点的实际位置
      const fromX = fromRect.left + fromRect.width / 2;
      const fromY = fromRect.top + fromRect.height / 2;

      // 转换为相对于画布的坐标
      const x1 = (fromX - rect.left - this.position.x) / this.scale;
      const y1 = (fromY - rect.top - this.position.y) / this.scale;

      // 创建贝塞尔曲线路径
      return this.createBezierPath(
        x1 * this.scale + this.position.x,
        y1 * this.scale + this.position.y,
        this.mousePosition.x,
        this.mousePosition.y
      );
    },
    createBezierPath(x1, y1, x2, y2) {
      const dx = Math.abs(x2 - x1) * 0.5;
      // 根据连接方向调整控制点
      if (x2 < x1) {
        // 从右到左的连接
        return `M ${x1} ${y1} C ${x1 - dx} ${y1}, ${
          x2 + dx
        } ${y2}, ${x2} ${y2}`;
      } else {
        // 从左到右的连接
        return `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${
          x2 - dx
        } ${y2}, ${x2} ${y2}`;
      }
    },
    handleComponentMouseDown(e, index) {
      if (e.button === 0 && !e.target.closest(".circle")) {
        // 将点击的组件置于顶层
        this.maxZIndex++;
        this.$set(this.components[index], "zIndex", this.maxZIndex);

        this.startComponentDrag(e, index);
        e.preventDefault();
        e.stopPropagation();
      }
    },
    handleComponentContextMenu(e, index) {
      const menuItems = [
        {
          label: "删除",
          action: () => this.deleteComponent(index),
        },
      ];

      // 计算菜单位置
      const rect = this.$el.getBoundingClientRect();
      let x = e.clientX;
      let y = e.clientY;

      // 检查右边界
      if (x + 200 > window.innerWidth) {
        // 200是菜单宽度
        x = e.clientX - 200;
      }

      // 检查下边界
      if (y + 100 > window.innerHeight) {
        // 100是预估的菜单高度
        y = e.clientY - 100;
      }

      this.$refs.contextMenu.showMenu(x, y, menuItems);
    },

    deleteComponent(index) {
      const deletedId = this.components[index].id;

      // 删除与该组件相关的所有连接
      connectionStore.connections = connectionStore.connections.filter(
        (conn) =>
          !(
            `unit-${index}` === conn.from.unitId ||
            `unit-${index}` === conn.to.unitId
          )
      );

      // 删除组件
      this.components.splice(index, 1);

      // 更新剩余组件的连接关系
      connectionStore.connections = connectionStore.connections.map((conn) => {
        let newConn = { ...conn };

        // 更新 from unitId
        const fromIndex = parseInt(conn.from.unitId.split("-")[1]);
        if (fromIndex > index) {
          newConn.from = {
            ...conn.from,
            unitId: `unit-${fromIndex - 1}`,
          };
        }

        // 更新 to unitId
        const toIndex = parseInt(conn.to.unitId.split("-")[1]);
        if (toIndex > index) {
          newConn.to = {
            ...conn.to,
            unitId: `unit-${toIndex - 1}`,
          };
        }

        return newConn;
      });

      // 强制更新组件实例
      this.$nextTick(() => {
        // 更新所有组件的 data-unit-id
        this.components.forEach((comp, idx) => {
          const el = document.querySelector(`[data-unit-id="unit-${idx}"]`);
          if (el && el.__vue__) {
            el.__vue__.$forceUpdate();
          }
        });

        // 更新所有连线
        this.updateConnections();
      });
    },
    logConnectionsInfo() {
      this.showDropdown = false;

      // 获取所有组件的坐标和配置信息
      const componentInfo = {};
      this.components.forEach((component, index) => {
        const el = document.querySelector(`[data-unit-id="unit-${index}"]`);
        if (el && el.__vue__) {
          // 计算相对于中心点的坐标
          const x = Math.round(component.x - this.centerOffset.x);
          const y = Math.round(component.y - this.centerOffset.y);

          // 获取组件实例的配置信息
          const vueInstance = el.__vue__;
          componentInfo[`unit-${index}`] = {
            position: { x, y },
            type: vueInstance.type,
            config: vueInstance.localConfig,
          };
        }
      });

      // 输出组件信息
      console.log("组件信息:", componentInfo);

      // 输出连接信息
      console.log(
        "连接信息:",
        this.connections.map((conn) => ({
          from: conn.from,
          to: conn.to,
          color: conn.color,
        }))
      );
    },
    toggleDropdown() {
      this.showLoginDropdown = false;
      this.showDropdown = !this.showDropdown;
    },
    loginDropdown() {
      this.showDropdown = false;
      this.showLoginDropdown = !this.showLoginDropdown;
    },
    showModelManagement() {
      this.showDropdown = false;
      this.$refs.modelManagement.show();
    },
    showPythonLibraryManagement() {
      this.showDropdown = false;
      this.$refs.pythonLibraryManagement.show();
    },
    showConfigManagement() {
      this.showDropdown = false;
      this.$refs.configManagement.show();
    },
    initializeCenterPoint() {
      const rect = this.$refs.mainContent.getBoundingClientRect();
      this.centerOffset = {
        x: rect.width / 2,
        y: rect.height / 2,
      };
    },
    async exportConnections() {
      // 获取组件信息
      const componentInfo = {};
      this.components.forEach((component, index) => {
        const el = document.querySelector(`[data-unit-id="unit-${index}"]`);
        if (el && el.__vue__) {
          const x = Math.round(component.x - this.centerOffset.x);
          const y = Math.round(component.y - this.centerOffset.y);

          const vueInstance = el.__vue__;
          // 找到对应的组件定义
          const unitDef = UNIT_NAMES.find(
            (unit) => unit.component === vueInstance.type
          );

          // 获取组件的实际配置
          const config = vueInstance.localConfig.map((item) => ({
            type: item.type,
            val: item.val,
            des: item.des,
          }));

          console.log("Exporting component config:", config);

          componentInfo[`unit-${index}`] = {
            position: { x, y },
            type: unitDef.en,
            config: config,
          };
        }
      });

      // 准备导出数据
      const exportData = {
        components: componentInfo,
        connections: this.connections.map((conn) => ({
          from: conn.from,
          to: conn.to,
          color: conn.color,
        })),
      };

      console.log("Exporting data:", exportData); // 添加日志

      try {
        // 让用户选择保存位置
        const { filePath } = await ipcRenderer.invoke("save-file-dialog", {
          title: "选择保存位置",
          defaultPath: "flow-config.json",
          filters: [{ name: "JSON Files", extensions: ["json"] }],
        });

        if (filePath) {
          // 保存文件
          await ipcRenderer.invoke("save-file", {
            filePath,
            content: JSON.stringify(exportData, null, 2),
          });
        }
      } catch (error) {
        console.error("导出失败:", error);
      }
    },
    importStringToModel(stringModel) {
      const importData = JSON.parse(stringModel);

      // 清除现有的组件和连接
      this.components = [];
      connectionStore.connections = [];

      // 导入组件
      Object.entries(importData.components).forEach(([id, data]) => {
        const unitDef = UNIT_NAMES.find((unit) => unit.en === data.type);
        if (unitDef) {
          // 创建组件时，处理配置
          const processedConfig = data.config.map((configItem, index) => {
            const defaultConfig = unitDef.config[index];
            // 如果是 select 类型，验证值是否在选项中
            if (defaultConfig && defaultConfig.type === "select") {
              const isValidOption = defaultConfig.options.some(
                (opt) => opt.value === configItem.val
              );
              if (!isValidOption) {
                // 如果值无效，使用默认值
                return defaultConfig;
              }
            }
            return configItem;
          });

          this.components.push({
            id: this.nextComponentId++,
            type: unitDef.component,
            x: data.position.x + this.centerOffset.x,
            y: data.position.y + this.centerOffset.y,
            config: processedConfig,
          });
        }
      });

      // 导入连接
      importData.connections.forEach((conn) => {
        connectionStore.connections.push(conn);
      });
    },
    async importConnections() {
      try {
        const { filePaths } = await ipcRenderer.invoke("open-file-dialog", {
          title: "选择配置文件",
          filters: [{ name: "JSON Files", extensions: ["json"] }],
          properties: ["openFile"],
        });

        if (filePaths && filePaths[0]) {
          const fileContent = await ipcRenderer.invoke(
            "read-file",
            filePaths[0]
          );
          this.importStringToModel(fileContent);
          this.$refs.toast.success("导入成功");
        }
      } catch (error) {
        this.$refs.toast.error("导入失败，文件格式异常");
        // alert("导入失败: " + error.message);
      }
    },
    async login() {
      if (!this.userInfo.islogin) {
        this.$refs.loginDialog.show();
      } else {
        this.loginDropdown();
      }
    },
    async handleLoginSuccess(userData) {
      this.userInfo = { ...userData, islogin: true };
      // 更新用户信息文件
      try {
        await ipcRenderer.invoke("update-user-info", {
          id: userData.id,
          username: userData.username,
          avatar: userData.avatar,
          islogin: true,
        });
        this.$refs.toast.success("登录成功");
      } catch (error) {
        console.error("更新用户信息失败:", error);
        this.$refs.toast.error("更新用户信息失败");
      }
    },
    async logout() {
      // 重置用户信息
      const defaultUserInfo = {
        islogin: false,
        id: null,
        avatar: "",
        username: "",
      };

      try {
        // 更新本地存储
        await ipcRenderer.invoke("update-user-info", defaultUserInfo);
        // 更新状态
        this.userInfo = defaultUserInfo;
        this.showLoginDropdown = false;
        this.$refs.toast.success("已退出登录");
      } catch (error) {
        console.error("退出登录失败:", error);
        this.$refs.toast.error("退出登录失败");
      }
    },
    async showTemplateCollection() {
      try {
        if (!this.userInfo) {
          this.$refs.toast.error("请先登录");
          return;
        }
        const response = await getUserData({
          id: this.userInfo.id,
        });
        if (response.code === 200) {
          this.collectList = response.data.collect;
        } else {
          this.$refs.toast.error("收藏列表获取失败，请重试");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        this.isLoading = false;
      }
      this.showLoginDropdown = false;
      this.$refs.templateCollection.show();
    },
    handleImportTemplate(template) {
      // 这里添加导入模板的具体逻辑
      try {
        this.importStringToModel(template.file);
        this.$refs.toast.success("模板导入成功");
      } catch (error) {
        console.error("导入失败:", error);
        this.$refs.toast.error("导入失败");
        // alert("导入失败: " + error.message);
      }
    },
    validateImportData(data) {
      // 验证数据结构
      if (!data || typeof data !== "object") return false;
      if (!data.components || typeof data.components !== "object") return false;
      if (!Array.isArray(data.connections)) return false;

      // 验证组件数据
      for (const [id, component] of Object.entries(data.components)) {
        if (!id.startsWith("unit-")) return false;
        if (
          !component.position ||
          typeof component.position.x !== "number" ||
          typeof component.position.y !== "number"
        )
          return false;
        if (!component.type || typeof component.type !== "string") return false;
        if (!Array.isArray(component.config)) return false;
      }

      // 验证连接数据
      for (const conn of data.connections) {
        if (!conn.from || !conn.to || !conn.color) return false;
      }

      return true;
    },
    async loadUserInfo() {
      try {
        const userInfo = await ipcRenderer.invoke("get-user-info");
        this.userInfo = userInfo;
      } catch (error) {
        console.error("加载用户信息失败:", error);
      }
    },
    handleDragEnter(e) {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.items && e.dataTransfer.items[0].kind === "file") {
        this.isDraggingFile = true;
      }
    },
    handleDragOver(e) {
      e.preventDefault();
      e.stopPropagation();
    },
    handleDragLeave(e) {
      e.preventDefault();
      e.stopPropagation();
      // 确保只有当鼠标真正离开主容器时才隐藏遮罩
      if (e.target === this.$refs.mainContent) {
        this.isDraggingFile = false;
      }
    },
    async handleDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      this.isDraggingFile = false;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.name.toLowerCase().endsWith(".json")) {
          try {
            const fileContent = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target.result);
              reader.onerror = (e) => reject(e);
              reader.readAsText(file);
            });

            this.importStringToModel(fileContent);
            this.$refs.toast.success("导入成功");
          } catch (error) {
            this.$refs.toast.error("导入失败，文件格式异常");
            // console.error("Import error:", error);
          }
        } else {
          this.$refs.toast.error("请拖入JSON文件");
        }
      }
    },
  },
};
</script>

<style scoped>
.main-content {
  flex: 1;
  height: 100%;
  background-color: #181818;
  overflow: hidden;
  position: relative;
  cursor: default;
}

.main-content.panning {
  cursor: grab;
}

.main-content.panning:active {
  cursor: grabbing;
}

.grid-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.content-wrapper {
  position: absolute;
  padding: 20px;
  color: #fff;
  user-select: none;
  pointer-events: all;
  z-index: 2;
}

.draggable-element {
  position: absolute;
  padding: 10px;
  background-color: #2c3e50;
  border: 1px solid #34495e;
  border-radius: 4px;
  cursor: move;
  user-select: none;
  transition: background-color 0.2s;
}

.draggable-element:hover {
  background-color: #34495e;
}

.zoom-controller {
  user-select: none;
  opacity: 0.5;
  position: absolute;
  left: 20px;
  bottom: 20px;
  display: flex;
  align-items: center;
  background-color: #252525;
  border: 1px solid #383838;
  color: #a0a0a0;
  border-radius: 4px;
  padding: 2px;
  gap: 2px;
  transition: opacity 0.2s;
}

.zoom-controller:hover {
  opacity: 1;
}

.zoom-btn {
  width: 24px;
  height: 24px;
  border: none;
  background-color: #252525;
  color: #a0a0a0;
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: background-color 0.2s;
}

.zoom-btn:hover:not(:disabled) {
  background-color: #3b3b3b;
}

.zoom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.zoom-input-wrapper {
  position: relative;
  width: 50px;
}

.zoom-input {
  width: 100%;
  height: 24px;
  background-color: #252525;
  border: none;
  color: #b9b9b9;
  padding: 0 16px 0 4px;
  border-radius: 2px;
  text-align: center;
}

.zoom-input::-webkit-inner-spin-button,
.zoom-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.zoom-symbol {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  color: #b9b9b9;
  font-size: 12px;
  pointer-events: none;
}

.processing-component {
  position: absolute;
  transition: box-shadow 0.2s;
  user-select: none;
  pointer-events: all;
  z-index: 2;
}

.connections-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.connection-path {
  fill: none;
  stroke-width: 2;
}

.connection-path.dragging {
  stroke-dasharray: 5, 5;
}

.connection-info-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  padding: 8px 16px;
  background-color: #252525;
  border: 1px solid #383838;
  color: #b9b9b9;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
  opacity: 0.5;
  z-index: 1000;
}

.connection-info-btn:hover {
  opacity: 1;
  background-color: #2c2c2c;
}

.toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 20px;
  display: flex;
  align-items: center;
  z-index: 100;
}

.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #2a2a2a;
  padding: 4px;
  border-radius: 6px;
  border: 1px solid #383838;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #383838;
  margin: 0 1px;
}

.toolbar-btn {
  user-select: none;
  background: transparent;
  border: none;
  cursor: pointer;
  height: 32px;
  width: 32px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-btn:hover {
  background: #383838;
}

.toolbar-btn img {
  width: 16px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.toolbar-btn:hover img {
  opacity: 1;
}

.settings-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 16px;
  background: #333;
  border-radius: 6px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  z-index: 100;
  min-width: 140px;
  padding: 4px;
  border: 1px solid #383838;
}

.dropdown-menu::before {
  content: "";
  position: absolute;
  top: -5px;
  left: 9px;
  width: 10px;
  height: 10px;
  background: #333;
  transform: rotate(45deg);
  border-left: 1px solid #383838;
  border-top: 1px solid #383838;
}

.dropdown-item {
  user-select: none;
  padding: 8px 12px;
  color: #b9b9b9;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}

.dropdown-item img {
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

.dropdown-item:hover {
  background: #444;
  color: #fff;
}

.dropdown-item:hover img {
  opacity: 1;
}

.coordinates-display {
  position: absolute;
  left: 16px;
  bottom: 60px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: #b9b9b9;
  user-select: none;
  opacity: 0.8;
  z-index: 100;
}

.coordinates-display span {
  font-family: "Consolas", monospace;
}

/* 添加拖拽导入遮罩层样式 */
.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-in-out;
  pointer-events: none;
}

.drag-message {
  background: #2a2a2a;
  padding: 20px 40px;
  border-radius: 8px;
  border: 2px dashed #00a8ff;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #b9b9b9;
  font-size: 16px;
}

.drag-message img {
  width: 24px;
  height: 24px;
  opacity: 0.8;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style> 