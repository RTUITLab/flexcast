<template>
  <div class='home'>
    <div class='sidebar'>
      <c-source-list class='sidebar-item'/>
      <c-controls class='sidebar-item'/>
    </div>

    <div class='timeline'>
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
      'https://files.rtuitlab.ru/mind.mp3',
      'https://files.rtuitlab.ru/veerus.mp3'
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

