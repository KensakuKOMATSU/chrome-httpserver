function t2ab(str /* String */) {
    var buffer = new ArrayBuffer(str.length);
    var view = new DataView(buffer);
    for(var i = 0, l = str.length; i < l; i++) {
      view.setInt8(i, str.charAt(i).charCodeAt());
    }
    return buffer;
}


var echo_ = function(sid) {
  var sid_ = e.socketId;
  chrome.socket.read(sid_, 65535, function(e){
    chrome.socket.write(s_, e.data, function(e){
      chrome.socket.destroy(s_);
    });
  })
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



chrome.socket.create('tcp', {}, function(e){
  var s = e;

  chrome.socket.listen(s.socketId, "0.0.0.0", 0, 10, function(e){
    chrome.socket.getInfo(s.socketId, function(e){
      console.dir("Local web server's URL => http://localhost:"+e.localPort+"/"); // you can check listen port :)
    });
    var accept_ = function(sid){
      chrome.socket.accept(sid, function(e){
        var sid_ = e.socketId;
        chrome.socket.read(sid_, 65535, function(e){
          chrome.socket.write(sid_, t2ab(response(RESP)), function(e){});
          chrome.socket.destroy(sid_);
        });
        accept_(sid);
      });
    }
    accept_(s.socketId);
  });
});
