import React from "react";
import Folder from "./Folder";
import DraggableTypes from "./DraggableTypes";
import { connect } from "react-redux";
import { removeFolder, removeSpecimen } from "../redux/actions/folderActions";
import { removeCabinet } from "../redux/actions/cabinetActions";

class FolderWaste extends Folder {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleDragEnter = e => {
    this.setState({ style: this.styleFocussed });
  };

  handleDragLeave = e => {
    this.setState({ style: this.styleBlurred });
  };

  handleDragOver = e => {
    e.preventDefault();
  };

  handleDrop = e => {
    console.log("dropped waste basket");
    e.preventDefault(); // no other behaviour
    e.stopPropagation(); // don't get other components to fire

    // we lose focus on the drop no matter what
    this.setState({ style: this.styleBlurred });

    switch (e.dataTransfer.getData("type")) {
      case DraggableTypes.FOLDER:
        this.props.removeFolder(e.dataTransfer.getData("folderId"));
        break;

      case DraggableTypes.CABINET:
        this.props.removeCabinet(e.dataTransfer.getData("cabinetId"));
        break;

      case DraggableTypes.SPECIMEN:
        this.props.removeSpecimen(
          e.dataTransfer.getData("associtedFolderId"),
          e.dataTransfer.getData("specimenId")
        );
        break;

      default:
        // FIXME - nice modal dialogue here
        alert("Sorry you can't drop that here.");
        return false;
    }
  };

  render() {
    return (
      <li
        style={this.state.style}
        onDragEnter={e => this.handleDragEnter(e)}
        onDragLeave={e => this.handleDragLeave(e)}
        onDrop={e => this.handleDrop(e)}
        onDragOver={e => this.handleDragOver(e)}
      >
        <button
          type="button"
          style={this.buttonStyle}
          onClick={e => console.log(e)}
        >
          <span role="img" aria-label="Basket">
            🗑️
          </span>{" "}
          Remove
        </button>
      </li>
    );
  }
}
export default connect(null, { removeFolder, removeCabinet, removeSpecimen })(
  FolderWaste
);
