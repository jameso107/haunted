/* Hotel Alice Lloyd: the building shell (structural walls from the flow map, window, elevator car, stairwell).
   Rooms and dressing live in js/hotel/*.js; this file only holds what exists in the real building. */
(function(){
'use strict';
var H = window.HOTEL; if (!H || H.failed) return;
var SC = H.SC, THREE = window.THREE;

// ---------- structural walls (from the flow map) ----------
H.WALLS = [[220,100,295,100],[345,100,460,100],[220,100,220,390],[460,100,460,155],[460,210,460,245],
 [220,245,330,245],[370,245,530,245],[460,155,700,155],[700,155,700,210],[700,210,590,210],
 [540,210,460,210],[530,210,530,245],[530,245,530,390],[190,390,215,390],[268,390,280,390],
 [318,390,610,390],[190,390,190,430],[190,460,190,545],[190,585,190,630],[190,630,610,630],
 [610,390,610,630],[430,390,430,465],[430,465,455,465],[520,465,545,465],[545,390,545,465],
 [70,415,190,415],[70,415,70,500],[70,500,190,500],[70,548,190,548],[70,582,190,582],
 [260,60,380,60],[260,60,260,100],[380,60,380,100]];
H.WALLS.forEach(function(w){ H.wall(w[0],w[1],w[2],w[3]); });

// window between the gallery and the north corridor: sill + header + glass (solid to walking)
(function(){
  var cx=(215+268)/2, w=(268-215)*SC;
  H.box(w,0.9,0.16,H.mat.wall,cx,0.45,390); H.box(w,H.WALL_H-2.1,0.16,H.mat.wall,cx,(H.WALL_H+2.1)/2,390);
  H.windowGlass=H.plane(w,1.2,new THREE.MeshLambertMaterial({color:0x9cc4e8,transparent:true,opacity:0.15,side:THREE.DoubleSide,depthWrite:false}),cx,1.5,390);
  H.map.walls.push([215,390,268,390]); H.seg(215,390,268,390);
})();

// ---------- elevator car (x 455-520, z 390-465; doors on z=465) ----------
H.elevator = {
  doorL: H.box(1.3,2.3,0.1,H.mat.metal,471.2,1.15,465),
  doorR: H.box(1.3,2.3,0.1,H.mat.metal,503.8,1.15,465),
  solid: H.seg(455,465,520,465),
  open: 0,                       // 0 closed .. 1 open
  light: H.plight(488,428,2.4,0xffd9a0,1.0,6),
  panel: H.box(1.7,0.05,1.1,H.glow(0xfff1cf,0.7),488,2.56,428)
};
H.map.doors.push([455,465,520,465]);
H.onUpdate(function(){
  var e=H.elevator;
  e.doorL.position.x=(471.2*SC)-1.32*e.open;
  e.doorR.position.x=(503.8*SC)+1.32*e.open;
  e.solid.off=e.open>0.8;
});

// stairwell steps descending west of the gallery
for(var i=0;i<5;i++){ H.box(0.55,0.2,1.3,H.lam(0x241d15),182-i*13,-0.1-i*0.2,565); }
H.seg(148,548,148,582);   // stop at the stairwell descent
})();
