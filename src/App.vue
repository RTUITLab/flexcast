<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
  box-sizing: 0;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #232532;
  color: #f8fbfd;
  height: 100%;
}

#app {
  height: 100%;
}

.noselect {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}
</style>
