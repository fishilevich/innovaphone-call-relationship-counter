import { DataSet, Network } from "vis";
import React, { Component, createRef } from "react";
import socketIOClient from "socket.io-client";
import "./App.css";
import "./vis.min.css";

class VisNetwork extends Component {
  constructor() {
    super();
    this.network = {};
    this.appRef = createRef();
    this.state = {
      relationsships: []
    };

    this.nodes = new DataSet();
    this.edges = new DataSet();
    this.data = {
      nodes: this.nodes,
      edges: this.edges
    };
    this.options = {
      interaction: { hover: true },
      physics: {
        barnesHut: {
          centralGravity: 1.0,
          avoidOverlap: 0.05
        }
      },
      nodes: {
        scaling: {
          label: {
            min: 15,
            max: 70
          }
        }
      }
    };
  }

  componentDidMount() {
    this.network = new Network(this.appRef.current, this.data, this.options);

    const socket = socketIOClient(process.env.REACT_APP_BACKEND_URL);
    socket.on("Relationships", data => this.setState({ relationsships: data }));
  }

  setRelationships(value) {
    this.setState({
      relationsships: value
    });
  }

  render() {
    const relationsships = this.state.relationsships;
    var nodes_temp = new Map();
    var edges_temp = [];

    for (var item of relationsships) {
      if (
        !nodes_temp.get(item.number1) &&
        item.number1 !== "750" &&
        item.number1 !== "760" &&
        item.number1 !== "770"
      ) {
        nodes_temp.set(item.number1, item.name1);
      }
      if (
        !nodes_temp.get(item.number2) &&
        item.number2 !== "750" &&
        item.number1 !== "760" &&
        item.number1 !== "770"
      ) {
        nodes_temp.set(item.number2, item.name2);
      }

      var e = {};
      e.id = "" + item.number1 + item.number2;
      e.from = item.number1;
      e.to = item.number2;
      e.label = item.count;
      edges_temp.push(e);
    }

    nodes_temp.forEach((value, key, map) => {
      var val = 1;
      if (!this.nodes.get(key)) {
        this.nodes.add({
          id: key,
          value: val,
          label: key,
          title: value,
          shape: "box"
        });
      } else {
        this.nodes.update({
          id: key,
          value: val,
          label: key,
          title: value,
          shape: "box"
        });
      }
    });

    // this.network.getConnectedNodes(key).length

    edges_temp.forEach(item => {
      if (!this.edges.get(item.id)) {
        this.edges.add({
          id: item.id,
          from: item.from,
          to: item.to,
          label: "" + item.label,
          font: { align: "middle" }
        });
      } else {
        var edge = this.edges.get(item.id);
        this.edges.update({
          id: item.id,
          from: item.from,
          to: item.to,
          label: "" + item.label,
          font: { align: "middle" }
        });
      }

      var count = this.network.getConnectedNodes(item.from).length;
      this.nodes.update({
        id: item.from,
        value: count * 2
      });

      var count = this.network.getConnectedNodes(item.to).length;
      this.nodes.update({
        id: item.to,
        value: count * 2
      });
    });

    /*
    this.nodes.forEach(item => {
      var count = this.network.getConnectedNodes(item.id).length;
      this.nodes.update({
        id: item.id,
        label: item.label,
        title: item.title + " - " + count,
        shape: "box",
        value: count * 2
      });
    });
    */

    //console.log(this.nodes);
    //console.log(edges_temp);

    return <div className="App" ref={this.appRef} />;
  }
}

export default VisNetwork;
