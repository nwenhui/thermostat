import React, { Component } from "react";
// import { useMachine } from "@xstate/react";
// import { Machine, interpret } from "xstate";
import CircularSlider from "@fseehawer/react-circular-slider";
// import { sliderMachine } from "../sliderMachine";

/** DRAWING AND COLOUR VARIABLES & FUNCTIONS AHHHH */

// canvas sizing
var centerWidth = window.innerWidth / 2;
var centerHeight = window.innerHeight / 2;

/**
 * 0: slider base
 * 1: slider knob
 * 2: slider knob shadow
 * 3: slider gradient range filler
 * 4: slider gradient range colour1 (blue)
 * 5: slider gradient range colour2 (red)
 * 6: knob colour
 */
var color = [
  "#f7f7f8",
  "#ffffff",
  "#eeefef",
  "#53585d",
  "#4b9ae5",
  "#ed6d67",
  "f6c143"
];

var backgroundColour = "#e3e4e6";

function drawCircle(ctx, x, y, r, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2, false);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawKnob(ctx, x, y) {
  drawCircle(ctx, x, y, 8, color[6]);
}

/** THERMOSTAT VARIABLES & FUNCTIONS EEWWWWW */

var bufferUp = 0; // buffer to slow down change of target temp when scrolling up
var bufferDown = 0; // buffer to slow down change of target temp when scrolling down
var hover = false; // whether the user is hovering over themostat to activate scrolling function
var hold = false; // whether the user is dragging the slider

// to generate the range of target temperature
var min = 50;
var max = 80;
function generateRange() {
  let rangeOfNumbers = [];
  for (let i = min; i <= max; i++) {
    rangeOfNumbers.push(i);
  }
  return rangeOfNumbers;
}

var sliderRange = (5 / 3) * Math.PI; // range of circle used by thermostat
var range = generateRange(); // array containing the available target temperatures to select from thermostat

/** THERMOSTAT EVENTS STUFFERINOS */

// position of user's cursor
var click = {
  x: 0,
  y: 0
};
var distance = 0; // distance of user's curser from center of thermostat
var angle = 0; // angle of cursor from start of thermostat (to calculate temperature)

// to check if the cursor is on the slider
function clickedSlider(x, y) {
  distance = Math.sqrt(
    Math.pow(x - centerWidth, 2) + Math.pow(centerHeight - y, 2)
  );
  return distance <= 185;
}

// to calculate angle variable
function getAngle(x, sine, y) {
  var base = Math.atan2(Math.abs(y - centerHeight), Math.abs(x - centerWidth));
  if (sine > 0) {
    if (x <= centerWidth) {
      angle = (1 / 3) * Math.PI + base;
    } else {
      angle = (4 / 3) * Math.PI - base;
    }
  } else {
    if (x <= centerWidth) {
      angle = (1 / 3) * Math.PI - base;
    } else {
      angle = (4 / 3) * Math.PI + base;
    }
  }
}

// to check if the cursor is within thermostat range (for dragging of slider)
function clickedWithinRange(x, y) {
  if (clickedSlider(x, y, distance)) {
    var sine = Math.sin((centerHeight - y) / distance);
    var arcsine = Math.asin((centerHeight - y) / distance);
    getAngle(x, sine, y);
    return sine > 0 || Math.abs(arcsine) <= (1 / 3) * Math.PI;
  }
}

class Slider extends Component {
  state = {
    currentTemp: 72,
    targetTemp: 50,
    angle: 0
    // current: sliderMachine.initialState
  };

  // service = interpret(sliderMachine).onTransition(current =>
  //   this.setState({ current })
  // );

  componentDidMount() {
    // this.service.start();
    this.updateSlider();

    window.addEventListener("mousedown", event => {
      hold = true;
      click.x = event.x;
      click.y = event.y;
      if (hold) {
        if (clickedWithinRange(click.x, click.y)) {
          var n = range.length;
          var index = parseInt(angle / (((5 / 3) * Math.PI) / n));
          index = parseInt((angle / sliderRange) * n);
          var temp = range[index];
          this.setState({ targetTemp: temp }, () => {
            this.updateAngle();
            this.updateSlider();
          });
        }
      }
    });

    window.addEventListener("mouseup", event => {
      hold = false;
    });

    window.addEventListener("wheel", event => {
      if (event.deltaY < 0 && this.state.targetTemp > 50 && hover) {
        bufferDown++; // scrolling DOWN
        if (bufferDown % 10 == 0) {
          var temp = this.state.targetTemp - 1;
          this.setState({ targetTemp: temp }, () => {
            this.updateAngle();
            this.updateSlider();
          });
        }
      } else if (event.deltaY > 0 && this.state.targetTemp < 80 && hover) {
        bufferUp++; // scrolling UP
        if (bufferUp % 10 == 0) {
          var temp = this.state.targetTemp + 1;
          this.setState({ targetTemp: temp }, () => {
            this.updateAngle();
            this.updateSlider();
          });
        }
      }
    });

    window.addEventListener("mousemove", event => {
      click.x = event.x;
      click.y = event.y;
      if (clickedSlider(click.x, click.y)) {
        hover = true;
        if (hold) {
          if (clickedWithinRange(click.x, click.y)) {
            var n = range.length;
            var index = parseInt(angle / (((5 / 3) * Math.PI) / n));
            index = parseInt((angle / sliderRange) * n);
            var temp = range[index];
            this.setState({ targetTemp: temp }, () => {
              this.updateAngle();
              this.updateSlider();
            });
          }
        }
      } else {
        hover = false;
      }
    });
  }

  // componentWillUnmount() {
  //   this.service.stop();
  // }

  updateAngle() {
    // angle = (this.state.targetTemp - min) / range.length + (5 / 3) * Math.PI;
    // this.setState({ angle });
  }

  drawSlider() {
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext("2d");
    //set background colour
    ctx.fillStyle = backgroundColour;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //draw slider
    ctx.beginPath();
    drawCircle(ctx, centerWidth, centerHeight, 200, color[0]);
    ctx.shadowOffsetY = 7;
    ctx.shadowColor = color[2];
    drawCircle(ctx, centerWidth, centerHeight, 185, color[1]);
    ctx.shadowOffsetY = 0;
    drawCircle(ctx, centerWidth, centerHeight, 170, color[3]);
    //draw slider gradient
    var startX = centerWidth - 170;
    var startY = centerHeight - 170;
    var endX = centerWidth + 170;
    var grd = ctx.createLinearGradient(startX, startY, endX, startY);
    grd.addColorStop(0, color[4]);
    grd.addColorStop(1, color[5]);
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(
      centerWidth,
      centerHeight,
      170,
      (2 / 3) * Math.PI,
      (Math.PI * 1) / 3,
      // 0,
      // Math.PI * 2,
      false
    );
    ctx.fill();
    //slider background
    drawCircle(ctx, centerWidth, centerHeight, 160, "white");
  }

  //update slider text AND BACKGROUND COLOUR LATER
  updateSlider() {
    this.updateAngle();
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawSlider();
    this.updateSliderLabels();
    drawKnob(
      ctx,
      centerWidth - 160 * Math.cos(angle + (5 / 3) * Math.PI),
      centerHeight - 160 * Math.sin(angle + (5 / 3) * Math.PI)
      // centerWidth - 160 * Math.cos(this.state.angle),
      // centerHeight - 160 * Math.sin(this.state.angle)
      // centerWidth - 160 * Math.cos(angle),
      // centerHeight - 160 * Math.sin(angle)
    );
  }

  updateSliderLabels() {
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(centerWidth - 100, centerHeight - 50, 200, 80);
    ctx.fillStyle = "pink";
    ctx.font = "bold 70px Helvetica";
    ctx.fillText(
      this.state.targetTemp,
      centerWidth - ctx.measureText(this.state.targetTemp).width / 2,
      centerHeight + 10
    );
    ctx.font = "bold 30px Helvetica";
    var currentText = "current: " + this.state.currentTemp;
    ctx.fillText(
      currentText,
      centerWidth - ctx.measureText(currentText).width / 2,
      centerHeight + 50
    );
  }

  render() {
    // const { current } = this.state;
    // const { send } = this.service;

    return (
      <canvas
        ref="canvas"
        width={window.innerWidth}
        height={window.innerHeight}
      />
    );
  }
}

export default Slider;
