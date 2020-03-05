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
    const { specimens, title, description } = this.props;

    return (
      <Fragment>
        {title && <strong>{title}: </strong>}
        {description && <span>{description}</span>}
        {this.renderSpecimenCards()}
      </Fragment>
    );
  }

  renderSpecimenCards() {
    const { specimens, associatedFolderId, loading } = this.props;

    if (loading) {
      return <Fragment>Loading ... </Fragment>;
    }

    if (specimens.length == 0) {
      return (
        <Fragment>No specimens to show. Try Discover or a folder.</Fragment>
      );
    }

    return (
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
    );
  }
}
//export default TextList;
const mapStateToProps = state => {
  const { browser } = state.specimens;
  const { title, description, associatedFolderId, loading } = browser;
  // expand the specimen ids into specimens
  const specimens = [];
  browser.specimenIds.map(id => {
    specimens.push(state.specimens.byId[id]);
    return id;
  });

  return { specimens, title, description, associatedFolderId, loading };
};
export default connect(mapStateToProps, { fetchSpecimens })(SpecimenBrowser);
