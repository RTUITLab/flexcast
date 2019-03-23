<template>
  <div class="c-samplelist">
    <div
      v-for="(source, index) in sources"
      :key="`source-${index}`"
      class="item noselect"
      :class="getSourceClass(source)"
      @mousedown="startHandle($event, source)"
    >{{ source.url }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { ISource, ISourceHandle } from '@/model/Sample';
import state from '@/model/State';

@Component
export default class CSampleList extends Vue {
  private handle: ISourceHandle | null = null;
  private sources: ISource[] = [];

  created() {
    state.on('sourcesChanged', this.updateSources);
    state.on('handleStartedFinished', this.updateHandle);

    window.addEventListener('mouseup', () => {
      state.setHandle(null);
    });

    window.addEventListener('mousemove', (e) => {
      if (state.sourceHandle == null) {
        return;
      }

      const { source } = state.sourceHandle;

      state.updateHandle({
        source,
        pageX: e.pageX,
        pageY: e.pageY
      });
    });
  }

  startHandle(e: any, source: ISource) {
    if (source.state != 'complete') {
      return;
    }

    state.setHandle({
      source,
      pageX: e.pageX,
      pageY: e.pageY
    });
  }

  updateSources() {
    this.sources = state.sources;
  }

  updateHandle() {
    this.handle = state.sourceHandle;
  }

  getSourceClass(sample: ISource) {
    return {
      handled: this.handle != null && sample.url == this.handle.source.url,
      analyzing: sample.state == 'analyzing',
      complete: sample.state == 'complete'
    };
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
  opacity: 1;

  .item {
    margin: 4px;
    padding: 20px;
    background-color: #03282d;
    cursor: pointer;

    &.handled {
      opacity: 0.5;
    }

    &.analyzing {
      opacity: 0.1;
      cursor: default;
    }
  }
}
</style>
