
var publisher;
var targetElement = 'publisherContainer';
fetch('/getToken')
  .then(function (response) { return response.json() })
  .then(function (data) {
    var apiKey = data.session.ot.apiKey;
    var sessionID = data.session.sessionId;
    var token = data.token;
    console.log(data);
    console.log(apiKey);
    console.log(sessionID);
    console.log(token);
    var session;


    // Replace apiKey and sessionID with your own values:
    session = OT.initSession(apiKey, sessionID);
    session.on("streamCreated", function (event) {
      console.log("New stream in the session: " + event.stream.streamId);
      var subscriber = session.subscribe(event.stream, targetElement,{insertMode: 'append'},function (error) {
        if (error) {
          console.log(error);
        } else {
          subscriber.element.style.width = '1280px';
          subscriber.element.style.height = '720px';
        }
    });
    });
    // Replace with a valid token:
    session.connect(token);
  });
