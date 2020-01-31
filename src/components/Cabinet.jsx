import React from "react";
import MyHerbariumPart from "./MyHerbariumPart";

class Cabinet extends MyHerbariumPart {
  constructor(props) {
    super(props);
    this.state = {};
  }

  folderListStyle = {
    listStyleType: "none",
    marginLeft: "0rem",
    marginTop: "0.5rem",
    padding: 0
  };

  styleBlurred = {
    background: "white"
  };

  styleFocussed = {
    background: "gray"
  };

  render() {
    return (
      <li>
        <span role="img" aria-label="Search">
          🗄️
        </span>{" "}
        {this.props.title} {this.getFolderList()}{" "}
      </li>
    );
  }
  getFolderList = () => {
    if (this.props.children && this.props.children.length < 1) return "";
    return <ul style={this.folderListStyle}>{this.props.children}</ul>;
  };
}

export default Cabinet;
