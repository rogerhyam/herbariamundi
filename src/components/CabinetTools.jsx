import React from "react";
import Cabinet from "./Cabinet";

class CabinetTools extends Cabinet {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <li>
        <span role="img" aria-label="Cabinet">
          🗄️
        </span>{" "}
        {this.props.title} {this.getFolderList()}{" "}
      </li>
    );
  }
  getFolderList = () => {
    if (!this.props.children || this.props.children.length < 1) return "";
    return <ul style={this.folderListStyle}>{this.props.children}</ul>;
  };
}

export default CabinetTools;
