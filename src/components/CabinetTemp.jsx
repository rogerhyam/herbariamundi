import React from "react";
import Cabinet from "./Cabinet";

class CabinetTemp extends Cabinet {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <li>
        TEMP: {this.props.title} {this.getFolderList()}{" "}
      </li>
    );
  }
  getFolderList = () => {
    if (this.props.children.length < 1) return "";
    return <ul>{this.props.children}</ul>;
  };
}

export default CabinetTemp;
