import React from "react";
import Folder from "./Folder";

class FolderEdit extends Folder {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <li>
        <span role="img" aria-label="Edit">
          📝
        </span>{" "}
        Edit
      </li>
    );
  }
}

export default FolderEdit;
