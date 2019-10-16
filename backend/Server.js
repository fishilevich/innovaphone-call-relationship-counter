const http = require("http");
const xml2js = require("xml2js");
const Relationship = require("./Realationship");
const config = require("./config.json");
const fronthttp = require("http").createServer();
const io = require("socket.io")(fronthttp);

var Relationships = new Map();

const server = http.createServer((request, response) => {
  if (request.method === "POST") {
    let body = "";

    request.on("error", err => {
      if (err) {
        response.writeHead(500, { "Content-Type": "text/html" });
        response.write("An error occurred");
        response.end();
      }
    });

    request.on("data", chunk => {
      body += chunk.toString();
    });

    request.on("end", () => {
      if (!body.startsWith("log-msg<cdr")) {
        response.end();
      } else {
        body = body.substr(7, body.length);
        var parser = new xml2js.Parser();
        console.log(body);

        parser.parseString(body, function(err, result) {
          handleCdr(result);
        });

        response.end();
      }
    });
  } else {
    response.end();
  }
});

io.on("connection", function(socket) {
  console.log("a user connected");
  BroadcastRelationships();
});

fronthttp.listen(
  config.backend_listener_port,
  config.backend_listener_addr,
  function() {
    console.log(
      "Backend listening on " +
        config.backend_listener_addr +
        ":" +
        config.backend_listener_port
    );
  }
);

function BroadcastRelationships() {
  RelationshipsSorted = [...Relationships.values()];
  RelationshipsSorted.sort(function(a, b) {
    return b.count - a.count;
  });
  io.emit("Relationships", RelationshipsSorted);
}

function handleCdr(result) {
  var cdr = JSON.parse(JSON.stringify(result));
  if (cdr.cdr["$"].dir === "from") {
    var from = cdr.cdr["$"].e164;
    var to = cdr.cdr.event[cdr.cdr.event.length - 1]["$"].e164;
    var fromName = cdr.cdr["$"].cn;
    var toName = cdr.cdr.event[cdr.cdr.event.length - 1]["$"].h323;

    /*
    if (from != "262") {
      return null;
    } else {
      console.log(JSON.stringify(result, null, 2));
      return null;
    }
    */

    if (from === undefined || to === undefined) {
    } else {
      if (from.length === 3 && to.length === 3) {
        var id = -1;
        if (
          !Relationships.get("" + from + to) &&
          !Relationships.get("" + to + from)
        ) {
          var relationship = new Relationship(from, fromName, to, toName);
          relationship.inc();
          Relationships.set("" + from + to, relationship);
        } else {
          relationship = Relationships.get("" + from + to);
          if (relationship) {
            relationship.inc();
          } else {
            relationship = Relationships.get("" + to + from);
            if (relationship) {
              relationship.inc();
            } else {
              console.log("WTF???");
            }
          }
        }

        RelationshipsSorted = [...Relationships.values()];
        RelationshipsSorted.sort(function(a, b) {
          return b.count - a.count;
        });

        console.log("----------------------------");
        RelationshipsSorted.forEach(function(relationship, index) {
          console.log(
            relationship.name1 +
              "\t\t<--->\t\t" +
              relationship.name2 +
              "\t\t" +
              relationship.count
          );
        });

        BroadcastRelationships();
      }
    }
  }
}

server.listen(
  config.innovaphone_pbx_listener_port,
  config.innovaphone_pbx_listener_addr,
  function() {
    console.log(
      "Innovaphone-PBX listening on " +
        config.innovaphone_pbx_listener_addr +
        ":" +
        config.innovaphone_pbx_listener_port
    );
  }
);
