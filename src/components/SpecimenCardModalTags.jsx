import React, { Component } from "react";
import { connect } from "react-redux";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Form from "react-bootstrap/Form";
import Autocomplete from "react-autocomplete";
import { saveTag } from "../redux/actions/saveTag";
import { deleteTag } from "../redux/actions/deleteTag";

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


    tagStyle = {
        border: "solid 1px DarkGray",
        padding: "0.3em",
        backgroundColor: "LightGray",
        borderRadius: "0.3em"
    }

    tagStyleDelete = {
        color: "red",
        verticalAlign: "super",
        fontWeight: "bold",
        fontSize: "90%"
    }

    handleTextInputChange = e => {

        // we need to prevent introduction of whitespace or #

        let value = e.target.value.replace(/\s+/g, '-');
        value = value.replace('#', '');
        value = value.toLowerCase();

        this.setState({ value: value });

        // change the items in the dropdown to reflect it

        const requestOptions = {
            method: "POST",
            body: JSON.stringify({ prefix: value }),
            headers: {
                Accept: "application/json"
            }
        };

        fetch("/tags.php?verb=suggest", requestOptions)
            .then(this.handleErrors)
            .then(res => res.json())
            .then(json => {
                this.setState({items: json.suggestions});
            })

    }

    handleAddTag = e =>{
        this.props.saveTag(this.state.value, this.props.specimen.id, this.props.specimen.db_id_i);
        this.setState({value: ''});
    }

    handleDeleteTag = e =>{
        this.props.deleteTag(
            e.nativeEvent.target.id,
            this.props.specimen.id,
            this.props.specimen.db_id_i
        );
        e.preventDefault();
    }

    render() {

        return (
            <Container fluid={true}>
                <Row >
                    <Col style={{ marginTop: "1em" }}>
                        <p>
                            Here you can add tags to the specimen to help sort it easier to find.
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
                            onKeyPress={e => console.log(e)}
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

                            inputProps={{ 
                                style: { width: '100%' },
                                placeholder: 'Type a tag',
                                onKeyPress: (e) => { if(e.key === "Enter")this.handleAddTag() }
                            }}
                        />

                    </Col>
                    <Col>
                        <Button variant="primary" onClick={this.handleAddTag}>Add</Button>
                    </Col>
                </Row>
                <Row style={{ height: "200px" }}>
                    <Col>
                        <hr />
                        <p><strong>Tags added by you:</strong>{' '}
                        {this.props.ownTags.map(tag => {
                            return(
                                <>
                                <span style={this.tagStyle} key={tag.id}>{tag.text}{' '}
                                <a style={this.tagStyleDelete} onClick={this.handleDeleteTag} id={tag.id} href="#">x</a></span>
                                {" "}
                                </>
                            )
                        })}
                         {this.props.ownTags.length < 1 ? " No tags." : ""}
                            
                        </p>
                        <p><strong>Tags added by others:</strong>{' '}
                        {this.props.othersTags.map(tag => {
                            return(
                                <>
                                <span style={this.tagStyle} key={tag.id}>{tag.text}</span>
                                {" "}
                                </>
                            )
                        })}
                        {this.props.othersTags.length < 1 ? " No tags." : ""}
                        </p>
                    </Col>
                </Row>
            </Container>
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
        ownTags: state.tags.ownTags,
        othersTags: state.tags.othersTags
    };
};
export default connect(mapStateToProps, {saveTag, deleteTag})(SpecimenCardModalTags);