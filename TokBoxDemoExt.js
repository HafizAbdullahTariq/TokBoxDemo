
const express = require("express");
const https = require("https");
const pem = require("pem");
const path = require('path');
const bodyParser = require('body-parser');

pem.createCertificate({ days: 1, selfSigned: true }, function (err, keys) {
    var options = {
        key: keys.serviceKey,
        cert: keys.certificate,
    };

    var app = express();



    // Create an HTTPS service.
    https.createServer(options, app).listen(4001, () => {
        console.log('server started');
    });


    let OpenTok = require('opentok'),
        opentok = new OpenTok('46865764', 'fb9cccd66ffbb7d9764b21316530c3346d7e8b3f');

    app.use(express.static(__dirname + "/public"))
    app.use(bodyParser.json());
    app.use(
        bodyParser.urlencoded({
            extended: true,
        })
    );
    app.use("/", function (req, res, next) {
        console.log('request', req.body);
        next();
    });
    var strSess = `{"session":{"ot":{"client":{"c":{"apiKey":"46865764","apiSecret":"fb9cccd66ffbb7d9764b21316530c3346d7e8b3f","apiUrl":"https://api.opentok.com","endpoints":{"createSession":"/session/create","getStream":"/v2/project/<%apiKey%>/session/<%sessionId%>/stream/<%streamId%>","listStreams":"/v2/project/<%apiKey%>/session/<%sessionId%>/stream","setArchiveLayout":"/v2/project/<%apiKey%>/archive/<%archiveId%>/layout","setStreamClassLists":"/v2/project/<%apiKey%>/session/<%sessionId%>/stream","dial":"/v2/project/46865764/dial","startBroadcast":"/v2/project/<%apiKey%>/broadcast","stopBroadcast":"/v2/project/<%apiKey%>/broadcast/<%broadcastId%>/stop","getBroadcast":"/v2/project/<%apiKey%>/broadcast/<%broadcastId%>","setBroadcastLayout":"/v2/project/<%apiKey%>/broadcast/<%broadcastId%>/layout","listBroadcasts":"/v2/project/<%apiKey%>/broadcast"},"request":{"timeout":20000},"auth":{"expire":300}}},"apiKey":"46865764","apiSecret":"fb9cccd66ffbb7d9764b21316530c3346d7e8b3f","apiUrl":"https://api.opentok.com"},"sessionId":"2_MX40Njg2NTc2NH5-MTU5NTkzOTk3NTc2OH5PSUkxRG8vSGhOaTUwdExlaGVqM2FtbWJ-UH4","mediaMode":"relayed","archiveMode":"manual"}}`;
    let sessionObj = JSON.parse(strSess);
    let rooms = {};
    sessionObj = sessionObj.session;
    app.get("/getSession", function (req, res) {
        res.send({ session: sessionObj })
    });
    app.post("/createSession", function (req, res) {
        const { room } = req.body;
        if (room && (!rooms.hasOwnProperty(room))) {
            opentok.createSession({ mediaMode: "routed" }, function (err, session) {
                if (err) return res.send({ message: err.message });
                rooms[room] = session;
                res.send({ success: true, message: 'Room Created', token: opentok.generateToken(session.sessionId), session });
            });
        } else {
            res.send({ success: false, message: 'Invalid room or room already exist' });
        }
    });
    app.get("/getTokenPublisher", function (req, res) {
        res.send({
            token: sessionObj.generateToken({
                role: 'publisher',
                session: sessionObj
            })
        });
    });
    app.get("/getTokenSubscriber", function (req, res) {
        res.send({
            token: sessionObj.generateToken({
                role: 'subscriber'
            }),
            session: sessionObj
        });
    });
    app.get("/getToken", function (req, res) {
        console.log(sessionObj);
        res.send({
            token: opentok.generateToken(sessionObj.sessionId),
            session: sessionObj
        });
    });
    app.post("/joinRoom", function (req, res) {
        const { room } = req.body;
        if (room && rooms.hasOwnProperty(room)) {
            res.send({
                success: true,
                token: opentok.generateToken(rooms[room].sessionId),
                session: rooms[room]
            });
        } else {
            res.send({ success: false, message: 'Invalid room' });
        }
    });

    app.post("/startArchive", function (req, res) {
        const { room } = req.body;
        console.log('sessionId', rooms[room].sessionId);
        opentok.startArchive(rooms[room].sessionId, {
            name: 'Important Presentation',
            // outputMode: 'individual'
        }, function (err, archive) {
            if (err) {
                res.send('fail');
                return console.log(err);
            } else {
                // The id property is useful to save off into a database
                rooms[room].archiveObj = archive;
                console.log("new archive:" + archive.id);
                res.send('success');
            }
        });
    });

    app.post("/stopArchive", function (req, res) {
        const { room } = req.body;
        const { archiveObj } = rooms[room];
        if (archiveObj)
            opentok.stopArchive(archiveObj.id, function (err, archive) {
                if (err) {
                    res.send('fail');
                    return console.log(err);
                }

                console.log("Stopped archive:" + archive.id);
                res.send('success');
            });

    });
    app.post('/download', function (req, res) {
        const { room } = req.body;
        const { archiveObj } = rooms[room];
        const archiveId = archiveObj.id;
        opentok.getArchive(archiveId, function (err, archive) {
            if (err) return res.send({ success: false, message: 'Could not get archive ' + archiveId + '. error=' + err.message });
            res.send({ success: true, url: archive.url });
        });
    });

    app.get("/", function (req, res) {
        res.sendFile(path.join(__dirname + "/public" + "/tokBox/index.html"));
    });

});