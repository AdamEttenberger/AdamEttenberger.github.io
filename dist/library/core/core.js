
Node.prototype.html = function(str) {
    if (this.outerHtml) {
        this.outerHtml = str;
    } else {
        var temp = document.createElement('div');
        temp.insertAdjacentHTML('afterbegin', str);
        while (temp.children.length > 0) {
            this.parentNode.insertBefore(temp.children[0], this);
        }
        this.parentNode.removeChild(this);
    }
}

NodeList.prototype.html = function(str) {
    for (var idx in this) {
        this[idx].nodeValue.html(str);
    }
}

function LoadFileAsync(method, url) {
  return new Promise(function(resolve) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.onload = function() {
      resolve(xhr);
    };
    xhr.send();
    });
}

function CanvasConsumeEvents() {
    for (var canvas of document.querySelectorAll('canvas')) {
        canvas.addEventListener('keydown', function(e) {
            // Allow Alt, Ctrl, or Meta key combinations
            if (e.altKey || e.ctrlKey || e.metaKey)
                return;

            // Allow F1-F12 keys
            switch (e.keyCode) {
                case 112: case 113: case 114: case 115: case 116: case 117:
                case 118: case 119: case 120: case 121: case 122: case 123:
                    return;
            }

            // Prevent all else, assume the Game Canvas might consume this
            e.preventDefault();
        });
    }
}

window.addEventListener('load', function() {
    CanvasConsumeEvents();
});
