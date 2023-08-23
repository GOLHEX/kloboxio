import React, { Component, useState } from "react"

class Genocide extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isToggleOn: true};

    // This binding is necessary to make `this` work in the callback
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState(prevState => ({
      isToggleOn: !prevState.isToggleOn
    }));
  }

  render() {
    const buttonStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: 50,
        width: 100,
        color: "red",
        boxShadow: "0 0 3px 2px #cec7c759"
    };
    return (
      <button onClick={this.handleClick}
      style={buttonStyle}>
      Genocide
      </button>
    );
  }
}

export default Genocide;