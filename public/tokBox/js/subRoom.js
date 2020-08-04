var connectionCount=0;
var session;
var publisher;
var targetElement = 'publisherContainer';

var form = document.getElementById("frm1");
var msgTxt = document.getElementById("messageTxt");
var msgHistory = document.getElementById("MsgContainer");
var username = document.getElementById("username");

function joinFunction() {
  let room = document.getElementById("lname").value;
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
  let room = document.getElementById("lname").value;
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


    // Replace apiKey and sessionID with your own values:
    session = OT.initSession(apiKey, sessionID);
    session.on("streamCreated", function (event) {
      console.log("New stream in the session: " + event.stream.streamId);
      var subscriber = session.subscribe(event.stream, targetElement, { insertMode: 'append' }, function (error) {
        if (error) {
          console.log(error);
        } else {
          subscriber.element.style.width = '1280px';
          subscriber.element.style.height = '720px';
        }
      });
    });
    
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

    // Replace with a valid token:
    session.connect(token, function (error) {
      if (error) {
        console.log('Error connect:', error.name, error.message);
        return;
      }

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

        session.on('signal:msg', function(event) {
          var msg = document.createElement('p');
          msg.innerText = event.data;
          msg.className = event.from.connectionId === session.connection.connectionId ? 'mine' : 'theirs';
          msgHistory.appendChild(msg);
          // msg.scrollIntoView();
        });
    });
  } else {
    console.log(data.message);
  }
}