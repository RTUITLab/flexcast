<template>
  <div class="c-controls">
    <div class="button play noselect" @click="togglePlay">
      <span v-if="isPlaying"><icon name="play" /></span>
      <span v-else><icon name="pause" /></span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import Icon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/play';
import 'vue-awesome/icons/pause';

@Component({
  components: {
    Icon
  }
})
export default class CControls extends Vue {
  private isPlaying: boolean = false;

  togglePlay() {
    this.isPlaying = !this.isPlaying;
  }
}
</script>

<style lang="scss">
.c-controls {
  padding: 10px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  background-color: #2f3045;

  .button {
    color: #232532;
    background-color: #82828e;
    text-align: center;

    &:hover, &.active {
      background-color: #0fc1c7;
      cursor: pointer;
    }

    &.play {
      border-radius: 50%;
      width: 50px;
      height: 50px;
      line-height: 50px;
      font-size: 20pt;
    }
  }
}
</style>
