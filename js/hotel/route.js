/* Hotel Alice Lloyd: guest route (start, elevator ride, stations, route arrows). */
(function(){
'use strict';
var H = window.HOTEL; if (!H || H.failed) return;

H.startAt(488,424,0);   // inside the elevator car, facing the doors

// ---------- elevator ride ----------
var ride={t:-1,done:false};
function openDoors(){ ride.done=true; H.cap(''); H.elevator.light.intensity=0.9; }
H.onBegin(function(){ ride.t=0; });
H.onSkip(function(){ if(!ride.done){ openDoors(); H.elevator.open=1; } });
H.onUpdate(function(dt){
  if(ride.t<0) return;
  if(!ride.done){
    ride.t+=dt;
    var e=H.elevator;
    if(ride.t<0.1 && !ride.greeted){ ride.greeted=true; H.say('Good evening. I am Dean Lloyd, and this is my hotel. Do mind the doors.'); }
    if(ride.t<6){ e.light.intensity=1.0; H.cap('The car rises. A bell somewhere counts the floors.'); }
    else if(ride.t<8){ e.light.intensity=Math.random()*1.5; if(!ride.th){ ride.th=true; H.sfx.thunder(); } H.cap('The lights stutter.'); }
    else if(ride.t<9.4){ e.light.intensity=0; H.cap('…'); }
    else { if(!ride.dinged){ ride.dinged=true; H.sfx.ding({x:488,z:465}); } openDoors(); }
  } else if(H.elevator.open<1){ H.elevator.open=Math.min(1,H.elevator.open+dt/1.3); }
});

H.route([[488,490],[565,540],[550,592],[425,600],[305,598],[228,590],[213,562],[241,537],[243,412],[292,396],[292,377],[248,372],[243,262],[300,258],[370,288],[445,313],[476,324],[452,286],[362,258],[350,246],[350,184],[455,184],[618,184]]);
H.station({n:1,x:488,z:428,name:'The Elevator',desc:'Dean Lloyd greets you on the ride up'});
})();
