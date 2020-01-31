import React from "react";
import CabinetOpenable from "./CabinetOpenable";

class CabinetTools extends CabinetOpenable {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.toggleOpenClose();
  }

  render() {
    return (
      <li style={{ marginBottom: "0.5rem" }}>
        <button
          type="button"
          style={this.buttonStyle}
          onClick={e => this.toggleOpenClose(e)}
        >
          <span role="img" aria-label="Cabinet">
            🗄️
          </span>{" "}
          {this.props.title}
          {this.getArrow()}
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

export default CabinetTools;
