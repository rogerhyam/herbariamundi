import React from "react";
import Folder from "./Folder";
import { connect } from "react-redux";
import { newFolder } from "../redux/actions/folderActions";

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
          onClick={e => this.props.newFolder(this.props.cabinetId)}
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
export default connect(null, { newFolder })(FolderNew);
//export default FolderNew;
