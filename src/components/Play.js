import React, { Component, useState } from "react"

class Play extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isPlayOn: true};
    //console.log(props)

    // This binding is necessary to make `this` work in the callback
    this.playClick = this.playClick.bind(this);
  }

  playClick() {
     //onsole.log(this.props)
    this.setState(prevState => ({
      isPlayOn: !prevState.isPlayOn
    }));
  }

  render() {
    const playStyle = {
        display: "flex",
        //alignItems: "flex-end",
        alignItems: "center",
        justifyContent: "center",
        height: 50,
        width: 100,
        color: "red",
        boxShadow: "0 0 3px 2px #cec7c759"
        //alignItems: "center",
        // padding: 20,
        // borderRadius: 20,
        //position: 'absolute',
        //ustifyContent: "center"
    };
    return (
      <button onClick={this.playClick}
      style={playStyle}>
      Play
        {this.state.isPlayOn ? ' ON' : ' OFF'}
      </button>
    );
  }
}

export default Play;