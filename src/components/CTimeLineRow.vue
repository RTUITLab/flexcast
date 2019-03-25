<template>
  <div class='c-timeline-row'>
    <c-waveform :sample='sample'/>

    <template v-for='item in visibleItems'>
      <div
        class='item noselect'
        :style='generateStyle(item)'
        :key='`item-${item.sample.id}`'
      >{{item.sample.source.name}}</div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import CWaveForm from '@/components/CWaveForm.vue';

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
  @Prop()
  public sample!: Sample;

  private visibleItems: IVisibleItem[] = [];

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

  generateStyle(item: IVisibleItem) {
    return {
      left: `${item.rectangle.offsetLeft}px`,
      width: `${item.rectangle.width}px`
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
    z-index: 4;
  }
}
</style>
