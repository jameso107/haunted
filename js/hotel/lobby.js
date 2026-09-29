/* Hotel Alice Lloyd: lobby. The Hall of Guests queue along the south wall, the front desk with LOBBY CAM 2,
   and the guest hall (James's loop) to Suite 1871. Zone: queue strip x 190-605 z 540-625, start region x 548-607
   z 395-540, guest hall x 350-548 z 467-540, north lane x 346-428 z 392-467, vestibule east half x 318-350 z 392-420. */
(function(){
'use strict';
var H = window.HOTEL; if (!H || H.failed) return;
H.lobbyWelcome=true;
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
var PI=Math.PI, capDiv=document.getElementById('caption'), stageDiv=document.getElementById('stage');
function clamp(v,a,b){ return v<a?a:v>b?b:v; }

// ---------- 1. structure (scene level) ----------
H.curtain(190,540,464.4,540); H.curtain(475.6,540,548,540);   // QN: queue curtain; butts column C2 (470,538), passes north of C1 (330,553)
H.curtain(346,420,346,540);                                   // JD: James's divider carried to QN so Room 1 is closed from the guest hall
H.curtain(318,390,318,420);                                   // VD: vestibule divider
H.curtain(346,420,360,420);                                   // STUB: door-surround flat for Suite 1871's plate and reader (angell.js)
[[560,402,605,402],[605,402,605,414],[605,414,560,414],[560,414,560,402],[546,402,560,402]].forEach(function(s){ H.seg(s[0],s[1],s[2],s[3]); H.map.walls.push(s); });   // desk counter + staff gate

// ---------- 2. content group ----------
var G=H.cull(H.group(0,0),[[186,388,612,632]]);
function add(m){ if(m) G.add(m); return m; }
function mk(geo,x,y,z,ry,rx){ var m=new THREE.Mesh(geo); m.position.set(x*SC,y,z*SC); if(ry) m.rotation.y=ry; if(rx) m.rotation.x=rx; return m; }
function bx(w,h,d,x,y,z,ry){ return mk(new THREE.BoxGeometry(w,h,d,Math.max(1,Math.ceil(w/0.5)),Math.max(1,Math.ceil(h/0.5)),1),x,y,z,ry); }
function merge(list,mat){ return add(H.merge(list,mat)); }
function basic(tex,o){ o=o||{}; o.map=tex; return new THREE.MeshBasicMaterial(o); }
function fit(g,txt,px,maxW,pre){ var f=Math.round(px); do { g.font=pre+f+'px Georgia,serif'; } while(g.measureText(txt).width>maxW && --f>6); return f; }
var WOOD=[], DARKW=[], DARK=[], BRASS=[], METAL=[], GILT=[], GLOW=[];

// sign atlas: every printed sign in one 1024x1024 canvas, one Lambert mesh
var AT=document.createElement('canvas'); AT.width=AT.height=1024; var ag=AT.getContext('2d'), ATL=[];
function textCell(lines,o){ return function(g,w,h){ var s=Math.min(w/(o.w||512),h/(o.h||256)); g.fillStyle=o.bg; g.fillRect(0,0,w,h);
  if(o.border){ g.strokeStyle=o.border; g.lineWidth=(o.bw||14)*s; g.strokeRect(10*s,10*s,w-20*s,h-20*s); }
  g.fillStyle=o.fg; g.textAlign='center'; g.textBaseline='middle'; var fs=(o.fs||44)*s, y0=h/2-(lines.length-1)*fs*0.62;
  lines.forEach(function(l,i){ fit(g,l,fs*(i===0&&o.firstScale||1),w-40*s,(i===0&&o.boldFirst?'bold ':'')); g.fillText(l,w/2,y0+i*fs*1.24); }); }; }
function cell(r,draw,mw,mh,x,y,z,ry){ ag.save(); ag.beginPath(); ag.rect(r[0],r[1],r[2],r[3]); ag.clip(); ag.translate(r[0],r[1]); draw(ag,r[2],r[3]); ag.restore();
  var geo=new THREE.PlaneGeometry(mw,mh), uv=geo.attributes.uv;
  for(var i=0;i<uv.count;i++) uv.setXY(i,(r[0]+0.5+uv.getX(i)*(r[2]-1))/1024,1-(r[1]+0.5+(1-uv.getY(i))*(r[3]-1))/1024);
  ATL.push(mk(geo,x,y,z,ry)); }
function slot(i){ return [(i%3)*343,Math.floor(i/3)*173,338,169]; }
var QS={bg:'#e4d3ae',fg:'#4b2f18',border:'#7a5a30',w:512,h:256,fs:40,boldFirst:true};
var BR={bg:'#1d1a16',fg:'#d9b76a',border:'#8a6a2a',w:512,h:256,fs:40,boldFirst:true};
var NP={bg:'#2a2016',fg:'#e2c47c',border:'#8a6a2a',w:338,h:70,fs:21,bw:4,boldFirst:true};

// ---------- 2a. Hall of Guests ----------
add(mk(new THREE.PlaneGeometry(16,1.1,32,2),400,0.55,627.85,PI)).material=H.lam(0xe2ded3);   // wainscot
(function(){ var n=110, p=new Float32Array(n*3);   // string lights
  for(var i=0;i<n;i++){ var x=200+400*i/(n-1); p[i*3]=x*SC; p[i*3+1]=2.42-0.12*Math.sin(PI*((x-200)%37.5)/37.5); p[i*3+2]=626.5*SC; }
  var geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(p,3));
  var dot=H.canvasTex(32,32,function(g){ var r=g.createRadialGradient(16,16,2,16,16,15); r.addColorStop(0,'#fff'); r.addColorStop(0.55,'rgba(255,255,255,0.9)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,32,32); });
  G.add(new THREE.Points(geo,new THREE.PointsMaterial({color:0xffc46b,size:0.05,map:dot,transparent:true,alphaTest:0.3,depthWrite:false})));
  G.add(new THREE.Line(geo,new THREE.LineBasicMaterial({color:0x1c1712}))); })();
// fireplace (the 1949 main lounge had a marble fireplace)
var marble=H.canvasTex(256,256,function(g,w,h){ g.fillStyle='#e6e1d8'; g.fillRect(0,0,w,h); var r=H.rng(7);
  for(var i=0;i<16;i++){ g.strokeStyle='rgba(110,102,92,'+(0.12+r()*0.3)+')'; g.lineWidth=0.5+r()*2; g.beginPath(); var x=r()*w, y=r()*h; g.moveTo(x,y); for(var k=0;k<6;k++){ x+=(r()-0.5)*80; y+=r()*50; g.lineTo(x,y); } g.stroke(); } });
merge([bx(0.2,1.15,0.25,232.5,0.575,624),bx(0.2,1.15,0.25,267.5,0.575,624),bx(1.72,0.08,0.3,250,1.15,624)],H.lam(0xffffff,{map:marble}));
DARK.push(bx(1.2,1.11,0.02,250,0.555,627.75));   // firebox back
function drawFire(g,t,w,h){ var gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#0a0604'); gr.addColorStop(1,'#1e1008'); g.fillStyle=gr; g.fillRect(0,0,w,h);
  g.fillStyle='#1a0e08'; for(var r=0;r<5;r++) for(var c=0;c<8;c++) g.fillRect(c*34+(r%2)*17-8,r*20+4,30,16);
  g.globalCompositeOperation='lighter';
  var eg=g.createRadialGradient(w/2,h-16,4,w/2,h-16,110); eg.addColorStop(0,'rgba(255,110,30,0.5)'); eg.addColorStop(1,'rgba(255,60,0,0)'); g.fillStyle=eg; g.fillRect(0,0,w,h);
  for(var i=0;i<5;i++){ var cx=58+i*35, fh=(0.55+0.3*Math.sin(t*(2+i)+i*1.7))*h*0.72, fw=20+4*Math.sin(t*(1.3+i*0.4)), b=h-22;
    var fg=g.createLinearGradient(0,b,0,b-fh); fg.addColorStop(0,'rgba(255,214,110,0.95)'); fg.addColorStop(0.45,'rgba(255,128,32,0.8)'); fg.addColorStop(1,'rgba(150,30,0,0)');
    g.fillStyle=fg; g.beginPath(); g.moveTo(cx-fw,b); g.quadraticCurveTo(cx-fw*0.8,b-fh*0.5,cx+Math.sin(t*3+i)*6,b-fh); g.quadraticCurveTo(cx+fw*0.8,b-fh*0.5,cx+fw,b); g.closePath(); g.fill(); }
  g.globalCompositeOperation='source-over'; g.fillStyle='#2b1a0e'; g.fillRect(40,h-24,176,9); g.fillStyle='#120a05'; g.fillRect(30,h-14,196,14); }
var fire=H.screen(256,128,drawFire,{x:250,z:620,range:8,every:3});
add(mk(new THREE.PlaneGeometry(0.9,0.6),250,0.5,627.45,PI)).material=basic(fire.tex);
// portraits: the four guests of honor (atlas) and the Dean's living portrait
function portrait(g,ox,style,band){ g.save(); g.translate(ox,0); g.fillStyle='#1a140e'; g.fillRect(0,0,256,320);
  var dean=style==='wave', cy=dean?160:148, ry=dean?150:134;
  g.save(); g.beginPath(); g.ellipse(128,cy,dean?118:112,ry,0,0,2*PI); g.clip();
  var rg=g.createRadialGradient(128,cy-20,20,128,cy,ry+6); rg.addColorStop(0,'#caa97a'); rg.addColorStop(0.7,'#8a6c48'); rg.addColorStop(1,'#3a2a1a'); g.fillStyle=rg; g.fillRect(0,0,256,320);
  var sil=dean?'#2b1d12':'#2e2014'; g.fillStyle=sil;
  g.beginPath(); g.moveTo(22,320); g.quadraticCurveTo(36,dean?232:214,100,dean?226:204); g.lineTo(156,dean?226:204); g.quadraticCurveTo(220,dean?232:214,234,320); g.fill();
  if(dean){
    g.fillStyle='#b08c62'; g.fillRect(110,190,36,42);   // neck
    g.fillStyle='#e8dcc4'; g.beginPath(); g.moveTo(104,226); g.lineTo(128,262); g.lineTo(152,226); g.fill();   // blouse
    g.strokeStyle='#1a120a'; g.lineWidth=3; g.beginPath(); g.moveTo(96,230); g.lineTo(124,274); g.moveTo(160,230); g.lineTo(132,274); g.stroke();   // lapels
    g.fillStyle='#3a2616'; g.beginPath(); g.ellipse(128,124,58,62,0,0,2*PI); g.fill();   // waved 1940s hair, framing the face
    g.beginPath(); g.ellipse(76,168,11,18,0.2,0,2*PI); g.fill(); g.beginPath(); g.ellipse(180,168,11,18,-0.2,0,2*PI); g.fill();
    var fg=g.createRadialGradient(118,130,8,128,142,66); fg.addColorStop(0,'#dcc09a'); fg.addColorStop(1,'#9a7650'); g.fillStyle=fg; g.beginPath(); g.ellipse(128,146,45,59,0,0,2*PI); g.fill();
    g.fillStyle='#3a2616'; g.beginPath(); g.ellipse(112,94,34,18,-0.25,0,2*PI); g.fill(); g.beginPath(); g.ellipse(148,92,30,16,0.3,0,2*PI); g.fill();
    g.strokeStyle='#5c3f26'; g.lineWidth=2; for(var k=0;k<4;k++){ g.beginPath(); g.moveTo(88+k*6,80+k*5); g.quadraticCurveTo(110,70+k*5,128,82+k*4); g.quadraticCurveTo(146,70+k*5,168-k*6,80+k*5); g.stroke(); }
    g.fillStyle='#8a6844'; g.beginPath(); g.ellipse(106,128,13,8,0,0,2*PI); g.fill(); g.beginPath(); g.ellipse(150,128,13,8,0,0,2*PI); g.fill();   // eye sockets
    g.strokeStyle='#4a3020'; g.lineWidth=2.5; g.beginPath(); g.arc(106,124,14,PI*1.15,PI*1.85); g.stroke(); g.beginPath(); g.arc(150,124,14,PI*1.15,PI*1.85); g.stroke();
    g.strokeStyle='#7a5638'; g.lineWidth=2; g.beginPath(); g.moveTo(129,134); g.quadraticCurveTo(124,156,122,162); g.lineTo(132,164); g.stroke();
    g.strokeStyle='#7a4432'; g.lineWidth=3; g.beginPath(); g.moveTo(112,180); g.quadraticCurveTo(128,186,144,180); g.stroke();
    for(var q=0;q<13;q++){ var a=PI*(0.18+0.64*q/12), px=128+34*Math.cos(a), py=206+16*Math.sin(a); g.fillStyle='#efe6d6'; g.beginPath(); g.arc(px,py,4,0,2*PI); g.fill(); g.fillStyle='#b7ab96'; g.beginPath(); g.arc(px+1,py+1.5,1.6,0,2*PI); g.fill(); }
  } else {
    g.fillRect(112,160,32,50); g.beginPath(); g.ellipse(128,130,36,46,0,0,2*PI); g.fill();
    if(style==='bun'){ g.beginPath(); g.ellipse(128,108,40,32,0,PI,0); g.fill(); g.beginPath(); g.arc(128,74,19,0,2*PI); g.fill(); }
    if(style==='curls'){ for(var c=0;c<9;c++){ var b=PI*(1.02+0.96*c/8); g.beginPath(); g.arc(128+42*Math.cos(b),124+48*Math.sin(b),12,0,2*PI); g.fill(); } }
    if(style==='collar'){ g.beginPath(); g.ellipse(128,110,39,30,0,PI,0); g.fill(); g.fillStyle='#d9c9a8'; g.beginPath(); g.moveTo(104,206); g.lineTo(100,166); g.lineTo(112,172); g.lineTo(128,166); g.lineTo(144,172); g.lineTo(156,166); g.lineTo(152,206); g.fill();
      g.fillStyle='#b8a47e'; for(var s=0;s<6;s++) g.fillRect(104+s*8,184,3,18); }
    if(style==='crown'){ g.beginPath(); g.ellipse(128,108,39,30,0,PI,0); g.fill(); g.strokeStyle='#4a3420'; g.lineWidth=2;
      for(var k2=0;k2<11;k2++){ var a2=PI*(1.05+0.9*k2/10); g.beginPath(); g.ellipse(128+38*Math.cos(a2),102+26*Math.sin(a2),9,6,a2+PI/2,0,2*PI); g.fillStyle='#3a2818'; g.fill(); g.stroke(); } }
  }
  g.restore();
  g.strokeStyle='#6b5436'; g.lineWidth=3; g.beginPath(); g.ellipse(128,cy,dean?118:112,ry,0,0,2*PI); g.stroke();
  g.fillStyle='#8a7a60'; g.font='7px Georgia,serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('Photograph: Bentley Historical Library (placeholder)',128,dean?314:284);
  if(band){ g.fillStyle='#2a2016'; g.fillRect(40,290,176,28); g.strokeStyle='#8a6a2a'; g.lineWidth=2; g.strokeRect(41,291,174,26); g.fillStyle='#d9b76a'; fit(g,band,16,160,'bold '); g.fillText(band,128,305); }
  if(dean){ g.globalCompositeOperation='destination-out'; g.beginPath(); g.ellipse(106,128,6,4.5,0,0,2*PI); g.fill(); g.beginPath(); g.ellipse(150,128,6,4.5,0,0,2*PI); g.fill(); g.globalCompositeOperation='source-over'; }
  g.restore(); }
var HON=[[300,'bun','ANGELL','SARAH CASWELL ANGELL · 1831–1903'],[340,'curls','KLEINSTUCK','CAROLINE HUBBARD KLEINSTUCK · 1855–1932'],
         [460,'collar','HINSDALE','MARY LOUISE HINSDALE · 1866–1946'],[500,'crown','PALMER','ALICE FREEMAN PALMER · 1855–1902']];
(function(){ var c=document.createElement('canvas'); c.width=1024; c.height=320; var g=c.getContext('2d');
  HON.forEach(function(p,i){ portrait(g,i*256,p[1],p[2]); });
  var t=new THREE.CanvasTexture(c); t.anisotropy=4;
  merge(HON.map(function(p,i){ var geo=new THREE.PlaneGeometry(0.5,0.625), uv=geo.attributes.uv; for(var k=0;k<uv.count;k++) uv.setX(k,(i+uv.getX(k))/4); return mk(geo,p[0],1.75,627.8,PI); }),H.lam(0xffffff,{map:t})); })();
HON.forEach(function(p,i){ cell([686,520+i*74,338,70],textCell(p[3].split(' · '),NP),0.34,0.07,p[0],1.35,627.8,PI); });
cell([686,816,338,68],textCell(['DEAN ALICE CROCKER LLOYD','1893–1950 · PROPRIETOR'],NP),0.5,0.1,405,1.16,627.8,PI);
var deanTex=H.canvasTex(256,320,function(g){ portrait(g,0,'wave',''); });
H.plane(0.7,0.875,H.lam(0xffffff,{map:deanTex,alphaTest:0.5}),405,1.75,627.4,PI,G);
var eyeMat=basic(H.canvasTex(128,64,function(g,w,h){ g.fillStyle='#e8e2d6'; g.fillRect(0,0,w,h); g.fillStyle='#4a3524'; g.beginPath(); g.arc(32,32,5.5,0,2*PI); g.fill();
  g.fillStyle='#0a0806'; g.beginPath(); g.arc(32,32,2.6,0,2*PI); g.fill(); }),{color:0x9c9486});
var eyes=[H.ball(0.018,eyeMat,403.5,1.84,627.8,G),H.ball(0.018,eyeMat,406.5,1.84,627.8,G)];   // 627.8 (not 627.7) so the ball never bulges through the canvas around the holes
H.onUpdate(function(){ if(!H.near(405,628,6)) return; var h=H.headPos();
  eyes.forEach(function(e){ var dx=h.x-e.position.x, dy=h.y-e.position.y, dz=h.z-e.position.z;
    e.rotation.set(clamp(-Math.atan2(dy,Math.hypot(dx,dz)),-0.44,0.44),PI+clamp(Math.atan2(-dx,-dz),-0.44,0.44),0,'YXZ'); }); });
// gilt frames, all five merged
function frame(x,y,z,iw,ih,ow,oh,d){ var bw=(ow-iw)/2, bh=(oh-ih)/2;
  GILT.push(bx(ow,bh,d,x,y+(ih+bh)/2,z),bx(ow,bh,d,x,y-(ih+bh)/2,z),bx(bw,ih,d,x-(iw+bw)/2/SC,y,z),bx(bw,ih,d,x+(iw+bw)/2/SC,y,z)); }
HON.forEach(function(p){ frame(p[0],1.75,627.55,0.5,0.625,0.6,0.725,0.03); }); frame(405,1.75,627.25,0.7,0.875,0.84,1.02,0.06);
// last year's charcoal ovals
H.plane(1.8,0.65,H.lam(0xffffff,{map:H.canvasTex(512,185,function(g){ var r=H.rng(31); g.clearRect(0,0,512,185);
  for(var i=0;i<5;i++){ var cx=52+i*102, cy=92;
    g.fillStyle='#ddd6c6'; g.beginPath(); g.ellipse(cx,cy,40,78,0,0,2*PI); g.fill();
    g.strokeStyle='rgba(30,28,26,0.85)'; for(var k=0;k<4;k++){ g.lineWidth=1+r()*1.5; g.beginPath(); g.ellipse(cx+(r()-0.5)*3,cy+(r()-0.5)*3,40-r()*3,78-r()*3,0,0,2*PI); g.stroke(); }
    g.strokeStyle='rgba(40,36,32,0.55)'; g.lineWidth=1.4; g.beginPath(); g.ellipse(cx,cy-12,15,20,0,0,2*PI); g.stroke();   // head
    g.strokeStyle='rgba(30,28,26,0.6)'; g.lineWidth=1.3; for(var s=0;s<46;s++){ var a=PI*(0.92+1.16*r()), rr=13+r()*8; g.beginPath(); g.ellipse(cx,cy-13,rr,rr*1.25,0,a,a+0.35+r()*0.3); g.stroke(); }   // hair, hatched along the head
    g.strokeStyle='rgba(40,36,32,0.4)'; g.lineWidth=1.2; g.beginPath(); g.arc(cx-6,cy-12,3.5,PI*1.1,PI*1.9); g.moveTo(cx+9.5,cy-12); g.arc(cx+6,cy-12,3.5,PI*1.1,PI*1.9); g.moveTo(cx,cy-9); g.lineTo(cx-1.5,cy-2); g.moveTo(cx-4,cy+2); g.lineTo(cx+4,cy+2); g.stroke();
    g.strokeStyle='rgba(40,36,32,0.25)'; for(var s2=0;s2<16;s2++){ g.beginPath(); g.moveTo(cx-13+s2*0.6,cy-18+s2*2); g.lineTo(cx-5+s2*0.4,cy-24+s2*2.4); g.stroke(); }   // shading on one cheek
    g.strokeStyle='rgba(40,36,32,0.7)'; g.lineWidth=1.8; g.beginPath(); g.moveTo(cx-6,cy+7); g.lineTo(cx-7,cy+20); g.quadraticCurveTo(cx-30,cy+26,cx-38,cy+66);
    g.moveTo(cx+6,cy+7); g.lineTo(cx+7,cy+20); g.quadraticCurveTo(cx+30,cy+26,cx+38,cy+66); g.stroke(); } }),alphaTest:0.5}),535,1.75,627.8,PI,G);
// queue radio (loops Q1-Q3 on the stair landing in the real haunt); 0.36 m tall so the grille sits on its face
WOOD.push(bx(0.4,0.7,0.4,198,0.35,605),bx(0.2,0.36,0.36,198,0.88,605));
H.plane(0.1,0.06,basic(null,{color:0xffb050}),200.7,0.84,605,PI/2,G);
// doorman's podium sign on building.js's draped table, with a backing board
cell(slot(6),textCell(['PLEASE WAIT HERE','THE DESK WILL CALL YOUR PARTY'],QS),0.6,0.3,581,0.93,570,-PI/2);
DARKW.push(bx(0.02,0.34,0.64,581.4,0.93,570));
// period signs on the queue curtain's south face
[[208,['SAFE PHRASE','“DO NOT DISTURB” · HAND ON HEAD']],[230,['THIS ATTRACTION USES','FLICKERING LIGHT · NO STROBES']],[372,['CLOSING HOURS','10 P.M. WEEKNIGHTS · MIDNIGHT WEEKENDS']],
 [396,['GENTLEMEN CALLERS','WAIT IN THE LOUNGE']],[420,['THREE FEET','ON THE FLOOR']],[522,['PLEASE SIGN OUT','· PLEASE SIGN IN ·']]].forEach(function(s,i){
  cell(slot(i),textCell(s[1],QS),0.8,0.4,s[0],1.6,540.6,0); });
cell([686,346,338,113],textCell(['CCTV IN OPERATION'],{bg:QS.bg,fg:QS.fg,border:QS.border,w:384,h:128,fs:44,boldFirst:true}),0.6,0.2,248,2.05,540.6,0);
H.plane(2.2,0.55,basic(H.canvasTex(1024,256,function(g,w,h){ g.fillStyle='#1a1208'; g.fillRect(0,0,w,h); g.strokeStyle='#8a6a2a'; g.lineWidth=14; g.strokeRect(10,10,w-20,h-20);   // glow banner
  g.fillStyle='#f2c572'; g.textAlign='center'; g.textBaseline='middle'; fit(g,'HOTEL ALICE LLOYD',76,w-80,'bold '); g.fillText('HOTEL ALICE LLOYD',w/2,102);
  var l2='A DREAM IN MODERN LIVING · EST. 1949 · INTERIORS BY KNOLL'; fit(g,l2,38,w-80,''); g.fillText(l2,w/2,176); }),{color:new THREE.Color(0.9,0.9,0.9)}),290,1.95,540.6,0,G);

// ---------- 2b. front desk ----------
WOOD.push(bx(1.8,1.05,0.48,582.5,0.525,408));
BRASS.push(bx(1.84,0.035,0.03,582.5,1.05,414.45));   // brass nosing (a full-depth cap would bury the register)
cell([0,895,680,124],textCell(['HOTEL ALICE LLOYD · FRONT DESK'],{bg:BR.bg,fg:BR.fg,border:BR.border,w:680,h:124,fs:54,bw:8,boldFirst:true}),1.2,0.22,582.5,0.62,414.3,0);
var clerkFig=H.figure(0x2a2f3a,0xd9c2a4,G); clerkFig.position.set(572*SC,0,397*SC); DARK.push(mk(new THREE.CylinderGeometry(0.1,0.1,0.07,14),572,1.66,397));   // clerk and his pillbox cap
DARKW.push(bx(0.46,0.4,0.34,565,1.26,407.5));   // monitor case
var cam=H.feed({x:602.3,z:396.4,y:2.35,tx:572,tz:470,ty:1.2,fov:64,w:256,h:192,every:3,range:5,sx:575,sz:448}); cam.on=false;   // lens just in front of the prop and its red dot
add(H.monitor(cam,0.4,0.3,565,1.28,412.0,0,{tint:0xcfe8d8}));
cell([686,895,200,50],textCell(['LOBBY CAM 2'],{bg:'#121412',fg:'#cfe8d8',w:200,h:50,fs:26,boldFirst:true}),0.2,0.05,565,1.09,412.05,0);
function drawStatic(g,t,w,h){ if(!tear || !tear.visible) return; var im=g.createImageData(w,h), d=im.data;
  for(var y=0;y<h;y++){ var on=Math.random()<0.62, b=60+Math.random()*120, sh=(Math.random()*w)|0;
    for(var x=0;x<w;x++){ var i=(y*w+((x+sh)%w))*4, v=on?b+(Math.random()-0.5)*70:0; d[i]=d[i+1]=d[i+2]=v; d[i+3]=on?225:0; } }
  g.putImageData(im,0,0); }
var tearScr=H.screen(128,96,function(g,t,w,h){ drawStatic(g,t,w,h); },{x:565,z:412,range:4,every:2});
var tear=add(mk(new THREE.PlaneGeometry(0.4,0.3),565,1.28,412.1,0)); tear.material=basic(tearScr.tex,{transparent:true,depthWrite:false}); tear.visible=false;
// the Dean on camera only
var dcc=add(mk(new THREE.PlaneGeometry(0.6,1.7),575,0.85,515,0));
dcc.material=basic(H.canvasTex(128,320,function(g){ g.clearRect(0,0,128,320); var c='#8c8c8c', d='#666';
  g.fillStyle=d; g.beginPath(); g.moveTo(44,168); g.lineTo(84,168); g.lineTo(82,262); g.lineTo(46,262); g.closePath(); g.fill();   // straight skirt
  g.fillStyle='#9a9a9a'; g.fillRect(52,262,8,42); g.fillRect(68,262,8,42); g.fillStyle='#4a4a4a'; g.fillRect(49,302,13,9); g.fillRect(66,302,13,9);
  g.fillStyle=c; g.beginPath(); g.moveTo(40,70); g.quadraticCurveTo(64,62,88,70); g.lineTo(93,120); g.lineTo(86,178); g.lineTo(42,178); g.lineTo(35,120); g.closePath(); g.fill();   // jacket
  g.fillRect(28,74,11,86); g.fillRect(89,74,11,86); g.fillStyle='#a6a6a6'; g.fillRect(28,158,11,10); g.fillRect(89,158,11,10);
  g.strokeStyle=d; g.lineWidth=2; g.beginPath(); g.moveTo(52,70); g.lineTo(64,104); g.lineTo(76,70); g.moveTo(64,104); g.lineTo(64,176); g.stroke();
  g.fillStyle='#a8a8a8'; g.fillRect(58,52,12,16); g.beginPath(); g.ellipse(64,38,13,16,0,0,2*PI); g.fill();
  g.fillStyle='#555'; g.beginPath(); g.ellipse(64,29,16,11,0,PI,0); g.fill(); g.beginPath(); g.ellipse(50,40,6,9,0,0,2*PI); g.ellipse(78,40,6,9,0,0,2*PI); g.fill();   // waved hair
  g.fillStyle='#dcdcdc'; for(var i=0;i<9;i++){ var a=PI*(0.15+0.7*i/8); g.beginPath(); g.arc(64+10*Math.cos(a),62+6*Math.sin(a),1.8,0,2*PI); g.fill(); } }),
  {transparent:true,alphaTest:0.1,opacity:0});   // alphaTest 0.1 (not 0.4) so the fade-in is smooth instead of popping at 40%
H.feedOnly(dcc);
// register
var paper=H.box(0.42,0.02,0.3,M.paper,580,1.06,408,0,G);
var regBase=document.createElement('canvas'); regBase.width=512; regBase.height=352;
(function(g,w,h){ g.fillStyle='#eee4c8'; g.fillRect(0,0,w,h); var vg=g.createRadialGradient(w/2,h/2,120,w/2,h/2,330); vg.addColorStop(0,'rgba(0,0,0,0)'); vg.addColorStop(1,'rgba(90,60,20,0.3)'); g.fillStyle=vg; g.fillRect(0,0,w,h);
  g.fillStyle='#6b3f1f'; g.font='bold 20px Georgia,serif'; g.textAlign='center'; g.fillText('ALICE LLOYD HALL · GUEST REGISTER',w/2,34);
  g.strokeStyle='#a9bccf'; g.lineWidth=1.5; for(var k=0;k<9;k++){ g.beginPath(); g.moveTo(10,60+k*36); g.lineTo(w-10,60+k*36); g.stroke(); }
  g.strokeStyle='#c46a6a'; g.beginPath(); g.moveTo(96,48); g.lineTo(96,h-6); g.stroke();
  var r=H.rng(19); g.strokeStyle='rgba(95,55,25,0.85)'; g.lineWidth=1.6;
  for(var row=1;row<=5;row++){ var y=60+row*36-10, x=18; g.beginPath(); g.moveTo(x,y); while(x<80){ x+=3; g.lineTo(x,y-4*Math.sin(x*0.9)-r()*3); } g.stroke();
    x=108; var end=300+r()*170; g.beginPath(); g.moveTo(x,y); while(x<end){ x+=2+r()*2; g.lineTo(x,y-5*Math.abs(Math.sin(x*0.35+r()))-r()*4); if(r()<0.06) { x+=10; g.moveTo(x,y); } } g.stroke(); }
})(regBase.getContext('2d'),512,352);
var regT0=-1, regShown=-2, REGS='Oct. 31 — Party of '+(H.party||'GUEST')+' — Suite 1871';
function regWant(t){ return regT0<0?-1:Math.min(REGS.length,Math.floor(REGS.length*(t-regT0)/2)); }   // characters written so far
function drawRegister(g,t,w,h){ g.drawImage(regBase,0,0); var n=regShown=regWant(t); if(n<0) return;
  g.fillStyle='#2a1a0c'; g.textAlign='left'; g.textBaseline='alphabetic'; fit(g,REGS,27,w-40,'italic '); g.fillText(REGS.slice(0,n),20,60+6*36-9); }
var regScr=H.screen(512,352,drawRegister,{x:580,z:408,range:5,every:3});
add(mk(new THREE.PlaneGeometry(0.4,0.28),580,1.072,408,0,-PI/2)).material=H.lam(0xffffff,{map:regScr.tex});
// phone (1940s desk set) and the camera prop, merged dark; the bell in brass
DARK.push(bx(0.18,0.07,0.22,591,1.085,408),bx(0.1,0.05,0.08,591,1.14,407),bx(0.26,0.035,0.05,591,1.18,407.2),bx(0.06,0.05,0.07,587.9,1.16,407.2),bx(0.06,0.05,0.07,594.1,1.16,407.2),
  mk(new THREE.CylinderGeometry(0.045,0.045,0.012,16),591,1.1,410.9,0,PI/2));
DARK.push(bx(0.12,0.1,0.22,603.5,2.35,393.5,-0.4));
H.box(0.02,0.02,0.02,H.glow(0xff2020,1),602.4,2.35,396.1,0,G);   // tally dot, just behind the feed camera's lens
BRASS.push(mk(new THREE.CylinderGeometry(0.05,0.055,0.015,16),600,1.058,409),mk(new THREE.SphereGeometry(0.045,14,6,0,2*PI,0,PI/2),600,1.065,409),
  mk(new THREE.CylinderGeometry(0.004,0.004,0.03,6),600,1.12,409),mk(new THREE.SphereGeometry(0.01,8,6),600,1.137,409));
// switchboard: Angell, Kleinstueck, Hinsdale, Palmer, and the three halls that came onto the board in fall 1949
var lamps=[0,0,0,0,0,0,0], LAMP=[[48,78,'ANGELL'],[101,78,'KLEINSTUECK'],[154,78,'HINSDALE'],[207,78,'PALMER'],[75,138,'MOSHER'],[128,138,'JORDAN'],[181,138,'STOCKWELL']];
var swBase=document.createElement('canvas'); swBase.width=swBase.height=256;
(function(g){ var gr=g.createLinearGradient(0,0,256,256); gr.addColorStop(0,'#3a2616'); gr.addColorStop(1,'#20150c'); g.fillStyle=gr; g.fillRect(0,0,256,256);
  var r=H.rng(5); g.strokeStyle='rgba(0,0,0,0.25)'; for(var i=0;i<40;i++){ g.lineWidth=0.5+r(); var y=r()*256; g.beginPath(); g.moveTo(0,y); g.bezierCurveTo(80,y+r()*8-4,170,y+r()*8-4,256,y+r()*6-3); g.stroke(); }
  g.strokeStyle='#8a6a2a'; g.lineWidth=4; g.strokeRect(4,4,248,248);
  g.fillStyle='#b8923a'; g.fillRect(58,14,140,26); g.fillStyle='#2a1c10'; g.textAlign='center'; g.textBaseline='middle'; fit(g,'SWITCHBOARD',16,130,'bold '); g.fillText('SWITCHBOARD',128,28);
  LAMP.forEach(function(l){ g.fillStyle='#e0c890'; fit(g,l[2],9,44,'bold '); g.fillText(l[2],l[0],l[1]+20); g.strokeStyle='#8a6a2a'; g.lineWidth=2; g.beginPath(); g.arc(l[0],l[1],12,0,2*PI); g.stroke(); });
  g.strokeStyle='#8a6a2a'; g.lineWidth=1; g.beginPath(); g.moveTo(60,172); g.lineTo(196,172); g.stroke(); g.fillStyle='#b8a070'; fit(g,'FALL 1949',9,80,''); g.fillText('FALL 1949',128,180);
  for(var row=0;row<2;row++) for(var k=0;k<7;k++){ var x=40+k*29, y=202+row*20; g.fillStyle='#8a6a2a'; g.beginPath(); g.arc(x,y,5.5,0,2*PI); g.fill(); g.fillStyle='#050403'; g.beginPath(); g.arc(x,y,2.6,0,2*PI); g.fill(); }
  g.lineWidth=3; g.strokeStyle='#7a2418'; g.beginPath(); g.moveTo(69,202); g.quadraticCurveTo(86,262,127,222); g.stroke();
  g.strokeStyle='#0c0c0c'; g.beginPath(); g.moveTo(156,222); g.quadraticCurveTo(176,266,214,202); g.stroke(); })(swBase.getContext('2d'));
var swShown='';
function drawSwitchboard(g,t,w,h){ g.drawImage(swBase,0,0); swShown=lamps.join('');
  LAMP.forEach(function(l,i){ var on=lamps[i]>0; g.save(); if(on){ g.shadowColor='#ffb030'; g.shadowBlur=16; }
    g.fillStyle=on?'#ffb030':'#3b2910'; g.beginPath(); g.arc(l[0],l[1],10,0,2*PI); g.fill(); g.restore();
    if(on){ g.fillStyle='#fff0c0'; g.beginPath(); g.arc(l[0]-2,l[1]-2,3.5,0,2*PI); g.fill(); } }); }
var swScr=H.screen(256,256,drawSwitchboard,{x:590,z:400,range:6,every:6});
H.plane(0.9,0.9,basic(swScr.tex,{color:0xc0c0c0}),591,1.55,392.3,0,G);
// key board: fobs in the lounge colour pairs; the proprietor's hook is empty
cell([343,520,338,254],function(g,w,h){ g.fillStyle='#2b1d12'; g.fillRect(0,0,w,h); g.strokeStyle='#8a6a2a'; g.lineWidth=6; g.strokeRect(5,5,w-10,h-10);
  g.fillStyle='#b8923a'; g.fillRect(w/2-86,16,172,30); g.fillStyle='#2a1c10'; g.textAlign='center'; g.textBaseline='middle'; fit(g,'GUEST KEYS',19,160,'bold '); g.fillText('GUEST KEYS',w/2,31);
  [['1871','#b3272a','#8e9096'],['1876','#6b4526','#3f7a3a'],['1912','#141414','#d4af37'],['1872','#e2c233','#6b4526'],['1949']].forEach(function(f,i){ var x=37+i*66;
    g.fillStyle='#c9a24a'; g.beginPath(); g.arc(x,72,5,0,2*PI); g.fill();
    if(f[1]){ g.strokeStyle='#b0b0b0'; g.lineWidth=3; g.beginPath(); g.moveTo(x,76); g.lineTo(x,100); g.stroke(); g.beginPath(); g.arc(x,82,6,0,2*PI); g.stroke();
      g.fillStyle=f[1]; g.fillRect(x-19,100,38,34); g.fillStyle=f[2]; g.fillRect(x-19,134,38,34); g.strokeStyle='#0a0806'; g.lineWidth=1.5; g.strokeRect(x-19,100,38,68);
      g.fillStyle='#fff'; g.strokeStyle='#000'; g.lineWidth=3; g.font='bold 15px Georgia,serif'; g.strokeText(f[0],x,134); g.fillText(f[0],x,134); }
    g.fillStyle='#d9b76a'; g.font='bold 17px Georgia,serif'; g.fillText(f[0],x,200); });
  g.fillStyle='#a08a60'; g.font='italic 13px Georgia,serif'; g.fillText('one key per party',w/2,232); },0.6,0.45,557,1.55,392.3,0);
// NO VACANCY
var neonShown=null; function neonOn(t){ return H.flick(t,0.7,0.7)>0.5; }
function drawNeon(g,t,w,h){ g.clearRect(0,0,w,h); g.lineJoin='round'; g.textBaseline='middle'; g.font='bold 76px "Arial Narrow",Arial,sans-serif'; g.lineWidth=5;
  var no=neonShown=neonOn(t); g.save(); if(no){ g.shadowColor='#ff3a24'; g.shadowBlur=18; } g.strokeStyle=no?'#ff5a44':'#4a1812'; g.textAlign='left'; g.strokeText('NO',16,h/2); g.restore();
  g.save(); g.shadowColor='#ff3a24'; g.shadowBlur=18; g.strokeStyle='#ff5a44'; g.textAlign='right'; g.strokeText('VACANCY',w-14,h/2); g.restore(); }
var neonScr=H.screen(512,128,drawNeon,{x:582,z:400,range:12,every:3});
H.plane(1.2,0.3,basic(neonScr.tex,{transparent:true,depthWrite:false}),582,2.3,392.3,0,G);
// luggage on the orange bench
DARKW.push(bx(0.2,0.32,0.5,603,0.6,515),bx(0.03,0.03,0.14,603,0.775,515),bx(0.18,0.28,0.42,603,0.58,528),bx(0.03,0.03,0.12,603,0.735,528));

// ---------- 2c. guest hall to Suite 1871 ----------
var runEW=H.canvasTex(512,256,function(g,w,h){ g.fillStyle='#6e1a1c'; g.fillRect(0,0,w,h); g.strokeStyle='rgba(20,0,0,0.35)'; g.lineWidth=3;
  for(var x=0;x<w;x+=64){ g.beginPath(); g.moveTo(x,h/2); g.lineTo(x+32,h/2-40); g.lineTo(x+64,h/2); g.lineTo(x+32,h/2+40); g.closePath(); g.stroke(); }
  g.fillStyle='#d9b44a'; g.fillRect(0,12,w,12); g.fillRect(0,h-24,w,12); g.fillStyle='#2a4a8a'; g.fillRect(0,30,w,12); g.fillRect(0,h-42,w,12); }); runEW.size=[1.8,1.2];
var runNS=H.canvasTex(256,512,function(g,w,h){ g.fillStyle='#6e1a1c'; g.fillRect(0,0,w,h); g.strokeStyle='rgba(20,0,0,0.35)'; g.lineWidth=3;
  for(var y=0;y<h;y+=64){ g.beginPath(); g.moveTo(w/2,y); g.lineTo(w/2+40,y+32); g.lineTo(w/2,y+64); g.lineTo(w/2-40,y+32); g.closePath(); g.stroke(); }
  g.fillStyle='#d9b44a'; g.fillRect(12,0,12,h); g.fillRect(w-24,0,12,h); g.fillStyle='#2a4a8a'; g.fillRect(30,0,12,h); g.fillRect(w-42,0,12,h); }); runNS.size=[1.2,1.8];
add(H.floorPatch(355,482,548,512,H.lam(0xffffff,{map:runEW}))); add(H.floorPatch(373,405,403,482,H.lam(0xffffff,{map:runNS})));
// the proprietor's door, 1949
var facadeTex=H.canvasTex(256,512,function(g,w,h){ g.fillStyle='#2b2119'; g.fillRect(0,0,w,h); g.fillStyle='#6e4a2c'; g.fillRect(18,18,w-36,h-18);
  [[40,44,176,176],[40,256,176,224]].forEach(function(r){ g.fillStyle='#5e3e24'; g.fillRect(r[0],r[1],r[2],r[3]); g.strokeStyle='#8a6240'; g.lineWidth=3; g.strokeRect(r[0]+7,r[1]+7,r[2]-14,r[3]-14); g.strokeStyle='#3a2412'; g.lineWidth=2; g.strokeRect(r[0],r[1],r[2],r[3]); });
  g.fillStyle='#c9a24a'; g.fillRect(96,138,64,26); g.strokeStyle='#7a5a20'; g.lineWidth=2; g.strokeRect(97,139,62,24); g.fillStyle='#2a1c10'; g.textAlign='center'; g.textBaseline='middle'; g.font='bold 19px Georgia,serif'; g.fillText('1949',128,152);
  g.fillStyle='#c9a24a'; g.beginPath(); g.arc(206,279,8,0,2*PI); g.fill(); g.fillRect(186,275,26,7);
  g.fillStyle='#efe6cf'; g.fillRect(176,292,62,104); g.strokeStyle='#7a5a30'; g.lineWidth=2; g.strokeRect(178,294,58,100); g.fillStyle='#6e4a2c'; g.beginPath(); g.arc(207,304,6,0,2*PI); g.fill();
  g.fillStyle='#4b2f18'; fit(g,'THE PROPRIETOR',9,54,'bold '); g.fillText('THE PROPRIETOR',207,326); g.fillText('·',207,340); fit(g,'DO NOT',12,54,'bold '); g.fillText('DO NOT',207,356); g.fillText('DISTURB',207,372); });
var doorMesh=H.plane(1.05,2.2,H.lam(0xffffff,{map:facadeTex}),470,1.1,467.2,0,G);   // west of the real elevator door (x 518-543)
cell([0,520,338,338],textCell(['HOTEL ALICE LLOYD · GUEST SUITES','1871 · ANGELL','1876 · KLEINSTUECK','1912 · HINSDALE','1872 · PALMER','1949 · THE PROPRIETOR'],{bg:'#1d1a16',fg:'#d9b76a',border:'#8a6a2a',w:512,h:512,fs:40,boldFirst:true,firstScale:0.8}),0.55,0.55,437,1.55,467.2,0);
DARK.push(bx(0.58,H.CURT_H,0.17,353,H.CURT_H/2,420));   // STUB's door-surround flat, deep enough that angell.js's 1871 plate and reader (z 417.75) sit on its face
GLOW.push(bx(0.12,0.2,0.08,448,1.95,467.3),bx(0.12,0.2,0.08,492,1.95,467.3),bx(0.12,0.2,0.08,334,1.95,392.4));
// room-service cart with a brass cloche
METAL.push(bx(0.9,0.04,0.5,430,0.8,527),bx(0.9,0.03,0.5,430,0.3,527));
[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(s){ METAL.push(bx(0.03,0.8,0.03,430+s[0]*0.42/SC,0.4,527+s[1]*0.22/SC)); });
BRASS.push(mk(new THREE.SphereGeometry(0.18,16,8,0,2*PI,0,PI/2),430,0.82,527),mk(new THREE.SphereGeometry(0.022,8,6),430,1.015,527));
cell([343,346,338,145],textCell(['SUITE 1871 · ANGELL','STRAIGHT AHEAD, THEN LEFT'],{bg:BR.bg,fg:BR.fg,border:BR.border,w:512,h:220,fs:40,boldFirst:true}),0.7,0.3,346.7,1.6,470,PI/2);

// static merges
merge(WOOD,M.wood); merge(DARKW,M.woodDark); merge(DARK,M.dark); merge(BRASS,M.brass); merge(METAL,M.metal); merge(GILT,H.lam(0xb8923a)); merge(GLOW,H.glow(0xffc98a,0.8));
var atlasTex=new THREE.CanvasTexture(AT); atlasTex.anisotropy=4; merge(ATL,H.lam(0xffffff,{map:atlasTex}));

// ---------- 3. lights (4 of 4) ----------
var deskL=H.plight(582,425,2.3,0xffc98a,0.6,6), hallW=H.plight(298,604,2.2,0xffb060,0.9,8), hallE=H.plight(462,604,2.2,0xffb060,0.9,8), loopL=H.plight(462,488,2.3,0xffc080,0.7,8);
var LS=[[deskL,0.6],[hallW,0.9],[hallE,0.9],[loopL,0.7]], lf=1;
function inLobby(p){ return p.z>=540 || p.z>=388 && (p.x>=346 || p.x>=318 && p.z<=420); }   // queue, desk, hall, north lane, vestibule (not Room 1 or anything north)
H.onUpdate(function(dt){ var p=H.player(), k=p.z>540?0:clamp((472-p.x)/82,0,1);   // loopL glides with the party: over the proprietor's door, then up the north lane (never west of x 400)
  loopL.position.set((462-62*k)*SC,2.3,(488-52*k)*SC);
  var to=inLobby(p)?1:0; if(lf!==to){ lf=clamp(lf+(to>lf?dt:-dt)/0.6,0,1); LS.forEach(function(l){ l[0].intensity=l[1]*lf; }); } });   // curtains don't stop point lights: the lobby goes dark once the party is in Room 1

// ---------- 4. grilles ----------
H.grille('queue',200.8,0.98,605,PI/2); H.grille('desk',582.5,0.85,414.3,0); H.grille('phone',596,0.85,414.3,0);   // phone grille beside the desk grille, clear of the front sign
H.grille('hall',405,2.35,627.8,PI); H.grille('corridor',455,2.2,467.2,0); H.grille('vestibule',334,2.3,392.2,0);

// ---------- 5. lines (verbatim from the narration script) ----------
H.addLines({
  Q1:{at:'queue',t:'Good evening. This is Dean Alice Lloyd, proprietor of the Hotel Alice Lloyd: open since 1949, and not yet closed.'},
  Q2:{at:'queue',t:'Tonight’s house rules are short: walk, do not run, keep your hands to yourselves, and stay with your party.'},
  Q3:{at:'queue',t:'Any guest who wishes to leave early need only say ‘Do not disturb’ and place a hand on one’s head. My staff will see you out at once, and no late minutes will be assessed.'},
  G1:{at:'hall',t:'The four ladies on this wall are my guests of honor. I asked that the houses bear their names to give residents ‘tradition and a sense of belonging to the best that the University has created.’'},
  G2:{at:'hall',t:'My portrait. I am told the eyes follow you; they do. I was Dean of Women for twenty years, and I have had practice.'},
  G4:{at:'hall',t:'While you wait, the house rules: gentlemen callers wait in the lounge, three feet on the floor, and nobody leaves after closing hours without signing out.'},
  G3:{at:'hall',t:'The Regents turned down one name after another for this building for three years. They settled on mine in 1950, once I was no longer in a position to object.'},
  L1:{at:'desk',t:'Come in out of the cold. In 1949 they called this hall ‘a dream in modern living,’ and I intend to hold them to it.'},
  D1:{at:'desk',t:'Sign the register, please. In my day every young woman in this hall signed out in that book and signed back in, and the house mothers read every page.'},
  D2:{at:'desk',t:'Don’t turn around, dear. It is rude to stare at the proprietor.'},
  D3:{at:'phone',t:'Front desk? Dean Lloyd speaking. From the fall of 1949 every call for Stockwell and Mosher-Jordan came through this board, and tonight all four of your suites are ringing at once.'},
  D4:{at:'desk',t:'One key per party. It opens Angell, Kleinstueck, Hinsdale and Palmer, in that order, and nothing else, so please don’t try.'},
  S1:{at:'corridor',t:'Four suites tonight, four Michigan women, and each room kept exactly as she liked it. The room numbers are the years they made history.'},
  S2:{at:'corridor',t:'That door is mine. Please do not knock.'},
  S3:{at:'vestibule',t:'Suite 1871. Tap your key and stand up straight; you are about to be received by the first lady of the University.'}
});
var F=0, qf=-1;   // frame count: a line queued this frame is not on the caption yet, so calm() waits one frame
function mark(){ qf=F; }
function talk(id,o){ H.line(id,o); qf=F; }
function clerk(t){ H.say(t,{who:'THE CLERK',voice:false}); qf=F; }
function calm(){ return H.quiet() && qf!==F; }
function capIs(id){ var ln=capDiv.querySelector('.line'); return !!ln && ln.textContent===H.LINES[id].t; }

// ---------- 6. narration zones ----------
var SAFE='Safe phrase tonight: say “Do not disturb” with a hand on your head.';
function welcome(){ talk('Q1'); H.cap(SAFE); H.after(7,function(){ if(stageDiv.textContent===SAFE) H.cap(''); }); }
H.onBegin(function(){ welcome();
  H.stations.forEach(function(s){ if(s.n===0){ s.name='Arrival · Hall of Guests'; s.desc='up the stairs, or the elevator (the accessible entrance) · the Dean’s portrait watches the queue'; }
    if(s.n===1){ s.name='The Front Desk'; s.desc='sign the register · watch LOBBY CAM 2 · take your key'; } }); });
[['G1',270],['G2',380],['G4',435],['G3',515]].forEach(function(g){ H.narrateIds([g[0]],[g[1],545,607,628],{when:calm,then:mark}); });   // each box runs to the end of the strip, so whenever she falls quiet the next unheard line plays, in order
var key=0, s3=false, knockT=[], kn=0;   // key: 0 none, 1 key lines queued, 2 key in hand; kn (the knock): 0 armed, 1 knocking, 2 S2 queued, 3 S2 on the caption, 4 done
function keyed(){ return key===2; }
H.narrateIds(['L1'],[548,420,607,540],{when:function(){ return calm() && key===0 && !dz.fired; },then:mark});   // covers the desk too, so an elevator arrival hears it before check-in, never after
H.narrateIds(['S3'],[318,388,358,420],{when:keyed,then:function(){ mark(); s3=true; if(!kn) kn=4; }});   // at the 1871 door (S1 now plays at the desk, just before the key: see answer())

// ---------- 7. the desk and LOBBY CAM 2 ----------
var ringing=false, ringT=0, ringNext=0, ghost;
function freshGhost(){ ghost={active:false,done:false,steps:0,seen:false,moved:false,want:false,t0:0}; } freshGhost();
function callPhone(){ if(!ghost.done) ghost.want=true; }
var desk=H.cue([[0,function(){ clerk('Good evening. Name for the register?'); H.sfx.bell({x:600,z:409}); }],
 [1,function(){ regT0=H.t; for(var i=0;i<8;i++) H.sfx.noise(0.12,3800,0.05,{type:'bandpass',q:2,delay:i*0.25,x:580,z:408}); }],
 [2.5,function(){ talk('D1'); }], [4,function(){ cam.on=true; }],
 [9,function(){ H.fade(dcc.material,1,1); ghost.active=true; ghost.t0=H.t; }],
 [34,function(){ callPhone(); }]]);
var phoneCue=H.cue([[0,function(){ ghost.done=true; ghost.active=false; talk('D2'); }],
 [0.2,function(){ tear.visible=true; H.sfx.noise(1.2,3000,0.25,{type:'highpass',x:565,z:412}); }],
 [1.3,function(){ dcc.visible=false; }], [1.4,function(){ tear.visible=false; }],   // she vanishes under the static; the live feed then shows the empty lobby
 [2.5,function(){ ringing=true; ringT=0; ringNext=0; }], [8.5,answer]]);
function answer(){ if(!ringing) return; ringing=false; for(var i=0;i<4;i++) lamps[i]=0; talk('D3');
  H.tween(2,function(p){ for(var i=0;i<4;i++) lamps[i]=p>=i/4?1:0; });
  talk('D4'); talk('S1'); clerk('Your key. Suite 1871 is down the hall, past the proprietor’s door.'); key=1; }   // S1 before the handover, so the hall is free for the knock; checkedIn waits (see the updater)
var dz=H.zone({x1:550,z1:425,x2:607,z2:475,once:true,when:calm,enter:function(){ desk.go(); }}); H.nzones.push(dz);   // after L1, so the clerk asks before the register writes
H.useIn(550,420,607,475,answer);   // Enter answers the phone while it rings
function stepDean(frac){ var p=H.player(), cx=cam.cam.position.x/SC, cz=cam.cam.position.z/SC, dx=p.x-cx, dz2=p.z-cz, L=Math.hypot(dx,dz2)||1;
  var tx=clamp(p.x+dx/L*22.5-dz2/L*7,552,604), tz=clamp(p.z+dz2/L*22.5+dx/L*7,440,525), x=dcc.position.x/SC, z=dcc.position.z/SC;   // 0.9 m behind the guest, a little off one shoulder
  dcc.position.set((x+(tx-x)*frac)*SC,0.85,(z+(tz-z)*frac)*SC); }
H.onUpdate(function(dt){
  dcc.rotation.y=Math.atan2(cam.cam.position.x-dcc.position.x,cam.cam.position.z-dcc.position.z);
  if(ghost.active){ var look=H.gaze(565,1.28,412,3.5,0.93), away=!H.gaze(565,1.28,412,3.5,0.6);
    if(look){ if(ghost.moved){ ghost.moved=false; ghost.steps++; if(ghost.steps>=3) callPhone(); } ghost.seen=true; }
    else if(away && ghost.seen && !ghost.moved && ghost.steps<3){ ghost.seen=false; ghost.moved=true; stepDean(ghost.steps<2?0.55:1); }   // she moves only while nobody watches the monitor
    if(H.t-ghost.t0>20) callPhone(); }
  if(ghost.want && !ghost.done && calm()){ ghost.want=false; phoneCue.go(); }   // D2 waits for D1 to finish
  if(ringing){ ringT+=dt; for(var i=0;i<4;i++) lamps[i]=ringT%3<2?1:0;
    while(ringNext<=ringT){ if(ringNext%3<2){ H.sfx.tone(440,0.05,0.05,{x:591,z:408,type:'square'}); H.sfx.tone(480,0.05,0.05,{x:591,z:408,type:'square'}); } ringNext+=0.1; } }
  // check-in: the key is in hand once D3, D4 and the clerk have finished; Suite 1871 unlocks when S3 has finished (at once if the party is out of the lobby)
  if(key===1 && calm()) key=2;
  if(key===2 && !H.stay.checkedIn && calm() && (s3 || !inLobby(H.player()))) H.stay.checkedIn=true;
  // the knock: once the key is in hand, when the party is level with the proprietor's door; the fourth rap after S2 has been heard
  if(!kn && keyed() && calm() && H.inBox(440,468,545,540)){ kn=1; knock(); }
  else if(kn===2 && capIs('S2')) kn=3;
  else if(kn===3 && !capIs('S2')){ kn=4; knockT.push(H.after(0.3,function(){ rap(0.9); knockT.push(jitter(0.35)); })); }
  // canvas screens redraw (and re-upload) only when their picture changes
  tearScr.every=tear.visible?2:1e9; regScr.every=regWant(H.t)!==regShown?3:1e9; swScr.every=lamps.join('')!==swShown?1:1e9; neonScr.every=neonOn(H.t)!==neonShown?1:1e9;
  F++;
});

// ---------- 8. the knock ----------
function rap(g){ H.sfx.noise(0.18,500,g,{x:470,z:466}); }
function jitter(d){ return H.tween(d,function(p){ var k=0.003*Math.sin(p*d*6*2*PI); doorMesh.position.z=467.2*SC+k; doorMesh.position.x=470*SC+k; },function(){ doorMesh.position.z=467.2*SC; doorMesh.position.x=470*SC; }); }
function knock(){ knockT.push(jitter(1.2)); [0.5,0.6,0.9].forEach(function(g,i){ knockT.push(H.after(i*0.35,function(){ rap(g); })); });
  knockT.push(H.after(0.75,function(){ kn=2; talk('S2'); })); }   // she answers right after the third rap, while the party is still at the door

// ---------- 10. reset for the next group ----------
H.resets.push(function(){ desk.stop(); phoneCue.stop(); cam.on=false; tear.visible=false;
  dcc.visible=true; dcc.material.opacity=0; dcc.position.set(575*SC,0.85,515*SC);
  freshGhost(); for(var i=0;i<lamps.length;i++) lamps[i]=0; ringing=false; regT0=-1;
  knockT.forEach(function(w){ w.dead=true; }); knockT=[]; kn=0; key=0; s3=false; doorMesh.position.set(470*SC,1.1,467.2*SC);
  H.after(0.3,welcome); });
// a party that walks past the desk without a key is sent back for it
H.zone({x1:318,z1:392,x2:362,z2:432,once:false,when:function(){ return !H.stay.checkedIn; },enter:function(){ if(H.quiet && !H.quiet()) return; H.say('You will want your key first, dear. The front desk is back the way you came.',{at:'vestibule'}); }});
// a warm sconce over the vestibule so the Suite 1871 door reads in show mode
H.plight(338,406,2.2,0xffc98a,0.55,4.5);
})();
