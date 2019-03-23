<template>
  <div class="c-controls">
    <div class="slidecontainer">
      <input type="range" min="1" max="100" value="50" class="slider">
    </div>
    <div class="button play noselect" @click="togglePlay">
      <span v-if="isPlaying">
        <icon name="play"/>
      </span>
      <span v-else>
        <icon name="pause"/>
      </span>
    </div>
    <div class="slidecontainer">
      <input type="range" v-model="zoom" min="5" max="200" class="slider" @input="zoomChanged">
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Composer } from '@/model/Composer';
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
  private zoom: number = 50;

  togglePlay() {
    const composer = new Composer();
    composer.Test();
    this.isPlaying = !this.isPlaying;
    this.$emit('playPause', this.isPlaying);
  }

  zoomChanged(value: Number) {
    this.$emit('zoomChanged', this.zoom);
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
  justify-items: center;

  .slidecontainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 0px 5px;

    .slider {
      margin: 0;
      -webkit-appearance: none;
      appearance: none;
      height: 5px;
      background: #d3d3d3;
      outline: none;
      opacity: 0.7;

      &:hover {
        opacity: 1;
      }

      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #4caf50;
        cursor: pointer;
      }

      &::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #4caf50;
        cursor: pointer;
      }
    }
  }

  .button {
    color: #232532;
    background-color: #82828e;
    text-align: center;

    &:hover,
    &.active {
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
