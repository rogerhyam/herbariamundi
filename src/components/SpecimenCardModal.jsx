import React, { Component } from "react";
import { connect } from "react-redux";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import SpecimenCardModalTags from './SpecimenCardModalTags';

import { showSpecimenModal } from "../redux/actions/showSpecimenModal";
import { addSpecimen } from "../redux/actions/workbenchActions";
import OpenSeadragon from 'openseadragon';


class SpecimenCardModal extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    hideModalDialogue = () => {
        this.props.showSpecimenModal(false);
    }

    handleAddToWorkbench = () => {
        this.props.addSpecimen(this.props.specimen.id);
        this.props.showSpecimenModal(false);
    }

    /**
     * called when modal becomes visible in the dom
     * @param {event} e 
     */
    handleEntered = (e) => {
        this.initLoupe();
    }

    initLoupe() {

        if (!this.props.specimen) return;

        let manifestUri = this.props.specimen.iiif_manifest_uri_ss[0];
        let imgServiceUri = null;
        fetch(manifestUri)
            .then(response => response.json())
            .then((jsonData) => {
                // extract the location of the image server info.json
                for (let index = 0; index < jsonData['@context'].length; index++) {
                    const context = jsonData['@context'][index];
                    switch (context) {
                        case 'http://iiif.io/api/presentation/2/context.json':
                            console.log("It is a type 2 manifest");
                            imgServiceUri = this.getImageServiceUriType2Manifest(jsonData);
                            break;
                        case 'http://iiif.io/api/presentation/3/context.json':
                            console.log("It is a type 3 manifest");
                            imgServiceUri = this.getImageServiceUriType3Manifest(jsonData);
                            break;
                    }

                }

                // careful not to keep changing state or we will keep triggering 
                // a rerender.
                if (this.state.imageServiceUri != imgServiceUri) {
                    this.setState({ 'imageServiceUri': imgServiceUri }, this.initOpenSeadragon);
                } else {
                    this.initOpenSeadragon(imgServiceUri);
                }


            })
            .catch((error) => {
                // FIXME: DISPLAY ERROR IF WE CAN'T GET THE MANIFEST
                // handle your errors here
                console.error(error)
            })

    }

    getImageServiceUriType3Manifest(manifest) {

        // get the first canvas
        let canvas = null;
        for (let index = 0; index < manifest.items.length; index++) {
            canvas = manifest.items[index];
            if (canvas.type == 'Canvas') break;
        }

        // canvas has a bunch of items  
        let page = null;
        for (let index = 0; index < canvas.items.length; index++) {
            page = canvas.items[index];
            //console.log(page);
            if (page.type == "AnnotationPage") {
                //console.log(page);
                for (let j = 0; j < page.items.length; j++) {
                    const annotation = page.items[j];
                    if (annotation.type == "Annotation" && annotation.motivation == "Painting") {
                        // this may be wrong. We may need the service URI but that 
                        // might not end in info.json 
                        // ours redirects to the manifest?
                        //console.log(annotation.body.id);

                        return annotation.body.id;

                    }
                }
            }
        }

    }

    getImageServiceUriType2Manifest(manifest) {
        // FIXME: IMPLEMENT TYPE 2 !! 
        return null;
    }

    initOpenSeadragon() {

        this.viewer = OpenSeadragon({
            id: "openseadragon1",
            prefixUrl: "/images/openseadragon/",
            showNavigator: true,
            navigatorId: "openseadragon1_nav",
            tileSources: this.state.imageServiceUri,
            defaultZoomLevel: 0,
            showFullPageControl: false
        });
        this.viewer.addHandler('open', (event) => {
            this.viewer.viewport.zoomTo(1, new OpenSeadragon.Point(this.props.x, this.props.y), true);
        });

    }

    handleTextChange = e => {

        console.log(this.state.textControl);

    }

    render() {

        // let's work out what the bottom tile size is
        //this.initLoupe();

        return (
            <>
                <Modal
                    show={this.props.modalVisible}
                    onHide={this.hideModalDialogue}
                    onEntered={this.handleEntered}
                    size="xl"
                    id="specimen-modal"
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Quick View</Modal.Title>
                    </Modal.Header>
                    <Modal.Body >
                        <Tabs defaultActiveKey="tags" id="quickview-tabs">
                            <Tab eventKey="quick-image" title="Image">

                                <Container fluid={true}>
                                    <Row nogutters md={12} lg={12}>
                                        <Col md={8} lg={8}>
                                            <div style={{ height: '500px', width: '100%' }} id="openseadragon1"></div>
                                        </Col>
                                        <Col md={4} lg={4}>
                                            <div style={{ height: '500px', width: '100%' }} id="openseadragon1_nav"></div>
                                        </Col>
                                    </Row>
                                </Container>
                            </Tab>
                            <Tab eventKey="tags" title="Tags">
                                <SpecimenCardModalTags specimen={this.props.specimen} />
                            </Tab>
                            <Tab eventKey="dets" title="Determinations">
                                <Container flow={true}>
                                    <Row style={{ height: "500px" }}>
                                        <Col>
                                            <div style={{ overflowY: 'scroll', height: "150px", border: "solid gray 1px" }}>
                                                <ul>
                                                    <li>Other det 1</li>
                                                    <li>Other det 2</li>
                                                    <li>Other det 3</li>
                                                    <li>Other det 4</li>
                                                    <li>Other det 1</li>
                                                    <li>Other det 2</li>
                                                    <li>Other det 3</li>
                                                    <li>Other det 4</li>
                                                    <li>Other det 1</li>
                                                    <li>Other det 2</li>
                                                    <li>Other det 3</li>
                                                    <li>Other det 4</li>
                                                </ul>
                                            </div></Col>
                                    </Row>
                                </Container>

                            </Tab>
                        </Tabs>


                        { /*
                        <div style={{ height: '500px', width: '75%', float: 'left' }}>
                            <div style={{ height: '500px', width: '100%' }} id="openseadragon1"></div>
                        </div>
                        <div style={{ height: '500px', width: '20%', marginRight: '2em', float: 'right' }}>
                            <div style={{ height: '500px', width: '100%' }} id="openseadragon1_nav"></div>
                            <div>My tag div</div>
                        </div>

                        */}
                    </Modal.Body>
                    <Modal.Footer>
                        <Form style={{ width: "100%", textAlign: "right" }}>
                            <Form.Row nogutters md={12} lg={12}>
                                <Col md={12} lg={12}>
                                    <Button variant="secondary" onClick={this.handleAddToWorkbench}>Add to Workbench</Button>
                                    {' '}
                                    <Button variant="primary" onClick={this.hideModalDialogue}>Close</Button>
                                </Col>
                            </Form.Row>
                        </Form>
                    </Modal.Footer>
                </Modal>
            </>
        );
    }

}

const mapStateToProps = state => {
    return {
        modalVisible: state.specimens.modalSpecimen ? true : false,
        specimen: state.specimens.byId[state.specimens.modalSpecimen.id],
        x: state.specimens.modalSpecimen.x,
        y: state.specimens.modalSpecimen.y
    };
};
export default connect(mapStateToProps, { showSpecimenModal, addSpecimen })(SpecimenCardModal);