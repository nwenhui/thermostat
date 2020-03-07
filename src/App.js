import React, { Component } from "react";
import "./App.css";
import Slider from "./components/slider";
import CircularSlider from "@fseehawer/react-circular-slider";

class App extends Component {
  render() {
    return (
      <div className="App-header">
        <Slider />
      </div>
    );
  }
}

export default App;
