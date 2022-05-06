
var object = document.getElementById('sushi');

var counter = 0;

object.onclick=function(){
    var x = Math.floor(Math.random()*300);
    var y = Math.floor(Math.random()*300);
    object.style.top = x + 'px';
    object.style.left = y + 'px';
    counter = counter + 1;
    if (counter == 5) {
      alert("Congrats you won! (also reminder for sushi saturday!)");
      counter = 0;
    }

};
