<template>
  <div class="c-waveform" :style="style">
    <div class="waveform"></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { Sample } from '@/model/Sample';

import WaveSurfer from 'wavesurfer.js';

@Component({})
export default class CWaveForm extends Vue {
  private wavesurfer!: any;

  @Prop()
  public sample!: Sample;

  mounted() {
    this.wavesurfer = WaveSurfer.create({
      container: '.waveform',
      waveColor: '#70FAFC',
      progressColor: '#357d7f',
      cursorColor: '#AAF9FE',
      forceDecode: true
    });
    this.wavesurfer.toggleInteraction();
    this.wavesurfer.toggleScroll();

    this.wavesurfer.setVolume(0.2);

    this.wavesurfer.on('error', (err: any) => {
      console.log(err);
    });

    this.wavesurfer.load(this.sample.url);

    this.wavesurfer.on('ready', () => {
      //this.wavesurfer.play();
    });
  }

  get style() {
    return {
      left: `${this.sample.offset}px`
    };
  }
}
</script>

<style lang="scss">
.c-waveform {
  position: relative;
}
</style>
