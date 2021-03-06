# Innovaphone Call Relationship Counter

A proof of concept tool for displaying call relationships within an innovaphone PBX in realtime.

## How it works

1. The innovaphone PBX generates CDRs (call detail records) and sends them to the __backend__.

2. The __backend__ does some filtering and preparation of CDR data and provides it for incoming __frontend__ connections.

3. A __frontend__ connects to the __backend__, gets the relationship data and displays it.

![Network view](docs/network.gif?raw=true "Network view")

## Built With

* [Node.js](https://nodejs.org/en/) - Backend
* [React](https://reactjs.org/) - Frontend
* [socket.io](https://socket.io/) - Communication
* [vis.js](https://visjs.org/) - Used to generate live network view

