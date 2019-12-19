import React, { Component } from "react";
import { connect } from "react-redux";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import { fetchSpecimens } from "../redux/actions/fetchSpecimensActions";

class SearchForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleTextChange = e => {
    console.log(e.target.value);
    this.setState({ searchText: e.target.value });
  };

  handleSubmit = e => {
    e.preventDefault();
    console.log(this.state);
    this.props.fetchSpecimens(this.state);
  };

  render() {
    // only display if we are active
    if (!this.props.active) return null;

    return (
      <Form>
        <Form.Row>
          <Col sm={10}>
            <Form.Group controlId="formSearch">
              <Form.Control
                type="text"
                placeholder="Enter search"
                onChange={this.handleTextChange}
              />
              <Form.Text className="text-muted">
                Type a taxon or collector name or number.
              </Form.Text>
            </Form.Group>
          </Col>
          <Col>
            <Button variant="primary" type="submit" onClick={this.handleSubmit}>
              Search
            </Button>
          </Col>
        </Form.Row>
      </Form>
    );
  }
}

const mapStateToProps = state => {
  const { search } = state;
  return { active: search.active };
};
export default connect(mapStateToProps, { fetchSpecimens })(SearchForm);
