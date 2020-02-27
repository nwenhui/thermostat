import React, { Component } from "react";
import "./App.css";
import CircularSlider from "@fseehawer/react-circular-slider";

class App extends Component {
  // state {
  //   currentTemp: {55}
  // };

  render() {
    return (
      <div className="App-header">
        <CircularSlider
          label="target temperature"
          // labelBottom={true}
          min={50}
          max={80}
          appendToValue="°F"
          labelColor="#005a58"
          knobColor="#005a58"
          progressColorFrom="#00bfbd"
          progressColorTo="#005a58"
          progressSize={24}
          trackColor="#eeeeee"
          trackSize={24}
        />

        <CircularSlider
          label="savings"
          min={0}
          max={100}
          dataIndex={20}
          prependToValue="$"
          appendToValue="K"
          labelColor="#005a58"
          labelBottom={true}
          knobColor="#005a58"
          progressColorFrom="#00bfbd"
          progressColorTo="#005a58"
          progressSize={24}
          trackColor="#eeeeee"
          trackSize={24}
        />
      </div>
    );
  }
}

export default App;
