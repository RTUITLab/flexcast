<template>
  <div class="c-samplelist">
    <div class="drop-zone noselect" :class="{hovered:dragZoneHovered}" ref="drop-zone">*.mp3</div>

    <div
      v-for="(source, index) in sources"
      :key="`source-${index}`"
      class="item noselect"
      :class="getSourceClass(source)"
      @mousedown="startHandle($event, source)"
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
  private dragZoneHovered: boolean = false;

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

  mounted() {
    const dropZone = this.$refs['drop-zone'] as HTMLElement;
    dropZone.addEventListener('drop', (event: any) => {
      event.preventDefault();

      const files: File[] = [];

      if (event.dataTransfer.items) {
        for (var i = 0; i < event.dataTransfer.items.length; i++) {
          if (event.dataTransfer.items[i].kind === 'file') {
            files.push(event.dataTransfer.items[i].getAsFile()!);
          }
        }
      } else {
        for (var i = 0; i < event.dataTransfer.files.length; i++) {
          files.push(event.dataTransfer.files[i]);
        }
      }

      files.forEach((file) => this.$state.sourceManager.addSource(file));
    });

    ['dragenter', 'dragover'].forEach((eventName) => {
      dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        this.dragZoneHovered = true;
      });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
      dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        this.dragZoneHovered = false;
      });
    });
  }

  startHandle(e: any, source: Source) {
    if (this.$state.instrumentManager.instrument !== 'mouse') {
      return;
    }

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
  opacity: 1;
  overflow-y: auto;

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

  .drop-zone {
    margin: 10px;
    padding: 10px;
    font-size: 20pt;
    text-align: center;
    border: 4px dashed #03282d;

    &.hovered {
      border: 4px dashed #139aac;
    }
  }
}
</style>
