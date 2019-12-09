import React from "react";
import Folder from "./Folder";

class FolderNew extends Folder {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <li>
        <button
          type="button"
          style={{
            ...this.buttonStyle,
            fontSize: "80%",
            fontStyle: "italic",
            color: "gray"
          }}
          onClick={this.handleClicked}
        >
          <span role="img" aria-label="New">
            ✨
          </span>
          Add Folder
        </button>
      </li>
    );
  }
}

export default FolderNew;
