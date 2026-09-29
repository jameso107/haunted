/* Hotel Alice Lloyd: Suite 1912 · Hinsdale, "The Oral Examination" (Room 3, the old Bust bay: x 440-528, z 247-388).
   The examining committee are two talking plaster busts (invented, unnamed); Dr. Hinsdale is never a figure: her chair is
   empty and her portrait hangs behind it. Tech wow: a three-button exam that grades you and a VOTES tally that slams to 4611.
   Scare: the Examiner, half out of the backlit window. */
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
var PI=Math.PI, stageEl=document.getElementById('stage');

// ---------- lines (verbatim from the narration script) ----------
var LN={
  H1:{at:'committee',t:'Suite 1912 belongs to Dr. Mary Louise Hinsdale, not to her father Burke, whose name was already on a men’s house. She published A History of the President’s Cabinet in 1911 and took her doctorate here in 1912.'},
  H2:{at:'committee',t:'One examiner admitted, ‘She began to ask us questions which we could not answer,’ then found her standing between him and the door and a colleague already climbing out the window. Tonight she examines you, and I shall read her questions.'},
  HQ1:{at:'committee',t:'Question the first: does the word ‘cabinet’ appear anywhere in the Constitution of the United States? One, yes. Two, no. Three, only in an amendment.'},
  HQ1r:{at:'committee',t:'Correct. The Constitution speaks only of ‘the principal Officer in each of the executive Departments.’ The Cabinet is a custom.'},
  HQ1w:{at:'committee',t:'Not once. The Constitution speaks only of ‘the principal Officer in each of the executive Departments.’ The Cabinet is a custom, not a clause.'},
  HQ2:{at:'committee',t:'Question the second: in 1919, the year before the Nineteenth Amendment, she ran statewide for Superintendent of Public Instruction. How many votes did she receive: one, 4,611; two, 46,110; or three, 461,100?'},
  HQ2r:{at:'committee',t:'Four thousand six hundred and eleven. She lost, ran again in 1921, and helped found the Grand Rapids League of Women Voters besides.'},
  HQt:{at:'committee',t:'Silence. The committee makes a note.'},
  H6:{at:'committee',t:'Ah. The committee is leaving by the window again.'},
  H7:{at:'committee',t:'This hall was dedicated in Hinsdale Lounge on the third of December, 1950. I was not there to see it; I had already moved upstairs. Miss Freeman is waiting at the end of the staff wing.'},
  CM1:{who:'THE COMMITTEE',t:'Is she here already?'},
  CM2:{who:'THE COMMITTEE',t:'We could not answer that one either.'},
  CM3:{who:'THE COMMITTEE',t:'She will only ask a harder one.'}
}; H.addLines(LN);

// ---------- structure (scene level) ----------
var exam={start:function(){}};
H.curtain(440,245,440,286); H.curtain(440,358,440,390);          // R3WN, R3WS
var d1912=H.suiteDoor({x1:440,z1:320,x2:440,z2:358,approach:1,plate:['1912 · HINSDALE'],num:'1912',
  ready:function(){ return !!H.stay.kleinDone; }, onOpen:function(){ exam.start(); }});   // plate and reader face the boardwalk
H.sign(['SUITE 1912'],{w:256,h:96,fs:44,bg:'#1d1a16',fg:'#d9b76a',border:'#8a6a2a',bw:5,glow:0.75},0.36,0.13,439.4,2.36,339,-PI/2);   // lit transom card over the door
H.curtain(440,272,465,272); H.curtain(500,272,528,272);          // R3N: the window wall; the Examiner's pocket (z 247-272) lies behind it
H.seg(465,272,500,272); H.map.curtains.push([465,272,500,272,'#9cc4e8']);   // the window opening is not walkable
[[497,295,517,295],[517,295,517,345],[517,345,497,345],[497,345,497,295],[486,322,494,322],[494,322,494,334],[494,334,486,334],[486,334,486,322]].forEach(function(s){ H.seg(s[0],s[1],s[2],s[3]); });   // table, lectern
H.grille('committee',527.8,2.2,345,-PI/2);
var lampL=H.plight(507,320,1.25,0xfff0c0,0.55,6);                         // banker's lamps
var winL=H.plight(482,262,1.6,0xbfd8ff,0,4);                              // backlight behind the window
var bustL=H.spot(470,320,2.5,522,320,1.4,0xcfe0ff,0.35,5,0.5,0.5);        // the busts' projector spill

// ---------- content (culled to the room and the boardwalk) ----------
var G=H.cull(H.group(0,0),[[300,240,535,392]]);
function mg(list,mat){ var m=H.merge(list,mat); G.add(m); return m; }
var plaster=H.lam(0xe8e4dc), black=H.lam(0x121216), wd=[], br=[], bl=[];
function card(w,h,o,lines){ return H.canvasTex(w,h,function(g){ g.fillStyle=o.bg; g.fillRect(0,0,w,h);
  for(var i=0;i<(o.speck||0);i++){ g.fillStyle='rgba(60,40,10,'+(Math.random()*0.09)+')'; g.fillRect(Math.random()*w,Math.random()*h,2,2); }
  if(o.border){ var n=o.inset||8; g.strokeStyle=o.border; g.lineWidth=o.bw||6; g.strokeRect(n,n,w-2*n,h-2*n); if(o.double){ g.lineWidth=1.5; g.strokeRect(n+8,n+8,w-2*n-16,h-2*n-16); } }
  g.fillStyle=o.fg; g.strokeStyle=o.fg; g.textAlign='center'; g.textBaseline='middle';
  lines.forEach(function(L){ if(L[0]==='-'){ g.lineWidth=2; g.beginPath(); g.moveTo(w*0.3,L[2]); g.lineTo(w*0.7,L[2]); g.stroke(); return; }
    var fs=L[1], st=L[3]==null?'bold ':L[3]; g.font=st+fs+'px Georgia,serif';
    while(g.measureText(L[0]).width>w-2*(o.pad||18) && fs>7){ fs--; g.font=st+fs+'px Georgia,serif'; } g.fillText(L[0],w/2,L[2]); }); }); }

// the window flat in R3N (x 465-500): sill, header, frame (lower sash raised), a roller blind, and the pocket's backlight
mg([H.box(1.4,0.8,0.06,M.wallBack,482.5,0.4,272), H.box(1.4,0.45,0.06,M.wallBack,482.5,2.325,272)]);
var roll=H.cyl(0.035,0.035,1.44,M.column,482.5,2.07,273.6,10); roll.rotation.z=PI/2;
mg([H.box(0.06,1.3,0.03,M.column,465,1.45,272), H.box(0.06,1.3,0.03,M.column,500,1.45,272), H.box(1.4,0.05,0.03,M.column,482.5,1.95,272),
  H.box(1.52,0.04,0.14,M.column,482.5,0.82,273.4), roll]);
var blind=H.plane(1.4,1.3,H.lam(0xffffff,{map:H.canvasTex(128,128,function(g,w,h){ g.fillStyle='#e8dcc0'; g.fillRect(0,0,w,h);
  for(var y=0;y<h;y+=3){ g.fillStyle='rgba(120,100,60,'+(0.05+Math.random()*0.05)+')'; g.fillRect(0,y,w,1); }
  g.fillStyle='#b8a47c'; g.fillRect(0,h-10,w,10); g.strokeStyle='#6a5a3a'; g.lineWidth=2; g.beginPath(); g.arc(w/2,h-16,4,0,7); g.stroke(); })}),482.5,1.45,272.7,0,G);
function blindAt(p){ blind.scale.y=1-0.92*p; blind.position.y=1.45+0.6*p; }
var backMat=H.glow(0xbfd8ff,0); H.plane(1.2,1.2,backMat,482.5,1.45,262,0,G);

// committee table (green baize), exam papers, two banker's lamps
H.box(0.8,0.76,2.0,H.lam(0x1f3a2a),507,0.38,320,0,G);
var pp=H.box(0.21,0.004,0.3,M.paper,505,0.762,300); pp.rotation.y=0.2;
var pq=H.box(0.21,0.004,0.3,M.paper,506,0.762,341); pq.rotation.y=-0.15;
mg([pp,pq,H.box(0.22,0.03,0.3,M.paper,511,0.775,318)]);
var shades=[];
[305,335].forEach(function(z){ br.push(H.cyl(0.07,0.08,0.02,M.brass,507,0.77,z,16), H.cyl(0.012,0.012,0.17,M.brass,507,0.86,z,8));
  var s=new THREE.Mesh(new THREE.CylinderGeometry(0.065,0.065,0.26,12,1,false,PI/2,PI)); s.rotation.x=PI/2; s.position.set(507*SC,0.95,z*SC); H.scene.add(s); shades.push(s); });
mg(shades,H.glow(0x3a9a5a,0.6,{side:THREE.DoubleSide}));

// Dr. Hinsdale's empty high-backed chair, facing west, and her portrait above it
wd.push(H.box(0.42,0.05,0.44,M.woodDark,522.5,0.45,320), H.box(0.04,0.7,0.42,M.woodDark,527.1,0.82,320), H.box(0.05,0.07,0.48,M.woodDark,527.1,1.19,320));
[[518,315],[518,325],[527,315],[527,325]].forEach(function(p){ wd.push(H.box(0.04,0.43,0.04,M.woodDark,p[0],0.215,p[1])); });
H.plane(0.5,0.62,H.lam(0xffffff,{map:H.canvasTex(256,320,function(g,w,h){ g.fillStyle='#1a140e'; g.fillRect(0,0,w,h);
  var gr=g.createRadialGradient(128,130,10,128,150,140); gr.addColorStop(0,'#cdb183'); gr.addColorStop(0.55,'#9c7f55'); gr.addColorStop(1,'#2e2216');
  g.fillStyle=gr; g.beginPath(); g.ellipse(128,150,106,134,0,0,7); g.fill();
  g.fillStyle='#2b2018'; g.beginPath(); g.moveTo(36,290); g.bezierCurveTo(44,226,86,210,128,208); g.bezierCurveTo(170,210,212,226,220,290); g.closePath(); g.fill();
  g.fillStyle='#8a7050'; for(var b=0;b<4;b++){ g.beginPath(); g.arc(128,232+b*14,2.2,0,7); g.fill(); }
  g.fillStyle='#d9c7a2'; g.beginPath(); g.moveTo(103,216); g.lineTo(106,170); g.quadraticCurveTo(128,177,150,170); g.lineTo(153,216); g.quadraticCurveTo(128,224,103,216); g.fill();   // the high collar
  g.strokeStyle='rgba(90,70,45,.55)'; g.lineWidth=1; for(var y=178;y<214;y+=6){ g.beginPath(); g.moveTo(106,y); g.quadraticCurveTo(128,y+5,150,y); g.stroke(); }
  var fg=g.createRadialGradient(122,128,4,128,136,46); fg.addColorStop(0,'#ead7b3'); fg.addColorStop(1,'#b39570');
  g.fillStyle=fg; g.beginPath(); g.ellipse(128,132,30,40,0,0,7); g.fill();
  g.fillStyle='#34261a'; g.beginPath(); g.moveTo(96,136); g.bezierCurveTo(90,90,110,82,128,84); g.bezierCurveTo(146,82,166,90,160,136); g.bezierCurveTo(158,110,146,100,128,101); g.bezierCurveTo(110,100,98,110,96,136); g.fill();
  g.beginPath(); g.ellipse(128,80,19,11,0,0,7); g.fill();
  g.fillStyle='#3a2a1c'; g.beginPath(); g.ellipse(116,128,5,2.4,0,0,7); g.ellipse(140,128,5,2.4,0,0,7); g.fill();
  g.strokeStyle='#4a3522'; g.lineWidth=1.6; g.beginPath(); g.moveTo(108,121); g.quadraticCurveTo(116,118,123,121); g.moveTo(133,121); g.quadraticCurveTo(140,118,148,121); g.stroke();
  g.strokeStyle='#8a6c4a'; g.lineWidth=1.3; g.beginPath(); g.moveTo(128,130); g.lineTo(125,146); g.lineTo(131,148); g.stroke();
  g.strokeStyle='#7a4e3a'; g.lineWidth=1.8; g.beginPath(); g.moveTo(119,157); g.quadraticCurveTo(128,160,137,157); g.stroke();
  g.textAlign='center'; g.textBaseline='middle';
  g.fillStyle='#2b2119'; g.fillRect(0,290,256,28); g.fillStyle='#d9b76a';
  g.font='bold 13px Georgia,serif'; g.fillText('DR. MARY LOUISE HINSDALE',128,299); g.font='10px Georgia,serif'; g.fillText('PH.D. MICHIGAN 1912',128,311); })}),527.8,1.6,320,-PI/2,G);
br.push(H.box(0.03,0.04,0.58,M.brass,527.6,1.93,320), H.box(0.03,0.04,0.58,M.brass,527.6,1.27,320), H.box(0.03,0.7,0.04,M.brass,527.6,1.6,313.25), H.box(0.03,0.7,0.04,M.brass,527.6,1.6,326.75));

// the VOTES tally board above her portrait: four red seven-segment digits
var tally={v:0,slam:-9}, SEG=[0x3f,0x06,0x5b,0x4f,0x66,0x6d,0x7d,0x07,0x7f,0x6f];
function digit(g,x,y,d,hot){ var W=28,Hh=46,T=5,h2=Hh/2,s=h2-T*1.5, r=[[T,0,W-2*T,T],[W-T,T,T,s],[W-T,h2+T/2,T,s],[T,Hh-T,W-2*T,T],[0,h2+T/2,T,s],[0,T,T,s],[T,h2-T/2,W-2*T,T]];
  g.save(); g.translate(x,y); g.transform(1,0,-0.08,1,3,0);
  for(var k=0;k<7;k++){ var on=SEG[d]&(1<<k); g.fillStyle=on?(hot?'#ffb49a':'#ff3a22'):'#2a0907'; g.shadowColor=on?'#ff2a10':'rgba(0,0,0,0)'; g.shadowBlur=on?8:0; g.fillRect(r[k][0],r[k][1],r[k][2],r[k][3]); }
  g.restore(); }
function drawTally(g,t,w,h){ if(!G.visible) return; g.fillStyle='#0b0807'; g.fillRect(0,0,w,h); g.strokeStyle='#6a4e22'; g.lineWidth=3; g.strokeRect(2,2,w-4,h-4);
  g.fillStyle='#d9b76a'; g.font='bold 19px Georgia,serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('VOTES',50,33);
  var s=('0000'+tally.v).slice(-4), hot=t-tally.slam<0.35; for(var i=0;i<4;i++) digit(g,104+i*38,9,+s[i],hot); }
var tallyScr=H.screen(256,64,drawTally,{x:520,z:320,range:8,every:2});
var tallyM=H.plane(0.8,0.2,new THREE.MeshBasicMaterial({map:tallyScr.tex}),527.5,2.42,320,-PI/2,G);
wd.push(H.box(0.02,0.26,0.86,M.woodDark,527.9,2.42,320));

// two committee busts on plinths flanking her chair; their faces are projected (holo) canvases
var bust=[{z:300,a:1,expr:'idle',speakUntil:0,blinkUntil:0,nextBlink:2.2,lx:0,ly:0,turn:0,dart:0,dx:0,dy:0},
          {z:340,a:0,expr:'idle',speakUntil:0,blinkUntil:0,nextBlink:4.1,lx:0,ly:0,turn:0,dart:0,dx:0,dy:0}];
var pl=[], plinths=[], tmpG=[];
bust.forEach(function(b){ var g=H.group(522,b.z,-PI/2); tmpG.push(g);
  function add(geo,list,y,sx,sy,sz,x,z){ var m=new THREE.Mesh(geo,plaster); m.position.set(x||0,y,z||0); m.scale.set(sx,sy,sz); g.add(m); list.push(m); }
  add(new THREE.SphereGeometry(0.12,24,16),pl,1.45,.85,1.1,.95);
  add(new THREE.CylinderGeometry(0.045,0.055,0.16,12),pl,1.3,1,1,1);
  add(new THREE.SphereGeometry(0.21,20,8,0,PI*2,0,PI/2),pl,1.11,1,.62,.6);
  add(new THREE.CylinderGeometry(0.1,0.12,0.07,16),pl,1.095,1,1,.8);            // socle between plinth and shoulders
  add(new THREE.BoxGeometry(0.17,0.06,0.17),bl,1.575,1,1,1);                    // mortarboard: cap and board
  add(new THREE.BoxGeometry(0.3,0.012,0.3),bl,1.612,1,1,1);
  add(new THREE.BoxGeometry(0.008,0.11,0.008),br,1.56,1,1,1,0.135,0.05);        // tassel
  g.updateMatrixWorld(true); plinths.push(H.cyl(0.15,0.18,1.06,H.lam(0x2c2c32),522,0.53,b.z,12)); });
mg(pl,plaster); mg(plinths); tmpG.forEach(function(g){ H.scene.remove(g); });
function drawFace(g,t,w,h,b){ if(!G.visible) return;
  var e=b.expr, cx=64+b.turn, ey=56, sp=t<b.speakUntil, blink=t<b.blinkUntil, gasp=e==='gasp';
  g.fillStyle='#000'; g.fillRect(0,0,w,h);
  var gr=g.createRadialGradient(cx,60,6,cx,64,54); gr.addColorStop(0,'#868c96'); gr.addColorStop(0.65,'#636870'); gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr; g.beginPath(); g.ellipse(cx,64,40,54,0,0,7); g.fill();
  g.strokeStyle='rgba(0,0,0,.35)'; g.lineWidth=1.2; g.beginPath(); g.moveTo(cx-14,33); g.quadraticCurveTo(cx,30,cx+14,33); g.moveTo(cx-11,38); g.quadraticCurveTo(cx,35,cx+11,38); g.stroke();
  if(b.a){ g.strokeStyle='#aeb2b8'; g.lineWidth=2; for(var i=0;i<7;i++){ g.beginPath(); g.moveTo(cx-37+i,50-i*3); g.lineTo(cx-30+i*1.5,28+i*2); g.moveTo(cx+37-i,50-i*3); g.lineTo(cx+30-i*1.5,28+i*2); g.stroke(); } }
  else { var hl=g.createRadialGradient(cx-6,22,1,cx-6,22,14); hl.addColorStop(0,'rgba(235,238,242,.7)'); hl.addColorStop(1,'rgba(0,0,0,0)'); g.fillStyle=hl; g.fillRect(cx-22,8,32,30);
    g.strokeStyle='#b0b4ba'; g.lineWidth=2.4; for(var j=0;j<9;j++){ g.beginPath(); g.moveTo(cx-35+j*0.4,50+j*4); g.lineTo(cx-28+j*0.6,54+j*4.5); g.moveTo(cx+35-j*0.4,50+j*4); g.lineTo(cx+28-j*0.6,54+j*4.5); g.stroke(); } }
  [-1,1].forEach(function(s){ var ex=cx+s*15;
    g.fillStyle='rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(ex,ey,11,7,0,0,7); g.fill();
    if(blink){ g.strokeStyle='#000'; g.lineWidth=2; g.beginPath(); g.moveTo(ex-7,ey); g.quadraticCurveTo(ex,ey+2,ex+7,ey); g.stroke(); }
    else { g.fillStyle='#d4d7dc'; g.beginPath(); g.ellipse(ex,ey,7.5,gasp?6:4.5,0,0,7); g.fill();
      g.fillStyle='#000'; g.beginPath(); g.arc(ex+Math.max(-4.5,Math.min(4.5,b.lx)),ey+Math.max(-2,Math.min(2,b.ly)),gasp?2.2:2.8,0,7); g.fill(); }
    var by=e==='nervous'?[47,41]:gasp?[41,39]:e==='window'?[45,47]:[46,45];   // brow outer, inner heights
    g.strokeStyle='#000'; g.lineWidth=b.a?3:4; g.beginPath(); g.moveTo(ex+s*9,by[0]); g.quadraticCurveTo(ex,Math.min(by[0],by[1])-3,ex-s*7,by[1]); g.stroke();
    if(b.a){ g.lineWidth=2.2; g.beginPath(); g.arc(ex,ey,10,0,7); g.stroke(); } });
  if(b.a){ g.lineWidth=2; g.strokeStyle='#000'; g.beginPath(); g.moveTo(cx-5,ey-2); g.quadraticCurveTo(cx,ey-5,cx+5,ey-2); g.moveTo(cx-25,ey-1); g.lineTo(cx-36,ey-3); g.moveTo(cx+25,ey-1); g.lineTo(cx+36,ey-3); g.stroke(); }
  g.strokeStyle='rgba(0,0,0,.7)'; g.lineWidth=2; g.beginPath(); g.moveTo(cx+2,ey+5); g.quadraticCurveTo(cx+6,ey+16,cx+4,ey+21); g.lineTo(cx-3,ey+22); g.stroke();
  var mh=sp?3+9*(0.5+0.5*Math.sin(29*t)):2;
  g.fillStyle='#000'; g.beginPath(); if(gasp&&!sp) g.ellipse(cx,ey+35,5.5,7,0,0,7); else g.ellipse(cx,ey+34,9,mh/2+0.5,0,0,7); g.fill();
  if(b.a){ g.fillStyle='#b4b8be'; g.beginPath(); g.moveTo(cx-17,ey+33); g.quadraticCurveTo(cx-10,ey+22,cx,ey+27); g.quadraticCurveTo(cx+10,ey+22,cx+17,ey+33); g.quadraticCurveTo(cx+8,ey+29,cx,ey+31); g.quadraticCurveTo(cx-8,ey+29,cx-17,ey+33); g.fill(); }
  g.fillStyle='rgba(0,0,0,.08)'; for(var y=0;y<h;y+=4) g.fillRect(0,y,w,1); }
var faceGeo=new THREE.SphereGeometry(0.123,24,16,0,PI);
bust.forEach(function(b){ b.scr=H.screen(128,128,function(g,t,w,h){ drawFace(g,t,w,h,b); },{x:522,z:320,range:6,every:2});
  var fm=H.holoMat(b.scr.tex); fm.opacity=0.9; var m=new THREE.Mesh(faceGeo,fm); m.position.set(522*SC,1.45,b.z*SC); m.rotation.y=-PI/2; m.scale.set(.85,1.1,.95); G.add(m); });
bl.push(H.box(0.25,0.12,0.3,black,470,2.6,320));   // the busts' projector on the ceiling

// oak lectern with three brass answer buttons and its card
H.box(0.32,1.1,0.46,M.wood,490,0.55,328,0,G);
var zBtn=[324.5,328,331.5], BR=new THREE.Color(0xb8873b), OFF=new THREE.Color(0x0a0806), cT=new THREE.Color(), m4=new THREE.Matrix4();
var btns=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035,0.04,0.03,16),new THREE.MeshBasicMaterial({color:0xffffff}),3); btns.frustumCulled=false;
for(var i=0;i<3;i++){ m4.makeTranslation(490*SC,1.115,zBtn[i]*SC); btns.setMatrixAt(i,m4); btns.setColorAt(i,OFF); } G.add(btns);
H.sign(['1 · 2 · 3'],{w:256,h:128,fs:62,bg:'#1d1a16',fg:'#d9b76a',border:'#8a6a2a',bw:6,glow:0.85},0.2,0.1,485.8,0.95,328,-PI/2,G);

// the Cabinet: a glass-front bookcase on the south wall, her 1911 book face-out, and the scholar at work inside
wd.push(H.box(1.2,1.8,0.02,M.woodDark,503,0.9,386.75), H.box(0.02,1.8,0.4,M.woodDark,488.25,0.9,382), H.box(0.02,1.8,0.4,M.woodDark,517.75,0.9,382),
  H.box(1.24,0.03,0.42,M.woodDark,503,1.815,382), H.box(1.2,0.08,0.4,M.woodDark,503,0.04,382), H.box(1.16,0.02,0.38,M.woodDark,503,0.56,382), H.box(1.16,0.02,0.38,M.woodDark,503,1.52,382),
  H.box(0.03,1.72,0.02,M.woodDark,488.8,0.95,376.9), H.box(0.03,1.72,0.02,M.woodDark,517.2,0.95,376.9), H.box(0.03,1.72,0.02,M.woodDark,503,0.95,376.9),
  H.box(1.16,0.03,0.02,M.woodDark,503,0.1,376.9), H.box(1.16,0.03,0.02,M.woodDark,503,1.795,376.9));
br.push(H.box(0.015,0.05,0.015,M.brass,502.3,0.95,376.5));
H.seg(488,376.5,518,376.5); H.seg(488,376.5,488,388); H.seg(518,376.5,518,388);   // the glass front and sides are solid
var books=new THREE.InstancedMesh(new THREE.BoxGeometry(0.035,0.24,0.17),H.lam(0xffffff),48), bc=[0x7a2622,0x2c5236,0x283a66], rnd=H.rng(1912), nb=0, dm=new THREE.Object3D();
books.frustumCulled=false;
function shelf(y,x0,x1){ for(var x=x0;x<x1&&nb<48;){ var s=0.85+rnd()*0.25; dm.position.set((x+0.45)*SC,y+0.12*s,384.3*SC); dm.scale.set(1,s,1); dm.updateMatrix();
  books.setMatrixAt(nb,dm.matrix); books.setColorAt(nb,cT.setHex(bc[(rnd()*3)|0])); nb++; x+=0.95+rnd()*0.25; } }
shelf(0.08,489.2,507); shelf(0.57,489.2,496.5); shelf(1.53,489.5,510); books.count=nb; G.add(books);
H.plane(0.17,0.24,H.lam(0xffffff,{map:card(180,256,{bg:'#23321f',fg:'#d9b76a',border:'#9a7a3a',bw:3,inset:6,pad:14},
  [['A HISTORY',22,54],['OF THE',16,82],['PRESIDENT’S',22,110],['CABINET',26,140],['-',0,170],['M. L. HINSDALE',15,196],['1911',16,224,'']])}),513,0.695,383.5,PI,G);
var scholarMat=H.holoMat(H.canvasTex(128,320,function(g,w,h){ g.fillStyle='#000'; g.fillRect(0,0,w,h);
  g.shadowColor='#bcd4ff'; g.shadowBlur=10; g.fillStyle='rgba(190,212,255,0.85)'; g.strokeStyle='rgba(190,212,255,0.85)';
  g.fillRect(6,196,58,6); g.fillRect(10,202,4,108); g.fillRect(56,202,4,108); g.fillRect(20,190,22,4);                          // writing desk and paper
  g.beginPath(); g.moveTo(66,214); g.quadraticCurveTo(102,228,112,312); g.lineTo(50,312); g.quadraticCurveTo(56,260,66,214); g.fill();   // skirt
  g.beginPath(); g.moveTo(66,222); g.quadraticCurveTo(62,170,72,140); g.quadraticCurveTo(84,128,94,134); g.quadraticCurveTo(102,176,100,224); g.closePath(); g.fill();
  g.fillRect(70,122,11,14); g.beginPath(); g.arc(68,110,14,0,7); g.fill(); g.beginPath(); g.arc(78,96,8,0,7); g.fill();   // high collar, head, hair up
  g.lineWidth=8; g.lineCap='round'; g.beginPath(); g.moveTo(80,146); g.quadraticCurveTo(70,176,44,188); g.stroke();
  g.lineWidth=2; g.beginPath(); g.moveTo(42,190); g.lineTo(33,176); g.stroke();
  g.globalAlpha=0.4; g.fillRect(102,150,5,160); g.globalAlpha=1; }),0xcfe0ff);
H.plane(0.45,0.8,scholarMat,503,1.045,380.5,PI,G);
H.plane(1.16,1.72,new THREE.MeshBasicMaterial({color:0xcfe0ee,transparent:true,opacity:0.08,depthWrite:false}),503,0.95,376.8,PI,G);

// the 1919 handbill on R3WS, the dedication plaque on the south wall, the black-and-gold rug
H.plane(0.45,0.6,H.lam(0xffffff,{map:card(256,340,{bg:'#e6d8b4',fg:'#2a1d12',border:'#3a2a1a',bw:4,double:1,speck:900,pad:26},
  [['MARY L.',42,64],['HINSDALE',42,110],['FOR',20,150,'italic '],['SUPERINTENDENT OF',24,188],['PUBLIC INSTRUCTION',24,220],['-',0,250],['1919',40,286]])}),440.6,1.5,372,PI/2,G);
H.plane(0.5,0.3,H.lam(0xffffff,{map:card(512,308,{bg:'#3b2b1a',fg:'#e0c070',border:'#b8923a',bw:10,double:1,pad:34},
  [['ALICE LLOYD HALL',44,92],['DEDICATED IN HINSDALE LOUNGE',30,160,''],['DECEMBER 3, 1950',36,220]])}),462,1.5,387.8,PI,G);
G.add(H.floorPatch(445,276,525,386,H.lam(0xffffff,{map:H.canvasTex(256,352,function(g,w,h){ g.fillStyle='#0e0d0b'; g.fillRect(0,0,w,h);
  g.strokeStyle='#b8923a'; g.lineWidth=6; g.strokeRect(10,10,w-20,h-20); g.lineWidth=2; g.strokeRect(22,22,w-44,h-44);
  g.fillStyle='rgba(184,146,58,.5)'; for(var y=44;y<h-36;y+=24) for(var x=44+((y/24)%2)*12;x<w-36;x+=24){ g.beginPath(); g.moveTo(x,y-4); g.lineTo(x+4,y); g.lineTo(x,y+4); g.lineTo(x-4,y); g.fill(); }
  g.fillStyle='#0e0d0b'; g.beginPath(); g.ellipse(128,176,58,78,0,0,7); g.fill();
  g.strokeStyle='#c9a44a'; g.lineWidth=3; g.beginPath(); g.ellipse(128,176,56,76,0,0,7); g.stroke(); g.beginPath(); g.ellipse(128,176,38,56,0,0,7); g.stroke();
  for(var i=0;i<1400;i++){ g.fillStyle='rgba(0,0,0,'+(Math.random()*0.25)+')'; g.fillRect(Math.random()*w,Math.random()*h,2,2); } })})));

// the Examiner (invented staff): gowned, capped, leaning in through the window from the waist; hidden until the scare
var exTex=H.canvasTex(128,64,function(g,w,h){ g.fillStyle='#cfc2a8'; g.fillRect(0,0,w,h); var cx=32;
  g.fillStyle='#f4f0e6'; g.beginPath(); g.ellipse(cx-6,28,4.5,3.6,0,0,7); g.ellipse(cx+6,28,4.5,3.6,0,0,7); g.fill();
  g.fillStyle='#111'; g.beginPath(); g.arc(cx-6,28,1.5,0,7); g.arc(cx+6,28,1.5,0,7); g.fill();
  g.strokeStyle='#2a221a'; g.lineWidth=2; g.beginPath(); g.moveTo(cx-11,21); g.lineTo(cx-2,24); g.moveTo(cx+11,21); g.lineTo(cx+2,24); g.stroke();
  g.fillStyle='#1a0d0a'; g.beginPath(); g.ellipse(cx,42,5,6.5,0,0,7); g.fill();
  g.fillStyle='#e8e4dc'; g.fillRect(cx-16,30,4,16); g.fillRect(cx+12,30,4,16); });
var exMat=new THREE.MeshLambertMaterial({map:exTex,emissive:0xffffff,emissiveMap:exTex,emissiveIntensity:0.3});
var exr=H.group(482,258,0,G), up=new THREE.Group(); up.position.y=0.9; exr.add(up); exr.visible=false;
(function(){ var blk=[], skin=[];
  function part(geo,list,x,y,z){ var m=new THREE.Mesh(geo); m.position.set(x,y,z); H.scene.add(m); list.push(m); return m; }
  var gown=part(new THREE.CylinderGeometry(0.21,0.26,0.9,12),[],0,0.45,0); H.scene.remove(gown); gown.material=black; exr.add(gown);
  part(new THREE.CylinderGeometry(0.17,0.21,0.52,10),blk,0,0.26,0);                               // torso
  part(new THREE.CylinderGeometry(0.2,0.2,0.08,10),blk,0,0.5,0).scale.set(1.15,1,0.8);             // gown yoke
  part(new THREE.SphereGeometry(0.13,14,12),skin,0,0.64,0);                                        // head
  part(new THREE.BoxGeometry(0.17,0.06,0.17),blk,0,0.76,0);                                        // mortarboard
  part(new THREE.BoxGeometry(0.3,0.012,0.3),blk,0,0.795,0).rotation.set(0.1,PI/4,0.12);
  [-1,1].forEach(function(s){ var a=new THREE.Vector3(s*0.19,0.46,0), b=new THREE.Vector3(s*0.32,0.85,0.35), d=b.clone().sub(a);
    var arm=part(new THREE.CylinderGeometry(0.05,0.075,d.length(),8),blk,(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2); arm.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
    var hand=part(new THREE.SphereGeometry(0.055,8,6),skin,b.x,b.y+0.03,b.z+0.02), uv=hand.geometry.attributes.uv; for(var k=0;k<uv.count;k++) uv.setXY(k,0.9,0.5); });
  up.add(H.merge(blk,black)); up.add(H.merge(skin,exMat)); })();

// ---------- the exam that grades you: idle > intro > ask > wait > resp > lurk > scare > done ----------
var state='idle', score=0, q=0, waitT=0, hi=-1, T=[], inT=0, outT=0, shutT=0, shut=false, aborted=false, lurkT=0, lunge=-9, myCap='', capE=document.getElementById('caption');
function later(d,fn){ var w=H.after(d,fn); T.push(w); return w; }
function whenQuiet(fn){ var ok=false, w=H.tween(12,function(){ if(!ok && H.quiet() && G.visible){ ok=true; w.dead=true; fn(); } },function(){ if(!ok){ ok=true; if(G.visible) fn(); else whenQuiet(fn); } }); T.push(w); }   // the committee pauses while the party is out of the room (no exam line follows them into the staff wing)
function next(id,gap,fn){ later(H.lineDur(id)+gap,function(){ whenQuiet(fn); }); }   // after line id has played out and the captions are clear
function cancel(){ T.forEach(function(w){ w.dead=true; }); T.length=0; }
function setExpr(e){ bust.forEach(function(b){ b.expr=e; }); }
function cm(id,k){ var b=bust[k], d=H.lineDur(id); H.line(id); b.speakUntil=H.t+d;
  for(var i=0;i<d/0.24-1;i++) H.sfx.noise(0.2,520+Math.random()*200,0.03,{type:'bandpass',q:0.8,x:522,z:b.z,delay:i*0.24,decay:1}); }
function lightBtns(){ for(var k=0;k<3;k++) btns.setColorAt(k,state==='wait'?(k===hi?BR:cT.copy(BR).multiplyScalar(0.35)):OFF); btns.instanceColor.needsUpdate=true; }
function cap(t){ myCap=t; H.cap(t); }
function clearCap(){ if(myCap && stageEl && stageEl.textContent===myCap) H.cap(''); myCap=''; }
function hush(){ var c=capE?capE.textContent:''; if(c) for(var k in LN) if(c.indexOf(LN[k].t)>=0){ H.say([''],{interrupt:true,who:'',voice:false,hold:0.05}); return; } }   // cut the committee off, never another room
function restoreWindow(anim){ exr.visible=false; backMat.emissiveIntensity=0;
  if(anim){ T.push(H.tween(0.6,function(p){ blindAt(1-p); })); T.push(H.lightTo(winL,0,0.5)); } else { blindAt(0); winL.intensity=0; } }
function clear(){ cancel(); state='idle'; score=0; q=0; hi=-1; waitT=0; tally.v=0; tally.slam=-9; restoreWindow(false); setExpr('idle'); lightBtns(); clearCap();
  inT=0; outT=0; shutT=0; shut=false; lurkT=0; bust.forEach(function(b){ b.speakUntil=0; }); }
function reset(){ clear(); d1912.close(); }
H.resets.push(function(){ aborted=false; reset(); });
exam.start=function(){ if(state!=='idle' && !(state==='done' && aborted)) return; clear(); aborted=false; state='intro'; setExpr('nervous'); H.line('H1');
  next('H1',0.3,function(){ cm('CM1',0); next('CM1',0.4,function(){ H.line('H2'); next('H2',0.8,function(){ ask(1); }); }); }); };
function ask(n){ q=n; state='ask'; H.line('HQ'+n);
  next('HQ'+n,0,function(){ state='wait'; waitT=0; hi=-1; lightBtns();
    cap(H.renderer.xr.isPresenting?'Answer: look at a brass button and pull the trigger.':'Answer: press 1, 2 or 3, or look at a brass button and press Enter.'); }); }
function answer(k){ if(state!=='wait') return; H.sfx.noise(0.03,2600,0.4,{x:490,z:328}); H.sfx.tone(1400,0.06,0.08,{x:490,z:328}); respond(k); }
function respond(k){ state='resp'; hi=-1; clearCap();
  for(var i=0;i<3;i++) btns.setColorAt(i,i===k-1?BR:OFF); btns.instanceColor.needsUpdate=true; later(0.7,lightBtns);
  if(q===1){ if(k===2){ score++; H.line('HQ1r'); next('HQ1r',0.2,function(){ cm('CM3',1); next('CM3',0.6,function(){ ask(2); }); }); }
    else { setExpr('gasp'); later(1,function(){ if(state==='resp'||state==='ask') setExpr('nervous'); });
      H.line('HQ1w'); next('HQ1w',0.2,function(){ cm('CM2',0); next('CM2',0.6,function(){ ask(2); }); }); } }
  else { if(k===1) score++; race(); } }
function race(){ var last=0; T.push(H.tween(2.5,function(p){ tally.v=Math.round(4611*(1-Math.pow(1-p,3)));
    if(H.t-last>0.045+0.25*p*p){ last=H.t; H.sfx.noise(0.012,5200,0.12,{type:'highpass',x:527,z:320}); } },
  function(){ tally.v=4611; tally.slam=H.t; H.sfx.bang({x:527,z:320}); H.sfx.noise(0.03,4000,0.5,{x:527,z:320});
    later(0.6,function(){ whenQuiet(function(){ H.line('HQ2r'); next('HQ2r',0.3,function(){ setExpr('window'); H.line('H6'); next('H6',0.2,function(){ state='lurk'; lurkT=0; }); }); }); }); })); }
function reachZ(a){ return (0.88*Math.sin(a)+0.37*Math.cos(a)+0.06)/SC; }   // how far the Examiner's hands lead the gown's base (svg units) at lean a
function leanFit(want){ var h=H.headPos(), hx=h.x/SC, hz=h.z/SC, r=0.6/SC, dx=Math.max(0,Math.abs(hx-482)-8), lim=dx<r?hz-Math.sqrt(r*r-dx*dx):1e9, a=want,   // hands stay >= 0.6 m from the eye
    bz=Math.max(256,Math.min(265,lim-reachZ(a)));
  while(a>-0.2 && bz+reachZ(a)>lim) a-=0.05; exr.position.z=bz*SC; return a; }
function windowScare(){ state='scare'; T.push(H.tween(0.25,function(p){ blindAt(p); })); T.push(H.lightTo(winL,1.2,0.15)); backMat.emissiveIntensity=1;
  exr.position.set(482*SC,0,265*SC); exr.visible=true; lunge=H.t; up.rotation.x=leanFit(0.15);
  H.sfx.bang({x:482,z:272}); H.sfx.sting({x:482,z:272}); H.scare('RUN! SHE HAS A FOLLOW-UP QUESTION!',1.8); setExpr('gasp');
  later(2,function(){ restoreWindow(true); setExpr('idle'); H.line('H7'); H.stay.hinsdaleDone=true; H.stay.exam=score; state='done'; }); }
H.exam1912={state:function(){ return state; }, score:function(){ return score; }, start:function(){ exam.start(); }, expr:setExpr};   // debug hook
function abort(){ cancel(); hush(); restoreWindow(false); setExpr('idle'); hi=-1; state='done'; aborted=true; lightBtns(); clearCap(); outT=0; inT=0; H.stay.hinsdaleDone=true; H.stay.exam=score; }   // the next pass through restarts it

// input: look at a button + Enter / trigger / A, or the number keys
H.useIn(445,276,528,388,function(){ if(state==='wait' && hi>=0) answer(hi+1); });
window.addEventListener('keydown',function(e){ var k={Digit1:1,Digit2:2,Digit3:3,Numpad1:1,Numpad2:2,Numpad3:3}[e.code];
  if(k && state==='wait' && H.inBox(440,247,530,390)) answer(k); });

var fv=new THREE.Vector3(), dv=new THREE.Vector3();
H.onUpdate(function(dt,t){
  var vis=G.visible, core=H.inBox(455,276,528,388), run=state!=='idle'&&state!=='done';
  lampL.intensity=vis?0.55:0; bustL.intensity=vis?0.35:0; bust[0].scr.range=bust[1].scr.range=vis?6:0; tallyScr.range=vis?8:0;   // range 0: no canvas uploads while hidden
  if(state==='idle'){ inT=(H.started() && (!H.stay.hinsdaleDone||aborted) && core)?inT+dt:0; if(inT>2.5) exam.start(); }   // slipped in through the pine-lane gap
  else if(run){ outT=vis?0:outT+dt; if(outT>20) abort(); }                                                             // wandered well away mid-exam
  else { if(aborted){ inT=core?inT+dt:0; if(inT>2) exam.start(); } outT=vis?0:outT+dt; if(outT>20) reset(); }           // came back after leaving / ready for the next party
  if(run && shut && H.player().x>440){ d1912.gazeT=0; d1912.dwellT=0; if(d1912.isOpen && H.player().x>445) d1912.close(); }   // the shut door stays shut from inside
  if(state==='lurk'){ lurkT+=dt; blindAt(0.03+0.04*Math.max(0,Math.sin(t*5))); if(lurkT>4.5 || H.gaze(482,1.45,272,7,0.8)) windowScare(); }   // the blind twitches until someone looks
  if(state!=='idle' && !shut && d1912.isOpen){ shutT=H.inBox(452,280,528,388)?shutT+dt:0;                                             // the door shuts behind the party
    if(shutT>1.2){ shut=true; d1912.close(); H.sfx.noise(0.14,240,0.7,{x:440,z:339}); H.sfx.tone(70,0.18,0.3,{x:440,z:339}); } }
  if(state==='wait'){ waitT+=vis?dt:0; var best=-1, bd=0.97, h=H.headPos(); H.camera.getWorldDirection(fv);
    for(var k=0;k<3;k++){ dv.set(490*SC-h.x,1.115-h.y,zBtn[k]*SC-h.z); var L=dv.length(); if(L<1.6){ var c=fv.dot(dv.divideScalar(L||1)); if(c>bd){ bd=c; best=k; } } }
    if(best!==hi){ hi=best; lightBtns(); }
    if(waitT>10){ state='resp'; hi=-1; lightBtns(); clearCap(); H.line('HQt'); next('HQt',0.3,function(){ respond(0); }); } }
  if(!vis) return;
  var p=H.player();
  bust.forEach(function(b){ var a=Math.atan2(p.z-b.z,Math.max(8,522-p.x)), c=Math.max(-1,Math.min(1,a/0.9)), tx, ty, tt;
    if(b.expr==='window'){ var aw=Math.atan2(272-b.z,40); tx=aw*4; ty=-1.8; tt=aw*16; }
    else if(b.expr==='nervous'){ if(t>b.dart){ b.dart=t+0.25+Math.random()*0.45; b.dx=(Math.random()*2-1)*3.8; b.dy=(Math.random()*2-1)*1.3; } tx=b.dx; ty=b.dy; tt=c*4; }
    else if(b.expr==='gasp'){ tx=c*1.5; ty=-0.5; tt=c*3; }
    else { tx=c*3.4; ty=-0.8; tt=c*6; }
    var kk=Math.min(1,dt*(b.expr==='nervous'?30:8)); b.lx+=(tx-b.lx)*kk; b.ly+=(ty-b.ly)*kk; b.turn+=(tt-b.turn)*Math.min(1,dt*4);
    if(t>b.nextBlink){ b.blinkUntil=t+0.14; b.nextBlink=t+3+Math.random()*3; } });
  if(exr.visible){ var s=t-lunge; up.rotation.x=leanFit(0.15+0.45*Math.min(1,s/0.18)+0.05*Math.sin(s*9)); }
  var ss=t-tally.slam; tallyM.position.y=2.42+(ss>=0&&ss<0.3?0.012*Math.sin(ss*80)*(1-ss/0.3):0);
  scholarMat.opacity=0.3+0.1*Math.sin(t);
});
mg(wd,M.woodDark); mg(br,M.brass); mg(bl,black);

H.onBegin(function(){ H.stations.forEach(function(s){ if(s.n===4){ s.name='Suite 1912 · Hinsdale'; s.desc='the oral examination · look at a brass button and press Enter or the trigger (or 1-2-3)'; } }); });
})();
