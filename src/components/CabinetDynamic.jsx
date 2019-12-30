import React from "react";
import CabinetOpenable from "./CabinetOpenable";
import DraggableTypes from "./DraggableTypes";
import { connect } from "react-redux";
import { setFocus, FocusTargetTypes } from "../redux/actions/setFocusAction";
import FolderSpecimens from "./FolderSpecimens";
import FolderNew from "./FolderNew";

class CabinetDynamic extends CabinetOpenable {
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
    console.log("dropped on cabinet");
    e.preventDefault(); // no other behaviour
    e.stopPropagation(); // don't get other components to fire

    // we lose focus on the drop no matter what
    this.setState({ style: this.styleBlurred });

    switch (e.dataTransfer.getData("type")) {
      case DraggableTypes.FOLDER:
        console.log("Folder dropped");
        // FIXME - Add specimen to folder!!
        alert("FIXME: Move folder to this cabinet");
        break;
      case DraggableTypes.CABINET:
        console.log("Cabinet dropped");
        // FIXME - change order of folders.
        alert("FIXME: Change order of cabinets");
        break;
      default:
        alert("Sorry you can't drop that here.");
        return false;
    }
  };

  handleDragStart = e => {
    console.log("cabinet drag start");
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("cabinetId", this.props.id);
    e.dataTransfer.setData("type", DraggableTypes.CABINET);
    e.dataTransfer.setDragImage(e.target, 2, 2);
  };

  render() {
    return (
      <li
        style={{
          ...this.state.style,
          paddingTop: "0.5rem"
        }}
        draggable={true}
        onDragEnter={e => this.handleDragEnter(e)}
        onDragLeave={e => this.handleDragLeave(e)}
        onDrop={e => this.handleDrop(e)}
        onDragOver={e => this.handleDragOver(e)}
        onDragStart={e => this.handleDragStart(e)}
      >
        <button
          type="button"
          style={this.buttonStyle}
          onClick={this.handleClicked}
        >
          <span role="img" aria-label="Search">
            🗄️
          </span>{" "}
          {this.props.title} ({this.props.folders.length})
        </button>
        {this.getFolderList()}
      </li>
    );
  }
  handleClicked = e => {
    this.props.setFocus(FocusTargetTypes.CABINET, this.props.id);
    this.toggleOpenClose();
  };

  getFolderList = () => {
    if (!this.isOpen()) return "";
    return (
      <ul style={this.folderListStyle}>
        {this.props.folders.map(f => (
          <FolderSpecimens
            key={f.id}
            id={f.id}
            title={f.title}
            description={f.description}
            cabinetId={this.props.id}
          />
        ))}
        <FolderNew cabinetId={this.props.id} />
      </ul>
    );
  };
}

const mapStateToProps = (state, ownProps) => {
  const { cabinets, folders } = state;
  const thisCabinet = cabinets.byId[ownProps.id];
  const myFolders = [];

  // if we are focussed in the state then we are focussed.
  let focussed = false;
  let opened = false;
  if (state.cabinets.focussedCabinetId === ownProps.id) {
    focussed = true;
    opened = true;
  }

  thisCabinet.folderIds.map(fid => {
    // we are always opened if we contain the focussed folder?
    if (state.folders.focussedFolderId === fid) opened = true;
    myFolders.push(folders.byId[fid]);
    return fid;
  });

  return { folders: myFolders, focussed, opened };
};

export default connect(mapStateToProps, { setFocus })(CabinetDynamic);
//export default CabinetDynamic;
