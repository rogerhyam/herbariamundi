import React from "react";
import { connect } from "react-redux";
import MyHerbariumPart from "./MyHerbariumPart";
import { editCabinet, removeCabinet } from "../redux/actions/cabinetActions";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

class CabinetDynamicContextMenu extends MyHerbariumPart {
    constructor(props) {
        super(props);
        this.state = {
            contextMenuVisible: false,
            deleteConfirmVisible: false
        };
    }

    componentDidMount() {
        document.addEventListener('contextmenu', e => {
            if (e.target.id == this.props.cabinetId) {
                this.setState({ contextMenuVisible: !this.state.contextMenuVisible });
                e.preventDefault();
            } else {
                this.setState({ contextMenuVisible: false });
            }
        });

        // hide the context menu if we normal click the cabinet while it is open.
        document.addEventListener('click', e => {
            if (e.target.id == this.props.cabinetId && this.state.contextMenuVisible) {
                this.setState({ contextMenuVisible: false });
            }
        });
    }

    closeContextMenu = e => {
        this.setState({ contextMenuVisible: false });
    }

    handleHideOptions = e => {
        this.closeContextMenu(e);
    }

    handleEditCabinet = e => {
        this.props.editCabinet(this.props.cabinetId);
    }

    handleDelete = e => {
        this.setState({ deleteConfirmVisible: true });
    }

    handleDeleteConfirm = e => {
        this.props.removeCabinet(this.props.cabinetId);
        this.setState({ deleteConfirmVisible: false });
    }

    handleDeleteConfirmCancel = e => {
        this.setState({ deleteConfirmVisible: false });
    }

    render() {

        // if we are not visible don't render.
        if (!this.state.contextMenuVisible) return null;

        return (
            <ul>
                <li><button
                    style={this.buttonStyle}
                    onClick={this.handleEditCabinet}
                >Rename</button></li>
                {!this.props.isFirst ?
                    <li>
                        <button
                            style={this.buttonStyle}
                            onClick={this.handleMoveDown}
                        >Move to top</button>
                    </li>
                    : ""
                }
                {!this.props.isFirst ?
                    <li>
                        <button
                            style={this.buttonStyle}
                            onClick={this.handleMoveDown}
                        >Move up</button>
                    </li>
                    : ""
                }
                {!this.props.isLast ?
                    <li>
                        <button
                            style={this.buttonStyle}
                            onClick={this.handleMoveDown}
                        >Move down</button>
                    </li>
                    : ""
                }
                {!this.props.isLast ?
                    <li>
                        <button
                            style={this.buttonStyle}
                            onClick={this.handleMoveBottom}
                        >Move to bottom</button>
                    </li>
                    : ""
                }
                <li><button
                    style={{ ...this.buttonStyle, color: 'red' }}
                    onClick={this.handleDelete}
                >Delete</button>
                    <Modal show={this.state.deleteConfirmVisible} onHide={this.handleDeleteConfirmCancel}>
                        <Modal.Header closeButton>
                            <Modal.Title>Delete cabinet?</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p>Are you sure you want to delete the cabinet <strong>"{this.props.cabinetTitle}"</strong> ?
                            {this.props.folderCount ? " The " + this.props.folderCount + " folders it contains will also be deleted. " : ""}
                            This action cannot be undone.</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant="secondary" onClick={this.handleDeleteConfirmCancel}>Cancel</Button>
                            <Button variant="danger" onClick={this.handleDeleteConfirm}>Delete</Button>
                        </Modal.Footer>
                    </Modal>
                </li>
                <li>
                    <button
                        style={this.buttonStyle}
                        onClick={this.handleHideOptions}
                    >Hide options</button>
                </li>
            </ul >


        );

    }

}

const mapStateToProps = (state, ownProps) => {
    return {};
};
export default connect(mapStateToProps, { editCabinet, removeCabinet })(CabinetDynamicContextMenu);