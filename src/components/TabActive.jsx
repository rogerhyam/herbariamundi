import React, { Component } from "react";
import Tab from "react-bootstrap/Tab";

class TabActive extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return <Tab eventKey="test1" title="Test1" />;
  }
}

export default TabActive;
