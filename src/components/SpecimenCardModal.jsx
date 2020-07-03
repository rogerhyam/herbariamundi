import React, { Component } from "react";
import { connect } from "react-redux";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import { showSpecimenModal } from "../redux/actions/showSpecimenModal";
import { addSpecimen } from "../redux/actions/workbenchActions";
import OpenSeadragon from 'openseadragon';


class SpecimenCardModal extends Component {
    constructor(props) {
        super(props);
        this.state = { pickedFolderId: 'NO_PICKED_FOLDER' };
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
        if (this.props.folders.focussedFolderId) {
            this.setState({ pickedFolderId: this.props.folders.focussedFolderId });
        } else {
            this.setState({ pickedFolderId: 'NO_PICKED_FOLDER' });
        }
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

    selectCabinet = (e) => {
        this.setState({ pickedFolderId: e.target.options[e.target.selectedIndex].value },
            e => { console.log(this.state) }
        )
    }

    getFolderSelect() {
        return (
            <Form.Control as="select" onChange={this.selectCabinet} value={this.state.pickedFolderId}>
                <option value="NO_PICKED_FOLDER" >Folders...</option>
                {this.props.cabinets.cabinetIds.map(cid => {
                    let cab = this.props.cabinets.byId[cid];
                    return (
                        <optgroup label={cab.title}>
                            {
                                cab.folderIds.map(fid => {
                                    const folder = this.props.folders.byId[fid];
                                    return (<option value={fid}>{folder.title} ({folder.specimenIds.length})</option>);
                                })

                            }
                        </optgroup>);
                })}
            </Form.Control>
        );
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
                        <div style={{ height: '500px', width: '75%', float: 'left' }}>
                            <div style={{ height: '500px', width: '100%' }} id="openseadragon1"></div>
                        </div>
                        <div style={{ height: '500px', width: '20%', marginRight: '2em', float: 'right' }}>
                            <div style={{ height: '500px', width: '100%' }} id="openseadragon1_nav"></div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Form style={{ width: "100%", textAlign: "right" }}>
                            <Form.Row>
                                <Col>
                                    {this.getFolderSelect()}
                                </Col>

                                <Col>
                                    <Button
                                        variant="secondary"
                                        onClick={this.hideModalDialogue}
                                        disabled={this.state.pickedFolderId == "NO_PICKED_FOLDER"}
                                    >
                                        {this.props.folders.focussedFolderId == this.state.pickedFolderId ? 'Remove from ' : 'Add to '}
                                          folder</Button>
                                    {' '}
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
        y: state.specimens.modalSpecimen.y,
        cabinets: state.cabinets,
        folders: state.folders
    };
};
export default connect(mapStateToProps, { showSpecimenModal, addSpecimen })(SpecimenCardModal);