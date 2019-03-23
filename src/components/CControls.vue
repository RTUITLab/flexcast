<template>
  <div class="c-controls">
    <div class="slidecontainer">
      <input
        type="range"
        v-model="volume"
        min="0"
        max="100"
        value="100"
        class="slider"
        @input="volumeChanged"
      >
    </div>
    <div class="button play noselect" @click="togglePlay">
      <span v-if="isPlaying">
        <img src="icons/pause.svg">
      </span>
      <span v-else>
        <img src="icons/play.svg">
      </span>
    </div>
    <div class="slidecontainer">
      <input type="range" v-model="zoom" min="5" max="200" class="slider" @input="zoomChanged">
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Icon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/play';
import 'vue-awesome/icons/pause';

import state from '@/model/State';

@Component({
  components: {
    Icon
  }
})
export default class CControls extends Vue {
  private isReady: boolean = false;

  private isPlaying: boolean = false;

  private zoom: number = 50;
  private volume: number = 100;

  mounted() {
    state.on('ready', this.handleReady);
  }

  handleReady() {
    this.isReady = true;
  }

  togglePlay() {
    if (!this.isReady) {
      return;
    }

    this.isPlaying = !this.isPlaying;
    state.isPlaying = this.isPlaying;
  }

  volumeChanged(value: Number) {
    this.volume = Number(this.volume);
    state.volume = this.volume / 100;
  }

  zoomChanged(value: Number) {
    this.zoom = Number(this.zoom);
    state.pps = this.zoom;
  }
}
</script>

<style lang="scss">
.c-controls {
  padding: 10px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  background-color: #03282d;
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
      background-color: #0b4e51;
      border: 1px solid #24dbcc;
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
        background-image: radial-gradient(78% 150%, #9cefff 50%, #023637 100%);
        border: 2px solid rgba(100, 180, 186, 0.85);
        cursor: pointer;
      }

      &::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-image: radial-gradient(78% 150%, #9cefff 50%, #023637 100%);
        border: 2px solid rgba(100, 180, 186, 0.85);
        cursor: pointer;
      }
    }
  }

  .button {
    color: #232532;
    text-align: center;

    &:hover,
    &.active {
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
