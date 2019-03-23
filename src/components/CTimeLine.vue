<template>
  <div class="c-timeline" ref="timeline">
    <canvas class="grid" ref="grid"></canvas>

    <c-timeline-row
      v-for="(samples, index) in timelines"
      :key="`timeline-${index}`"
      :samples="samples"
      :ref="`timeline-${index}`"
      @needsRedraw="redraw"
    />

    <div class="cursor" ref="cursor"></div>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Prop, Vue } from 'vue-property-decorator';
import CTimeLineRow from '@/components/CTimeLineRow.vue';

import { IWindowSlice } from '@/model/WindowSlice';
import { Sample } from '@/model/Sample';
import state from '@/model/State';

@Component({
  components: {
    'c-timeline-row': CTimeLineRow
  }
})
export default class CTimeLine extends Vue {
  private timelineElement!: HTMLElement;
  private cursorElement!: HTMLElement;
  private gridElement!: HTMLElement;
  private context!: CanvasRenderingContext2D;

  @Prop({
    type: Array,
    default: []
  })
  public timelines!: Sample[][];

  mounted() {
    this.timelineElement = this.$refs['timeline'] as HTMLElement;
    this.cursorElement = this.$refs['cursor'] as HTMLElement;
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

    this.timelineElement.addEventListener('mousemove', this.updateCursor);

    state.on('ppsChanged', this.redraw);
  }

  updateCursor(e: any) {
    this.cursorElement.style.left = `${e.clientX}px`;
  }

  updated() {
    this.$nextTick(() => {
      this.redraw();
    });
  }

  redraw() {
    const xOffset = this.timelineElement.scrollLeft;
    const yOffset = this.timelineElement.scrollTop;

    const width = this.timelineElement.clientWidth;
    const height = this.timelineElement.clientHeight;

    for (let i = 0; i < this.timelines.length; ++i) {
      const timeline = (this.$refs[`timeline-${i}`] as any)[0];

      timeline.updateVisibleItems({
        offsetLeft: xOffset,
        offsetTop: yOffset,
        width,
        height
      });
    }

    (this.gridElement as any).width = width;
    (this.gridElement as any).height = height;

    this.context.lineWidth = 2;

    this.context.clearRect(0, 0, width, height);

    this.context.beginPath();

    let elapsedSeconds = Math.ceil(xOffset / state.pps);

    let x = elapsedSeconds * state.pps - xOffset;
    const maxX = this.timelineElement.clientWidth;

    this.context.font = '16px Arial';
    this.context.fillStyle = '#11706D';
    this.context.strokeStyle = '#03282D';

    while (x < maxX) {
      this.context.moveTo(x, 0);
      this.context.lineTo(x, height);

      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = elapsedSeconds - minutes * 60;

      this.context.fillText(
        `${this.pad(minutes, 2)}:${this.pad(seconds, 2)}`,
        x + 3,
        height - 3
      );
      ++elapsedSeconds;

      x += state.pps;
    }

    this.context.stroke();
  }

  scrollHorizontally(e: any) {
    e = window.event || e;
    var delta = Math.max(-1, Math.min(1, e.wheelDelta || -e.detail));
    (this.$refs['timeline'] as any).scrollLeft -= delta * 40;

    this.redraw();
    e.preventDefault();
  }

  pad(n: number, width: number, z?: string) {
    z = z || '0';
    let r = n.toString();
    return r.length >= width ? n : new Array(width - r.length + 1).join(z) + n;
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
    background: #9cefff;
    border: 2px solid rgba(100, 180, 186, 0.85);
    border-radius: 0px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #ffffff;
    cursor: pointer;
    border-radius: 0px;
  }
  &::-webkit-scrollbar-thumb:active {
    background: #e0e0e0;
    border-radius: 0px;
  }
  &::-webkit-scrollbar-track {
    background-color: #0b4e51;
    border-radius: 0px;
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

  .cursor {
    position: absolute;
    top: 0;
    height: calc(100% - 20px);
    background-color: red;
    display: block;
    width: 1px;
    z-index: 999999;
  }
}
</style>
