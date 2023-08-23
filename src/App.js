import React, { Component, useState } from "react"
import Env from "./three/Env"
import W from "./wrapper/W"
//import ThreeScene from "./three/ThreeScene"
import GOL from "./three/GameOfLife"
import Play from "./components/Play"
import Genocide from "./components/Genocide"
import './App.css'




class App extends Component {
  constructor(props){
    super(props);
    this.state = {isPlay: false};
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
  componentWillUnmount() {

  }
    _playClick = (e) => {
        e.preventDefault();
        console.log('You clicked on  Play.');
        // this.setState(prevState => ({
        //   isPlayOn: !prevState.isPlayOn
        // }));
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
            </div>
        <Env  />

        <div className="App-footer">
            GNA
        </div>
      </div>
    )
  }
}
export default App;

