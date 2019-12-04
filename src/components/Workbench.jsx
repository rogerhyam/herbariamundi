import React, { Component } from "react";
import mirador from "mirador";

class Workbench extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  initConfig = {
    id: "my-mirador",
    manifests: {
      "https://iiif.lib.harvard.edu/manifests/drs:48309543": {
        provider: "Harvard University"
      }
    },
    windows: [
      {
        loadedManifest: "https://iiif.lib.harvard.edu/manifests/drs:48309543",
        canvasIndex: 2,
        thumbnailNavigationPosition: "far-bottom"
      }
    ]
  };

  wrapperStyle = {
    position: "relative",
    minHeight: "500px"
  };

  componentDidMount() {
    // const { t, plugins } = this.props;
    mirador.viewer(this.initConfig, []);

    // nasty dynamic resizing
    this.setMiradorHeight();
    window.onresize = e => {
      this.setMiradorHeight();
    };
  }

  setMiradorHeight = () => {
    const wrap = document.getElementById("miradorWrapper");
    let bannerHeight = wrap.getBoundingClientRect().y;
    // FIXME banner height is 0 when first called so we default to 100 could be better
    if (bannerHeight === 0) bannerHeight = 100;
    wrap.style.height = window.innerHeight - bannerHeight + "px";
    console.log(wrap.style.height);
  };

  render() {
    return (
      <div id="miradorWrapper" style={this.wrapperStyle}>
        <div id={this.initConfig.id} />
      </div>
    );
  }
}

export default Workbench;
