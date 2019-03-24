<template>
  <div class="c-waveform" :style="style">
    <div :id="`waveform-${sampleId}`"></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Sample } from '@/model/Sample';
import state from '@/model/State';

import WaveSurfer from 'wavesurfer.js';

import { Effect } from '@/model/Effects';

let SAMPLE_ID = 0;

@Component({})
export default class CWaveForm extends Vue {
  @Prop()
  public sample!: Sample;

  public volume: number = 1;
  public pps: number = 50;

  private sampleId: Number = 0;
  private wavesurfer: any = null;
  private isPlaying: boolean = false;

  private shouldPlay: boolean = false;

  private effects: Effect[] = [];

  created() {
    this.sampleId = SAMPLE_ID++;
  }

  mounted() {
    this.$nextTick(() => {
      this.wavesurfer = WaveSurfer.create({
        container: `#waveform-${this.sampleId}`,
        waveColor: '#70FAFC',
        progressColor: '#357d7f',
        cursorColor: '#AAF9FE',
        forceDecode: true,
        autoCenter: false,
        fillParent: false,
        hideScrollbar: true,
        cursorWidth: 0
      });

      this.wavesurfer.toggleInteraction();
      this.wavesurfer.toggleScroll();

      state.on('ppsChanged', this.updateZoom);
      this.updateZoom();

      state.on('volumeChanged', this.updateVolume);
      this.updateVolume();

      this.wavesurfer.on('error', (err: any) => {
        console.log(err);
      });

      this.wavesurfer.on('ready', () => {
        const duration = this.wavesurfer.getDuration();
        this.sample.duration = duration;
        state.updateSample(this.sample);
      });

      this.wavesurfer.loadDecodedBuffer(this.sample.source.data);

      state.on('playing', this.updatePlaying);
      state.on('playPause', this.updatePlaying);
      state.on('seeked', this.handleSeek);
    });
  }

  beforeDestroy() {
    state.off('ppsChanged', this.updateZoom);
    state.off('volumeChanged', this.updateVolume);
    state.off('playing', this.updatePlaying);
    state.off('playPause', this.updatePlaying);
    state.off('seeked', this.handleSeek);
  }

  handleSeek() {
    if (!this.sample.isComplete) {
      return;
    }

    const seconds = state.time / 1000;

    let progress = 0;
    if (seconds > this.sample.offset + this.sample.duration) {
      progress = 1;
    } else if (seconds > this.sample.offset) {
      progress = (seconds - this.sample.offset) / this.sample.duration;
    }

    this.wavesurfer.seekTo(progress);

    this.updateEffects();

    this.updatePlaying();
  }

  updatePlaying() {
    this.shouldPlay = state.isPlaying;

    const inRange = this.isInRange();
    if (inRange) {
    }
    if (this.isPlaying && (!this.shouldPlay || !inRange)) {
      this.wavesurfer.pause();
      this.isPlaying = false;
    } else if (!this.isPlaying && this.shouldPlay && this.isInRange()) {
      this.wavesurfer.play();
      this.updateEffects();
      this.isPlaying = true;
    }
  }

  isInRange() {
    if (!this.sample.isComplete) {
      return false;
    }
    const seconds = state.time / 1000;
    return (
      seconds >= this.sample.offset &&
      seconds <= this.sample.offset + this.sample.duration
    );
  }

  updateZoom() {
    if (this.wavesurfer == null) {
      return;
    }
    this.pps = state.pps;

    new Promise((resolve, reject) => {
      this.wavesurfer.zoom(state.pps);
      resolve();
    });
  }

  updateVolume() {
    if (this.wavesurfer == null) {
      return;
    }

    this.volume = state.volume;
    this.wavesurfer.setVolume(state.volume);
  }

  generateExponentialIn(start: number, current: number, duration: number) {
    const N = 50;
    const step = duration / N;

    return Array.from(Array(N + 1).keys())
      .map((x) => x * step)
      .filter((x) => x + start >= current)
      .map((x) => {
        const t = ((x - duration / 2) * 4 * Math.PI) / duration;
        return 1 / (1 + Math.pow(Math.E, -t));
      });
  }

  generateExponentialOut(start: number, current: number, duration: number) {
    const N = 50;
    const step = duration / N;

    return Array.from(Array(N + 1).keys())
      .map((x) => x * step)
      .filter((x) => x + start >= current)
      .map((x) => {
        const t = ((x - duration / 2) * 4 * Math.PI) / duration;
        return 1 - 1 / (1 + Math.pow(Math.E, -t));
      });
  }

  updateEffects() {
    const sampleTime = state.time / 1000;
    if (sampleTime < this.sample.offset) {
      return;
    }

    const currentTime = this.wavesurfer.backend.ac.currentTime;

    const fadeInOffset = this.sample.fadeInOffset;
    const fadeInDuration = this.sample.fadeInDuration;
    const fadeOutDuration = this.sample.fadeOutDuration;
    const fadeOutOffset = this.sample.fadeOutOffset;

    const sampleStart = this.sample.offset;
    const fadeInStart = sampleStart + fadeInOffset;
    const fadeInFinish = sampleStart + fadeInOffset + fadeInDuration;
    const fadeOutStart =
      sampleStart + this.sample.duration - fadeOutDuration - fadeOutOffset;
    const fadeOutFinish = sampleStart + this.sample.duration - fadeOutOffset;

    const toContextTime = (time: number) => time - sampleTime + currentTime;

    const node = this.wavesurfer.backend.ac.createGain();

    if (sampleTime < fadeInStart && fadeInOffset > 0) {
      node.gain.setValueAtTime(0, toContextTime(sampleTime));
    }
    if (sampleTime < fadeInFinish && fadeInDuration > 0) {
      const start = Math.max(fadeInStart, sampleTime);

      const values = this.generateExponentialIn(
        fadeInStart,
        start,
        fadeInDuration
      );

      if (values.length > 0) {
        node.gain.setValueCurveAtTime(
          values,
          toContextTime(start),
          fadeInFinish - start
        );
      }
    }
    if (sampleTime < fadeOutStart) {
      const start = Math.max(fadeOutStart, sampleTime);
      node.gain.setValueAtTime(1.0, toContextTime(start));
    }
    if (sampleTime < fadeOutFinish && fadeOutDuration > 0) {
      const start = Math.max(fadeOutStart, sampleTime);

      const values = this.generateExponentialOut(
        fadeOutStart,
        start,
        fadeOutDuration
      );

      if (values.length > 0 && start > fadeOutStart) {
        node.gain.setValueAtTime(values[0], toContextTime(start));
      }

      node.gain.setValueCurveAtTime(
        values,
        toContextTime(start),
        fadeOutFinish - start
      );
    }
    if (sampleTime < sampleStart + this.sample.duration && fadeOutOffset > 0) {
      const start = sampleStart + this.sample.duration;
      node.gain.setValueAtTime(0, toContextTime(start));
    }

    this.wavesurfer.backend.setFilter(node);
  }

  get style() {
    return {
      left: `${this.sample.offset * this.pps}px`
    };
  }
}
</script>

<style lang="scss">
.c-waveform {
  display: inline-block;
  position: relative;
  top: 0;
}
</style>
