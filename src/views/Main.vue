<template>
  <div class="home">
    <div class="sidebar">
      <c-sample-list class="sidebar-item"></c-sample-list>

      <c-controls class="sidebar-item" @zoomChanged="handleZoom"/>
    </div>

    <div class="timeline">
      <c-timeline :pps="zoom" :timelines="timelines"/>
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

@Component({
  components: {
    'c-controls': CControls,
    'c-sample-list': CSampleList,
    'c-timeline': CTimeLine
  }
})
export default class Home extends Vue {
  private zoom: number = 50;

  handleZoom(zoom: number) {
    this.zoom = zoom;
  }

  async created() {
    const composer = new Composer();
    composer.Run(this.timelines.flatMap(s => s[0]));
  }

  get timelines() {
    return [
      [
        {
          offset: 0,
          url: 'https://files.rtuitlab.ru/green-light.mp3'
        }
      ],
      [
        {
          offset: 4,
          url: 'https://files.rtuitlab.ru/subaru.mp3'
        }
      ]
    ];
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

