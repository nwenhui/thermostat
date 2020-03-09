import React, { Component, createContext } from "react";
// import { useMachine } from "@xstate/react";
// import { Machine, interpret } from "xstate";
// import { sliderMachine } from "../sliderMachine";

/** DRAWING AND COLOUR VARIABLES & FUNCTIONS AHHHH */

// canvas sizing
var centerWidth = 500 / 2;
var centerHeight = 500 / 2;

/**
 * 0: slider base
 * 1: slider knob
 * 2: slider knob shadow
 * 3: slider gradient range filler
 * 4: slider gradient range colour1 (blue)
 * 5: slider gradient range colour2 (red)
 * 6: knob colour
 * 7: mode = OFF
 * 8: mode = HEATING
 * 9: mode = COOLING
 */
var color = [
  "#f7f7f8",
  "#ffffff",
  "#eeefef",
  "#53585d",
  "#4b9ae5",
  "#ed6d67",
  "#f6c143",
  "grey",
  "red",
  "blue"
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

const modeEnum = {
  OFF: 7,
  HEATING: 8,
  COOLING: 9
};

var mode = modeEnum.OFF;

const DT = 2;
const DTCOOL = 1.5;
const DTHEAT = 1;

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

/** TEST SLIDER THINGERINGS */

var holdTest = false;
var test = {
  x: 0,
  y: 0
};
// to generate the range of target temperature
var testMin = 32;
var testMax = 100;
function generateRangetest() {
  let rangeOfNumbers = [];
  for (let i = testMin; i <= testMax; i++) {
    rangeOfNumbers.push(i);
  }
  return rangeOfNumbers;
}
var testRange = generateRangetest();
var sliderStart = 0;
var sliderLength = 0;
var sliderEnd = 0;

function drawTestKnob(ctx, x, y) {
  drawCircle(ctx, x, y, 8, "LightSteelBlue");
  test.x = x;
  test.y = y;
}

function clickedTestKnob(x, y) {
  var distance = Math.sqrt(Math.pow(x - test.x, 2) + Math.pow(y - test.y, 2));
  return distance <= 8;
}

class Slider extends Component {
  state = {
    currentTemp: 32,
    targetTemp: 50
  };

  componentDidMount() {
    if (hold || holdTest) {
      document.body.style.cursor = "pointer";
    } else {
      document.body.style.cursor = "default";
    }

    this.updateSlider();

    window.addEventListener("mousedown", event => {
      hold = true;
      document.body.style.cursor = "pointer";
      click.x = event.x;
      click.y = event.y;
      if (hold) {
        if (clickedWithinRange(click.x, click.y)) {
          var n = range.length;
          var index = parseInt(angle / (((5 / 3) * Math.PI) / n));
          index = parseInt((angle / sliderRange) * n);
          var temp = range[index];
          this.setState({ targetTemp: temp }, () => {
            this.updateSlider();
            this.updateTestSlider();
          });
        }
      }
      if (clickedTestKnob(click.x, click.y)) {
        holdTest = true;
        document.body.style.cursor = "pointer";
      }
    });

    window.addEventListener("mouseup", event => {
      hold = false;
      holdTest = false;
      document.body.style.cursor = "default";
    });

    window.addEventListener("wheel", event => {
      if (event.deltaY < 0 && this.state.targetTemp > 50 && hover) {
        bufferDown++; // scrolling DOWN
        if (bufferDown % 10 == 0) {
          var temp = this.state.targetTemp - 1;
          this.setState({ targetTemp: temp }, () => {
            this.updateSlider();
            this.updateTestSlider();
          });
        }
      } else if (event.deltaY > 0 && this.state.targetTemp < 80 && hover) {
        bufferUp++; // scrolling UP
        if (bufferUp % 10 == 0) {
          var temp = this.state.targetTemp + 1;
          this.setState({ targetTemp: temp }, () => {
            this.updateSlider();
            this.updateTestSlider();
          });
        }
      }
    });

    window.addEventListener("mousemove", event => {
      click.x = event.x;
      click.y = event.y;
      if (clickedSlider(click.x, click.y)) {
        hover = true;
        document.body.style.cursor = "pointer";
        if (hold) {
          if (clickedWithinRange(click.x, click.y)) {
            var n = range.length;
            var index = parseInt(angle / (((5 / 3) * Math.PI) / n));
            index = parseInt((angle / sliderRange) * n);
            var temp = range[index];
            this.setState({ targetTemp: temp }, () => {
              this.updateSlider();
              this.updateTestSlider();
            });
          }
        }
      } else {
        hover = false;
        document.body.style.cursor = "default";
      }
      if (clickedTestKnob(click.x, click.y)) {
        document.body.style.cursor = "pointer";
      }
      if (holdTest) {
        var n = testRange.length;
        if (click.x > sliderEnd) {
          test.x = sliderEnd;
          index = n - 1;
        } else if (click.x < sliderStart) {
          test.x = sliderStart;
          index = 0;
        } else {
          var index = parseInt(((click.x - sliderStart) / sliderLength) * n);
          test.x = click.x;
        }
        temp = testRange[index];
        this.setState({ currentTemp: temp }, () => {
          this.updateSlider();
          this.updateTestSlider();
        });
      }
    });

    this.drawTestSlider();
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
      false
    );
    ctx.fill();
    //slider background
    drawCircle(ctx, centerWidth, centerHeight, 160, color[mode]);
  }

  //update slider
  updateSlider() {
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.updateSliderColour();
    this.drawSlider();
    drawKnob(
      ctx,
      centerWidth - 160 * Math.cos(angle + (5 / 3) * Math.PI),
      centerHeight - 160 * Math.sin(angle + (5 / 3) * Math.PI)
    );
    this.updateSliderLabels();
  }

  //update slider text
  updateSliderLabels() {
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
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

  //get thermostat mode
  updateSliderColour() {
    if (this.state.currentTemp > this.state.targetTemp + DT + DTCOOL) {
      mode = modeEnum.COOLING;
    }
    if (this.state.currentTemp < this.state.targetTemp - DT - DTHEAT) {
      mode = modeEnum.HEATING;
    }
    if (
      this.state.targetTemp - (DT - DTHEAT) < this.state.currentTemp &&
      this.state.currentTemp < this.state.targetTemp + (DT - DTCOOL)
    ) {
      mode = modeEnum.OFF;
    }
  }

  drawTestSlider() {
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = backgroundColour;
    ctx.fillRect(centerWidth - 200, centerHeight + 210, 400, 50);
    ctx.font = "17px Helvetica";
    ctx.fillStyle = "black";
    ctx.fillText("set current temperature", 50, 495);
    sliderStart = 50 + ctx.measureText("set current temperature").width + 20;
    sliderLength = 400 - ctx.measureText("set current temperature").width - 20;
    sliderEnd = sliderStart + sliderLength;
    ctx.beginPath();
    ctx.moveTo(sliderStart, 490);
    ctx.lineTo(sliderEnd, 490);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "Thistle";
    ctx.lineCap = "round";
    ctx.stroke();
    drawTestKnob(ctx, sliderStart, 490);
  }

  updateTestSlider() {
    const canvas = this.refs.canvas;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = backgroundColour;
    ctx.fillRect(centerWidth - 200, centerHeight + 210, 400, 50);
    ctx.font = "17px Helvetica";
    ctx.fillStyle = "black";
    ctx.fillText("set current temperature", 50, 495);
    ctx.beginPath();
    ctx.moveTo(sliderStart, 490);
    ctx.lineTo(sliderEnd, 490);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "Thistle";
    ctx.lineCap = "round";
    ctx.stroke();
    drawTestKnob(ctx, test.x, 490);
  }

  render() {
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
