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

  private gain?: ScriptProcessorNode;

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

      this.gain = this.wavesurfer.backend.ac.createScriptProcessor(
        4096,
        1,
        1
      ) as ScriptProcessorNode;
      this.gain.onaudioprocess = (ev) => {
        // The input buffer is the song we loaded earlier
        const inputBuffer = ev.inputBuffer;

        // The output buffer contains the samples that will be modified and played
        const outputBuffer = ev.outputBuffer;
        for (
          let channel = 0;
          channel < outputBuffer.numberOfChannels;
          channel++
        ) {
          const inputData = inputBuffer.getChannelData(channel);
          const outputData = outputBuffer.getChannelData(channel);

          // Loop through the 4096 samples
          for (var sample = 0; sample < inputBuffer.length; sample++) {
            // make output equal to the same as the input
            outputData[sample] = inputData[sample];
          }
        }
      };
      this.wavesurfer.loadDecodedBuffer(this.sample.source.data);
      this.wavesurfer.backend.setFilter(this.gain);
      console.log(this.wavesurfer.getFilters());
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
