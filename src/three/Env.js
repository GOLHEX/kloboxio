import React, { Component } from "react"
import io from "socket.io-client"
import MetaMaskSDK from '@metamask/sdk';
import Tetra from "./Tetra"
import GOL from "./GameOfLife"
import W from "../wrapper/W"

import './Env.css'

class Env extends Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
    this.userPos = this.userPos.bind(this);
    this.lastPose = { x: '15', y: '15' };
    this.state = {
      endpoint: "https://yarn.ddns.net:8443",
      color: '#795548',
      rnd: 14,
      colors: [
                  '#24A14E',
                  '#E91E63',
                  '#92329B',
                  '#673AB7',
                  '#3F51B5',
                  '#2196F3',
                  '#03A9F4',
                  '#00BCD4',
                  '#009688',
                  '#4CAF50',
                  '#8BC34A',
                  '#CDDC39',
                  '#FFEB3B',
                  '#FFC107',
                  '#FF9800',
                  '#FF5722',
                  '#795548',
                  '#9E9E9E',
                  '#607D8B'
                ]
    };


    //this.socket = io.connect(this.state.endpoint)
    this.socket = io(this.state.endpoint)
    //this.socket = 'io()'
    //
    if(this.socket){
      this.socket.on('userPos', (data) => {
        console.log(data);
      });
    }

  }

  handleClick() {
    const rnd = this.getRandomInt(0, 14);
    this.setState({ rnd: rnd });
    this.setState({ color: this.state.colors[rnd]});
    this.cc(this.state.color);
    console.log('socket emit');
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  cc(cd){
    this.socket.emit('cc', cd)
  }

  userPos(x,y){
    if(this.lastPose != { x: x, y: y }){
      this.socket.emit('userPos', x, y)
      this.lastPose = { x: x, y: y }
    }
  }

  

  render() {
    return (

      //<Tetra io={this.socket} onClick={this.handleClick} userPos={this.userPos} usercolor="blue" />
      <Tetra io={this.socket} onClick={this.handleClick} userPos={this.userPos} usercolor="blue" healpixProps={this.props.healpixProps} />
      ///<GOL className="GOL" io={this.socket} onClick={this.handleClick} userPos={this.userPos} usercolor="blue"/>

    )
  }
}
export default Env;