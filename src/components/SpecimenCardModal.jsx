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
import SpecimenCardModalDets from './SpecimenCardModalDets';
import { showSpecimenModal } from "../redux/actions/showSpecimenModal";
import { addSpecimen } from "../redux/actions/workbenchActions";
import { fetchTags } from "../redux/actions/fetchTags";
import { fetchDets } from "../redux/actions/fetchDets";
import OpenSeadragon from 'openseadragon';

class SpecimenCardModal extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    hideModalDialogue = () => {
        this.props.showSpecimenModal(false);
    }

    /**
     * called when modal becomes visible in the dom
     * @param {event} e 
     */
    handleEntered = (e) => {

        // make the images work
        this.initLoupe();

        // update the tags 
        this.props.fetchTags(this.props.specimen.id, this.props.specimen.db_id_i);

        // update the tags 
        this.props.fetchDets(this.props.specimen.id, this.props.specimen.db_id_i);


    }

    initLoupe() {

        if (!this.props.specimen) return;

        const manifestUri = this.props.specimen.iiif_manifest_uri_ss[0];

        // extract the image service for the first painting annotation of the first canvas
        // and set it in thes state
        const requestOptions = {
            method: "POST",
            body: JSON.stringify({ 'manifest_uri': manifestUri }),
            headers: { Accept: "application/json" }
        };

        fetch("/fetch_parsed_manifest.php", requestOptions)
            .then(res => res.json())
            .then(json => {
                let imgServiceUri = json.canvases[0].image_info_uri;
                if (this.state.imageServiceUri != imgServiceUri) {
                    this.setState({ 'imageServiceUri': imgServiceUri }, this.initOpenSeadragon);
                } else {
                    this.initOpenSeadragon(imgServiceUri);
                }
            })
            .catch(error => console.log(error));
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
                        <Tabs defaultActiveKey={this.props.defaultTab} id="quickview-tabs">
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
                            <Tab eventKey="dets" title="Dets">
                                <SpecimenCardModalDets specimen={this.props.specimen} />
                            </Tab>
                        </Tabs>
                    </Modal.Body>
                    <Modal.Footer>
                        <Form style={{ width: "100%", textAlign: "right" }}>
                            <Form.Row nogutters md={12} lg={12}>
                                <Col md={12} lg={12}>
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
        y: state.specimens.modalSpecimen.y,
        defaultTab: state.specimens.modalSpecimen.tab
    };
};
export default connect(mapStateToProps, { showSpecimenModal, addSpecimen, fetchTags, fetchDets })(SpecimenCardModal);