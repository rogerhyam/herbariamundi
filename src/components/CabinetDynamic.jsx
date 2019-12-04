import React from "react";
import Cabinet from "./Cabinet";
//import { DRAGGABLE_FOLDER, DRAGGABLE_CABINET } from "./DraggableTypes";

class CabinetDynamic extends Cabinet {
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

  //   handleDragEnter = e => {
  //     this.setState({ style: this.styleFocussed });
  //   };

  //   handleDragLeave = e => {
  //     this.setState({ style: this.styleBlurred });
  //   };

  //   handleDragOver = e => {
  //     e.preventDefault();
  //   };

  //   handleDrop = e => {
  //     console.log("dropped on cabinet");
  //     e.preventDefault(); // no other behaviour
  //     e.stopPropagation(); // don't get other components to fire

  //     // we lose focus on the drop no matter what
  //     this.setState({ style: this.styleBlurred });

  //     switch (e.dataTransfer.getData("type")) {
  //       case DRAGGABLE_FOLDER:
  //         console.log("Folder dropped");
  //         // FIXME - Add specimen to folder!!
  //         break;
  //       case DRAGGABLE_CABINET:
  //         console.log("Cabinet dropped");
  //         // FIXME - Add specimen to folder!!
  //         break;
  //       default:
  //         return false;
  //     }
  //   };

  render() {
    return (
      <li
        style={this.state.style}
        // onDragEnter={e => this.handleDragEnter(e)}
        // onDragLeave={e => this.handleDragLeave(e)}
        // onDrop={e => this.handleDrop(e)}
        // onDragOver={e => this.handleDragOver(e)}
      >
        🗄️ {this.props.title} {this.getFolderList()}{" "}
      </li>
    );
  }
  getFolderList = () => {
    if (this.props.children.length < 1) return "";
    return <ul>{this.props.children}</ul>;
  };
}

export default CabinetDynamic;
