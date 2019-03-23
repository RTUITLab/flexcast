<template>
  <div class="c-samplelist">
    <div v-for="(url, index) in tracks" :key="`track-${index}`" class="track-item">{{ url }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class CSampleList extends Vue {
  mounted() {}

  get tracks() {
    return ['test/test.mp3', 'test/test.mp3'];
  }
}
</script>

<style lang="scss">
.c-samplelist {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  .track-item {
    margin: 4px;
    padding: 20px;
    background-color: #2f3045;
  }
}
</style>
