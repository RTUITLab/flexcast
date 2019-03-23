<template>
  <div class="c-timeline">
    <c-waveform v-for="(sample, index) in samples" :key="`waveform-${index}`" :sample="sample" :pps="pps"/>
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
export default class CTimeLine extends Vue {
  @Prop({
    type: Array,
    default: []
  })
  public samples!: Sample[];

  @Prop({
    default: 50
  })
  public pps!: number;
}
</script>

<style lang="scss">
.c-timeline {
  right: 0;
  position: relative;
  white-space: nowrap;
  margin: 0;
  padding: 0;
}
</style>
