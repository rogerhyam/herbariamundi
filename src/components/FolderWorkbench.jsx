import React from "react";
import Folder from "./Folder";
import DraggableTypes from "./DraggableTypes";
import { connect } from "react-redux";
import { addSpecimen } from "../redux/actions/workspaceActions";
import { showSpecimens } from "../redux/actions/showSpecimensAction";

class FolderWorkbench extends Folder {
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
    //console.log("dropped on cabinet");
    e.preventDefault(); // no other behaviour
    e.stopPropagation(); // don't get other components to fire

    // we lose focus on the drop no matter what
    this.setState({ style: this.styleBlurred });

    switch (e.dataTransfer.getData("type")) {
      case DraggableTypes.SPECIMEN:
        console.log("specimen dropped on workbench");
        this.props.addSpecimen(e.dataTransfer.getData("specimenId"));
        break;
      default:
        // FIXME - nice modal dialogue here
        alert("You can't drop a " + e.dataTransfer.getData("type") + " here.");
        return false;
    }
  };

  render() {
    const { specimens } = this.props;
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
          onClick={() =>
            this.props.showSpecimens(
              specimens.map(sp => sp.cetaf_id),
              "Workbench",
              "Workbench",
              "These are specimens available in the workbench"
            )
          }
        >
          <span role="img" aria-label="Microscope">
            🔬
          </span>{" "}
          Workbench ({specimens.length})
        </button>
      </li>
    );
  }
}

//export default TextList;
const mapStateToProps = state => {
  const specimens = [];
  state.specimens.workbench.specimenIds.map(id => {
    specimens.push(state.specimens.byId[id]);
    return id;
  });
  return { specimens };
};
export default connect(mapStateToProps, { addSpecimen, showSpecimens })(
  FolderWorkbench
);
