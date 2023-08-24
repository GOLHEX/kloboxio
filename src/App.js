import React, { Component, useState } from "react"
import Env from "./three/Env"
import W from "./wrapper/W"
//import ThreeScene from "./three/ThreeScene"
import GOL from "./three/GameOfLife"
import Play from "./components/Play"
import Genocide from "./components/Genocide"
import ValueToggleButton from "./components/ValueToggleButton"
import './App.css'




class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      healpixProps: {
        radius: 1,
        detail: 1
      },
      isPlay: false,
    };
    this._playClick = this._playClick.bind(this);
  }
  authenticate(){
    return new Promise(resolve => setTimeout(resolve, 2000))
  }
  componentDidMount(){
    this.authenticate().then(() => {
      const ele = document.getElementById('preloader')
      if(ele){
        // fade out
        ele.classList.add('available')
        setTimeout(() => {
          // remove from DOM
          ele.outerHTML = ''
        }, 200)
      }
    })
  }

  _playClick = (e) => {
      e.preventDefault();
      console.log('You clicked on  Play.');
      // this.setState(prevState => ({
      //   isPlayOn: !prevState.isPlayOn
      // }));
  }

  handleDetailChange = (newDetail) => {
    console.log("Значение healpixProps.detail изменилось:", newDetail);
    this.setState(prevState => ({
      healpixProps: {
        ...prevState.healpixProps,
        detail: newDetail,
      },
    }));
  }
  componentWillUnmount() {

  }
  render() {
    const headerStyle = {
        display: "flex",
        //alignItems: "flex-end",
        alignItems: "center",
        justifyContent: "center"
    };
    return (
      <div className="App">
            <div className="App-header"
            style={headerStyle}
            >
                <Play
                    onClick={this._playClick}
                    isPlay={this.state.isPlayOn}
                />
                <Genocide />
                <ValueToggleButton
                  initialValue={this.state.healpixProps.detail}
                  minValue={0}
                  maxValue={5}
                  step={1}
                  onValueChange={this.handleDetailChange}
                />
            </div>
        <Env  healpixProps={this.state.healpixProps} />

        <div className="App-footer">
            GNA
        </div>
      </div>
    )
  }
}
export default App;

