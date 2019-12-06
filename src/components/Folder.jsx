import React, { Component } from "react";
import DraggableTypes from "./DraggableTypes";

class Folder extends Component {
  constructor(props) {
    super(props);
    this.state = { style: this.styleBlurred };
  }

  styleBlurred = {
    backgroundColor: "white"
  };

  styleFocussed = {
    backgroundColor: "gray"
  };

  buttonStyle = {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
    display: "inline",
    margin: 0,
    padding: 0,
    outline: "none",
    textAlign: "left",
    whiteSpace: "nowrap"
  };

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
    console.log("dropped on folder");
    e.preventDefault(); // no other behaviour
    e.stopPropagation(); // don't get other components to fire

    // we lose focus on the drop no matter what
    this.setState({ style: this.styleBlurred });

    switch (e.dataTransfer.getData("type")) {
      case DraggableTypes.FOLDER:
        console.log("Folder dropped");
        break;
      case DraggableTypes.SPECIMEN:
        console.log("Specimen dropped");
        console.log(e.dataTransfer.getData("specimenId"));
        // FIXME - Add specimen to folder!!
        break;
      // nothing for other drop types
      default:
        return false;
    }
  };

  handleDragStart = e => {
    console.log("folder drag start");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("folderId", "folder 12939");
    e.dataTransfer.setData("type", DraggableTypes.FOLDER);
    e.dataTransfer.setDragImage(e.target, 10, 10);
  };

  render() {
    return (
      <li
        style={this.state.style}
        draggable={true}
        onDragStart={e => this.handleDragStart(e)}
        onDragEnter={e => this.handleDragEnter(e)}
        onDragLeave={e => this.handleDragLeave(e)}
        onDrop={e => this.handleDrop(e)}
        onDragOver={e => this.handleDragOver(e)}
      >
        <span role="img" aria-label="Folder">
          📁
        </span>{" "}
        {this.props.title}
      </li>
    );
  }
}

export default Folder;
