import React, { Component } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { connect } from "react-redux";

class CabinetEditForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleSubmit = e => {
    e.preventDefault();
    console.log(e);
  };

  handleTitleChange = e => {
    console.log(e.target.value);
  };

  render() {
    if (!this.props.cabinetId) return null;

    let title = "Edit Cabinet";
    if (this.props.cabinetId == "_NEW_") title = "New Cabinet";

    return (
      <Form>
        <h3>{title}</h3>
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            onChange={this.handleTitleChange}
          />
          <Form.Text className="text-muted">
            We'll never share your email with anyone else.
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" placeholder="Password" />
        </Form.Group>
        <Form.Group controlId="formBasicCheckbox">
          <Form.Check type="checkbox" label="Check me out" />
        </Form.Group>
        <Button variant="primary" type="submit" onClick={this.handleSubmit}>
          Submit
        </Button>
      </Form>
    );
  }
}

const mapStateToProps = state => {
  return { cabinetId: state.cabinets.editingCabinetId };
};
export default connect(mapStateToProps, {})(CabinetEditForm);
//export default CabinetEditForm;
