import React from "react";
import CabinetOpenable from "./CabinetOpenable";

class CabinetTemp extends CabinetOpenable {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <li>
        <button
          type="button"
          style={this.buttonStyle}
          onClick={e => this.toggleOpenClose(e)}
        >
          <span role="img" aria-label="Cabinet">
            🗄️
          </span>{" "}
          {this.props.title}
        </button>
        {this.getFolderList()}{" "}
      </li>
    );
  }
  getFolderList = () => {
    if (
      !this.props.children ||
      this.props.children.length < 1 ||
      !this.isOpen()
    )
      return "";
    return <ul style={this.folderListStyle}>{this.props.children}</ul>;
  };
}

export default CabinetTemp;
