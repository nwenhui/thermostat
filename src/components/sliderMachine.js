import { Machine, interpret } from "xstate";

export const sliderMachine = new Machine({
  id: "sliderMachine",
  initial: "idle",
  states: {
    idle: {
      on: {
        DOWN: "armed"
      }
    },
    armed: {
      on: {
        UP: "idle",
        MOVE: "twisting"
      }
    },
    twisting: {
      on: {
        UP: "idle"
      }
    }
  }
});
