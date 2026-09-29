/* Hotel Alice Lloyd: the guest route (James's sketch, 2026-09-29), stations and route arrows.
   Guests arrive up the stairs (southwest) or by the elevator (accessible entrance, east face), gather by the
   elevator, walk the lobby loop, then Room 1 -> 2 -> 3 -> 4 and out through the exit alcove. */
(function(){
'use strict';
var H = window.HOTEL; if (!H || H.failed) return;

H.startAt(206,565,Math.PI/2);   // top of the stairs, facing east along the south wall

H.ROUTE = {
  queue: [[206,565],[245,596],[420,600],[560,596],[566,560],[572,500],[576,444]],   // stairs -> the front desk by the elevator
  show:  [[576,444],[578,470],[565,495],[400,497],[388,482],[388,412],[352,405],[332,407],[330,432],   // lobby loop, north lane, vestibule, Suite 1871 door
          [325,500],[250,505],[238,445],[262,408],[298,404],                                         // Room 1 (Angell), out through the alcove
          [299,378],[290,350],[244,320],[242,290],[244,226],[270,213],[304,216],[308,262],[332,288],   // doorway, shore lane, round the bog room (Kleinstueck)
          [455,345],[478,352],                                                                       // boardwalk into Room 3 (Hinsdale)
          [458,310],[400,282],[356,258],[350,232],                                                   // pine lane back, through the gap
          [352,205],[400,197],[452,196],                                                             // staff wing to the Palmer door
          [655,190],[478,170],                                                                       // Room 4 (Palmer): down the corridor and back
          [446,168],[430,140],[362,122],[320,106],[320,74]]                                          // night corridor, exit alcove
};
H.route(H.ROUTE.queue.concat(H.ROUTE.show.slice(1)));

H.station({n:0,x:260,z:595,name:'Arrival \u00B7 Hall of Guests',desc:'up the stairs, or the elevator (the accessible entrance) \u00B7 the Dean\u2019s portrait watches the queue'});
H.station({n:1,x:560,z:470,name:'The Front Desk',desc:'sign the register \u00B7 watch LOBBY CAM 2 \u00B7 take your key'});
H.station({n:2,x:262,z:470,name:'Suite 1871 \u00B7 Angell',desc:'the night the house was wired \u00B7 watch the mirror, then the window'});
H.station({n:3,x:276,z:250,name:'Suite 1876 \u00B7 Kleinstueck',desc:'the Preserve \u00B7 stay on the boards \u00B7 follow only the true letters'});
H.station({n:4,x:484,z:340,name:'Suite 1912 \u00B7 Hinsdale',desc:'the oral examination \u00B7 answer with 1-2-3, or look at a button and press Enter'});
H.station({n:5,x:600,z:182,name:'Suite 1872 \u00B7 Palmer',desc:'one little door \u00B7 the lost bust speaks'});
H.station({n:6,x:320,z:84,name:'Check-out',desc:'late minutes assessed \u00B7 Enter at the door to check in again'});

// placeholder welcome until lobby.js takes over the front desk
if(!H.lobbyWelcome) H.narrate({x1:545,z1:420,x2:610,z2:500,lines:['Good evening. I am Dean Lloyd, and this is my hotel. Do sign the register.']});
})();
