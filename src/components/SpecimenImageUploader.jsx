import React, { Component } from "react";
import Form from "react-bootstrap/Form";
class SpecimenImageUploader extends Component {
  constructor(props) {
    super(props);
    this.state = { filesUploaded: {}, filesInProgress: {} };
  }

  dropAreaStyle = {
    border: "2px dashed #ccc",
    borderRadius: "20px",
    padding: "20px"
  };

  fileDropped = e => {
    // work through the files and upload them
    Array.from(e.target.files).forEach(file => this.upload(file));
  };

  upload(file) {
    // do nothing for ones that are complete
    if (file.name in this.state.filesUploaded) return;

    // do nothing for ones that are in progress
    if (file.name in this.state.filesInProgress) return;

    // do nothing for ones that aren't jpegs
    if (file.type !== "image/jpeg") {
      alert("JPEG files only please");
      return;
    }

    const h = new Headers();
    h.append("Accept", "application/json");

    const fd = new FormData();
    fd.append("specimen_id", this.props.getSpecimenId());
    fd.append("specimen_image", file, file.name);

    const req = new Request("/specimen_image_upload.php", {
      method: "POST",
      headers: h,
      body: fd
    });

    // flag it as in progress
    this.setState({
      filesInProgress: { ...this.state.filesInProgress, [file.name]: file }
    });

    fetch(req)
      .then(res => res.json())
      .then(file => {
        // remove it from the in progress
        delete this.state.filesInProgress[file.name];
        this.setState({ filesInProgress: { ...this.state.filesInProgress } });

        // add it to the list of uploaded
        this.setState({
          filesUploaded: { ...this.state.filesUploaded, [file.name]: file }
        });

        // tell parent what files have been uploaded.
        this.props.setFilesUploaded(this.state.filesUploaded);

        return file;
      })
      .catch(error => {
        console.log(error);
      });

    console.log(file);
  }

  render() {
    return (
      <Form>
        <Form.Group controlId="formBasicPassword">
          <Form.Control
            type="file"
            style={this.dropAreaStyle}
            multiple
            accept="image/jpeg"
            onChange={e => this.fileDropped(e)}
          />
          <Form.Text className="text-muted">
            Drag and drop jpg image files for the specimen here.
          </Form.Text>
        </Form.Group>
      </Form>
    );
  }
}

export default SpecimenImageUploader;
