import React from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { connect } from "react-redux";
import {
  editFolderCancel,
  editFolderSave
} from "../redux/actions/folderActions";

import CabinetFolderEditForm from "./CabinetFolderEditForm";

class FolderEditForm extends CabinetFolderEditForm {
  constructor(props) {
    super(props);
    this.state = { description: "", title: "" };
  }

  handleSubmit = e => {
    e.preventDefault();
    console.log(this.state);
    this.props.editFolderSave(
      this.props.folderId,
      this.props.cabinetId,
      this.state.title,
      this.state.description
    );
    this.setState({ description: "", title: "" });
  };

  render() {
    let title = "Edit Folder";
    if (this.props.folderId === "_NEW_") title = "New Folder";

    return (
      <Form>
        <Modal
          show={this.props.folderId ? true : false}
          onHide={this.props.editFolderCancel}
        >
          <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="formTitle">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Title"
                onChange={this.handleTitleChange}
              />
              <Form.Control.Feedback type="invalid">
                You must supply a title.
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="formDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows="3"
                placeholder="Description"
                onChange={this.handleDescriptionChange}
              />
            </Form.Group>
            <Form.Text className="text-muted">
              A longer description of the folder's contents. Max 500 characters.
            </Form.Text>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.props.editFolderCancel}>
              Close
            </Button>
            <Button variant="primary" type="submit" onClick={this.handleSubmit}>
              Save
            </Button>
          </Modal.Footer>
        </Modal>
      </Form>
    );
  }
}

const mapStateToProps = state => {
  return {
    folderId: state.folders.editingFolderId,
    cabinetId: state.folders.newFolderInCabinetId
  };
};
export default connect(mapStateToProps, { editFolderCancel, editFolderSave })(
  FolderEditForm
);
//export default CabinetEditForm;
