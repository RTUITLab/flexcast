declare module 'globals' {
  import { State } from '@/model/State';
  import { Bus } from '@/model/Bus';

  module 'vue/types/vue' {
    interface Vue {
      $state: State;
      $bus: Bus;
    }
  }
}
