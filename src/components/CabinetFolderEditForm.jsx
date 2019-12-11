import { Component } from "react";

class CabinetFolderEditForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleTitleChange = e => {
    this.setState({ title: e.target.value });
  };

  handleDescriptionChange = e => {
    this.setState({ description: e.target.value });
  };

  render() {
    return null;
  }
}

export default CabinetFolderEditForm;
