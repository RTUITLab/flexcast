<template>
  <div class="c-samplelist">
    <div
      v-for="(url, index) in sources"
      :key="`source-${index}`"
      class="item noselect"
      @mousedown="startHandle($event, url)"
    >{{ url }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import state from '@/model/State';

@Component
export default class CSampleList extends Vue {
  private sources: string[] = [];

  created() {
    state.on('sourcesChanged', this.updateSources);

    state.on('handleMoved', () => {
      console.log(state.sourceHandle);
    });

    window.addEventListener('mouseup', () => {
      state.setHandle(null);
    });

    window.addEventListener('mousemove', (e) => {
      if (state.sourceHandle == null) {
        return;
      }

      const { data } = state.sourceHandle;

      state.updateHandle({
        data,
        pageX: e.pageX,
        pageY: e.pageY
      });
    });
  }

  startHandle(e: any, url: string) {
    state.setHandle({
      data: url,
      pageX: e.pageX,
      pageY: e.pageY
    });
  }

  updateSources() {
    this.sources = state.sources;
  }
}
</script>

<style lang="scss">
.c-samplelist {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background-color: #003840;
  height: 100%;

  .item {
    margin: 4px;
    padding: 20px;
    background-color: #03282d;
    cursor: pointer;

    &.handled {
      background-color: #021518;
    }
  }
}
</style>
