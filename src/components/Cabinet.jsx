import React, { Component } from "react";

class Cabinet extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <li>
        🗄️ {this.props.title} {this.getFolderList()}{" "}
      </li>
    );
  }
  getFolderList = () => {
    if (this.props.children.length < 1) return "";
    return <ul>{this.props.children}</ul>;
  };
}

export default Cabinet;
