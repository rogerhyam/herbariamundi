import React, { Component } from "react";
import { connect } from "react-redux";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Autocomplete from "react-autocomplete";
import { saveTag } from "../redux/actions/saveTag";

class SpecimenCardModalTags extends Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [
                { id: 'foo', label: 'foo' },
                { id: 'bar', label: 'bar' },
                { id: 'baz', label: 'baz' },
            ]
        };
    }

    handleTextInputChange = e => {

        // we need to prevent introduction of whitespace or #

        let value = e.target.value.replace(/\s+/g, '-');
        value = value.replace('#', '');
        value = value.toLowerCase();

        this.setState({ value: value });

    }

    handleAddTag = e =>{
        this.props.saveTag(this.state.value, this.props.specimen.id);
    }

    render() {

        return (

            <Container fluid={true}>
                <Row >
                    <Col style={{ marginTop: "1em" }}>
                        <p>
                            Here you can add tags to the specimen to help sort it into a groups.
                            You could add the name of a project or sampling site for example.
                            Just start typing a tag and existing tags will be suggested.
                            Tags must be lowercase with no spaces or hashes(#) but they can have other punctuation.
                            
                        </p>
                        <hr />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Autocomplete
                            items={this.state.items}
                            shouldItemRender={(item, value) => item.label.toLowerCase().indexOf(value.toLowerCase()) > -1}
                            getItemValue={item => item.label}
                            renderItem={(item, highlighted) =>
                                <div
                                    key={item.id}
                                    style={{ backgroundColor: highlighted ? '#eee' : 'transparent', paddingLeft: '0.5em' }}
                                >
                                    {item.label}
                                </div>
                            }
                            value={this.state.value}
                            onChange={this.handleTextInputChange}
                            onSelect={value => this.setState({ value })}
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

                            inputProps={{ style: { width: '100%' }, placeholder: 'Type a tag' }}
                        />

                    </Col>
                    <Col>
                        <Button variant="primary" onClick={this.handleAddTag}>Add</Button>
                    </Col>
                </Row>
                <Row style={{ height: "200px" }}>
                    <Col>
                        <hr />
                        <p><strong>Tags added by you:</strong></p>
                        <p><strong>Tags added by others:</strong></p>
                    </Col>
                </Row>
            </Container>


        );

    }


}
const mapStateToProps = state => {
    return {
    };
};
export default connect(mapStateToProps, {saveTag})(SpecimenCardModalTags);