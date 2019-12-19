import React, { Component } from "react";
import { connect } from "react-redux";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import SpecimenImageUploader from "./SpecimenImageUploader";
import uuidv1 from "uuid/v1";
import { createSpecimen } from "../redux/actions/createSpecimenActions";

class SpecimenCreateForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      specimenId: uuidv1(),
      files: {},
      fileList: []
    };
  }

  handleMetadataChange = e => {
    this.setState({ [e.target.name]: e.target.value });
    console.log(e.target.name, e.target.value);
  };

  getSpecimenId = () => {
    return this.state.specimenId;
  };

  setFilesUploaded = files => {
    // check all the files are in the file list and add them if they are not.
    // fixme - this would re-add any we deleted so we may need to keep a deleteFileList
    Object.keys(files).map(key => {
      if (this.state.fileList.indexOf(key) === -1) {
        this.setState({ fileList: [...this.state.fileList, key] });
      }
    });
    this.setState({ files });
  };

  imageUp = imageIndex => {
    if (imageIndex < 1) return; // do nothing if we are at the top
    const fl = [...this.state.fileList]; // don't alter state directly
    const f = fl[imageIndex]; // grab the file name
    fl[imageIndex] = fl[imageIndex - 1]; // move the one below it up one
    fl[imageIndex - 1] = f; // insert it down one
    this.setState({ fileList: fl }); // set it as the state
  };

  imageDown = imageIndex => {
    if (imageIndex > this.state.fileList.length - 2) return; // do nothing if we are at the top
    const fl = [...this.state.fileList]; // don't alter state directly
    const f = fl[imageIndex]; // grab the file name
    fl[imageIndex] = fl[imageIndex + 1]; // move the one above it down one
    fl[imageIndex + 1] = f; // insert our one down one
    this.setState({ fileList: fl }); // set it as the state
  };

  imageDelete = imageIndex => {
    console.log("IMAGE DELETE", imageIndex);
    const fl = [...this.state.fileList];
    fl.splice(imageIndex, 1);
    this.setState({ fileList: fl });
  };

  specimenSave = e => {
    e.preventDefault();
    this.props.createSpecimen(this.state);
  };

  render() {
    return (
      <Container style={{ paddingTop: "2em" }}>
        <h2>Create Specimen</h2>
        <p>
          This allows you to create a virtual specimen by uploading images of a
          real one. The result will be displayed in your Temporary folders until
          it is published.
        </p>
        <h3>Specimen Metadata</h3>
        <Form>
          <Row>
            <Col>
              <Form.Group controlId="formCollector">
                <Form.Label>Collector</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Collector(s) name"
                  name="collector"
                  onChange={e => this.handleMetadataChange(e)}
                />
                <Form.Text className="text-muted">
                  The name of the individual or group who collected the
                  specimen.
                </Form.Text>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="formCollectorNumber">
                <Form.Label>Collector Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Collector Number"
                  name="collectorNumber"
                  onChange={e => this.handleMetadataChange(e)}
                />
                <Form.Text className="text-muted">
                  The number/code issued by the collectors at the time of
                  collection.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group controlId="formLatLon">
                <Form.Label>Coordinates</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Latitude,Longitude"
                  name="latLon"
                  onChange={e => this.handleMetadataChange(e)}
                />
                <Form.Text className="text-muted">
                  Decimal latitude comma longitude using the WGS84 datum. e.g.
                  55.965660,-3.205058
                </Form.Text>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="formLocation">
                <Form.Label>Collection Location</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Location"
                  name="collectionLocation"
                  onChange={e => this.handleMetadataChange(e)}
                />
                <Form.Text className="text-muted">
                  Where the specimen was collected.
                </Form.Text>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="formCountry">
                <Form.Label>Country</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Country"
                  name="countryIso"
                  onChange={e => this.handleMetadataChange(e)}
                />
                <Form.Text className="text-muted">
                  You must give a contempory country of origin in line with the
                  Nagoya Protocol.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Group controlId="formCollectionDate">
                <Form.Label>Collection Date</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Year-month-day"
                  name="collectionDate"
                  onChange={e => this.handleMetadataChange(e)}
                />
                <Form.Text className="text-muted">
                  Please give the date of collection. This is free text but to
                  avoid confusion follow the convention of year-month-day e.g.
                  1965-02-28
                </Form.Text>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="formCollectionYear">
                <Form.Label>Year of Collection</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Year"
                  name="collectionYear"
                  onChange={e => this.handleMetadataChange(e)}
                />
                <Form.Text className="text-muted">
                  You must give the year of collection as a four digit integer.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group controlId="formGenus">
                <Form.Label>Genus</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Genus"
                  name="genus"
                  onChange={e => this.handleMetadataChange(e)}
                />
                <Form.Text className="text-muted">
                  The genus name if known. A single word.
                </Form.Text>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="formSpecies">
                <Form.Label>Specific Epithet</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="specific-epithet"
                  name="specificEpithet"
                  onChange={e => this.handleMetadataChange(e)}
                />
                <Form.Text className="text-muted">
                  The specific epithet if known. A single word.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group controlId="formScientificName">
                <Form.Label>Scientific Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Scientific Name"
                  name="scientificName"
                  onChange={e => this.handleMetadataChange(e)}
                />
                <Form.Text className="text-muted">
                  Full scientific name. This can include author string etc or
                  just a Family name if that is all that is known.
                </Form.Text>
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="formStorageLocation">
                <Form.Label>Storage Location</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Code:path/within/collection"
                  name="storageLocation"
                  onChange={e => this.handleMetadataChange(e)}
                />
                <Form.Text className="text-muted">
                  Where is this specimen physically stored? If it is in a
                  herbarium with an official Index Herbariorum code use that
                  code followed by a colon and the location within the
                  herbarium. If it will be discarded just put "Discared".
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Group controlId="formNotes">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  type="textarea"
                  as="textarea"
                  placeholder="Additional notes about the specimen"
                  name="notes"
                  onChange={e => this.handleMetadataChange(e)}
                />
                <Form.Text className="text-muted">
                  Additional notes about the specimen
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Form>
        <h3>Specimen Images</h3>
        <p>
          You can upload multiple images for the specimen. The first must be an
          overview showing the complete specimen with label if there is one.
          Subsequent images can be close ups or different views.
        </p>
        <ul>
          {this.state.fileList.map((fileName, index) => (
            <Row key={fileName}>
              <Col>
                {fileName in this.state.files ? (
                  <img
                    src={this.state.files[fileName].thumbnail_uri}
                    alt="Thumbnail of specimen"
                  />
                ) : (
                  "No Thumbnail"
                )}
              </Col>
              <Col>
                <Form.Control
                  type="text"
                  placeholder="Additional notes about this image"
                  name={fileName}
                  onChange={e => this.handleMetadataChange(e)}
                />
              </Col>
              <Col>
                <ButtonGroup size="sm" aria-label="Basic example">
                  <Button
                    variant="primary"
                    disabled={index < 1 ? true : false}
                    onClick={e => this.imageUp(index)}
                  >
                    Up
                  </Button>
                  <Button
                    variant="primary"
                    disabled={
                      index > this.state.fileList.length - 2 ? true : false
                    }
                    onClick={e => this.imageDown(index)}
                  >
                    Down
                  </Button>
                  <Button
                    variant="danger"
                    onClick={e => this.imageDelete(index)}
                  >
                    Delete
                  </Button>
                </ButtonGroup>
              </Col>
            </Row>
          ))}
        </ul>
        <SpecimenImageUploader
          getSpecimenId={this.getSpecimenId}
          setFilesUploaded={this.setFilesUploaded}
        />
        <Button
          variant="primary"
          type="submit"
          onClick={e => this.specimenSave(e)}
        >
          Save Specimen
        </Button>
      </Container>
    );
  }
}

export default connect(null, { createSpecimen })(SpecimenCreateForm);
