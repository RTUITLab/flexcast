<template>
  <div class="c-waveform" :style="style">
    <div :id="`waveform-${sampleId}`"></div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch } from 'vue-property-decorator';
import { Sample } from '@/model/Sample';

import WaveSurfer from 'wavesurfer.js';

let SAMPLE_ID = 0;

@Component({})
export default class CWaveForm extends Vue {
  @Prop()
  public sample!: Sample;

  @Prop({
    default: 50
  })
  public pps!: number;

  @Prop({
    default: 0.2
  })
  public volume!: Number;

  private sampleId: Number = 0;
  private wavesurfer: any = null;

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

      this.wavesurfer.zoom(this.pps);

      this.wavesurfer.on('error', (err: any) => {
        console.log(err);
      });

      this.wavesurfer.load(this.sample.url);
    });
  }

  @Watch('pps', {
    immediate: false
  })
  onPpsChanged(value: number, old: number) {
    this.pps = value;
    this.wavesurfer.zoom(this.pps);
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
