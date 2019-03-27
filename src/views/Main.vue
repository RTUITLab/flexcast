<template>
  <div class="home">
    <div class="sidebar">
      <c-source-list class="sidebar-item"/>
      <c-controls class="sidebar-item"/>
    </div>

    <div class="timeline">
      <c-timeline/>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CControls from '@/components/CControls.vue';
import CSourceList from '@/components/CSourceList.vue';
import CTimeLine from '@/components/CTimeLine.vue';

import { Sample } from '@/model/stuff/Sample';

@Component({
  components: {
    'c-controls': CControls,
    'c-source-list': CSourceList,
    'c-timeline': CTimeLine
  }
})
export default class Home extends Vue {
  created() {
    const testSources = [
      'https://files.rtuitlab.ru/green-light.mp3',
      'https://files.rtuitlab.ru/veerus.mp3',
      'https://files.rtuitlab.ru/Bang.mp3',
      'https://files.rtuitlab.ru/WantYou.mp3',
      'https://files.rtuitlab.ru/wecallforlove.mp3'
    ];

    testSources.forEach((track) => {
      this.$state.sourceManager.addSource(track);
    });
  }
}
</script>

<style lang="scss">
.home {
  height: 100%;
  display: flex;
  flex-direction: row;

  .sidebar {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-shadow: 2px 0px 2px 0px rgba(0, 0, 0, 0.66);

    .sidebar-item:first-child {
      flex-grow: 1;
    }
  }

  .timeline {
    flex: 4;
  }
}
</style>

