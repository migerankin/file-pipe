<template>
  <div id="app">
    <MainContent ref="mainContent" />
  </div>
</template>

<script>
import MainContent from "./components/MainContent.vue";

export default {
  name: "App",
  components: {
    MainContent,
  },
  mounted() {
    document.addEventListener("contextmenu", (e) => e.preventDefault());
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
}

#app {
  height: 100vh;
  display: flex;
  background-color: #181818;
  color: #ffffff;
}
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
input:focus {
  outline: none;
}
</style> 