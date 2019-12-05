import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import DraggableTypes from "./DraggableTypes";

class SpecimenCard extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleDragStart = (e, cetafId) => {
    console.log(cetafId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("specimenId", cetafId);
    e.dataTransfer.setData("type", DraggableTypes.SPECIMEN);
    e.dataTransfer.setDragImage(e.target, 10, 10);
  };

  render() {
    const sp = this.props.specimen;

    return (
      <Card
        key={sp.cetaf_id}
        draggable={true}
        onDragStart={e => this.handleDragStart(e, sp.cetaf_id)}
        style={{
          width: "150px", // fixed pixel width matched to the size the thumbnails are
          height: "20rem", // fixed height or the float left won't work
          float: "left",
          margin: "0.2rem"
        }}
      >
        <Card.Img variant="top" src={sp.thumbnail_uri} draggable={false} />
        <Card.Body style={{ padding: 5 }}>
          <Card.Text
            style={{
              fontSize: "0.75rem"
            }}
          >
            <span dangerouslySetInnerHTML={{ __html: sp.title }}></span>
          </Card.Text>
        </Card.Body>
      </Card>
    );
  }
}

export default SpecimenCard;
