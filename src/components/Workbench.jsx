import React, { Component } from "react";
import mirador from "mirador";
import { connect } from "react-redux";

class Workbench extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // our private list of manifests
  manifests = [];

  initConfig = {
    id: "my-mirador",
    window: {
      allowClose: true,
      sideBarOpenByDefault: false
    },
    workspace: {
      type: "mosaic"
    },
    workspaceControlPanel: {
      enabled: true
    }
  };

  wrapperStyle = {
    position: "relative",
    minHeight: "500px"
  };

  componentDidMount() {
    this.miradorInstance = mirador.viewer(this.initConfig, []);
    // nasty dynamic resizing
    this.setMiradorHeight();
    window.onresize = e => {
      this.setMiradorHeight();
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { manifests } = nextProps;
    const { store, actions } = this.miradorInstance;
    console.log(manifests);

    const manifestsToAdd = manifests.filter(id => {
      return !this.manifests.includes(id);
    });

    manifestsToAdd.map(id => {
      store.dispatch(actions.fetchManifest(id));
      this.manifests.push(id);
      return id;
    });

    console.log(store.getState());
    console.log(actions);

    // we never rerender as we don't want to load mirador again
    return false;
  }

  setMiradorHeight = () => {
    const wrap = document.getElementById("miradorWrapper");
    let bannerHeight = wrap.getBoundingClientRect().y;
    // FIXME banner height is 0 when first called so we default to 100 could be better
    if (bannerHeight === 0) bannerHeight = 100;
    wrap.style.height = window.innerHeight - bannerHeight + "px";
  };

  render() {
    return (
      <div id="miradorWrapper" style={this.wrapperStyle}>
        <div id={this.initConfig.id} />
      </div>
    );
  }
}

//export default TextList;
const mapStateToProps = state => {
  const manifests = [];
  state.specimens.workbench.specimenIds.map(id => {
    manifests.push(state.specimens.byId[id].iiif_manifest_uri);
    return id;
  });
  return { manifests };
};
export default connect(mapStateToProps, {})(Workbench);
//export default Workbench;
