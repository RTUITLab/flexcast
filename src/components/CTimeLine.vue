<template>
  <div class='c-timeline' ref='timeline' @scroll='redraw'>
    <canvas class='grid-canvas' ref='grid-canvas'></canvas>

    <c-timeline-row
      v-for='(sample, index) in samples'
      :key='`timeline-${index}`'
      :ref='`timeline-${index}`'
      :sample='sample'
      @needsRedraw='redraw'
    />

    <template v-if='sourceHandle'>
      <c-timeline-row :sample='newSample' :ref='`timeline-new`' @needsRedraw='redraw'/>
    </template>

    <canvas class='cursor-canvas' ref='cursor-canvas'></canvas>

    <div class='spacer'></div>
  </div>
</template>

<script lang="ts">
import { Component, Watch, Prop, Vue } from 'vue-property-decorator';
import CTimeLineRow from '@/components/CTimeLineRow.vue';

import { SourceHandle } from '@/model/managers/SourceManager';
import { Sample } from '@/model/stuff/Sample';
import { TimeLineManager } from '@/model/managers/TimeLineManager';
import { Rectangle } from '@/model/stuff/Rectangle';

@Component({
  components: {
    'c-timeline-row': CTimeLineRow
  }
})
export default class CTimeLine extends Vue {
  private timelineManager!: TimeLineManager;

  private timelineElement!: HTMLElement;

  private gridElement!: HTMLElement;
  private gridContext!: CanvasRenderingContext2D;

  private cursorElement!: HTMLElement;
  private cursorContext!: CanvasRenderingContext2D;

  private samples: Sample[] = [];
  private newSample: Sample | null = null;

  private sourceHandle: SourceHandle | null = null;

  mounted() {
    this.timelineManager = this.$state.timelineManager;

    this.timelineElement = this.$refs['timeline'] as HTMLElement;

    this.gridElement = this.$refs['grid-canvas'] as HTMLElement;
    this.gridContext = (this.gridElement as any).getContext('2d');

    this.cursorElement = this.$refs['cursor-canvas'] as HTMLElement;
    this.cursorContext = (this.cursorElement as any).getContext('2d');

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

    this.timelineElement.addEventListener('click', this.moveCursor);

    this.$bus.on('samplesChanged', this.updateSamples);

    this.$bus.on('handleStarted', this.updateSourceHandle);
    this.$bus.on('handleFinished', this.updateSourceHandle);
    this.$bus.on('handleMoved', this.updateSourceHandle);

    this.$bus.on('playing', this.redraw);
    this.$bus.on('seeked', this.redraw);
    this.$bus.on('scrollToCursor', this.updateCursor);

    this.$bus.on('ppsChanged', this.redraw);

    window.addEventListener('resize', this.redraw);

    this.redraw();
  }

  updateSamples() {
    this.samples = this.$state.sampleManager.samples;
    this.$nextTick(() => {
      this.redraw();
    })
  }

  updateSourceHandle() {
    this.sourceHandle = this.$state.sourceManager.sourceHandle;

    if (this.sourceHandle == null) {
      if (this.newSample) {
        this.$state.sampleManager.addSample(this.newSample);
      }

      this.newSample = null;
      return;
    }

    const xOffset = this.timelineElement.scrollLeft;
    const x = this.sourceHandle.pageX - this.timelineElement.offsetLeft;
    const offset = Math.max(0, (xOffset + x) / this.timelineManager.pps);

    if (this.newSample == null) {
      const source = this.sourceHandle.source;
      this.newSample = new Sample(source);
    }

    this.newSample.offset = offset;
    this.redraw();
  }

  updateCursor() {
    this.timelineElement.scrollLeft =
      this.timelineManager.time * this.timelineManager.pps;
    this.redrawCursor();
  }

  updated() {
    this.$nextTick(() => {
      this.redraw();
    });
  }

  redraw() {
    this.redrawGrid();
    this.redrawCursor();
  }

  moveCursor(e: any) {
    if (!e.altKey) {
      return;
    }

    const x = e.pageX - this.timelineElement.offsetLeft;
    const pixels = this.timelineElement.scrollLeft + x;

    this.timelineManager.time = pixels / this.timelineManager.pps;

    this.redrawCursor();
  }

  redrawGrid() {
    const xOffset = this.timelineElement.scrollLeft;
    const yOffset = this.timelineElement.scrollTop;

    const width = this.timelineElement.clientWidth;
    const height = this.timelineElement.clientHeight;

    for (let i = 0; i <= this.samples.length; ++i) {
      const timeline =
        i < this.samples.length
          ? (this.$refs[`timeline-${i}`] as any)[0]
          : (this.$refs[`timeline-new`] as any);

      if (timeline == null) {
        continue;
      }

      timeline.updateVisibleItems(
        new Rectangle({
          offsetLeft: xOffset,
          offsetTop: yOffset,
          width,
          height
        })
      );
    }

    (this.gridElement as any).width = width;
    (this.gridElement as any).height = height;

    this.gridContext.lineWidth = 2;

    this.gridContext.clearRect(0, 0, width, height);

    this.gridContext.beginPath();

    let step = 1;
    const pps = this.timelineManager.pps;
    if (pps < 2) {
      step = 60;
    } else if (pps < 10) {
      step = 30;
    } else if (pps < 20) {
      step = 15;
    } else if (pps < 45) {
      step = 5;
    }

    const pixelStep = pps * step;

    let elapsedSteps = Math.ceil(xOffset / pixelStep);

    let x = elapsedSteps * pixelStep - xOffset;
    const maxX = this.timelineElement.clientWidth;

    this.gridContext.font = '16px Arial';
    this.gridContext.fillStyle = '#11706D';
    this.gridContext.strokeStyle = '#03282D';

    while (x < maxX) {
      this.gridContext.moveTo(x, 0);
      this.gridContext.lineTo(x, height);

      const minutes = Math.floor((elapsedSteps * step) / 60);
      const seconds = elapsedSteps * step - minutes * 60;

      this.gridContext.fillText(
        `${this.pad(minutes, 2)}:${this.pad(seconds, 2)}`,
        x + 3,
        height - 3
      );

      ++elapsedSteps;

      x += pixelStep;
    }

    this.gridContext.stroke();
  }

  redrawCursor() {
    const xOffset = this.timelineElement.scrollLeft;
    const yOffset = this.timelineElement.scrollTop;

    const width = this.timelineElement.clientWidth;
    const height = this.timelineElement.clientHeight;

    (this.cursorElement as any).width = width;
    (this.cursorElement as any).height = height;

    this.cursorContext.lineWidth = 2;

    this.cursorContext.clearRect(0, 0, width, height);

    this.cursorContext.beginPath();

    const timePixels = this.timelineManager.time * this.timelineManager.pps;
    this.cursorContext.strokeStyle = '#dd282D';

    const checkInRange = (x: number) => x >= xOffset && x <= xOffset + width;

    if (checkInRange(timePixels)) {
      this.cursorContext.moveTo(timePixels - xOffset, 0);
      this.cursorContext.lineTo(timePixels - xOffset, height);
    }

    for (let i = 0; i <= this.samples.length; ++i) {
      const timeline =
        i < this.samples.length
          ? (this.$refs[`timeline-${i}`] as any)[0]
          : (this.$refs[`timeline-new`] as any);

      if (timeline == null) {
        continue;
      }

      const height = 128;
      const spacing = 5;

      const samples: Sample[] = timeline.getSamples();
      samples.forEach((sample) => {
        if (sample.source.beats == null) {
          return;
        }

        const beats = sample.source.beats;

        beats.head.concat(beats.tail).forEach((beat) => {
          const x = (beat + sample.offset) * this.timelineManager.pps;

          if (!checkInRange(x)) {
            return;
          }

          this.cursorContext.moveTo(
            x - xOffset,
            (height + spacing) * i - yOffset
          );
          this.cursorContext.lineTo(
            x - xOffset,
            (height + spacing) * i + height - yOffset
          );
        });
      });
    }

    this.cursorContext.stroke();
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

  .grid-canvas,
  .cursor-canvas {
    position: absolute;
    top: 0;
  }

  .spacer {
    height: 100px;
  }
}
</style>
