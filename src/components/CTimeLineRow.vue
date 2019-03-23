<template>
  <div class="c-timeline-row">
    <c-waveform v-for="(sample, index) in samples" :key="`waveform-${index}`" :sample="sample"/>

    <template v-for="item in visibleItems">
      <div
        class="item"
        :style="generateStyle(item)"
        :key="`item-${item.sample.id}`"
      >{{item.sample.url}}</div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import CWaveForm from '@/components/CWaveForm.vue';

import { Sample, ISample } from '@/model/Sample';
import { IWindowSlice, contains } from '@/model/WindowSlice';
import state from '@/model/State';

interface IVisibleItem {
  sample: Sample;
  left: number;
  width: number;
}

@Component({
  components: {
    'c-waveform': CWaveForm
  }
})
export default class CTimeLineRow extends Vue {
  @Prop({
    type: Array,
    default: []
  })
  public samples!: Sample[];

  private visibleItems: IVisibleItem[] = [];

  public updateVisibleItems(windowSlice: IWindowSlice) {
    let result: IVisibleItem[] = [];

    this.samples.forEach((sample) => {
      if (!sample.isComplete) {
        return;
      }

      const left = sample.offset * state.pps;
      const width = sample.duration * state.pps;

      const area = contains(windowSlice, left, width);

      if (area) {
        result.push({
          sample: sample,
          left: area.left,
          width: area.width
        });
      }
    });

    this.visibleItems = result;
  }

  generateStyle(item: IVisibleItem) {
    return {
      left: `${item.left}px`,
      width: `${item.width}px`
    };
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

  &:not(:last-child) {
    margin-bottom: 5px;
  }

  .item {
    height: 128px;
    display: inline-block;
    position: absolute;
    top: 0;
    background: rgba(0, 0, 0, 0.2);
  }
}
</style>
