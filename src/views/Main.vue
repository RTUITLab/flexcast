<template>
  <div class="home">
    <div class="sidebar">
      <c-sample-list class="sidebar-item"></c-sample-list>

      <c-controls class="sidebar-item" />
    </div>

    <div class="timelines">
      <c-timeline
        v-for="(samples, index) in timelines"
        :samples="samples"
        :key="`timeline-${index}`"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import CControls from '@/components/CControls.vue';
import CTimeLine from '@/components/CTimeLine.vue';
import CSampleList from '@/components/CSampleList.vue';

import { Sample } from '@/model/Sample';

@Component({
  components: {
    'c-controls': CControls,
    'c-timeline': CTimeLine,
    'c-sample-list': CSampleList,
  }
})
export default class Home extends Vue {
  mounted() {}

  get timelines() {
    return [
      [
        {
          offset: 30,
          url: 'test/test.mp3'
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
    flex-grow: 1;

    .sidebar-item {
      &:last-child {
        margin-top: auto;
      }
    }
  }

  .timelines {
    flex-grow: 4;
  }
}
</style>

