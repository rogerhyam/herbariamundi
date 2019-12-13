import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { fetchSpecimens } from "../redux/actions/fetchSpecimensActions";
import Container from "react-bootstrap/Container";
import SpecimenCard from "./SpecimenCard";

class SpecimenBrowser extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    const { specimens, title, description, associatedFolderId } = this.props;

    return (
      <Fragment>
        {title && <strong>{title}: </strong>}
        {description && <span>{description}</span>}
        <Container fluid={true}>
          {specimens.map(sp => (
            <SpecimenCard
              specimen={sp}
              key={sp.id}
              mini={false}
              associatedFolderId={associatedFolderId}
            />
          ))}
        </Container>
      </Fragment>
    );
  }
}

//export default TextList;
const mapStateToProps = state => {
  const { browser } = state.specimens;
  const { title, description, associatedFolderId } = browser;
  // expand the specimen ids into specimens
  const specimens = [];
  browser.specimenIds.map(id => {
    specimens.push(state.specimens.byId[id]);
    return id;
  });

  return { specimens, title, description, associatedFolderId };
};

// wrap the big boy in a connector
export default connect(mapStateToProps, { fetchSpecimens })(SpecimenBrowser);
