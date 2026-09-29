/* Hotel Alice Lloyd: Suite 1872 · Palmer, "one little door". The dorm corridor of six doors (x 460-700, z 155-210):
   her entrance-exam slate, a chase of floor light and knocks door by door, Housekeeping's drop, and her lost bust,
   which speaks her own words before the Chicago bells ring. If the real doors belong to residents, the real haunt
   uses only the hanger cards and floor strips on them; nothing is fixed to the walls. */
(function(){
'use strict';
var H = window.HOTEL; if (!H || H.failed) return;
/* ---- HOTEL KIT v1 (paste verbatim right after the H guard in every area file; the first copy to load defines it) ---- */
var SC=H.SC, THREE=window.THREE, M=H.mat;
if(!H.kit){ H.kit=1;
  var TW=[], CULL=[], OV=false, capEl=document.getElementById('caption');
  H.tween=function(d,f,done){ var w={t:0,d:Math.max(0.001,d),f:f,done:done,dead:false}; TW.push(w); return w; };   // f(p) with p 0..1; set w.dead=true to cancel
  H.after=function(d,fn){ return H.tween(d,function(){},fn); };
  H.onUpdate(function(dt){ for(var i=TW.length-1;i>=0;i--){ var w=TW[i]; if(w.dead){ TW.splice(i,1); continue; }
    w.t=Math.min(w.d,w.t+dt); w.f(w.t/w.d); if(w.t>=w.d){ TW.splice(i,1); if(w.done) w.done(); } } });
  H.fade=function(mat,to,d){ var a=mat.opacity; return H.tween(d,function(p){ mat.opacity=a+(to-a)*p; }); };
  H.lightTo=function(L,to,d){ var a=L.intensity; return H.tween(d||0.01,function(p){ L.intensity=a+(to-a)*p; }); };
  H.keepAway=function(o,minM){ var h=H.headPos(), dx=o.position.x-h.x, dz=o.position.z-h.z, d=Math.hypot(dx,dz);   // o: scene-level object, position in meters
    if(d<minM){ if(d<1e-4){ dx=1; dz=0; d=1; } o.position.x=h.x+dx/d*minM; o.position.z=h.z+dz/d*minM; } };
  H.heading=function(dx,dz){ var y=H.player().yaw, l=Math.hypot(dx,dz)||1; return (Math.sin(y)*dx+Math.cos(y)*dz)/l>0.3; };   // facing roughly toward plan direction (dx,dz)
  H.quiet=function(){ return !capEl || !capEl.textContent; };   // nobody is speaking and nothing is queued
  H.LINES={}; H.addLines=function(o){ for(var k in o) H.LINES[k]=o[k]; };   // {ID:{t:'text', at:'grilleId', who:'NAME'}}
  H.lineDur=function(id){ return 1.6+0.066*H.LINES[id].t.length; };
  H.line=function(id,o){ var L=H.LINES[id]; if(!L) return; o=o||{}; var who=L.who||'DEAN LLOYD';
    H.say(L.t,{who:who,at:L.at,interrupt:!!o.interrupt,voice:who==='DEAN LLOYD'?undefined:false}); };
  H.nzones=[];   // every one-shot zone goes here so replay re-arms it
  H.narrateIds=function(ids,b,o){ o=o||{}; var z=H.zone({x1:b[0],z1:b[1],x2:b[2],z2:b[3],once:true,when:o.when,
    enter:function(){ ids.forEach(function(id){ H.line(id); }); if(o.then) o.then(); }}); H.nzones.push(z); return z; };
  H.resets=[]; H.shows=[]; H.cue=function(c){ var s=H.show(c); H.shows.push(s); return s; };
  H.replay=function(){ H.shows.forEach(function(s){ s.stop(); }); TW.forEach(function(w){ w.dead=true; });
    H.nzones.forEach(function(z){ z.fired=false; }); H.resets.forEach(function(f){ try{ f(); }catch(e){ console.warn(e); } });
    for(var k in H.stay) delete H.stay[k]; H.stay.suites={};
    H.say([''],{interrupt:true,who:'',voice:false,hold:0.05}); H.cap(''); H.teleport(206,565,Math.PI/2); };
  window.addEventListener('keydown',function(e){ if(e.code==='Tab' && !H.renderer.xr.isPresenting) OV=!OV; });
  H.cull=function(g,boxes){ CULL.push({g:g,b:boxes}); return g; };   // show group g only while the player is inside one of boxes [[x1,z1,x2,z2],..] (always in bird's-eye)
  H.onUpdate(function(){ var p=H.player(); for(var c=0;c<CULL.length;c++){ var v=OV, bs=CULL[c].b;
    for(var i=0;!v&&i<bs.length;i++){ var b=bs[i]; v=p.x>b[0]&&p.x<b[2]&&p.z>b[1]&&p.z<b[3]; } CULL[c].g.visible=v; } });
  H.rng=function(seed){ return function(){ seed|=0; seed=seed+0x6D2B79F5|0; var t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
}
/* ---- end HOTEL KIT ---- */

var PI=Math.PI, DS=THREE.DoubleSide, G=H.cull(H.group(0,0),[[330,100,702,250]]);
var mine=[];   // this suite's own tweens, so reset() can cancel them without touching other rooms
function tw(d,f,done){ for(var i=mine.length-1;i>=0;i--) if(mine[i].dead||mine[i].t>=mine[i].d) mine.splice(i,1); var w=H.tween(d,f,done); mine.push(w); return w; }
function later(d,fn){ return tw(d,function(){},fn); }
function fadeTo(mat,to,d){ var a=mat.opacity; return tw(d,function(p){ mat.opacity=a+(to-a)*p; }); }
function lightTo(L,to,d){ var a=L.intensity; return tw(d,function(p){ L.intensity=a+(to-a)*p; }); }
function mk(geo,mat,x,y,z,parent){ var m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); if(parent) parent.add(m); return m; }   // meters
function fit(g,txt,x,y,maxW,px,font,style){ style=style||''; g.font=style+px+'px '+font; var w=g.measureText(txt).width, sx=Math.max(0.72,Math.min(1,maxW/w));   // condense, then shrink
  if(w*sx>maxW){ px=Math.floor(px*maxW/(w*sx)); g.font=style+px+'px '+font; }
  g.save(); g.translate(x,y); g.scale(sx,1); g.fillText(txt,0,0); g.restore(); }
function capLine(){ var e=document.querySelector('#caption .line'); return e?e.textContent:''; }

// ---------- structure: the suite door on the corridor mouth, six plates, the pedestal ----------
var show, DOORS=[{id:'D1',x:495,z:157,sx:495,sz:163.25},{id:'D4',x:500,z:208,sx:500,sz:201.75},{id:'D2',x:575,z:157,sx:575,sz:163.25},
  {id:'D3',x:655,z:157,sx:655,sz:163.25},{id:'D5',x:670,z:208,sx:670,sz:201.75},{id:'D6',x:698,z:182.5,sx:691.75,sz:182.5,r:1}];   // walking east
var CARDS=[['1876','COMMENCEMENT'],['1879','WELLESLEY'],['1882','THE PRESIDENT’S','OFFICE'],['1890','THE WOMEN’S','LEAGUE'],['1892','CHICAGO','DEAN OF WOMEN'],['1897','WHY GO TO','COLLEGE?']];
var d1872=H.suiteDoor({x1:460,z1:155,x2:460,z2:210,approach:1,plate:['1872 · PALMER'],num:'1872',
  ready:function(){ return !!H.stay.hinsdaleDone && quietT>0.3; }, onOpen:function(){ show.go(); }});   // entered from the staff wing; leaves swing east. Held while R1/C1/C2 play, so they land by the TV and P1 on the door
DOORS.forEach(function(d,i){ H.doors[d.id].setPlate([CARDS[i][0]]); });
[[677,177,687,177],[687,177,687,188],[687,188,677,188],[677,188,677,177],                          // the bust's pedestal
 [684.5,172.5,695.5,172.5],[684.5,157,684.5,172.5],[695.5,157,695.5,172.5],[684,196.5,698,196.5],[684,196.5,684,208]]   // sheeted chair, crate
 .forEach(function(s){ H.seg(s[0],s[1],s[2],s[3]); });

// ---------- the entrance-exam slate and the proctor's lamp ----------
var CHALK="'Chalkduster','Bradley Hand','Segoe Print',Georgia,serif";
var slateT=H.canvasTex(512,360,function(g,w,h){ g.fillStyle='#1f2a24'; g.fillRect(0,0,w,h); var r=H.rng(1872);
  for(var i=0;i<70;i++){ g.strokeStyle='rgba(225,232,222,'+(0.015+r()*0.035)+')'; g.lineWidth=8+r()*18; var x=r()*w, y=r()*h;
    g.beginPath(); g.moveTo(x,y); g.lineTo(x+30+r()*140,y+(r()-0.5)*24); g.stroke(); }   // old erasures
  g.fillStyle='#eef0e8'; g.textAlign='center'; g.textBaseline='middle';
  fit(g,'ENTRANCE EXAMINATION',w/2,58,w-56,36,CHALK); fit(g,'UNIVERSITY OF MICHIGAN · 1872',w/2,106,w-80,24,CHALK); g.fillRect(96,134,w-192,3);
  fit(g,'ΓΝΩΘΙ ΣΕΑΥΤΟΝ',w/2,192,w-80,42,'Georgia,serif'); fit(g,'x² − 7x + 12 = 0',w/2,270,w-80,42,CHALK); });
var slateMat=H.lam(0xffffff,{map:slateT,emissive:0xffffff,emissiveMap:slateT,emissiveIntensity:0.3}), lampMat=H.glow(0xffd9a0,0.8,{side:DS});
var SX=535*SC, TILT=-0.12;   // a freestanding easel between D1 and D2, clear of the suite door's north leaf (it sweeps x 460-488)
function tilt(m,a){ m.rotation.x=a; return m; }
G.add(H.merge([tilt(mk(new THREE.BoxGeometry(0.66,0.48,0.02),M.wood,SX,1.45,158.6*SC),TILT), mk(new THREE.BoxGeometry(0.72,0.025,0.06),M.wood,SX,1.2,159.6*SC),
  tilt(mk(new THREE.BoxGeometry(0.03,1.74,0.025),M.wood,SX-0.35,0.87,159.4*SC),-0.065), tilt(mk(new THREE.BoxGeometry(0.03,1.74,0.025),M.wood,SX+0.35,0.87,159.4*SC),-0.065)],M.wood));
tilt(mk(new THREE.PlaneGeometry(0.6,0.42),slateMat,SX,1.4513,158.6*SC+0.0109,G),TILT);
var arm=mk(new THREE.CylinderGeometry(0.006,0.006,0.075,6),M.brass,SX,1.728,158.75*SC); arm.rotation.x=0.89;
G.add(H.merge([mk(new THREE.BoxGeometry(0.03,0.03,0.03),M.brass,SX,1.705,157.9*SC),arm],M.brass));
var shade=mk(new THREE.ConeGeometry(0.045,0.06,14,1,true),lampMat,SX,1.75,159.55*SC,G); shade.rotation.x=0.6;

// ---------- hanger cards on the six levers (one atlas, one draw call) ----------
function rrect(g,x,y,w,h,r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
var cardT=H.canvasTex(1024,256,function(g,w,h){ var cw=w/6;
  CARDS.forEach(function(L,i){ var x0=i*cw+4, x1=(i+1)*cw-4, cx=(x0+x1)/2;
    g.globalCompositeOperation='source-over'; g.fillStyle='#efe3c8'; rrect(g,x0,4,x1-x0,h-8,14); g.fill();
    g.strokeStyle='#33261a'; g.lineWidth=2.5; rrect(g,x0+8,64,x1-x0-16,h-76,8); g.stroke();
    g.fillStyle='#33261a'; g.textAlign='center'; g.textBaseline='middle';
    fit(g,L[0],cx,100,x1-x0-30,44,'Georgia,serif','bold '); g.fillRect(cx-34,126,68,2);
    for(var k=1;k<L.length;k++) fit(g,L[k],cx,124+36*k,x1-x0-24,27,'Georgia,serif','bold ');
    g.globalCompositeOperation='destination-out'; g.beginPath(); g.arc(cx,34,17,0,7); g.fill(); g.fillRect(cx-3,4,6,30); });   // hole and slit for the lever
  g.globalCompositeOperation='source-over'; });
var cardMat=H.lam(0xffffff,{map:cardT,alphaTest:0.5,emissive:0xffffff,emissiveMap:cardT,emissiveIntensity:0.22}), cards=[];
DOORS.forEach(function(d,i){ var geo=new THREE.PlaneGeometry(0.22,0.4), uv=geo.attributes.uv;
  for(var k=0;k<uv.count;k++) uv.setX(k,(i+uv.getX(k))/6);
  var m=mk(geo,cardMat,0.33,0.855,0.055,H.doors[d.id].group); cards.push(m); });   // door-local meters: the hole sits on the lever
H.scene.updateMatrixWorld(true); G.add(H.merge(cards,cardMat));

// ---------- floor light strips in front of each door (the chase) ----------
var C0=new THREE.Color(0x201808), CON=new THREE.Color(0xffd9a0), CDIM=new THREE.Color(0x806040), tmpC=new THREE.Color(), dmy=new THREE.Object3D();
var strips=new THREE.InstancedMesh(new THREE.PlaneGeometry(0.8,0.12).rotateX(-PI/2),new THREE.MeshBasicMaterial({color:0xffffff}),6);
DOORS.forEach(function(d,i){ dmy.position.set(d.sx*SC,0,d.sz*SC); dmy.rotation.set(0,d.r?PI/2:0,0); dmy.updateMatrix(); strips.setMatrixAt(i,dmy.matrix); strips.setColorAt(i,C0); });
strips.position.y=0.012; strips.frustumCulled=false; G.add(strips);
function stripColor(i,c){ strips.setColorAt(i,c); strips.instanceColor.needsUpdate=true; }

// ---------- the study at the far end: storage sign, sheeted chair and crate ----------
H.sign(['OBSERVATORY LODGE','STORAGE · 2018'],{w:512,h:184,fs:48,bg:'#e4dfd2',fg:'#2a2a2a',border:'#6a6a6a',bw:5,glow:0.42},0.5,0.18,688,2.05,157.2,0,G);
var cloth=H.lam(0xcfc9bc,{map:H.tex.folds,side:DS});
var chb=mk(new THREE.BoxGeometry(0.44,0.5,0.1),cloth,690*SC,0.7,160.8*SC); chb.rotation.x=-0.12;   // chair back under the sheet
G.add(H.merge([mk(new THREE.BoxGeometry(0.46,0.46,0.44),cloth,690*SC,0.23,166*SC), chb,
  mk(new THREE.BoxGeometry(0.56,0.5,0.42),cloth,691*SC,0.25,202*SC)],cloth));

// ---------- pedestal, plaster bust, the projected face, dust sheet, plaque, spill on D6 ----------
var plaster=H.lam(0xe8e4dc);
H.cyl(0.18,0.2,1.06,H.lam(0x2c2c32),682,0.53,182.5,12,G);
var bh=mk(new THREE.SphereGeometry(0.12,24,16),plaster,0,1.45,0); bh.scale.set(0.85,1.1,0.95);
var bsh=mk(new THREE.SphereGeometry(0.21,24,10,0,2*PI,0,PI/2),plaster,0,1.13,0); bsh.scale.set(1,0.45,0.6);
var bust3=H.merge([bh,mk(new THREE.CylinderGeometry(0.052,0.064,0.15,14),plaster,0,1.29,0),bsh,mk(new THREE.CylinderGeometry(0.09,0.11,0.07,18),plaster,0,1.095,0)],plaster);
bust3.position.set(682*SC,0,182.5*SC); bust3.rotation.y=-PI/2; G.add(bust3);   // faces west, down the hall

var bust={speakUntil:0,blinkAt:3,blinkEnd:0};
function drawFace(g,t,w,h){ g.fillStyle='#000'; g.fillRect(0,0,w,h);
  var sk=g.createRadialGradient(128,140,8,128,140,76); sk.addColorStop(0,'#f1e8da'); sk.addColorStop(0.72,'#c4b6a3'); sk.addColorStop(1,'#000');
  g.fillStyle=sk; g.beginPath(); g.ellipse(128,146,54,70,0,0,7); g.fill();
  g.fillStyle='#5b4533'; g.fillRect(36,0,184,52); g.beginPath(); g.ellipse(128,56,72,30,0,0,7); g.fill();       // hair drawn back from a centre parting
  g.beginPath(); g.ellipse(76,104,14,30,0.25,0,7); g.ellipse(180,104,14,30,-0.25,0,7); g.fill();
  g.strokeStyle='#2e2218'; g.lineWidth=2; g.beginPath(); g.moveTo(128,30); g.lineTo(128,84); g.stroke();
  for(var i=0;i<14;i++){ var s=i/13, bx=50+156*s, by=62-30*Math.sin(PI*s);                                        // the braided crown
    g.fillStyle=i%2?'#9a7654':'#86654a'; g.beginPath(); g.ellipse(bx,by,10,6.5,i%2?0.7:-0.7,0,7); g.fill(); g.stroke(); }
  g.strokeStyle='#6a5646'; g.lineWidth=4; g.lineCap='round';
  g.beginPath(); g.moveTo(92,104); g.quadraticCurveTo(104,97,117,103); g.moveTo(139,103); g.quadraticCurveTo(152,97,164,104); g.stroke();   // brows
  if(t>bust.blinkAt){ bust.blinkEnd=t+0.14; bust.blinkAt=t+3+3*Math.random(); }
  [104,152].forEach(function(ex){ if(t<bust.blinkEnd){ g.strokeStyle='#4a3a30'; g.lineWidth=3; g.beginPath(); g.moveTo(ex-11,118); g.lineTo(ex+11,118); g.stroke(); return; }
    g.fillStyle='#d8d0c4'; g.beginPath(); g.ellipse(ex,118,12,6,0,0,7); g.fill();
    g.fillStyle='#4a3a2c'; g.beginPath(); g.arc(ex,118,5.5,0,7); g.fill(); g.fillStyle='#120e0c'; g.beginPath(); g.arc(ex,118,2.6,0,7); g.fill();
    g.fillStyle='#fff'; g.beginPath(); g.arc(ex+2,116,1.4,0,7); g.fill(); });
  g.strokeStyle='#a8977f'; g.lineWidth=3; g.beginPath(); g.moveTo(123,122); g.quadraticCurveTo(119,142,122,151); g.stroke();   // nose
  g.fillStyle='#8a7766'; g.beginPath(); g.ellipse(121,153,4,2.5,0,0,7); g.ellipse(135,153,4,2.5,0,0,7); g.fill();
  var mh=H.t<bust.speakUntil?4+10*(0.5+0.5*Math.sin(31*t)):2;
  g.fillStyle='#b47f76'; g.beginPath(); g.ellipse(128,174,15,3+mh/2,0,0,7); g.fill();
  g.fillStyle='#3a1c1a'; g.beginPath(); g.ellipse(128,174,11,mh/2,0,0,7); g.fill(); }
var faceScr=H.screen(256,256,drawFace,{x:682,z:182,range:6,every:2}), faceMat=H.holoMat(faceScr.tex), faceG=H.group(682,182.5,-PI/2,G);
mk(new THREE.SphereGeometry(0.123,24,16,0,PI),faceMat,0,1.45,0,faceG).scale.set(0.85,1.1,0.95);

var SHEET_Y=1.06, sheet=mk(new THREE.LatheGeometry([[.285,-.08],[.275,.03],[.265,.12],[.24,.19],[.19,.25],[.155,.33],[.145,.4],[.135,.47],[.11,.53],[.06,.565],[0,.575]]
  .map(function(p){ return new THREE.Vector2(p[0],p[1]); }),20),cloth,682*SC,SHEET_Y,182.5*SC,G);   // a dust sheet over head and shoulders

var INS=[['GIVEN TO HOSPITALITY'],['FERVENT IN SPIRIT'],['THE SWEETNESS OF HER LIPS','INCREASING LEARNING']], inscr={i:-1}, inscrScr=null;
function drawInscr(g,t,w,h){ var gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#a4854a'); gr.addColorStop(1,'#6a5128'); g.fillStyle=gr; g.fillRect(0,0,w,h);
  g.strokeStyle='#3b2b12'; g.lineWidth=3; g.strokeRect(5,5,w-10,h-10); var L=INS[inscr.i];
  if(L){ g.textAlign='center'; g.textBaseline='middle'; g.fillStyle='#24180a'; L.forEach(function(s,k){ fit(g,s,w/2,h/2+(k-(L.length-1)/2)*19,w-26,18,'Georgia,serif','bold '); }); }
  if(inscrScr) inscrScr.range=0; }   // redraw only after a change
inscrScr=H.screen(256,64,drawInscr,{x:680,z:182,range:6,every:3});
H.plane(0.3,0.08,H.lam(0xffffff,{map:inscrScr.tex,emissive:0xffffff,emissiveMap:inscrScr.tex,emissiveIntensity:0.3}),677.2,0.95,182.5,-PI/2,G);
function setInscr(i){ inscr.i=i; inscrScr.range=6; }
var spillMat=H.holoMat(faceScr.tex); H.plane(1.1,0.9,spillMat,695.4,1.45,182.5,-PI/2,G);   // just proud of D6's frame

// ---------- projector on a floor pole between D2 and D3, and its beam ----------
var PB=new THREE.Vector3(622*SC,2.24,161*SC), PT=new THREE.Vector3(682*SC,1.45,182.5*SC), PL=PB.clone().addScaledVector(PT.clone().sub(PB).normalize(),0.14);
H.cyl(0.02,0.02,2.18,M.metal,622,1.09,161,8,G); H.box(0.3,0.12,0.25,M.dark,622,2.24,161,0,G).lookAt(PT);   // under the 163 pipe
var lensMat=H.glow(0xfff0e0,0), lens=mk(new THREE.CircleGeometry(0.035,14),lensMat,PL.x,PL.y,PL.z,G); lens.lookAt(PT);
var beamMat=H.holoMat(null,0xfff0e0), beam=mk(new THREE.ConeGeometry(0.22,PL.distanceTo(PT),16,1,true).rotateX(-PI/2),beamMat,0,0,0,G);
beam.position.copy(PL).add(PT).multiplyScalar(0.5); beam.lookAt(PT);   // narrow at the lens, wide at the bust

// ---------- the ten bells on a shelf over D5 ----------
H.box(1.7,0.03,0.12,M.wood,672.5,2.25,206.2,0,G);
var BELL0=new THREE.Color(0x5c4622), BELL1=new THREE.Color(0xfff0b0), bellFlash=[0,0,0,0,0,0,0,0,0,0];
var bells=new THREE.InstancedMesh(new THREE.LatheGeometry([[0,0],[.06,0],[.075,.02],[.07,.06],[.055,.11],[.04,.14],[0,.15]].map(function(p){ return new THREE.Vector2(p[0],p[1]); }),16),
  new THREE.MeshBasicMaterial({color:0xffffff,side:DS}),10);
for(var bi=0;bi<10;bi++){ dmy.position.set((654+4.2*bi)*SC,0,206*SC); dmy.rotation.set(0,0,0); dmy.updateMatrix(); bells.setMatrixAt(bi,dmy.matrix); bells.setColorAt(bi,BELL0); }
bells.position.y=2.265; bells.frustumCulled=false; G.add(bells);

// ---------- Housekeeping: a PVC gantry and the drop ghost (animatronic) ----------
var pvc=H.lam(0xdedad0), GY=2.485, xb=mk(new THREE.CylinderGeometry(0.014,0.014,(205.4-158.6)*SC,8),pvc,632*SC,0,182*SC); xb.rotation.x=PI/2;
var gantry=H.merge([mk(new THREE.CylinderGeometry(0.014,0.014,GY,8),pvc,632*SC,-GY/2,158.6*SC),mk(new THREE.CylinderGeometry(0.014,0.014,GY,8),pvc,632*SC,-GY/2,205.4*SC),xb],pvc);
gantry.position.y=GY; G.add(gantry);   // origin at the crossbar, so the bird's-eye view hides it
var Y0=2.55, Y1=2.0, ghost=H.group(632,183,-PI/2,G); ghost.position.y=Y0;   // y = the hem: hidden above the 2.5 m ceiling; the stop cord holds it at 2.0 m
var shroudT=H.canvasTex(256,64,function(g,w,h){ var gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#ffffff'); gr.addColorStop(1,'#b9bcc6'); g.fillStyle=gr; g.fillRect(0,0,w,h);
  g.globalCompositeOperation='destination-out'; var r=H.rng(632); g.beginPath(); g.moveTo(0,h);                  // a torn hem
  for(var x=0;x<=w;x+=8){ g.lineTo(x+4,h-2-r()*9); g.lineTo(x+8,h); } g.fill(); g.globalCompositeOperation='source-over'; });
var shroudM=H.lam(0xe8e8f0,{map:shroudT,alphaTest:0.5,transparent:true,opacity:0.9,side:DS,emissive:0x8890a8,emissiveIntensity:0.25}), V2=function(p){ return new THREE.Vector2(p[0],p[1]); };
function sleeve(sx){ var d=new THREE.Vector3(0.35*sx,-0.3,0.9).normalize(), m=mk(new THREE.ConeGeometry(0.065,0.26,10,1,true),shroudM,0,0,0);   // open end reaching toward the guest
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,-1,0),d); m.position.set(0.13*sx,0.2,0.02).addScaledVector(d,0.13); return m; }
ghost.add(H.merge([mk(new THREE.LatheGeometry([[.25,0],[.24,.04],[.21,.1],[.18,.16],[.15,.21],[.12,.25],[.09,.28]].map(V2),16),shroudM,0,0,0),sleeve(1),sleeve(-1)],shroudM));
mk(new THREE.SphereGeometry(0.12,16,12),H.lam(0xffffff,{emissive:0x8890a8,emissiveIntensity:0.25,map:H.canvasTex(128,64,function(g,w,h){ g.fillStyle='#e8e8f0'; g.fillRect(0,0,w,h);
  g.fillStyle='#141218'; g.beginPath(); g.ellipse(25,26,5.5,8,0.15,0,7); g.ellipse(39,26,5.5,8,-0.15,0,7); g.fill(); g.beginPath(); g.ellipse(32,45,5,8,0,0,7); g.fill(); })}),0,0.36,0,ghost);   // the whole figure fits between the cord (2.0 m) and the crossbar: head top 2.48 m

// ---------- lights (3) and grilles ----------
var warmL=H.plight(560,183,2.3,0xffcf8f,0.3,8);                                       // the corridor, dim
var spotL=H.spot(PL.x/SC,PL.z/SC,PL.y,682,182.5,1.4,0xfff0e0,0,5,0.2,0.5);            // on the bust, from the projector's lens
var dropL=H.plight(632,183,2.2,0xcfe0ff,0,3);                                         // a single cold flash at the drop
H.grille('slate',549,2.2,157.2,0); H.grille('transom',575,2.25,207.8,PI); H.grille('bells',660,2.3,157.2,0);

H.addLines({
  P1:{t:'Alice Freeman sat Michigan’s entrance examination in 1872 and did poorly in Greek and mathematics. President Angell let her in on ‘a trial of six weeks.’',at:'slate'},
  P2:{t:'Every door on this hall is a room she walked into first.',at:'transom'},
  P3:{t:'Wellesley later offered her a professorship in mathematics and Greek, the very subjects she had failed, and made her acting president at twenty-six. At Chicago, as the first Dean of Women, she saw women go from a quarter of the students to nearly half.',at:'transom'},
  P4:{t:'Housekeeping. I do apologize; they have never learned to knock.',at:'transom'},
  P5:{t:'This is her bust. It stood in the Dean of Women’s office from 1924, went missing after the office moved out in 1948, and turned up in 2018 in a conference room at Observatory Lodge, just up the street.',at:'bells'},
  P6:{t:'It kept my office company for eighteen years, and we lost track of each other in the move. I am so glad she was found.',at:'bells'},
  P7:{t:'In 1908 the University of Chicago hung ten bells in her memory, each inscribed with one of her virtues. That one reads, ‘Given to hospitality.’',at:'bells'},
  P8:{t:'She once said that death is ‘only a little door from one room to another.’ I am in a position to confirm it. Check-out is back the way you came.',at:'bells'},
  B1:{t:'It is people that count.',who:'ALICE FREEMAN PALMER'},
  B2:{t:'Life becomes a glory instead of a grind.',who:'ALICE FREEMAN PALMER'}
});

// ---------- the show: P1 on the door, the chase of doors, Housekeeping, the bust ----------
// Palmer's own line queue, fed to the engine one line at a time, so P4 can cut in right after whatever line is playing
var LQ=[], fedT=-9, quietT=0; H.onUpdate(function(dt){ quietT=(H.quiet() && H.stay.hinsdaleDone)?quietT+dt:0; });   // a line queued this frame is not on the caption yet: the door waits for 0.3 s of silence after Hinsdale is done (so C1 is not raced)
function say(id){ LQ.push(id); } function sayNext(id){ LQ.unshift(id); }
function hush(){ return !LQ.length && H.quiet() && H.t-fedT>0.2; }   // nothing of ours waiting and nobody speaking
H.onUpdate(function(){ var p=H.player(); if(LQ.length && p.x<440 && p.z<182) LQ.length=0;   // the party is back in the night corridor: no Palmer line follows them to check-out
  if(LQ.length && H.quiet() && H.t-fedT>0.2){ H.line(LQ.shift()); fedT=H.t; } });
show=H.cue([[0,function(){ reset(false); say('P1'); }]]);
var chaseDone=false, chaseT0=-1;
function lightStrip(i){ stripColor(i,CON); tw(1,function(p){ stripColor(i,tmpC.copy(CON).lerp(CDIM,p)); }); }
var chaseCue=H.cue([[0,function(){ chaseT0=H.t; lampMat.emissiveIntensity=0; slateMat.emissiveIntensity=0.05; say('P2'); say('P3'); }]]
  .concat(DOORS.map(function(d,i){ return [0.72*i,function(){ lightStrip(i); H.sfx.noise(0.18,500,0.5,{x:d.x,z:d.z}); }]; }))
  .concat([[4.4,function(){ chaseDone=true; }]]));
var chaseZ=H.zone({x1:462,z1:157,x2:520,z2:208,once:true,when:function(){ return d1872.isOpen; },enter:function(){ chaseCue.go(); }});

var drop={t:-1,fired:false,p4:false,px:0,vx:0};
function fireDrop(){ drop.t=0; drop.fired=true; dropL.intensity=0.8; lightTo(dropL,0,1);
  H.sfx.bang({x:632,z:183}); H.sfx.whisper({x:632,z:183}); H.scare('HOUSEKEEPING!',1.4); later(2,function(){ sayNext('P4'); drop.p4=true; }); }
var dropZ=H.zone({x1:600,z1:157,x2:622,z2:208,once:true,when:function(){ return chaseT0>=0 && !studyZ.fired && drop.vx>0.15 && H.heading(1,0); },enter:fireDrop});   // walking and facing east, once per party (reset() re-arms it)
H.onUpdate(function(dt){
  var hx=H.headPos().x; if(dt>0) drop.vx+=(Math.max(-3,Math.min(3,(hx-drop.px)/dt))-drop.vx)*Math.min(1,dt*5); drop.px=hx;   // head speed east, m/s
  if(drop.t>=0){ drop.t+=dt; var t=drop.t, y;
    if(t<1.9) y=Math.max(Y1,Y0-(Y0-Y1)*(1-Math.exp(-12*t)*Math.cos(18*t)));   // snap down onto the stop cord, bounce, hold 1.5 s
    else { y=Math.min(Y0,Y1+(t-1.9)*0.8); if(y>=Y0) drop.t=-1; }     // winch back up at 0.8 m/s
    ghost.position.y=y; ghost.rotation.z=0.07*Math.sin(t*4.2)*Math.exp(-t*0.7); }
});

// the bust. The spec's timeline (T=P5+P6+0.5: sheet; T+1: face; T+2.5: B1; +B1+0.8: B2; +B2+1: bells; +4: P7/P8), but P5 queues straight
// behind P3 and each "after a line" step waits for the captions to actually finish, so a slow voice never puts her mouth out of sync
var pendingSay=null;
function pullSheet(){ H.sfx.noise(0.7,1300,0.22,{x:684,z:182,decay:1});
  tw(0.8,function(p){ var e=p*p*(3-2*p); sheet.position.x=(682*SC)+0.4*e; sheet.position.y=SHEET_Y+(0.3-SHEET_Y)*e; sheet.rotation.z=-1.2*e; },function(){ sheet.visible=false; }); }
function projector(on,d){ fadeTo(faceMat,on?0.9:0,d); fadeTo(beamMat,on?0.06:0,d); fadeTo(spillMat,on?0.2:0,d); lensMat.emissiveIntensity=on?0.9:0; }
function bustSay(id){ say(id); pendingSay={id:id,t:H.t}; }   // her mouth moves when her caption actually comes up
function seq(steps){ var q={i:-1,t:0,w:0,ok:false}; q.go=function(){ q.i=0; q.t=0; q.w=0; q.ok=false; }; q.stop=function(){ q.i=-1; }; q.running=function(){ return q.i>=0; };
  H.onUpdate(function(dt){ if(q.i<0) return; var st=steps[q.i]; if(!st){ q.i=-1; return; }
    if(st.quiet && !q.ok){ q.w+=dt; if(hush() || q.w>st.quiet) q.ok=true; else return; }   // {quiet: max seconds to wait for silence}
    q.t+=dt; if(q.t>=(st.after||0)){ st.fn(); q.i++; q.t=0; q.w=0; q.ok=false; } });
  H.shows.push(q); return q; }
var bustSeq=seq([{fn:function(){ say('P5'); say('P6'); }},
  {quiet:120,after:0.5,fn:pullSheet},
  {after:1,fn:function(){ projector(true,1.5); lightTo(spotL,0.9,1.5); }},
  {after:1.5,fn:function(){ bustSay('B1'); }},
  {quiet:15,after:0.8,fn:function(){ bustSay('B2'); }},
  {quiet:15,after:1,fn:startRing},
  {after:4,fn:function(){ say('P7'); say('P8'); H.stay.palmerDone=true; ring.hold=H.t+H.lineDur('P7'); }}]);
var studyZ=H.zone({x1:622,z1:157,x2:698,z2:208,once:true,when:function(){ return chaseT0>=0 && (drop.fired?drop.p4:H.t-chaseT0>8); },enter:function(){ bustSeq.go(); }});   // anywhere past the drop, once P4 is queued
H.onUpdate(function(dt){
  if(pendingSay){ var L=H.LINES[pendingSay.id];
    if(capLine()===L.t){ var d=H.lineDur(pendingSay.id); bust.speakUntil=H.t+d; H.sfx.noise(d,600,0.03,{type:'bandpass',q:0.8,x:682,z:182}); pendingSay=null; }
    else if(H.t-pendingSay.t>20) pendingSay=null; }
  faceScr.range=(faceMat.opacity>0.001||spillMat.opacity>0.001)?6:0;   // draw the face only while it is projected
});

// the bells: rounds twice, six rows of plain hunt, rounds (the real ring of 1908 is in E-flat; notes approximate)
var NOTES=[784,698.5,622.3,587.3,523.3,466.2,415.3,392,349.2,311.1], PM=[0.5,1,1.2,1.5,2], PG=[0.5,0.7,0.35,0.2,0.3], PD=[3.5,2.5,1.8,1.4,1.2];
var ring={on:false,t:0,i:0,a:0,list:[],bus:null,hold:0};
function ringRows(){ var r=[0,1,2,3,4,5,6,7,8,9], rows=[r.slice(),r.slice()];
  for(var k=0;k<6;k++){ for(var i=k%2;i+1<10;i+=2){ var a=r[i]; r[i]=r[i+1]; r[i+1]=a; } rows.push(r.slice()); }
  rows.push([0,1,2,3,4,5,6,7,8,9]); var list=[], t=0;
  rows.forEach(function(row,n){ row.forEach(function(b){ list.push({t:t,b:b}); t+=0.24; }); if(n%2) t+=0.24; });   // handstroke gap after each backstroke row
  return list; }
function bellBus(){ var ac=H.audio(); if(!ac) return null; try{   // one shared panner for every partial (not one per tone)
  var g=ac.createGain(), p=ac.createPanner(); g.gain.value=0.8; p.panningModel='HRTF'; p.distanceModel='inverse'; p.refDistance=1.2; p.rolloffFactor=1.3; p.maxDistance=40;
  if(p.positionX){ p.positionX.value=672*SC; p.positionY.value=2.3; p.positionZ.value=205*SC; } else p.setPosition(672*SC,2.3,205*SC);
  g.connect(p); p.connect(ac.destination); return g; }catch(e){ return null; } }
function strikeAudio(b,delay){ var ac=H.audio(); if(!ac||!ring.bus) return; try{ var t0=ac.currentTime+delay;
  for(var k=0;k<5;k++){ var o=ac.createOscillator(), g=ac.createGain(); o.frequency.value=NOTES[b]*PM[k];
    g.gain.setValueAtTime(0.0001,t0); g.gain.exponentialRampToValueAtTime(PG[k]*0.08,t0+0.006); g.gain.exponentialRampToValueAtTime(0.0001,t0+PD[k]);
    o.connect(g); g.connect(ring.bus); o.start(t0); o.stop(t0+PD[k]+0.05); } }catch(e){} }
function strikeVis(b){ bellFlash[b]=1; if(b===9 && (inscr.i<0 || H.t>=ring.hold)) setInscr((inscr.i+1)%3); }   // the tenor turns the plaque (held on HOSPITALITY through P7)
function startRing(){ ring.list=ringRows(); ring.on=true; ring.t=0; ring.i=0; ring.a=0; ring.hold=0; ring.bus=bellBus(); }
function stopBells(){ ring.on=false; var b=ring.bus; ring.bus=null;
  if(b){ try{ b.gain.setTargetAtTime(0.0001,H.audio().currentTime,0.05); setTimeout(function(){ try{ b.disconnect(); }catch(e){} },500); }catch(e){} }
  for(var i=0;i<10;i++){ bellFlash[i]=0; bells.setColorAt(i,BELL0); } bells.instanceColor.needsUpdate=true; }
H.onUpdate(function(dt){
  if(ring.on){ ring.t+=dt; var L=ring.list;
    while(ring.a<L.length && L[ring.a].t<ring.t+0.12){ strikeAudio(L[ring.a].b,Math.max(0,L[ring.a].t-ring.t)); ring.a++; }   // schedule a little ahead
    while(ring.i<L.length && L[ring.i].t<=ring.t){ strikeVis(L[ring.i].b); ring.i++; }
    if(ring.i>=L.length && ring.t>L[L.length-1].t+2.5){ ring.on=false; projector(false,2.5); lightTo(spotL,0.5,2.5); } }   // she fades; the bust stays lit
  var any=false; for(var i=0;i<10;i++) if(bellFlash[i]>0){ bellFlash[i]=Math.max(0,bellFlash[i]-dt/0.3); bells.setColorAt(i,tmpC.copy(BELL0).lerp(BELL1,bellFlash[i])); any=true; }
  if(any) bells.instanceColor.needsUpdate=true;
});

// ---------- reset: back to idle for the next party (the show's t0 does the same, minus the door) ----------
function reset(full){
  if(full) d1872.close();
  mine.forEach(function(w){ w.dead=true; }); mine.length=0; chaseCue.stop(); bustSeq.stop(); LQ.length=0;
  for(var i=0;i<6;i++) strips.setColorAt(i,C0); strips.instanceColor.needsUpdate=true; lampMat.emissiveIntensity=0.8; slateMat.emissiveIntensity=0.3;
  drop.t=-1; drop.fired=false; drop.p4=false; drop.vx=0; ghost.position.y=Y0; ghost.rotation.z=0; dropL.intensity=0;
  sheet.visible=true; sheet.position.set(682*SC,SHEET_Y,182.5*SC); sheet.rotation.set(0,0,0);
  faceMat.opacity=0; beamMat.opacity=0; spillMat.opacity=0; lensMat.emissiveIntensity=0; spotL.intensity=0; bust.speakUntil=0; pendingSay=null;
  stopBells(); setInscr(-1);
  chaseDone=false; chaseT0=-1; chaseZ.fired=false; dropZ.fired=false; studyZ.fired=false;
}
H.resets.push(function(){ reset(true); });
var wasOpen=false; H.onUpdate(function(){ if(wasOpen && !d1872.isOpen) reset(false); wasOpen=d1872.isOpen; });   // the door auto-closed: the party has gone

H.onBegin(function(){ H.stations.forEach(function(s){ if(s.n===5){ s.name='Suite 1872 · Palmer'; s.desc='one little door · the lost bust speaks'; } }); });
H.palmer={door:d1872,reset:reset,ghost:ghost,sheet:sheet,ring:ring,bust:bust,chase:function(){ return chaseDone; }};   // debug handle
})();
