import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { fetchSpecimens } from "../redux/actions/fetchSpecimensActions";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";

class SpecimenBrowser extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <Fragment>
        <p>
          <Button onClick={() => this.props.fetchSpecimens()}>Refresh</Button>
        </p>
        <Container fluid={true}>
          {this.props.items.map(sp => (
            <Card
              key={sp.cetaf_id}
              style={{
                width: "150px", // fixed pixel width matched to the size the thumbnails are
                height: "20rem", // fixed height or the float left won't work
                float: "left",
                margin: "0.2rem"
              }}
            >
              <Card.Img variant="top" src={sp.thumbnail_uri} />
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
          ))}
        </Container>
      </Fragment>
    );
  }
}

//export default TextList;
const mapStateToProps = state => {
  // should appear as an array in the properties.
  if ("specimens" in state && "items" in state.specimens) {
    return { items: state.specimens.items };
  } else {
    // items not defined so give them an empty one
    return { items: [] };
  }
};

// wrap the big boy in a connector
export default connect(mapStateToProps, { fetchSpecimens })(SpecimenBrowser);
