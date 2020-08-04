
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
    var publisher;

    // Replace with the replacement element ID:
    publisher = OT.initPublisher(targetElement,{resolution: '1280x720',width:1280, height:720});
    publisher.on({
      streamCreated: function (event) {
        console.log("Publisher started streaming.");
      },
      streamDestroyed: function (event) {
        console.log("Publisher stopped streaming. Reason: "
          + event.reason);
      }
    });

    // Replace apiKey and sessionID with your own values:
    session = OT.initSession(apiKey, sessionID);
    // Replace token with your own value:
    session.connect(token, function (error) {
      if (session.capabilities.publish == 1) {
        session.publish(publisher);
      } else {
        console.log("You cannot publish an audio-video stream.");
      }
    });
  });
