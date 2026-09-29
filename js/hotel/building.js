/* Hotel Alice Lloyd: the building shell. Only what exists in the real rooms goes here: flow-map walls,
   window, elevator car, columns, dorm doors, fixtures and furniture seen in the Oct 2025 walkthrough video.
   Positions marked "verify" came from the video analysis and should be checked on site. */
(function(){
'use strict';
var H = window.HOTEL; if (!H || H.failed) return;
var SC = H.SC, THREE = window.THREE, M = H.mat;

// ---------- structural walls (from the flow map), tinted by zone ----------
var LCH = [[460,155,700,155],[700,155,700,210],[700,210,590,210],[540,210,460,210]];   // the dorm corridor
H.WALLS = [[220,100,295,100],[345,100,460,100],[220,100,220,390],[460,100,460,155],[460,210,460,245],
 [220,245,330,245],[370,245,530,245],[530,210,530,245],[530,245,530,390],[190,390,215,390],[268,390,280,390],
 [318,390,610,390],[190,390,190,430],[190,460,190,545],[190,585,190,630],[190,630,610,630],
 [610,390,610,630],[430,390,430,465],[430,465,455,465],[520,465,545,465],[545,390,545,465],
 [70,415,190,415],[70,415,70,500],[70,500,190,500],[70,548,190,548],[70,582,190,582],
 [260,60,380,60],[260,60,260,100],[380,60,380,100]].concat(LCH);
H.WALLS.forEach(function(w){
  var lounge = Math.min(w[1],w[3])>=390 && Math.min(w[0],w[2])>=190;
  H.wall(w[0],w[1],w[2],w[3], LCH.indexOf(w)>=0 ? M.wallCorr : lounge ? M.wall : M.wallBack);
});

// back-of-house: the unmodeled block east of the middle zone and the sealed pocket read as solid in plan
H.box((700-534)*SC,H.WALL_H,(390-214)*SC,H.lam(0x0b0b0d),617,H.WALL_H/2,302);
H.box((526-464)*SC,H.WALL_H,(241-214)*SC,H.lam(0x0b0b0d),495,H.WALL_H/2,227.5);

// ---------- window between the gallery and the middle zone (z=390, x 222-268) ----------
(function(){
  var x1=222, x2=268, cx=(x1+x2)/2, w=(x2-x1)*SC;
  H.box(w,0.9,0.16,M.wallBack,cx,0.45,390); H.box(w,H.WALL_H-2.1,0.16,M.wallBack,cx,(H.WALL_H+2.1)/2,390);
  H.box((222-215)*SC,H.WALL_H,0.16,M.wallBack,218.5,H.WALL_H/2,390);                     // fill the old 215-222 sliver
  H.box(w+0.12,0.04,0.25,M.column,cx,0.92,390);                                          // sill ledge, both sides
  [[x1,1.5],[x2,1.5]].forEach(function(f){ H.box(0.06,1.2,0.2,M.column,f[0],f[1],390); });   // jambs
  H.box(w+0.12,0.06,0.2,M.column,cx,2.13,390);                                           // head
  H.windowGlass=H.plane(w,1.2,new THREE.MeshLambertMaterial({color:0x9cc4e8,transparent:true,opacity:0.15,side:THREE.DoubleSide,depthWrite:false}),cx,1.5,390);
  H.map.walls.push([215,390,268,390]); H.seg(215,390,268,390);
  H.cap2d(215,390,268,390,'#9cc4e8',H.WALL_H);
})();

// ---------- elevator car (x 455-520, z 390-465; doors on z=465). Verify: the real car may be ~2.0 x 1.5 m ----------
H.elevator = {
  doorL: H.box(1.3,2.3,0.1,M.metal,471.2,1.15,465),
  doorR: H.box(1.3,2.3,0.1,M.metal,503.8,1.15,465),
  solid: H.gate(455,465,520,465),
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

// ---------- lounge (Z1): columns, perimeter fluorescents, furniture (verify positions) ----------
H.column(330,553);                         // C1: the frog-mural column
H.column(470,538);                         // C2
(function(){                               // frog mural on C1's east face
  var t=H.canvasTex(128,192,function(g,w,h){ g.fillStyle='#e8e6df'; g.fillRect(0,0,w,h);
    g.fillStyle='#3f9a3a'; g.beginPath(); g.ellipse(64,110,34,40,0,0,Math.PI*2); g.fill();
    g.beginPath(); g.ellipse(46,62,15,15,0,0,Math.PI*2); g.ellipse(82,62,15,15,0,0,Math.PI*2); g.fill();
    g.fillStyle='#fff'; g.beginPath(); g.arc(46,60,8,0,7); g.arc(82,60,8,0,7); g.fill(); g.fillStyle='#111'; g.beginPath(); g.arc(47,61,4,0,7); g.arc(81,61,4,0,7); g.fill();
    g.strokeStyle='#2c6e28'; g.lineWidth=4; g.beginPath(); g.arc(64,96,14,0.2,Math.PI-0.2); g.stroke();
    g.strokeStyle='#3f9a3a'; g.lineWidth=5; g.beginPath(); g.moveTo(94,112); g.lineTo(112,82); g.stroke();
    g.fillStyle='#9a4fd0'; for(var i=0;i<5;i++){ g.beginPath(); g.arc(112+8*Math.cos(i*1.26),76+8*Math.sin(i*1.26),5,0,7); g.fill(); } });
  H.plane(0.44,0.66,H.lam(0xffffff,{map:t}),330+11.4,1.25,553,Math.PI/2);
})();
var tube=H.glow(0xe8f0ff,0.95);
function fluor(x1,z1,x2,z2){ var dx=x2-x1, dz=z2-z1, len=Math.hypot(dx,dz)*SC;
  var m=H.box(len,0.05,0.12,tube,(x1+x2)/2,2.62,(z1+z2)/2,-Math.atan2(dz,dx)); H.fixture(m); return m; }
fluor(607,395,607,625); fluor(320,393,425,393); fluor(548,393,605,393); fluor(432,468,543,468);
H.box((543-432)*SC,0.37,0.1,H.lam(0xc8782a),487.5,2.535,467.5);          // orange bulkhead band over the elevator face (low confidence)
H.onHouseLights(function(on){ houseFill.forEach(function(L){ L.intensity=on?0.5:0; }); });
var houseFill=[H.plight(560,510,2.4,0xeef2ff,0,9), H.plight(330,520,2.4,0xeef2ff,0,9)];
// orange modular vinyl bench on the east wall, sheet-draped table beside it
(function(){ var or=H.lam(0xd4642a);
  H.box(0.5,0.3,2.8,or,603.75,0.15,505); for(var i=0;i<3;i++) H.box(0.46,0.14,0.9,or,603.75,0.37,505+(i-1)*23.5);
  H.box(0.8,0.76,1.9,H.lam(0xd9d4c8),590,0.38,570);
})();
H.box(0.35,0.12,0.3,M.dark,470,2.45,510); H.cyl(0.015,0.015,0.3,M.metal,470,2.6,510,6);   // ceiling projector
[[200,410,600,410],[200,600,600,600]].forEach(function(c){ H.box((c[2]-c[0])*SC,0.025,0.025,M.metal,(c[0]+c[2])/2,2.70,c[1]); });   // surface conduit

// ---------- LCH dorm corridor (x 460-700, z 155-210): lower ceiling, pipes, cove light, doors ----------
H.ceilPatch(460,155,700,210,H.lam(0x2a2620),2.5);
[[163,0.05,2.42],[171,0.04,2.40],[178,0.03,2.44]].forEach(function(p){
  var m=new THREE.Mesh(new THREE.CylinderGeometry(p[1],p[1],(698-462)*SC,8),M.metal); m.rotation.z=Math.PI/2; m.position.set(580*SC,p[2],p[0]*SC); H.scene.add(m); });
H.fixture(H.box((698-462)*SC,0.03,0.05,H.glow(0xffb870,0.9),580,2.47,207));        // warm LED cove strip along the south wall
// the niche at x 540-590 on the south wall reads as a real opening
H.box((590-540)*SC,H.WALL_H-2.13,0.16,M.wallCorr,565,(H.WALL_H+2.13)/2,210);
[540,590].forEach(function(x){ H.box(0.06,2.13,0.2,M.woodDark,x,1.065,210); });
// dorm doors, ~3.2 m pitch (verify count and positions on site); rooms can relabel them with setPlate()
H.doors = {
  D1: H.door({x:495,z:157,face:'s',plate:['101']}),
  D2: H.door({x:575,z:157,face:'s',plate:['103']}),
  D3: H.door({x:655,z:157,face:'s',plate:['105']}),
  D4: H.door({x:500,z:208,face:'n',plate:['102']}),
  D5: H.door({x:670,z:208,face:'n',plate:['104']}),
  D6: H.door({x:698,z:182.5,face:'w',plate:['106']})
};

// ---------- exit alcove (Z7): exit door with a crash bar and a narrow lit sidelight ----------
H.door({x:345,z:62,face:'s',w:0.91,mat:M.metal,frameMat:M.dark,plate:['EXIT'],});
H.box(0.8,0.05,0.06,M.metal,345,1.0,64);
H.fixture(H.box(0.2,1.2,0.03,H.glow(0xcfd8e0,0.8),362.5,1.5,61.2));

// ---------- stairwell: 0.28 m treads, 0.18 m risers, x 190 -> 134 ----------
for(var i=0;i<8;i++){ H.box(0.28,0.18,1.3,H.lam(0x241d15),190-3.5-i*7,-0.09-i*0.18,565); }
H.seg(148,548,148,582);   // stop at the stairwell descent
})();
