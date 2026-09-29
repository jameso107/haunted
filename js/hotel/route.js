/* Hotel Alice Lloyd: the guest route (James's sketch, 2026-09-29), stations and route arrows.
   Guests arrive up the stairs (southwest) or by the elevator (accessible entrance, east face), gather by the
   elevator, walk the lobby loop, then Room 1 -> 2 -> 3 -> 4 and out through the exit alcove. */
(function(){
'use strict';
var H = window.HOTEL; if (!H || H.failed) return;

H.startAt(206,565,Math.PI/2);   // top of the stairs, facing east along the south wall

H.ROUTE = {
  queue: [[206,565],[245,596],[420,600],[560,596],[586,560],[586,480],[578,440]],   // stairs -> start region by the elevator
  show:  [[578,440],[578,470],[565,495],[400,497],[388,482],[388,412],[352,405],[325,405],   // lobby loop -> north lane
          [318,432],[318,530],[225,530],[225,440],[262,410],[296,402],                         // Room 1
          [299,378],[252,360],[244,290],[246,222],[270,206],[300,210],[308,262],               // Room 2 (runs north to z 195)
          [332,288],[455,345],[478,352],                                                        // diagonal down to Room 3
          [455,318],[400,286],[356,258],[350,232],[350,200],[392,181],[455,180],                // diagonal back, into the upper room
          [688,183],[470,178],                                                                  // Room 4: down the dorm corridor and back
          [430,140],[360,118],[322,104],[320,74]]                                               // exit alcove
};
H.route(H.ROUTE.queue.concat(H.ROUTE.show.slice(1)));

H.station({n:0,x:260,z:595,name:'Arrival',desc:'up the stairs (or the elevator, the accessible entrance) and along the queue'});
H.station({n:1,x:560,z:470,name:'The Lobby',desc:'check-in with Dean Lloyd, proprietor'});
H.station({n:2,x:262,z:470,name:'Room 1',desc:'the lower lounge by the window'});
H.station({n:3,x:276,z:250,name:'Room 2',desc:'north end of the west lane'});
H.station({n:4,x:484,z:340,name:'Room 3',desc:'the old Bust bay'});
H.station({n:5,x:600,z:182,name:'Room 4',desc:'down the dorm corridor and back'});
H.station({n:6,x:320,z:84,name:'Check-out',desc:'the exit alcove'});

// placeholder welcome until lobby.js takes over the front desk
if(!H.lobbyWelcome) H.narrate({x1:545,z1:420,x2:610,z2:500,lines:['Good evening. I am Dean Lloyd, and this is my hotel. Do sign the register.']});
})();
