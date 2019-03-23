<template>
  <div class="c-timeline" ref="timeline">
    <canvas class="grid" ref="grid"></canvas>

    <c-timeline-row
      v-for="(samples, index) in timelines"
      :key="`timeline-${index}`"
      :samples="samples"
      :pps="pps"
      @needsRedraw="redraw"
    />
  </div>
</template>

<script lang="ts">
import { Component, Watch, Prop, Vue } from 'vue-property-decorator';
import CTimeLineRow from '@/components/CTimeLineRow.vue';

import { Sample } from '@/model/Sample';

@Component({
  components: {
    'c-timeline-row': CTimeLineRow
  }
})
export default class CTimeLine extends Vue {
  private timelineElement!: HTMLElement;
  private gridElement!: HTMLElement;
  private context!: CanvasRenderingContext2D;

  @Prop({
    type: Array,
    default: []
  })
  public timelines!: Sample[][];

  @Prop()
  public pps!: number;

  mounted() {
    this.timelineElement = this.$refs['timeline'] as HTMLElement;
    this.gridElement = this.$refs['grid'] as HTMLElement;
    this.context = (this.gridElement as any).getContext('2d');

    this.timelineElement.addEventListener(
      'mousewheel',
      this.scrollHorizontally,
      false
    );
    this.timelineElement.addEventListener(
      'DOMMouseScroll',
      this.scrollHorizontally,
      false
    );
  }

  updated() {
    this.$nextTick(() => {
      this.redraw();
    });
  }

  redraw() {
    (this.gridElement as any).width = this.timelineElement.clientWidth;
    (this.gridElement as any).height = this.timelineElement.clientHeight;

    const width = this.timelineElement.clientWidth;
    const height = this.timelineElement.clientHeight;

    this.context.lineWidth = 2;

    this.context.clearRect(0, 0, width, height);

    this.context.beginPath();

    const xOffset = this.timelineElement.scrollLeft;
    const yOffset = this.timelineElement.scrollTop;

    let x = Math.ceil(xOffset / this.pps) * this.pps - xOffset;
    const maxX = this.timelineElement.clientWidth;

    console.log(x);

    while (x < maxX) {
      this.context.moveTo(x, 0);
      this.context.lineTo(x, height);

      x += this.pps;
    }

    this.context.strokeStyle = '#03282D';
    this.context.stroke();
  }

  scrollHorizontally(e: any) {
    e = window.event || e;
    var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
    (this.$refs['timeline'] as any).scrollLeft -= delta * 40;

    this.redraw();
    e.preventDefault();
  }
}
</script>

<style lang="scss">
@mixin scrollbar() {
  &::-webkit-scrollbar {
    width: 20px;
    height: 20px;
  }
  &::-webkit-scrollbar-button {
    width: 0px;
    height: 0px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e1e1e1;
    border: 0px none #ffffff;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #ffffff;
    cursor: pointer;
  }
  &::-webkit-scrollbar-thumb:active {
    background: #e0e0e0;
  }
  &::-webkit-scrollbar-track {
    background: #666666;
    border: 0px none #ffffff;
    border-radius: 0px;
  }
  &::-webkit-scrollbar-track:hover {
    background: #666666;
  }
  &::-webkit-scrollbar-track:active {
    background: #333333;
  }
  &::-webkit-scrollbar-corner {
    background: transparent;
  }
}

@mixin no-scrollbar() {
  &::-webkit-scrollbar {
    height: 0;
    width: 0;
  }
  &::-webkit-scrollbar-thumb {
    height: 0;
    width: 0;
  }
  &::-webkit-scrollbar-track {
    height: 0;
    width: 0;
  }
}

.c-timeline {
  overflow: auto;
  background-color: #00191d;
  height: 100%;
  @include scrollbar();

  .grid {
    position: absolute;
  }
}
</style>
