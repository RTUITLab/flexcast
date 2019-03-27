<template>
  <div class="c-waveform" :style="style">
    <div :id="`waveform-${sampleId}`"></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import WaveSurfer from 'wavesurfer.js';

import { Transition } from '@/model/algorithms/Transition';
import { Sample } from '@/model/stuff/Sample';

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

      this.$bus.on('ppsChanged', this.updateZoom);
      this.updateZoom();

      this.$bus.on('volumeChanged', this.updateVolume);
      this.updateVolume();

      this.wavesurfer.on('error', (err: any) => {
        console.log(err);
      });

      this.wavesurfer.on('ready', () => {
        const duration = this.wavesurfer.getDuration();
        this.sample.duration = duration;
        this.$state.sampleManager.updateSample(this.sample);
      });

      this.wavesurfer.loadDecodedBuffer(this.sample.source.data);

      this.$bus.on('samplesChanged', this.handleSeek);
      this.$bus.on('playing', this.updatePlaying);
      this.$bus.on('playPause', this.updatePlaying);
      this.$bus.on('seeked', this.handleSeek);
    });
  }

  beforeDestroy() {
    this.$bus.off('ppsChanged', this.updateZoom);
    this.$bus.off('volumeChanged', this.updateVolume);
    this.$bus.off('playing', this.updatePlaying);
    this.$bus.off('playPause', this.updatePlaying);
    this.$bus.off('seeked', this.handleSeek);
  }

  handleSeek() {
    if (!this.sample.isComplete) {
      return;
    }

    const seconds = this.$state.timelineManager.time;

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
    this.shouldPlay = this.$state.timelineManager.isPlaying;

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

    const seconds = this.$state.timelineManager.time;

    return (
      seconds >= this.sample.offset &&
      seconds <= this.sample.offset + this.sample.duration
    );
  }

  updateZoom() {
    if (this.wavesurfer == null) {
      return;
    }
    this.pps = this.$state.timelineManager.pps;

    new Promise((resolve, reject) => {
      this.wavesurfer.zoom(this.$state.timelineManager.pps);
      resolve();
    });
  }

  updateVolume() {
    if (this.wavesurfer == null) {
      return;
    }

    this.volume = this.$state.timelineManager.volume;
    this.wavesurfer.setVolume(this.$state.timelineManager.volume);
  }

  updateEffects() {
    const sampleTime = this.$state.timelineManager.time;
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

      const values = Transition.generateExponentialIn(
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

      const values = Transition.generateExponentialOut(
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
      const start = Math.max(fadeOutFinish, sampleTime);
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
