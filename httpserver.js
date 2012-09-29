function t2ab(str /* String */) {
    var buffer = new ArrayBuffer(str.length);
    var view = new DataView(buffer);
    for(var i = 0, l = str.length; i < l; i++) {
      view.setInt8(i, str.charAt(i).charCodeAt());
    }
    return buffer;
}

function ab2t(buffer /* ArrayBuffer */) {
  var arr = new Int8Array(buffer);
  var str = "";
  for(var i = 0, l = arr.length; i < l; i++) {
    str += String.fromCharCode.call(this, arr[i]);
  }
  return str;
}


var RESPHEAD = [
  "HTTP/1.1 200 OK",
  "Server: chrome24",
  "Content-Length: {%len%}",
  "Connection: Close",
  "Content-Type: text/html"
]

RESPHEAD = RESPHEAD.join("\r\n")+"\r\n\r\n";

var RESP = [
  "<!doctype html>",
  "<html>",
  "<head>",
  "</head>",
  "<body>",
  "<h1>Welcome!!</h1>",
  "<p>this web server is built w/ chrome's packaged apps v2 feature</p>",
  "</body>",
  "</html>"
]
RESP = RESP.join("\r\n");

var response = function(str){
  var len = str.length;
  return RESPHEAD.replace("{%len%}", len)+str;
}


var rtw = function(sid) {
  // [TODO]
  // call recursive for keep-alive features
  // currently, I haven't tested.
  chrome.socket.read(sid, 65535, function(e){
    console.log(ab2t(e.data));
    if(e.resultCode < 0) {
      chrome.socket.destroy(sid);
      return;
    }
    chrome.socket.write(sid, t2ab(response(RESP)), function(e){
      // [TODO] check datasize
      console.dir(e);
      rtw(sid);
    });
  });
}

chrome.socket.create('tcp', {}, function(e){
  var s = e;

  chrome.socket.listen(s.socketId, "0.0.0.0", 0, 10, function(e){
    chrome.socket.getInfo(s.socketId, function(e){
      console.log("Local web server's URL => http://localhost:"+e.localPort+"/"); // you can check listen port :)
    });
    var accept_ = function(sid){
      chrome.socket.accept(sid, function(e){
        rtw(e.socketId);
        accept_(s.socketId);
      });
    }
    accept_(s.socketId);
  });
});
