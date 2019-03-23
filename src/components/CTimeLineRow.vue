<template>
  <div class="c-timeline-row">
    <c-waveform
      v-for="(sample, index) in samples"
      :key="`waveform-${index}`"
      :sample="sample"
      :pps="pps"
      @waveformReady="onReady"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import CWaveForm from '@/components/CWaveForm.vue';
import { Sample } from '@/model/Sample';

import '@/model/Sample';

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

  onReady() {
    this.$emit('needsRedraw');
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
}
</style>
