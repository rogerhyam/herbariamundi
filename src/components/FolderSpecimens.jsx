import React from "react";
import DraggableTypes from "./DraggableTypes";
import MyHerbariumPart from "./MyHerbariumPart";
import { connect } from "react-redux";
import { setFocus, FocusTargetTypes } from "../redux/actions/setFocusAction";
import { addSpecimen } from "../redux/actions/folderActions";
import { showSpecimens } from "../redux/actions/showSpecimensAction";

class FolderSpecimens extends MyHerbariumPart {
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
        const spid = e.dataTransfer.getData("specimenId");

        // prevent double adding
        const specimenIds = this.props.specimens.map(sp => sp.id);
        if (specimenIds.includes(spid)) {
          alert("Specimens can only be added to a folder once.");
          break;
        } else {
          this.props.addSpecimen(this.props.id, spid);
          break;
        }

      default:
        alert("Sorry you can't drop that here");
        return false;
    }
  };

  handleDragStart = e => {
    console.log("folder drag start");
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("folderId", this.props.id);
    e.dataTransfer.setData("type", DraggableTypes.FOLDER);
    e.dataTransfer.setDragImage(e.target, 2, 2);
  };

  render() {
    const { specimens } = this.props;
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
        <button
          type="button"
          style={this.buttonStyle}
          onClick={e => {
            this.props.showSpecimens(
              specimens.map(sp => sp.id),
              this.props.id,
              this.props.title,
              this.props.description
            );
            this.props.setFocus(FocusTargetTypes.FOLDER, this.props.id);
          }}
        >
          <span role="img" aria-label="Folder">
            {this.getFolderIcon()}
          </span>{" "}
          {this.props.title} ({specimens.length})
        </button>
      </li>
    );
  }

  getFolderIcon() {
    if (this.props.focussed) return "📂";
    else return "📁";
  }
}

const mapStateToProps = (state, ownProps) => {
  let focussed = false;
  if (state.folders.focussedFolderId === ownProps.id) focussed = true;

  // how many specimens do we have?
  const specimens = [];
  state.folders.byId[ownProps.id].specimenIds.map(id => {
    specimens.push(state.specimens.byId[id]);
    return id;
  });
  return { focussed, specimens };
};
export default connect(mapStateToProps, {
  setFocus,
  addSpecimen,
  showSpecimens
})(FolderSpecimens);
//export default Folder;
