import React from "react";
import Cabinet from "./Cabinet";

class CabinetDropTarget extends Cabinet {
  constructor(props) {
    super(props);
    this.state = {};
  }

  styleBlurred = {
    border: "solid 1px white"
  };

  styleFocussed = {
    border: "solid 1px gray"
  };

  render() {
    return (
      <li>
        {this.props.title} {this.getFolderList()}{" "}
      </li>
    );
  }
  getFolderList = () => {
    if (this.props.children.length < 1) return "";
    return <ul style={this.folderListStyle}>{this.props.children}</ul>;
  };
}

export default CabinetDropTarget;
