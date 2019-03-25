<template>
  <div class='c-samplelist'>
    <div
      v-for='(source, index) in sources'
      :key='`source-${index}`'
      class='item noselect'
      :class='getSourceClass(source)'
      @mousedown='startHandle($event, source)'
    >{{ source.name }}</div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { Source } from '@/model/stuff/Source';
import { SourceHandle } from '@/model/managers/SourceManager';

import state from '@/model/State';

@Component
export default class CSourceList extends Vue {
  private handle: SourceHandle | null = null;
  private sources: Source[] = [];

  created() {
    this.$bus.on('sourcesChanged', this.updateSources);
    this.$bus.on('handleStarted', this.updateHandle);
    this.$bus.on('handleFinished', this.updateHandle);

    window.addEventListener('mouseup', () => {
      this.$state.sourceManager.stopHandle();
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.$state.sourceManager.hasHandle) {
        return;
      }

      this.$state.sourceManager.moveHandle(e.pageX, e.pageY);
    });
  }

  startHandle(e: any, source: Source) {
    this.$state.timelineManager.isPlaying = false;

    const handle = new SourceHandle(source, e.pageX, e.pageY);
    this.$state.sourceManager.startHandle(handle);
  }

  updateSources() {
    this.sources = this.$state.sourceManager.sources;
  }

  updateHandle() {
    this.handle = this.$state.sourceManager.sourceHandle;
  }

  getSourceClass(sample: Source) {
    return {
      handled: this.handle != null && sample.name == this.handle.source.name
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
