import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import DraggableTypes from "./DraggableTypes";

class SpecimenCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleDragStart = (e, specimenId, associtedFolderId) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("specimenId", specimenId);
    e.dataTransfer.setData("associtedFolderId", associtedFolderId);
    e.dataTransfer.setData("type", DraggableTypes.SPECIMEN);
    e.dataTransfer.setDragImage(e.target, 10, 10);
  };

  render() {
    const { specimen, associatedFolderId } = this.props;

    return (
      <Card
        key={specimen.id}
        draggable={true}
        onDragStart={e =>
          this.handleDragStart(e, specimen.id, associatedFolderId)
        }
        style={{
          width: "150px", // fixed pixel width matched to the size the thumbnails are
          height: "20rem", // fixed height or the float left won't work
          float: "left",
          margin: "0.2rem"
        }}
      >
        <Card.Img
          variant="top"
          src={specimen.thumbnail_uri}
          draggable={false}
        />
        <Card.Body style={{ padding: 5 }}>
          <Card.Text
            style={{
              fontSize: "0.75rem"
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: specimen.title }}></span>
          </Card.Text>
        </Card.Body>
      </Card>
    );
  }
}

export default SpecimenCard;
