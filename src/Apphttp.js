import React, { Component } from "react";
import io from "socket.io-client";
import Three from "./Three";

class App extends Component {
  constructor() {
    super();
    this.state = {
      endpoint: "http://yarn.ddns.net:4001",
      color: 'whit'
    };
    //this.socket = io(this.state.endpoint,{secure:true})
  this.socket = io(this.state.endpoint)

  }

  send = (cd) => {
    //const socket = socketIOClient(this.state.endpoint);
    this.socket.emit('change color', cd) // change 'red' to this.state.color
  }

  any = () => {
    //const socket = socketIOClient(this.state.endpoint);
    this.socket.emit('any') // change 'red' to this.state.color
  }

  setColor = (color) => {
    this.setState({ color })
  }
  

  readColor = (color) => {
        switch (color) {
          case "yellow": this.send('blue');
          case "grey": this.send('yellow');
          case "red":this.send('green');
          case "green":this.send('blue');
          case "blue": this.send('grey');
          default: this.send('white');
        }
  }

  render() {

    //const socket = socketIOClient(this.state.endpoint);
     this.socket.on('change color', (col) => {
       document.body.style.backgroundColor = col
     })

    this.socket.on('any', () => {
       alert('Другое событие');
     })

    return (
    <div className="Rio">
      <div style={{ textAlign: "center", position: "absolute" }}>
        <button onClick={() => this.send() }>Clear Color</button>
        <button id="blue" onClick={() => this.send('blue')}>Blue</button>
        <button id="red" onClick={() => this.send('red')}>Red</button>
        <button id="any" onClick={(e) => this.any()}>Click to Any event </button>
      </div>
      <div>
        {Three}
      </div>
    </div>
    )
  }
}
export default App;