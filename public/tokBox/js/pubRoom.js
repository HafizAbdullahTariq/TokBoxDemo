
var connectionCount=0;
var session;
var publisher;
var room;
var targetElement = 'publisherContainer';
var form = document.getElementById("frm1");
var msgTxt = document.getElementById("messageTxt");
var msgHistory = document.getElementById("MsgContainer");
var username = document.getElementById("username");
function joinFunction() {
  room = document.getElementById("lname").value;
  fetch('/joinRoom', {
    method: 'POST', headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ room })
  })
    .then(function (response) { return response.json() })
    .then(setupFunction);
}
function createFunction() {
  room = document.getElementById("lname").value;
  fetch('/createSession', {
    method: 'POST', headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ room })
  })
    .then(function (response) { return response.json() })
    .then(setupFunction);
}
function msgFunction() {
  if (msgTxt.value && msgTxt.value != '') {
    session.signal({
      type: 'msg',
      data: username.value + ': ' + msgTxt.value
    }, function (error) {
      if (error) {
        console.log('Error sending signal:', error.name, error.message);
      } else {
        msgTxt.value = '';
      }
    });
  } else {
    console.log('Enter message');
  }
}

function setupFunction(data) {
  console.log(data);
  if (data.success) {

    var apiKey = data.session.ot.apiKey;
    var sessionID = data.session.sessionId;
    var token = data.token;
    console.log(data);
    console.log(apiKey);
    console.log(sessionID);
    console.log(token);
    var publisher;

    // Replace with the replacement element ID:
    publisher = OT.initPublisher(targetElement, { resolution: '1280x720', width: 1280, height: 720 });
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

    // another client connect or disconnect event;
    session.on({
      connectionCreated: function (event) {
        if (event.connection.connectionId != session.connection.connectionId) {
          connectionCount++;
          console.log('Another client connected. ' + connectionCount + ' total.');
          document.getElementById("connectedHeading").innerHTML = 'Total connected: ' + connectionCount;
        }
      },
      connectionDestroyed: function connectionDestroyedHandler(event) {
        connectionCount--;
        console.log('A client disconnected. ' + connectionCount + ' total.');
        document.getElementById("connectedHeading").innerHTML = 'Total connected: ' + connectionCount;
      }
    });

    session.connect(token, function (error) {
      if (session.capabilities.publish == 1) {
        session.publish(publisher);

        form.addEventListener('submit', function (event) {
          event.preventDefault();
          if (msgTxt.value && msgTxt.value != '') {
            session.signal({
              type: 'msg',
              data: username.value + ': ' + msgTxt.value
            }, function (error) {
              if (error) {
                console.log('Error sending signal:', error.name, error.message);
              } else {
                msgTxt.value = '';
              }
            });
          } else {
            console.log('Enter message');
          }

        });

        session.on('signal:msg', function (event) {
          var msg = document.createElement('p');
          msg.innerText = event.data;
          msg.className = event.from.connectionId === session.connection.connectionId ? 'mine' : 'theirs';
          msgHistory.appendChild(msg);
          // msg.scrollIntoView();
        });

      } else {
        console.log("You cannot publish an audio-video stream.");
      }
    });
  } else {
    console.log("You cannot session");
  }
}
function startRecording(){
  fetch('/startArchive', {
    method: 'POST', headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ room })
  })
    .then(function (response) { console.log(response); })
}
function stopRecording(){
  fetch('/stopArchive', {
    method: 'POST', headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ room })
  })
    .then(function (response) { console.log(response); })
}
function downloadRecording(){
  fetch('/download', {
    method: 'POST', headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ room })
  })
  .then(function (response) { return response.json() })
  .then(function (data){ 
    if(data.success){
      window.open(data.url,"_blank ");
    } else {
      console.log(data.message);
    }
  });
}