<template>
  <div class="c-controls">
    <div class="row instruments">
      <div
        class="button noselect"
        :class="getInstrumentClass('cursor')"
        @click="selectInstrument('cursor')"
      >
        <img src="icons/cursor.svg">
      </div>
      <div
        class="button noselect"
        :class="getInstrumentClass('move')"
        @click="selectInstrument('move')"
      >
        <img src="icons/arrows.svg">
      </div>
      <div class="button noselect" @click="automerge">
        <img src="icons/blocks.svg">
      </div>
    </div>
    <div class="row">
      <div class="button noselect" @click="buttonBegin">
        <img src="icons/begin.svg">
      </div>
      <div class="button noselect" @click="buttonBackward">
        <img src="icons/backward.svg">
      </div>
      <div class="button play noselect" @click="togglePlay">
        <span v-if="isPlaying">
          <img src="icons/pause.svg">
        </span>
        <span v-else>
          <img src="icons/play.svg">
        </span>
      </div>
      <div class="button noselect" @click="buttonForward">
        <img src="icons/forward.svg">
      </div>
      <div class="button noselect" @click="buttonEnd">
        <img src="icons/end.svg">
      </div>
    </div>
    <div class="row">
      <div class="button noselect">
        <img src="icons/volumemin.svg" height="25px">
      </div>
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
      <div class="button noselect">
        <img src="icons/volumemax.svg" height="25px">
      </div>
    </div>
    <div class="row">
      <div class="button noselect">
        <img src="icons/lowscale.svg" height="20px">
      </div>
      <div class="slidecontainer">
        <input type="range" v-model="zoom" min="1" max="200" class="slider" @input="zoomChanged">
      </div>
      <div class="button noselect">
        <img src="icons/highscale.svg" height="20px">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Icon from 'vue-awesome/components/Icon';
import 'vue-awesome/icons/play';
import 'vue-awesome/icons/pause';

import state from '@/model/State';
import { InstrumentType } from '@/model/Instrument';

@Component({
  components: {
    Icon
  }
})
export default class CControls extends Vue {
  private isReady: boolean = false;

  private isPlaying: boolean = false;

  private zoom: number = 20;
  private volume: number = 100;

  private instrument: InstrumentType | null = null;

  mounted() {
    state.on('ready', this.handleReady);
    state.on('playPause', this.updateState);
    state.on('instrumentChanged', this.updateInstrument);
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

  updateState() {
    this.isPlaying = state.isPlaying;
  }

  volumeChanged(value: Number) {
    this.volume = Number(this.volume);
    state.volume = this.volume / 100;
  }

  zoomChanged(value: Number) {
    this.zoom = Number(this.zoom);
    state.pps = this.zoom;
  }

  buttonBackward() {
    const seconds = state.time / 1000;

    const leftOrigins = state.samples
      .map((v) => {
        return seconds - v.offset;
      })
      .filter((v) => v > 0)
      .sort((a, b) => {
        if (a == b) {
          return 0;
        }

        return a < b ? -1 : 1;
      });

    if (leftOrigins.length == 0) {
      this.buttonBegin();
      return;
    }

    state.time = (seconds - leftOrigins[0]) * 1000;

    state.scrollToCursor();
  }

  buttonForward() {
    const seconds = state.time / 1000;

    const rightEnds = state.samples
      .map((v) => {
        return v.offset + v.duration - seconds;
      })
      .filter((v) => v > 0)
      .sort((a, b) => {
        if (a == b) {
          return 0;
        }

        return a < b ? -1 : 1;
      });

    if (rightEnds.length == 0) {
      this.buttonEnd();
      return;
    }

    state.time = (rightEnds[0] + seconds) * 1000;
    state.scrollToCursor();
  }

  buttonBegin() {
    state.time = 0;
    state.scrollToCursor();
  }

  buttonEnd() {
    state.time = state.maxTime;
    state.scrollToCursor();
  }

  updateInstrument() {
    this.instrument = state.instrument;
  }

  automerge() {
    state.mergeSamples();
  }

  selectInstrument(instrument: InstrumentType) {
    state.instrument = instrument;
  }

  getInstrumentClass(instrument: InstrumentType) {
    return {
      active: this.instrument != null && this.instrument == instrument
    };
  }
}
</script>

<style lang="scss">
.c-controls {
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: #03282d;
  justify-items: center;

  .row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    justify-items: center;
    padding-left: 10px;
    padding-right: 10px;

    &.instruments {
      background-color: #021d20;

      .button {
        margin: 0;
        width: 40px;
        padding: 5px;
      }

      .active {
        background-color: #010c0e;
      }
    }
  }

  .slidecontainer {
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 40px;
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
    margin: 5px;

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

    &:not(.play) {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  }
}
</style>
