<template>
  <div class="c-timeline">
    <c-waveform v-for="(sample, index) in samples" :key="`waveform-${index}`" :sample="sample"/>
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
}
</script>

<style lang="scss">
</style>
