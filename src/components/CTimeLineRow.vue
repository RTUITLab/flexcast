<template>
  <div class="c-timeline-row">
    <c-waveform
      v-for="(sample, index) in samples"
      :key="`waveform-${index}`"
      :sample="sample"
      :pps="pps"
      @waveformReady="onReady"
    />

    <template v-for="item in visibleItems">
      <div
        class="item"
        :style="generateStyle(item)"
        :key="`item-${item.sample.id}`"
      >{{item.sample.sample.url}}</div>
    </template>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import CWaveForm from '@/components/CWaveForm.vue';

import { Sample, ISample } from '@/model/Sample';
import { IWindowSlice, contains } from '@/model/WindowSlice';

interface ISampleItem {
  id: number;
  sample: Sample;
  duration: number;
}

interface IVisibleItem {
  sample: ISampleItem;
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

  @Prop()
  public pps!: number;

  private sampleItems: Map<number, ISampleItem> = new Map<
    number,
    ISampleItem
  >();

  private visibleItems: IVisibleItem[] = [];

  onReady(sampleItem: ISampleItem) {
    this.sampleItems.set(sampleItem.id, sampleItem);
    this.$emit('needsRedraw');
  }

  public updateVisibleItems(windowSlice: IWindowSlice) {
    let result: IVisibleItem[] = [];

    this.sampleItems.forEach((element) => {
      const left = element.sample.offset * this.pps;
      const width = element.duration * this.pps;

      const area = contains(windowSlice, left, width);

      if (area) {
        result.push({
          sample: element,
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