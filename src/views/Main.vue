<template>
  <div class="home">
    <div class="sidebar">
      <c-sample-list class="sidebar-item"/>

      <c-controls class="sidebar-item"/>
    </div>

    <div class="timeline">
      <c-timeline :timelines="samples.map(v => [v])"/>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CControls from '@/components/CControls.vue';
import CSampleList from '@/components/CSampleList.vue';
import CTimeLine from '@/components/CTimeLine.vue';

import { Composer } from '@/model/Composer';
import { Sample } from '@/model/Sample';
import state from '@/model/State';

@Component({
  components: {
    'c-controls': CControls,
    'c-sample-list': CSampleList,
    'c-timeline': CTimeLine
  }
})
export default class Home extends Vue {
  private samples: Sample[] = [];

  created() {
    
    state.samples = [
      new Sample('https://files.rtuitlab.ru/green-light.mp3', 0),
      new Sample('https://files.rtuitlab.ru/subaru.mp3', 4)
    ];
    const composer = new Composer();
    composer.Run(state.samples);

    state.on('samplesChanged', this.updateSamples);
    this.updateSamples();

    state.on('ready', () => {
      console.log('Hello world');
    });
  }

  updateSamples() {
    this.samples = state.samples;
  }
}
</script>

<style lang="scss">
.home {
  height: 100%;
  display: flex;
  flex-direction: row;

  .sidebar {
    display: flex;
    flex-direction: column;
    flex: 1;
    box-shadow: 2px 0px 2px 0px rgba(0, 0, 0, 0.66);

    .sidebar-item {
      &:last-child {
        margin-top: auto;
      }
    }
  }

  .timeline {
    flex: 4;
  }
}
</style>

