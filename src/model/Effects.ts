export type EventType = 'fade-in' | 'fade-out';

export class Effect {
  constructor(public start: number, public duration: number) {}
}
