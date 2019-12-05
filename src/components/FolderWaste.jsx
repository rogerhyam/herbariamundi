import React from "react";
import Folder from "./Folder";

class FolderWaste extends Folder {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <li>
        <span role="img" aria-label="Basket">
          🗑️
        </span>{" "}
        Remove
      </li>
    );
  }
}

export default FolderWaste;
