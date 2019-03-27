<template>
  <div class="c-timeline-row">
    <c-waveform :sample="sample"/>

    <template v-for="item in visibleItems">
      <div
        class="item noselect"
        :style="getStyle(item)"
        :class="getClass(item)"
        :key="`item-${item.sample.id}`"
        @mousedown="startMove(item)"
      >{{item.sample.source.name}}</div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import CWaveForm from '@/components/CWaveForm.vue';

import { InstrumentType } from '@/model/managers/InstrumentManager';
import { Rectangle } from '@/model/stuff/Rectangle';
import { Sample } from '@/model/stuff/Sample';

interface IVisibleItem {
  sample: Sample;
  rectangle: Rectangle;
}

@Component({
  components: {
    'c-waveform': CWaveForm
  }
})
export default class CTimeLineRow extends Vue {
  private instrument!: InstrumentType;

  private currentItem: Sample | null = null;

  @Prop()
  public sample!: Sample;

  private visibleItems: IVisibleItem[] = [];

  created() {
    this.$bus.on('instrumentChanged', this.updateState);
    this.updateState();

    window.addEventListener('mouseup', () => {
      this.currentItem = null;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.currentItem == null) {
        return;
      }

      this.$state.timelineManager.isPlaying = false;

      this.currentItem.offset += e.movementX / this.$state.timelineManager.pps;
      this.$state.sampleManager.updateSample(this.currentItem);
    });
  }

  beforeDestroy() {
    this.$bus.off('instrumentChanged', this.updateState);
  }

  updateState() {
    this.instrument = this.$state.instrumentManager.instrument;
    this.$forceUpdate();
  }

  startMove(item: IVisibleItem) {
    if (this.currentItem != null || this.instrument !== 'move') {
      return;
    }

    this.currentItem = item.sample;
  }

  public updateVisibleItems(windowRectangle: Rectangle) {
    let result: IVisibleItem[] = [];

    if (!this.sample.isComplete) {
      return;
    }

    const left = this.sample.offset * this.$state.timelineManager.pps;
    const width = this.sample.duration * this.$state.timelineManager.pps;

    const intersection = windowRectangle.findHorizontalIntersection(
      new Rectangle({
        offsetLeft: left,
        offsetTop: 0,
        width,
        height: 128
      })
    );

    if (intersection) {
      result.push({
        sample: this.sample,
        rectangle: intersection
      });
    }

    this.visibleItems = result;
  }

  getStyle(item: IVisibleItem) {
    return {
      left: `${item.rectangle.offsetLeft}px`,
      width: `${item.rectangle.width}px`
    };
  }

  getClass(item: IVisibleItem) {
    return {
      'instrument-mouse': this.instrument === 'mouse',
      'instrument-move': this.instrument === 'move'
    };
  }

  public getSamples() {
    return [this.sample];
  }
}
</script>

<style lang="scss">
.c-timeline-row {
  right: 0;
  position: relative;
  white-space: nowrap;
  margin: 0;
  padding: 0;
  height: 128px;
  margin-bottom: 5px;

  .item {
    height: 128px;
    display: inline-block;
    position: absolute;
    top: 0;
    background: rgba(0, 0, 0, 0.2);
    z-index: 10;

    &.instrument-mouse {
      cursor: text;
    }

    &.instrument-move {
      cursor: ew-resize;

      &:hover {
        background: rgba(0, 0, 60, 0.2);
      }
    }
  }
}
</style>
