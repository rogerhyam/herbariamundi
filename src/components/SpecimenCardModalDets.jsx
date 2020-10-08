import React, { Component } from "react";
import { connect } from "react-redux";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Autocomplete from "react-autocomplete";
import { saveDet } from "../redux/actions/saveDet";
import { deleteDet } from "../redux/actions/deleteDet"

class SpecimenCardModalDets extends Component {
    constructor(props) {
        super(props);
        this.defaultFormText = 'Enter the first few letters of the Genus and specific epithet (case sensitive) then pick from list.'
        this.state = {
            items: [],
            formText: this.defaultFormText,
            buttonsDisabled: true
        };
        
    }

    handleTextInputChange = e => {

        // we need to prevent introduction of whitespace or #
        let value = e.target.value;

        this.setState({ 
            'value': value,
            'item': null,
            'buttonsDisabled': true,
            'formText': this.defaultFormText
        });

        // change the items in the dropdown to reflect it
        let url = new URL('https://wfo-solr.rbge.info/suggest.php'); // FIXME: Move this to config
        url.search = new URLSearchParams({'q': value}).toString();
        const requestOptions = {
            method: "GET",
            headers: {
                Accept: "application/json"
            }
        };

        fetch(url, requestOptions)
            .then(this.handleErrors)
            .then(res => res.json())
            .then(json => {
                this.setState({items: json});
            })

    }

    handleSelection = (value, item) => {

        // update current state with current selection
        this.setState(
            {
                'value': item.scientificName_s + ' ' + item.scientificNameAuthorship_s,
                'item': item,
                'formText': item.id,
                'buttonsDisabled': false
            }
        );

        // create a check up link
        // + ' [' + item.id + ']'

    }

    handleSaveDet = e => {
        this.props.saveDet(this.state.item.id, this.props.specimen.id, this.props.specimen.db_id_i, this.state.item);
        this.setState(
            {
                'value': '',
                'item': null,
                'formText': "Determination changes may take a few minutes to appear in index.",
                'buttonsDisabled': true
            }
        );
    }

    handleDeleteDet = e =>{
        let detId = e.nativeEvent.target.id;
        this.props.deleteDet(detId, this.props.specimen.db_id_i);
    }

    handleViewWfo = e => {
        
        // do nothing if we don't have a selected item (shouldn't happen)
        if(this.state.item == null){
            console.log("Trying to view non existing item");
            return;
        }

        let url = 'http://www.worldfloraonline.org/taxon/' + this.state.item.taxonID_s;
        window.open(url, 'wfo_view');


    }

    handleGoogleIt = e =>{

        // do nothing if we don't have a selected item (shouldn't happen)
        if(this.state.item == null){
            console.log("Trying to Google non existing item");
            return;
        }

        let url = new URL('https://google.com/search');
        url.search = new URLSearchParams(
            {
                'q': this.state.item.scientificName_s + ' ' + this.state.item.scientificNameAuthorship_s,
                'tbm': 'isch'
            }).toString();
        window.open(url, 'google_view');

    }

    render() {

        return (
            <Form>
            <Container fluid={true}>
                <Row >
                    <Col style={{ marginTop: "1em" }}>
                        <p>
                            Here you can create a determination for a specimen.
                            You can associate it with any accepted or unchecked taxon in the current version of 
                            the <a href="http://www.worldfloraonline.org/">World Flora Online</a>.
                        </p>
                        <hr />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Autocomplete
                            items={this.state.items}
                            shouldItemRender={item => true}
                            getItemValue={item => item.scientificName_s}
                            renderItem={(item, highlighted) =>
                                <div
                                    key={item.suggest_result_id}
                                    style={{ backgroundColor: highlighted ? '#eee' : 'transparent', paddingLeft: '0.5em' }}
                                    dangerouslySetInnerHTML={{__html:item.search_display}}
                                ></div>
                            }
                            value={this.state.value}
                            onChange={this.handleTextInputChange}
                            onKeyPress={e => console.log(e)}
                            onSelect={this.handleSelection}
                            wrapperStyle={{ width: "500px" }}
                            menuStyle={{
                                borderRadius: '3px',
                                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.8)',
                                background: 'rgba(255, 255, 255, 0.9)',
                                padding: '2px 0',
                                fontSize: '90%',
                                position: 'fixed',
                                overflow: 'auto',
                                maxHeight: '50%',
                                zIndex: 1000
                            }}

                            inputProps={{ 
                                style: { width: '100%' },
                                placeholder: 'Genus species',
                                onKeyPress: (e) => { if(e.key === "Enter")this.handleAddTag() }
                            }}
                        />
                        <Form.Text  className="text-muted" >{this.state.formText}</Form.Text>

                    </Col>
                    <Col>
                        <Button variant="primary" onClick={this.handleSaveDet} disabled={this.state.buttonsDisabled} >Save</Button>
                        {' '}
                        <Button variant="primary" onClick={this.handleViewWfo} disabled={this.state.buttonsDisabled} >View@WFO</Button>
                        {' '}
                        <Button variant="primary" onClick={this.handleGoogleIt} disabled={this.state.buttonsDisabled} >Google It</Button>
                    </Col>
                </Row>
                <Row style={{ height: "200px", overflowY: "scroll" }}>
                    <Col>
                    <hr />
                        <p><strong>Dets by you:</strong>{this.props.ownDets.length < 1 ? " None." : ""}</p>
                        {this.props.ownDets.map(det => {
                            return(
                                <p key={det.id} >
                                <a href={det.wfo_link} target="wfo_view" >{det.wfo_label}</a>
                                {" on "}
                                {det.created}
                                {" "}
                                <Button variant="outline-danger" size="sm" id={det.id} onClick={det => this.handleDeleteDet(det)} >Remove</Button>
                                </p>
                            )
                        })}
          
                        <p><strong>Dets by others:</strong>{this.props.othersDets.length < 1 ? " No dets." : ""}</p>
                        {this.props.othersDets.map(det => {
                            return(
                                <p key={det.id} >
                                <a href={det.wfo_link} target="wfo_view" >{det.wfo_label}</a>
                                {" by "}
                                <a  href={det.user_link} target="orcid_view" >{det.user_label}</a>
                                {" on "}
                                {det.created}
                                </p>
                            )
                        })}

                    </Col>
                </Row>
            </Container>
            </Form>
        );

    }

    handleErrors = response => {
        if (!response.ok) {
            throw Error(response.statusText);
        }
        return response;
    }

//data.rbge.org.uk/herb/E00288181
//data.rbge.org.uk/herb/E00024644

}
const mapStateToProps = state => {
    return {
        ownDets: state.dets.ownDets,
        othersDets: state.dets.othersDets
    };
};
export default connect(mapStateToProps, {saveDet, deleteDet})(SpecimenCardModalDets);