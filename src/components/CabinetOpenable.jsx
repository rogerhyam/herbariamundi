import Cabinet from "./Cabinet";

class CabinetOpenable extends Cabinet {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return null;
  }

  toggleOpenClose() {
    if ("isOpen" in this.state) {
      if (this.state.isOpen) {
        this.setState({ isOpen: false });
      } else {
        this.setState({ isOpen: true });
      }
    } else {
      this.setState({ isOpen: true });
    }
  }

  isOpen() {
    // we initialise the state if it isn't there.
    if ("isOpen" in this.state) {
      return this.state.isOpen;
    } else {
      return false;
    }
  }
}

export default CabinetOpenable;
