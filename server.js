
var shoe = require('shoe')
var ecstatic = require('ecstatic')
var http = require('http')
var MuxDemux = require("mux-demux")
var join = require('path').join
var model = require('./model')
var reloader = require('client-reloader')
var uuid = require("node-uuid")

var PORT = 3000

var server = http.createServer(
    ecstatic(join(__dirname, 'static'))
)

server.listen(PORT, function () {
    console.log( 'listening on', PORT)
})

var sock = shoe(reloader(function (stream) {
    var mdm = MuxDemux(function (stream) {
        console.log("stream", stream.meta)
        if (stream.meta === "model") {
            stream.pipe(model.createStream()).pipe(stream)
        } else if (stream.meta === "identity") {
            // identity stream tells you the users name
            // if this stream disconnects it means they are dead
            // so signal the human as dead
            stream.on("data", function (name) {
                name = name.toString()

                console.log("name", name)

                stream.on("end", kill(name))
            })
        }
    })

    console.log("connection")

    mdm.pipe(stream).pipe(mdm)
}))

sock.install(server, '/shoe')

mock(model)

function mock(model) {
    model.add({
        id: "tree:" + uuid()
        , x: Math.round(Math.random() * 600)
        , y: Math.round(Math.random() * 480)
        , type: "tree"
    })

    model.add({
        id: "rock:" + uuid()
        , x: Math.round(Math.random() * 600)
        , y: Math.round(Math.random() * 480)
        , type: "rock"
    })
}

function kill(name) {
    return function () {
        model.set("human:" + name, {
            dead: true
        })
    }
}