<template>
  <div class="home">
    <div class="sidebar">
      <c-sample-list class="sidebar-item"></c-sample-list>

      <c-controls class="sidebar-item" @zoomChanged="handleZoom"/>
    </div>

    <div class="timelines">
      <c-timeline
        v-for="(samples, index) in timelines"
        :key="`timeline-${index}`"
        :samples="samples"
        :pps="zoom"
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
    'c-sample-list': CSampleList
  }
})
export default class Home extends Vue {
  private zoom: number = 50;

  mounted() {}

  handleZoom(zoom: number) {
    this.zoom = zoom;
  }

  get timelines() {
    return [
      [
        {
          offset: 0,
          url: 'test/test.mp3'
        }
      ],
      [
        {
          offset: 1,
          url: 'https://files.rtuitlab.ru/subaru.mp3'
        },
        {
          offset: 300,
          url: 'https://files.rtuitlab.ru/subaru.mp3'
        }
      ],
      [
        {
          offset: 2,
          url: 'https://files.rtuitlab.ru/subaru.mp3'
        }
      ]
    ];
  }
}
</script>

<style lang="scss">
@mixin scrollbar() {
  &::-webkit-scrollbar {
    width: 20px;
    height: 20px;
  }
  &::-webkit-scrollbar-button {
    width: 0px;
    height: 0px;
  }
  &::-webkit-scrollbar-thumb {
    background: #e1e1e1;
    border: 0px none #ffffff;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #ffffff;
    cursor: pointer;
  }
  &::-webkit-scrollbar-thumb:active {
    background: #e0e0e0;
  }
  &::-webkit-scrollbar-track {
    background: #666666;
    border: 0px none #ffffff;
    border-radius: 0px;
  }
  &::-webkit-scrollbar-track:hover {
    background: #666666;
  }
  &::-webkit-scrollbar-track:active {
    background: #333333;
  }
  &::-webkit-scrollbar-corner {
    background: transparent;
  }
}

@mixin no-scrollbar() {
  &::-webkit-scrollbar {
    height: 0;
    width: 0;
  }
  &::-webkit-scrollbar-thumb {
    height: 0;
    width: 0;
  }
  &::-webkit-scrollbar-track {
    height: 0;
    width: 0;
  }
}

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

  .timelines {
    overflow: auto;
    flex: 4;

    @include scrollbar();
  }
}
</style>

