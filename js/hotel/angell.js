/* Hotel Alice Lloyd: Suite 1871, Angell, "The Night the House Was Wired" (Room 1, the Dean's office behind the mirror, the Window).
   Room 1 x 193-346, z 420-540 + the alcove x 193-280, z 392-420; the mirror chamber x 70-190, z 415-500; the Window box x 220-272, z 362-390. */
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

var PI=Math.PI, mine=[], R=H.rng(1871);
function T(w){ mine.push(w); return w; }   // tweens this room owns, so resetRoom can cancel them
function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
function cv(w,h){ var c=document.createElement('canvas'); c.width=w; c.height=h; return c; }
function ell(g,x,y,rx,ry,f){ g.fillStyle=f; g.beginPath(); g.ellipse(x,y,rx,ry,0,0,PI*2); g.fill(); }

// ---------- lines and grilles ----------
H.addLines({
  A1:{t:'Sarah Caswell Angell came to Ann Arbor in September of 1871 and wrote home that she was \u2018so miserably lonely and homesick.\u2019 She spent the next thirty-two years making sure no student here felt that way.',at:'parlor'},
  A2:{t:'Before this University had a Dean of Women, it had Mrs. Angell. In 1896 the Daily wrote that \u2018her graciousness and kindly direction has aided many a college girl.\u2019',at:'parlor'},
  A3:{t:'Tonight it is 1891, the year the President\u2019s House was wired for electricity. The gas is not taking it well.',at:'parlor'},
  A4:{t:'There. Electric light. Now you can see everyone in the room.',at:'parlor'},
  A5:{t:'That was the footman. He has been waiting to take your coats since the Junior Hop of 1891.',at:'parlor'},
  A6:{t:'Look through the window. At every Junior Hop she \u2018met and welcomed every bud, debutante and society woman,\u2019 and she has never once left the receiving line.',at:'window'},
  A7:{t:'The Angells often had a young student named Alice Freeman in their home; you will meet her before the night is out. Suite 1876 is through that door.',at:'window'}
});
var n0=H.scene.children.length;   // scene-level meshes from here on are this file's (the glass sees them)
H.grille('parlor',345.2,2.3,470,-PI/2); H.grille('window',246,2.4,392.2,0);

// ---------- structure (scene level) ----------
H.curtain(280,420,318,420);                                    // V2: keeps the vestibule's west strip (Room 1's exit) off the room's body
H.curtain(220,362,272,362); H.curtain(272,362,272,390);        // the Window box (black duvetyne): north and east sides; west side is wall x=220, south is the window wall
H.seg(190,430,190,460); H.map.walls.push([190,430,190,460]);   // the two-way mirror fills the Dean's-office doorway
var d1871=H.suiteDoor({x1:318,z1:420,x2:346,z2:420,approach:-1,plate:['1871 \u00B7 ANGELL'],num:'1871',
  ready:function(){ return !!H.stay.checkedIn; }, onOpen:function(){ resetRoom(); delete H.stay.angellDone; pend=H.t; }});   // entered from the north; leaves swing into the room
var pend=null;   // the show clock starts once the lobby's lead-in (S3) has finished, so A1-A3 and the duel keep the script's grid

// ---------- content group ----------
var G=H.cull(H.group(0,0),[[60,388,365,545],[270,340,330,392]]);   // + the look back through the Suite 1876 doorway
function inRoom(){ return H.inBox(190,420,346,540) || H.inBox(190,390,318,420); }   // Room 1, the alcove and its exit strip: where the glass can be seen
function mg(list,mat){ var m=H.merge(list,mat); G.add(m); return m; }

// canvas art
function drawDamask(g,w,h){ g.fillStyle='#3a1830'; g.fillRect(0,0,w,h);
  for(var x=0;x<w;x+=4){ g.fillStyle='rgba(255,220,240,'+(0.02+0.02*Math.sin(x*0.21))+')'; g.fillRect(x,0,2,h); }
  function fleur(x,y){ g.save(); g.translate(x,y); g.fillStyle='rgba(206,164,78,0.7)';
    g.beginPath(); g.moveTo(0,-42); g.bezierCurveTo(15,-26,13,-6,0,6); g.bezierCurveTo(-13,-6,-15,-26,0,-42); g.fill();
    for(var s=-1;s<=1;s+=2){ g.beginPath(); g.moveTo(s*4,4); g.bezierCurveTo(s*32,-4,s*36,-30,s*18,-36); g.bezierCurveTo(s*28,-22,s*20,-6,s*6,10); g.fill(); }
    g.fillRect(-15,8,30,6); g.beginPath(); g.moveTo(-9,14); g.lineTo(9,14); g.lineTo(0,36); g.fill();
    g.strokeStyle='rgba(206,164,78,0.5)'; g.lineWidth=3; for(s=-1;s<=1;s+=2){ g.beginPath(); g.arc(s*28,24,10,0,PI*1.5); g.stroke(); } g.restore(); }
  function dia(x,y){ g.fillStyle='rgba(206,164,78,0.5)'; g.beginPath(); g.moveTo(x,y-10); g.lineTo(x+7,y); g.lineTo(x,y+10); g.lineTo(x-7,y); g.fill(); }
  for(var r=0;r<4;r++) for(var c=0;c<4;c++) fleur(c*128+64,r*128+64);
  for(r=0;r<=4;r++) for(c=0;c<=4;c++) dia(c*128,r*128); }
function drawOak(g,w,h){ g.fillStyle='#ecdcc4'; g.fillRect(0,0,w,h);
  for(var i=0;i<160;i++){ var y=R()*h; g.strokeStyle='rgba(90,60,30,'+(0.05+R()*0.1)+')'; g.lineWidth=1; g.beginPath(); g.moveTo(0,y); g.bezierCurveTo(w*0.3,y+R()*6-3,w*0.6,y+R()*6-3,w,y+R()*4-2); g.stroke(); }
  g.fillStyle='#fff6e6'; g.fillRect(0,0,w,7); g.fillStyle='#8a6a48'; g.fillRect(0,12,w,4);                // chair rail
  g.fillStyle='#6a4a30'; g.fillRect(0,h-30,w,30); g.fillStyle='#fff0da'; g.fillRect(0,h-33,w,3);           // baseboard
  for(var p=0;p<2;p++){ var x0=p*128+16, y0=34, pw=96, ph=h-34-50;
    g.fillStyle='#fff6e6'; g.fillRect(x0,y0,pw,3); g.fillRect(x0,y0,3,ph); g.fillStyle='#7a5a3a'; g.fillRect(x0,y0+ph-3,pw,3); g.fillRect(x0+pw-3,y0,3,ph);
    g.strokeStyle='rgba(90,60,30,0.5)'; g.lineWidth=2; g.strokeRect(x0+13,y0+13,pw-26,ph-26); } }
function drawRug(g,w,h){ g.fillStyle='#4a1834'; g.fillRect(0,0,w,h);
  g.fillStyle='rgba(184,146,58,0.5)'; [[40,40],[w-40,40],[40,h-40],[w-40,h-40]].forEach(function(c){ g.beginPath(); g.arc(c[0],c[1],74,0,PI*2); g.fill(); });
  g.fillStyle='#2a0e22'; g.fillRect(0,0,w,40); g.fillRect(0,h-40,w,40); g.fillRect(0,0,40,h); g.fillRect(w-40,0,40,h);
  g.strokeStyle='#b8923a'; g.lineWidth=6; g.strokeRect(6,6,w-12,h-12); g.lineWidth=4; g.strokeRect(40,40,w-80,h-80);
  g.fillStyle='#b8923a'; for(var i=30;i<w-20;i+=20){ [[i,23],[i,h-23],[23,i],[w-23,i]].forEach(function(p){ g.beginPath(); g.moveTo(p[0],p[1]-6); g.lineTo(p[0]+6,p[1]); g.lineTo(p[0],p[1]+6); g.lineTo(p[0]-6,p[1]); g.fill(); }); }
  ell(g,w/2,h/2,128,160,'#b8923a'); ell(g,w/2,h/2,112,144,'#2a0e22'); ell(g,w/2,h/2,86,112,'#6a2448');
  ell(g,w/2,h/2-176,30,18,'#b8923a'); ell(g,w/2,h/2+176,30,18,'#b8923a');
  for(var k=0;k<16;k++){ g.save(); g.translate(w/2,h/2); g.rotate(k*PI/8); ell(g,0,-44,k%2?5:9,k%2?16:26,k%2?'#8a6a2c':'#a88838'); g.restore(); }
  ell(g,w/2,h/2,22,22,'#2a0e22'); ell(g,w/2,h/2,12,12,'#a88838'); g.strokeStyle='#b8923a'; g.lineWidth=3; g.beginPath(); g.ellipse(w/2,h/2,70,92,0,0,PI*2); g.stroke();
  for(i=0;i<4000;i++){ g.fillStyle='rgba(0,0,0,'+(R()*0.14)+')'; g.fillRect(R()*w,R()*h,2,2); } }
function portrait(){ var c=cv(256,320), g=c.getContext('2d');   // lobby style: sepia oval vignette on #1a140e, head-and-shoulders, nameplate band y 290-318
  g.fillStyle='#1a140e'; g.fillRect(0,0,256,320);
  g.save(); g.beginPath(); g.ellipse(128,150,104,132,0,0,PI*2); g.clip();
  var gr=g.createRadialGradient(128,140,16,128,150,140); gr.addColorStop(0,'#cdb084'); gr.addColorStop(0.55,'#8f7048'); gr.addColorStop(1,'#1a140e'); g.fillStyle=gr; g.fillRect(0,0,256,320);
  g.fillStyle='#2b1d12'; g.beginPath(); g.moveTo(30,300); g.bezierCurveTo(40,228,84,206,128,204); g.bezierCurveTo(172,206,216,228,226,300); g.fill();   // dark silk dress
  g.fillStyle='#c4a174'; g.fillRect(114,166,28,40);                                                                                              // neck
  g.fillStyle='#e6d8b8'; g.beginPath(); g.moveTo(102,196); g.lineTo(154,196); g.lineTo(148,222); g.lineTo(128,232); g.lineTo(108,222); g.fill();   // lace collar
  g.strokeStyle='#a89468'; g.lineWidth=1; for(var i=0;i<6;i++){ g.beginPath(); g.arc(110+i*7.2,221-Math.abs(i-2.5)*2,3.5,0,PI); g.stroke(); }
  ell(g,128,132,34,44,'#d6b688');                                                                                                                // face
  ell(g,128,76,19,15,'#3a2616'); g.fillStyle='#3a2616'; g.beginPath(); g.moveTo(92,134); g.bezierCurveTo(84,92,104,82,128,82); g.bezierCurveTo(152,82,172,92,164,134);   // bun; hair parted and drawn back
  g.bezierCurveTo(160,112,150,100,128,100); g.bezierCurveTo(106,100,96,112,92,134); g.fill();
  g.strokeStyle='#5e4228'; g.lineWidth=1.5; g.beginPath(); g.moveTo(128,84); g.lineTo(128,100); g.stroke(); for(var j=0;j<4;j++){ g.beginPath(); g.moveTo(124-j*7,90+j*2); g.quadraticCurveTo(104-j*3,98,96,122); g.stroke(); g.beginPath(); g.moveTo(132+j*7,90+j*2); g.quadraticCurveTo(152+j*3,98,160,122); g.stroke(); }
  g.fillStyle='#2a1a0e'; ell(g,110,128,6,3.4,'#2a1a0e'); ell(g,146,128,6,3.4,'#2a1a0e');                                                       // eyes 18 px either side
  g.strokeStyle='#4a3220'; g.lineWidth=2; g.beginPath(); g.arc(110,124,9,PI*1.15,PI*1.85); g.stroke(); g.beginPath(); g.arc(146,124,9,PI*1.15,PI*1.85); g.stroke();
  g.beginPath(); g.moveTo(128,132); g.lineTo(124,148); g.lineTo(130,149); g.stroke(); g.strokeStyle='#8a4a3a'; g.beginPath(); g.moveTo(118,160); g.quadraticCurveTo(128,164,138,160); g.stroke();
  ell(g,128,238,6,6,'#e0c070');                                                                                                                  // brooch
  g.restore();
  g.strokeStyle='rgba(26,20,14,0.9)'; g.lineWidth=8; g.beginPath(); g.ellipse(128,150,104,132,0,0,PI*2); g.stroke();
  g.textAlign='center'; g.textBaseline='middle'; g.fillStyle='rgba(205,185,145,0.6)'; g.font='7px Georgia,serif'; g.fillText('Photograph: Bentley Historical Library (placeholder)',128,285);
  g.fillStyle='#b8923a'; g.fillRect(20,290,216,28); g.strokeStyle='#6a4a1a'; g.lineWidth=2; g.strokeRect(21,291,214,26);
  g.fillStyle='#1d1408'; g.font='bold 13px Georgia,serif'; g.fillText('SARAH CASWELL ANGELL',128,299); g.font='9px Georgia,serif'; g.fillText('FIRST LADY OF THE UNIVERSITY \u00B7 1871\u20131903',128,311);
  return c; }
function figureTex(kind){ var c=cv(128,320), g=c.getContext('2d');   // transparent, pale full-length figure for the Pepper's ghost
  var body=g.createLinearGradient(0,40,0,320); body.addColorStop(0,'rgba(235,240,255,0.95)'); body.addColorStop(1,'rgba(140,155,195,0.55)');
  var lite='rgba(228,234,255,0.95)', dim='rgba(50,60,95,0.55)', skin='rgba(255,242,232,1)';
  if(kind==='angell'){   // 1890s: bodice with leg-of-mutton sleeves, full skirt, lace collar, hair in a bun
    g.fillStyle=body; g.beginPath(); g.moveTo(52,126); g.bezierCurveTo(40,190,16,262,8,314); g.quadraticCurveTo(64,322,120,314); g.bezierCurveTo(112,262,88,190,76,126); g.closePath(); g.fill();
    g.strokeStyle=dim; g.lineWidth=2; [22,42,64,86,106].forEach(function(x){ g.beginPath(); g.moveTo(64+(x-64)*0.2,136); g.quadraticCurveTo(64+(x-64)*0.7,230,x,312); g.stroke(); });
    g.fillStyle=lite; g.beginPath(); g.moveTo(46,62); g.lineTo(82,62); g.lineTo(75,128); g.lineTo(53,128); g.closePath(); g.fill();
    ell(g,40,76,14,18,lite); ell(g,88,76,14,18,lite);
    g.fillStyle='rgba(212,220,246,0.9)'; g.beginPath(); g.moveTo(28,84); g.lineTo(44,88); g.lineTo(60,124); g.lineTo(52,130); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(100,84); g.lineTo(84,88); g.lineTo(68,124); g.lineTo(76,130); g.closePath(); g.fill();
    ell(g,64,127,9,6,skin); g.strokeStyle=dim; g.beginPath(); g.moveTo(50,128); g.lineTo(78,128); g.stroke();
    g.fillStyle=skin; g.fillRect(58,44,12,14); for(var i=0;i<7;i++) ell(g,50+i*4.7,59,3.4,3.4,'rgba(255,255,255,1)');
    ell(g,64,34,11,14,skin); ell(g,64,25,12.5,8,'rgba(165,155,150,0.95)'); ell(g,64,13,7,6,'rgba(165,155,150,0.95)');
  } else {               // 1940s: jacket with padded shoulders, straight skirt, waved hair, pearls
    g.fillStyle=body; g.beginPath(); g.moveTo(46,150); g.lineTo(82,150); g.lineTo(85,248); g.lineTo(43,248); g.closePath(); g.fill();
    g.fillStyle='rgba(200,208,232,0.75)'; g.fillRect(50,248,9,54); g.fillRect(69,248,9,54); ell(g,54,305,8,4,lite); ell(g,74,305,8,4,lite);
    g.fillStyle=lite; g.beginPath(); g.moveTo(38,62); g.lineTo(90,62); g.lineTo(82,118); g.lineTo(90,160); g.lineTo(38,160); g.lineTo(46,118); g.closePath(); g.fill();
    g.fillStyle='rgba(212,220,246,0.9)'; g.beginPath(); g.moveTo(30,62); g.lineTo(40,62); g.lineTo(38,150); g.lineTo(29,150); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(98,62); g.lineTo(88,62); g.lineTo(90,150); g.lineTo(99,150); g.closePath(); g.fill();
    ell(g,33,155,5,6,skin); ell(g,95,155,5,6,skin); ell(g,34,64,9,6,lite); ell(g,94,64,9,6,lite);
    g.strokeStyle=dim; g.lineWidth=2; g.beginPath(); g.moveTo(52,64); g.lineTo(64,104); g.lineTo(76,64); g.stroke(); g.fillStyle=dim; g.fillRect(40,118,48,5);
    g.fillStyle=skin; g.fillRect(58,46,12,14); for(i=0;i<7;i++) ell(g,52+i*4,57+Math.abs(i-3)*-0.8+2.4,1.9,1.9,'rgba(255,255,255,1)');
    ell(g,64,35,11,14,skin); ell(g,64,25,14,9,'rgba(185,180,172,0.95)'); ell(g,52,34,5,8,'rgba(185,180,172,0.95)'); ell(g,76,34,5,8,'rgba(185,180,172,0.95)');
  }
  g.fillStyle='rgba(40,50,80,0.6)'; g.fillRect(58,33,4,1.6); g.fillRect(66,33,4,1.6); g.fillRect(61,41,6,1.3);
  var fade=g.createLinearGradient(0,0,0,320); fade.addColorStop(0,'rgba(0,0,0,0.8)'); fade.addColorStop(0.6,'rgba(0,0,0,0.7)'); fade.addColorStop(1,'rgba(0,0,0,0.12)');
  g.globalCompositeOperation='destination-in'; g.fillStyle=fade; g.fillRect(0,0,128,320);   // translucent, and the hem dissolves
  return new THREE.CanvasTexture(c); }
function drawFlame(g,t,w,h){ g.clearRect(0,0,w,h); var fl=0.86+0.08*Math.sin(t*9.3)+0.05*Math.sin(t*23.1), sw=4*Math.sin(t*6.1);
  var gr=g.createRadialGradient(w/2,h*0.72,2,w/2,h*0.62,w*0.6); gr.addColorStop(0,'rgba(255,250,225,1)'); gr.addColorStop(0.4,'rgba(255,170,60,0.95)'); gr.addColorStop(1,'rgba(255,80,0,0)');
  g.fillStyle=gr; g.beginPath(); g.moveTo(w/2+sw,h*(1-0.95*fl)); g.quadraticCurveTo(w*0.98,h*0.72,w/2,h*0.97); g.quadraticCurveTo(w*0.02,h*0.72,w/2+sw,h*(1-0.95*fl)); g.fill(); }

// materials
var damT=H.canvasTex(512,512,drawDamask); damT.size=[0.8,0.8];
var oakT=H.canvasTex(256,256,drawOak); oakT.size=[0.9,0.9];
var rugT=H.canvasTex(512,512,drawRug); rugT.size=[4.8,3.84];
var damMat=H.lam(0xffffff,{map:damT}), oakMat=H.lam(0x5a3a22,{map:oakT}), rugMat=H.lam(0xffffff,{map:rugT});
var gilt=H.lam(0xb8923a), brass=M.brass, pianoMat=H.lam(0x2b1810), ivory=H.lam(0xe8e2d0), plum=H.lam(0x4a1838), wood=H.lam(0x3a2416);
var bulbMat=H.glow(0xfff2dd,0), gasMat=H.glow(0xff9a40,0.9,{side:THREE.DoubleSide}), chSconceMat=H.glow(0xff9a40,0,{side:THREE.DoubleSide});
var flameScr=H.screen(64,128,drawFlame,{x:266,z:470,range:8,every:3});
var flameMat=new THREE.MeshBasicMaterial({map:flameScr.tex,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide});

// walls: damask (y 0.9-2.5) over oak wainscot (y 0-0.9); [axis, at, from, to, ry, y0, y1]
var FACES=[['x',192.2,392,430,PI/2],['x',192.2,460,539.4,PI/2],['x',345.4,420.4,539.4,-PI/2],['z',539.4,192.2,345.4,PI],['z',420.6,280,318,0],
  ['z',392.2,192.2,222,0],['z',392.2,268,280,0],['x',72.2,417,498,PI/2],['z',417.2,72,188,0],['z',497.8,72,188,PI]];
function spans(mat,y0,y1,defs,list){ defs.forEach(function(d){ var a=d[5]==null?y0:d[5], b=d[6]==null?y1:d[6], w=Math.abs(d[3]-d[2])*SC, h=b-a;
  var geo=new THREE.PlaneGeometry(w,h,Math.ceil(w/0.5),3); H.scaleUV(geo,w/mat.map.size[0],h/mat.map.size[1]);
  var m=new THREE.Mesh(geo,mat), mid=(d[2]+d[3])/2; if(d[0]==='x') m.position.set(d[1]*SC,(a+b)/2,mid*SC); else m.position.set(mid*SC,(a+b)/2,d[1]*SC);
  m.rotation.y=d[4]; list.push(m); }); return list; }
var frieze=spans(damMat,2.5,H.WALL_H,FACES.concat([['z',392.12,222,268,0],['x',192.2,430,460,PI/2]]),[]);   // plain plum frieze above the picture rail (also closes the gap over the curtains)
frieze.forEach(function(m){ var uv=m.geometry.attributes.uv; for(var i=0;i<uv.count;i++) uv.setXY(i,0.25,0.875); });
mg(spans(damMat,0.9,2.5,FACES.concat([['z',392.12,222,268,0,2.16,2.5],['x',192.2,430,460,PI/2,2.13,2.5]]),frieze),damMat);   // + over the window and over the mirror
mg(spans(oakMat,0,0.9,FACES.concat([['z',392.2,222.8,267.2,0,0,0.88]]),[]),oakMat);                                       // + under the window
H.box(0.16,H.WALL_H-2.13,1.2,M.wall,190,(H.WALL_H+2.13)/2,445,0,G);                                                        // header over the office doorway
G.add(H.floorPatch(215,432,335,528,rugMat));
var rug2=H.floorPatch(96,424,182,492,rugMat); H.scaleUV(rug2.geometry,4.8/(86*SC),3.84/(68*SC)); G.add(rug2);                // the chamber's copy

// gilt: portrait frames, the mirror frame, picture rails at y 2.5
var giltL=[];
function frame(cx,cy,cz,w,h,alongZ){ var t=0.05, d=0.04, o=(w/2+t/2)/SC;
  if(alongZ) giltL.push(H.box(d,t,w+2*t,gilt,cx,cy+h/2+t/2,cz),H.box(d,t,w+2*t,gilt,cx,cy-h/2-t/2,cz),H.box(d,h,t,gilt,cx,cy,cz-o),H.box(d,h,t,gilt,cx,cy,cz+o));
  else giltL.push(H.box(w+2*t,t,d,gilt,cx,cy+h/2+t/2,cz),H.box(w+2*t,t,d,gilt,cx,cy-h/2-t/2,cz),H.box(t,h,d,gilt,cx-o,cy,cz),H.box(t,h,d,gilt,cx+o,cy,cz)); }
frame(319,1.95,539.3,0.55,0.69,false); frame(72.4,1.95,452,0.55,0.69,true);
giltL.push(H.box(0.06,0.8,1.2,gilt,190.4,0.4,445),H.box(0.06,0.23,1.2,gilt,190.4,2.015,445),H.box(0.06,1.1,0.2,gilt,190.4,1.35,432.5),H.box(0.06,1.1,0.2,gilt,190.4,1.35,457.5));
FACES.forEach(function(d){ var L=Math.abs(d[3]-d[2])*SC, m=(d[2]+d[3])/2; giltL.push(d[0]==='x'?H.box(0.02,0.03,L,gilt,d[1],2.5,m):H.box(L,0.03,0.02,gilt,m,2.5,d[1])); });
mg(giltL,gilt);

// portraits: hers over the piano; the chamber hangs the same one, mirror-reversed
var pc=portrait(), pt=new THREE.CanvasTexture(pc), pt2=new THREE.CanvasTexture(pc); pt2.repeat.x=-1; pt2.offset.x=1;
H.plane(0.55,0.69,H.lam(0xffffff,{map:pt}),319,1.95,539.3,PI,G);
H.plane(0.55,0.69,H.lam(0xffffff,{map:pt2}),72.4,1.95,452,PI/2,G);

// the upright piano against QN (and its double in the chamber)
mg([H.box(1.5,1.25,0.52,pianoMat,319,0.625,532.5),H.box(1.56,0.04,0.56,pianoMat,319,1.27,532.5),H.box(1.5,1.25,0.52,pianoMat,78.5,0.625,452,PI/2)],pianoMat);
H.seg(300,521,338,521); H.seg(300,521,300,539); H.seg(338,521,338,539);
var keysT=H.canvasTex(256,32,function(g,w,h){ g.fillStyle='#f4efe2'; g.fillRect(0,0,w,h); g.fillStyle='#8a8478'; for(var i=0;i<=36;i++) g.fillRect(i*w/36,0,1,h);
  g.fillStyle='#16110d'; for(i=0;i<36;i++){ var k=i%7; if(k!==2&&k!==6) g.fillRect((i+0.68)*w/36,h*0.42,w/36*0.64,h*0.58); } });
var keys=H.plane(1.3,0.14,H.lam(0xffffff,{map:keysT}),319,0.782,522.4,0,G); keys.rotation.x=-PI/2;

// brass: chandelier, sconce arms, electroliers, the rope posts; bulbs; tulip shades; flames
var brassL=[], bulbL=[], shadeL=[], chShadeL=[], flameL=[];
brassL.push(H.cyl(0.07,0.05,0.04,brass,266,2.70,480,12),H.cyl(0.012,0.012,0.43,brass,266,2.47,480,6),H.cyl(0.08,0.03,0.1,brass,266,2.22,480,12));
var ring=new THREE.Mesh(new THREE.TorusGeometry(0.35,0.015,8,24)); ring.rotation.x=PI/2; ring.position.set(266*SC,2.25,480*SC); brassL.push(ring);
for(var i=0;i<5;i++){ var a=i*2*PI/5, ca=Math.cos(a), sa=Math.sin(a);
  var arm=H.cyl(0.01,0.01,0.35,brass,266+ca*0.175/SC,2.25,480+sa*0.175/SC,6); arm.rotation.set(0,-a,PI/2); brassL.push(arm);
  brassL.push(H.cyl(0.022,0.014,0.04,brass,266+ca*0.35/SC,2.28,480+sa*0.35/SC,8)); bulbL.push(H.ball(0.03,bulbMat,266+ca*0.35/SC,2.33,480+sa*0.35/SC)); }
function sconce(x,z,dir,shades,flames){ var u=function(m){ return m/SC*dir; };
  brassL.push(H.box(0.02,0.18,0.09,brass,x,1.83,z)); var am=H.cyl(0.009,0.009,0.15,brass,x+u(0.075),1.8,z,6); am.rotation.z=PI/2; brassL.push(am);
  brassL.push(H.cyl(0.018,0.01,0.04,brass,x+u(0.15),1.8,z,8));
  var sh=new THREE.Mesh(new THREE.ConeGeometry(0.06,0.12,10,1,true)); sh.position.set((x+u(0.15))*SC,1.88,z*SC); sh.rotation.x=PI; shades.push(sh);
  if(flames) for(var k=0;k<2;k++){ var f=new THREE.Mesh(new THREE.PlaneGeometry(0.04,0.08)); f.position.set((x+u(0.15))*SC,1.95,z*SC); f.rotation.y=k*PI/2+PI/4; flames.push(f); } }
sconce(192.3,405,1,shadeL,flameL); sconce(192.3,500,1,shadeL,flameL); sconce(345.3,445,-1,shadeL,flameL); sconce(345.3,505,-1,shadeL,flameL);
sconce(72.3,425,1,chShadeL,null);
[[201,468],[288,532]].forEach(function(p){   // bare-bulb electroliers: the 'electric' side
  brassL.push(H.cyl(0.13,0.16,0.04,brass,p[0],0.02,p[1],14),H.cyl(0.016,0.016,1.96,brass,p[0],1.0,p[1],8),H.cyl(0.022,0.016,0.05,brass,p[0],1.985,p[1],8));
  bulbL.push(H.ball(0.03,bulbMat,p[0],2.02,p[1])); H.seg(p[0]-0.2,p[1],p[0]+0.2,p[1]); });
[[206,426],[206,464]].forEach(function(p){ brassL.push(H.cyl(0.12,0.14,0.03,brass,p[0],0.015,p[1],14),H.cyl(0.022,0.022,0.92,brass,p[0],0.49,p[1],8),H.ball(0.04,brass,p[0],0.97,p[1])); });
var rope=new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(new THREE.Vector3(206*SC,0.9,427*SC),new THREE.Vector3(206*SC,0.6,445*SC),new THREE.Vector3(206*SC,0.9,463*SC)),14,0.016,6,false),H.lam(0x7a1422));
G.add(rope); H.seg(206,426,206,464);   // safety rope 0.6 m in front of the mirror
mg(brassL,brass); mg(bulbL,bulbMat); mg(shadeL,gasMat); mg(chShadeL,chSconceMat); mg(flameL,flameMat);

// settee, tea table (lace, teapot, three cups), the Michigras card
mg([H.box(0.58,0.26,1.52,plum,201.8,0.32,498),H.box(0.12,0.55,1.6,plum,195.8,0.72,498),H.box(0.1,0.16,0.8,plum,195.8,1.06,498),
  H.box(0.58,0.22,0.1,plum,201.8,0.56,479.5),H.box(0.58,0.22,0.1,plum,201.8,0.56,516.5)],plum);
H.seg(209.5,478,209.5,518); H.seg(194,478,209.5,478); H.seg(194,518,209.5,518);
var woodL=[H.cyl(0.45,0.45,0.03,wood,222,0.705,500,28),H.cyl(0.05,0.07,0.62,wood,222,0.38,500,10),H.cyl(0.22,0.26,0.06,wood,222,0.03,500,16)];
[[196.5,480.5],[196.5,515.5],[208,480.5],[208,515.5]].forEach(function(p){ woodL.push(H.box(0.05,0.19,0.05,wood,p[0],0.095,p[1])); });
mg(woodL,wood); H.seg(211,489,233,489); H.seg(233,489,233,511); H.seg(233,511,211,511); H.seg(211,511,211,489);
var ivL=[H.box(1.3,0.06,0.2,ivory,319,0.75,523.5),H.cyl(0.48,0.48,0.006,ivory,222,0.723,500,28),H.box(1.3,0.06,0.2,ivory,87.5,0.75,452,PI/2)];
var pot=H.ball(0.07,ivory,215.5,0.782,498); pot.scale.y=0.8; ivL.push(pot,H.ball(0.016,ivory,215.5,0.85,498));
var sp=H.cyl(0.01,0.018,0.1,ivory,218.5,0.8,498,8); sp.rotation.z=-0.9; ivL.push(sp);
var hd=new THREE.Mesh(new THREE.TorusGeometry(0.032,0.008,6,12)); hd.position.set(212.4*SC,0.79,498*SC); ivL.push(hd);
[[228,505],[228.5,494],[219,508]].forEach(function(p){ ivL.push(H.cyl(0.055,0.055,0.006,ivory,p[0],0.729,p[1],14),H.cyl(0.035,0.027,0.05,ivory,p[0],0.757,p[1],10)); });
mg(ivL,ivory);
var card=H.plane(0.15,0.1,H.lam(0xffffff,{map:H.textTexture(['ANGELL HOUSE','MICHIGRAS 1956','\u2018BLOW, GABRIEL, BLOW\u2019'],{w:256,h:170,fs:24,bg:'#efe3c8',fg:'#33261a',border:'#8a6a2a',bw:6,boldFirst:true})}),223.5,0.73,500.5,0,G);
card.rotation.set(-PI/2,0,1.35);
H.sign(['SARAH CASWELL','ANGELL HALL \u00B7 1905'],{w:512,h:256,fs:56,bg:'#6b5226',fg:'#f2dc98',border:'#c9a44e',bw:10,boldFirst:true},0.4,0.2,204,1.5,392.4,0,G);

// ---------- the mirror and the chamber ----------
var mir=H.mirror({x:190.8,z:445,y:1.35,w:0.8,h:1.1,ry:Math.PI/2,res:384,every:2,range:6,tint:0xc9cfd6}); mir.on=false;
var RL=6; mir.cam.layers.set(RL); mir.cam.layers.enable(H.FEED_LAYER);   // the glass draws only the room (layer 6, see roomLayer) and the feed-only figures
var glass=H.plane(0.8,1.1,new THREE.MeshBasicMaterial({color:0x1a2228,transparent:true,opacity:0.12,depthWrite:false}),190.6,1.35,445,Math.PI/2,G);
var faceT=H.canvasTex(128,64,function(g,w,h){ g.fillStyle='#ffffff'; g.fillRect(0,0,w,h); var x=w*0.25;
  g.fillStyle='#1a1414'; g.fillRect(x-8,27,5,3); g.fillRect(x+3,27,5,3); g.fillStyle='#6a5a50'; g.fillRect(x-9,23,7,1.5); g.fillRect(x+2,23,7,1.5);
  g.fillStyle='#b05a5a'; g.fillRect(x-4,40,8,2); ell(g,x-10,36,3,2,'rgba(210,120,120,0.5)'); ell(g,x+10,36,3,2,'rgba(210,120,120,0.5)'); g.fillStyle='#1a1414'; g.fillRect(x+7,33,1.5,1.5); });
var faceMat=H.lam(0xe8e0d0,{map:faceT,emissive:0x4a443c}), wigMat=H.lam(0xb4b2ac,{emissive:0x3a3a38}), gloveMat=H.lam(0xf2efe6,{emissive:0x505050});   // a little self-light: he is backlit
function footman(){ var f=H.figure(0x101014,0xe8e0d0,G); f.children[1].material=faceMat;
  var wig=new THREE.Mesh(new THREE.SphereGeometry(0.12,12,8),wigMat); wig.position.set(0,1.62,-0.035); wig.scale.set(1.08,0.82,1.0); f.add(wig);
  var a=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.11,0.05)), b=new THREE.Mesh(new THREE.BoxGeometry(0.08,0.11,0.05)); a.position.set(-0.19,1.42,0.24); b.position.set(0.19,1.42,0.24);
  var gl=H.merge([a,b],gloveMat); f.add(gl); f.userData.gloves=gl; f.visible=false; return f; }
var foot=footman(), footGhost=H.feedOnly(footman());   // the Footman; his ghost exists only in the glass
var mirror={state:'idle',t:0,tw:null};

// ---------- the light duel ----------
var gasL=H.plight(266,470,2.1,0xff9a40,0.9,7), elecL=H.plight(266,470,2.35,0xeef2ff,0,8), chamberL=H.plight(140,452,1.9,0xffd0a0,0,5);
var lv={g:0.9,e:0,hg:0.9,he:0}, hiss=null, buzz=null, duel={on:false,t0:0,hs:false,pop:false}, away=0;
function setLevels(g,e){ gasL.intensity=g; gasMat.emissiveIntensity=g; flameMat.opacity=Math.min(1,g/0.9); elecL.intensity=e; bulbMat.emissiveIntensity=e/1.4;
  if(hiss && Math.abs(g-lv.hg)>0.02){ hiss.set(0.012*g); lv.hg=g; } if(buzz && Math.abs(e-lv.he)>0.02){ buzz.set(0.008*e); lv.he=e; } lv.g=g; lv.e=e; }
function startLoops(){ if(!hiss) hiss=H.sfx.loop({kind:'noise',type:'highpass',freq:3000,gain:0.012,x:266,z:470}); if(!buzz) buzz=H.sfx.loop({kind:'hum',freq:120,gain:0.008,x:266,z:470});
  T(H.after(1.6,function(){ if(hiss) hiss.set(0.012*lv.g); if(buzz) buzz.set(0.008*lv.e); lv.hg=lv.g; lv.he=lv.e; })); }   // loops fade in, then follow the lights
function stopLoops(){ if(hiss){ hiss.stop(); hiss=null; } if(buzz){ buzz.stop(); buzz=null; } }
function levelsAt(d){
  if(d<4) return [0.9,0];
  if(d<7) return [0.6,d<4.25?1.2:0];
  if(d<9) return [0.35+0.25*H.flick(d,1.5,0.5),d<7.5?0.9:0];
  if(d<15){ var k=Math.floor((d-9)/0.72)%2; return k?[0.25,1.1]:[0.9,0.05]; }       // each light toggles every 0.72 s
  if(d<21){ var k2=Math.floor((d-15)/0.36)%2; return k2?[0.25,1.1]:[0.9,0.05]; }    // every 0.36 s: 1.4 Hz per light
  if(d<24){ var f=H.flick(d,2,0.5); return [0.9*f,f>0.5?0.05:1.1]; }
  if(d<25.5) return [0,0];                                                          // the one blackout
  return [0,1.4]; }

// piano: the opening of the 'Moonlight' Sonata, bars 1-4, one triplet eighth every 0.36 s, looped until the blackout
var N={Fs1:46.25,Gs1:51.91,A1:55,B1:61.74,Cs2:69.3,Fs2:92.5,Gs2:103.83,A2:110,B2:123.47,Cs3:138.59,Fs3:185,Gs3:207.65,A3:220,Bs3:261.63,Cs4:277.18,D4:293.66,Ds4:311.13,E4:329.63,Fs4:369.99};
var RH=[], LH={0:[N.Cs2,N.Cs3,4],12:[N.B1,N.B2,4],24:[N.A1,N.A2,2.1],30:[N.Fs1,N.Fs2,2.1],36:[N.Gs1,N.Gs2,4]};
function trip(a,b,c,n){ for(var i=0;i<n;i++) RH.push(a,b,c); }
trip(N.Gs3,N.Cs4,N.E4,4); trip(N.Gs3,N.Cs4,N.E4,4); trip(N.A3,N.Cs4,N.E4,2); trip(N.A3,N.D4,N.Fs4,2);
RH.push(N.Gs3,N.Bs3,N.Fs4, N.Gs3,N.Cs4,N.E4, N.Gs3,N.Cs4,N.Ds4, N.Fs3,N.Bs3,N.Ds4);
var piano={on:false,t:0,next:0,i:0}, waltz={on:false,t:0,next:0,b:0};

// ---------- the Window: a Pepper's ghost behind the interior window ----------
var petg=H.plane(0.9,1.2,new THREE.MeshBasicMaterial({color:0xcfe0ff,transparent:true,opacity:0.04,depthWrite:false,side:THREE.DoubleSide}),246,1.5,376,PI/4,G);
var edge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(0.9,1.2)),new THREE.LineBasicMaterial({color:0xcfe0ff,transparent:true,opacity:0.08}));
edge.position.copy(petg.position); edge.rotation.copy(petg.rotation); G.add(edge);
var liner=new THREE.Mesh(new THREE.PlaneGeometry(1.1,H.WALL_H)); liner.position.set(222.3*SC,H.WALL_H/2,376*SC); liner.rotation.y=PI/2;
mg([H.box(0.08,1.1,0.65,M.black,267,1.3,376),liner,H.floorPatch(222,362,272,390,M.black,0.004)],M.black);   // TV on its side behind the east jamb; the box lined black
var hazeT=H.canvasTex(256,128,function(g,w,h){ var gr=g.createRadialGradient(w/2,h*0.55,4,w/2,h*0.55,w*0.55); gr.addColorStop(0,'rgba(255,200,130,1)'); gr.addColorStop(0.5,'rgba(190,110,50,0.5)'); gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr; g.fillRect(0,0,w,h); for(var i=0;i<16;i++){ var x=10+R()*(w-20), y=8+R()*h*0.45, r=3+R()*7, b=g.createRadialGradient(x,y,0,x,y,r);
    b.addColorStop(0,'rgba(255,240,200,0.9)'); b.addColorStop(1,'rgba(255,200,120,0)'); g.fillStyle=b; g.fillRect(x-r,y-r,2*r,2*r); } });
var backdropMat=new THREE.MeshBasicMaterial({map:hazeT,transparent:true,opacity:0.08,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
H.plane(2.0,1.2,backdropMat,246,1.3,362.8,0,G);
var hostMat=H.holoMat(figureTex('angell'),0xcfe0ff), deanMat=H.holoMat(figureTex('lloyd'),0xe0e8ff);
var host=H.plane(0.55,1.5,hostMat,238,1.15,372,0,G), dean=H.plane(0.55,1.6,deanMat,254,1.2,374,0,G);
var win={armed:false,started:false,due:false,stage:0,t0:0};   // stage 1: A6 playing, 2: pause, 3: the Dean and A7, 4: Suite 1876 may open
function armWindow(){ if(win.armed) return; win.armed=true; H.cap('The window in the alcove begins to glow.'); T(H.after(2.5,function(){ H.cap(''); })); T(H.fade(backdropMat,0.18,1.5)); }
function windowBeat(){ if(win.started) return; if(!win.armed){ win.armed=true; T(H.fade(backdropMat,0.18,1.5)); }
  win.started=true; win.stage=1; win.t0=H.t; H.line('A6'); T(H.fade(hostMat,0.85,1.5)); waltz.on=true; waltz.t=0; waltz.next=0; waltz.b=0; }
function deanIn(){ win.stage=3; win.t0=H.t; T(H.fade(deanMat,0.85,1.5)); T(H.tween(1,function(p){ dean.scale.x=0.25+0.75*p; })); H.line('A7'); }
function winTick(){ var el=H.t-win.t0;   // each step waits for the line before it to finish (the voice can run longer than the caption estimate)
  if(win.stage===1 && el>1 && (H.quiet() || el>2.6*H.lineDur('A6'))){ win.stage=2; T(H.after(0.5,deanIn)); }
  else if(win.stage===3 && el>1 && (H.quiet() || el>2.6*H.lineDur('A7'))){ win.stage=4; H.stay.angellDone=true;
    T(H.after(30,function(){ T(H.fade(hostMat,0,2)); T(H.fade(deanMat,0,2)); waltz.on=false; })); } }
H.zone({x1:194,z1:392,x2:280,z2:420,once:false,when:function(){ return win.armed && !win.started; },enter:windowBeat});

// ---------- mirror state machine: idle > wait > ghost > snap > done ----------
function toGhost(){ mirror.state='ghost'; mirror.t=0; footGhost.visible=true; mirror.tw=T(H.lightTo(chamberL,0.5,2)); H.sfx.whisper({x:190,z:445}); }
function slap(){ H.sfx.bang({x:190,z:445}); var gl=foot.userData.gloves; T(H.tween(0.14,function(p){ gl.position.z=0.08*Math.sin(p*PI); })); }
function toSnap(){ mirror.state='snap'; mirror.t=0; if(mirror.tw) mirror.tw.dead=true;
  setLevels(0,0.05); chamberL.intensity=1.6; mir.on=false; mir.mesh.visible=false; footGhost.visible=false;
  foot.position.set(182*SC,0,clamp(H.player().z,441,449)*SC); foot.rotation.y=PI/2; foot.visible=true;   // both gloves stay inside the glass (z 435-455)
  slap(); T(H.after(0.25,slap)); T(H.after(0.45,function(){ H.sfx.sting({x:190,z:445}); H.scare('MAY I TAKE YOUR COAT?',1.6); })); }
function toDone(){ mirror.state='done'; away=0; T(H.lightTo(chamberL,0,0.4)); foot.visible=false; mir.mesh.visible=true; setLevels(0.6,0.8);
  T(H.after(1,function(){ H.line('A5'); })); T(H.after(1+H.lineDur('A5')+1.5,armWindow)); T(H.after(25,function(){ win.due=true; })); }
// after the show, the parlor banks its lights once the guest has gone (a glow for the look back from the doorway, then dark), and relights if they return
function afterTick(dt){ away=H.inBox(190,388,350,545)?0:away+dt;
  var far=away>2 && !H.inBox(190,340,350,545), tg=away<2?[0.6,0.8]:far?[0,0]:[0.15,0], k=Math.min(1,dt*1.5);
  var g=lv.g+(tg[0]-lv.g)*k, e=lv.e+(tg[1]-lv.e)*k; if(Math.abs(g-tg[0])<0.003) g=tg[0]; if(Math.abs(e-tg[1])<0.003) e=tg[1];
  if(g!==lv.g || e!==lv.e) setLevels(g,e);
  if(away>2) waltz.on=false;
  if(far && lv.g<0.01) stopLoops(); else if(away<2 && !hiss) startLoops(); }

// the glass renders layer 6 only: this file's meshes, the lights, and the shell (floor, ceiling, walls, curtains, doors) around Room 1
function roomLayer(){ var A=new THREE.Box3(new THREE.Vector3(186*SC,-1,386*SC),new THREE.Vector3(350*SC,9,545*SC)), b=new THREE.Box3(), size=new THREE.Vector3(), FO=1<<H.FEED_LAYER;
  function on(o){ o.traverse(function(c){ if(c.layers.mask!==FO) c.layers.enable(RL); }); }   // feed-only figures (the Footman's ghost, the avatar) keep layer 5
  H.scene.updateMatrixWorld(true);
  H.scene.traverse(function(o){ if(o.isLight) o.layers.enable(RL); });   // every light, so the glass is lit exactly like the room
  own.forEach(function(c){ if(c!==mir.mesh && !c.isLight) on(c); });
  H.scene.children.forEach(function(c){ if(c===mir.mesh || c.isLight || own.indexOf(c)>=0) return;
    var cam=false; c.traverse(function(o){ if(o.isCamera) cam=true; }); if(cam || !(c.isMesh || c.isGroup)) return;
    b.setFromObject(c); if(b.isEmpty() || !b.intersectsBox(A)) return; b.getSize(size);
    if(c.isMesh || Math.max(size.x,size.z)<3) on(c); }); }   // other files' big content groups stay out of the glass

H.onUpdate(function(dt,t){
  mir.on=inRoom() && d1871.isOpen && mirror.state!=='snap';   // never behind a closed door
  if(pend!==null && (H.quiet() || H.t-pend>10)){ pend=null; show.go(); }
  if(win.stage) winTick();
  if(win.due && !win.started && inRoom()) windowBeat();
  if(duel.on){ var d=H.t-duel.t0, L=levelsAt(d);
    if(d>=7 && !duel.hs){ duel.hs=true; H.sfx.noise(0.7,3500,0.25,{type:'highpass',decay:1,x:266,z:470}); }
    if(d>=24 && !duel.pop){ duel.pop=true; piano.on=false; H.sfx.noise(0.08,2200,0.7,{x:266,z:480}); H.sfx.tone(160,0.3,0.12,{glide:50,x:266,z:480}); }
    setLevels(L[0],L[1]); if(d>=25.5) duel.on=false; }
  if(piano.on){ piano.t+=dt; if(piano.t-piano.next>1) piano.next=piano.t;
    while(piano.t>=piano.next){ var i=piano.i%48, lh=LH[i]; H.sfx.tone(RH[i],0.9,0.05,{type:'triangle',x:319,z:530});
      if(lh){ H.sfx.tone(lh[0],lh[2],0.08,{type:'triangle',x:319,z:530}); H.sfx.tone(lh[1],lh[2],0.08,{type:'triangle',x:319,z:530}); }
      piano.i++; piano.next+=0.36; } }
  if(waltz.on){ waltz.t+=dt; if(waltz.t-waltz.next>1) waltz.next=waltz.t;
    while(waltz.t>=waltz.next){ if(waltz.b%3===0) H.sfx.tone(196,0.38,0.03,{type:'triangle',x:246,z:376});
      else { H.sfx.tone(247,0.3,0.03,{type:'triangle',x:246,z:376}); H.sfx.tone(294,0.3,0.03,{type:'triangle',x:246,z:376}); }
      waltz.b++; waltz.next+=0.4; } }
  if(hostMat.opacity>0) host.rotation.x=0.05*Math.sin(2.5*t);
  chSconceMat.emissiveIntensity=chamberL.intensity*0.6;
  if(mirror.state==='done') afterTick(dt);
  if(mirror.state==='idle' || mirror.state==='done') return;
  mirror.t+=(mirror.state!=='wait' || inRoom())?dt:0;   // the 12 s fallback only counts while the guest is in the room
  if(mirror.state==='wait'){ if((H.inBox(196,424,300,470) && H.gaze(190.8,1.35,445,4.5,0.85)) || mirror.t>12) toGhost(); }
  else if(mirror.state==='ghost'){ var p=H.player(); footGhost.position.set(clamp(p.x+20,200,296)*SC,0,clamp(p.z+(p.z<445?11:-11),432,458)*SC); footGhost.rotation.y=-PI/2; if(mirror.t>2.5) toSnap(); }
  else if(mirror.state==='snap' && mirror.t>1.5) toDone();
});

// ---------- reset and the show cue ----------
function resetRoom(){ mine.forEach(function(w){ w.dead=true; }); mine.length=0;
  duel.on=false; duel.hs=duel.pop=false; piano.on=false; waltz.on=false; stopLoops(); away=0;
  setLevels(0.9,0); chamberL.intensity=0;
  mirror.state='idle'; mirror.t=0; mirror.tw=null; mir.mesh.visible=true; foot.visible=false; footGhost.visible=false; foot.userData.gloves.position.z=0;
  hostMat.opacity=0; deanMat.opacity=0; dean.scale.x=1; host.rotation.x=0; backdropMat.opacity=0.08; win.armed=win.started=win.due=false; win.stage=0; }
var show=H.cue([[0,function(){ resetRoom(); delete H.stay.angellDone; H.line('A1'); piano.on=true; piano.t=0; piano.next=0; piano.i=0; startLoops(); }],
  [14,function(){ H.line('A2'); }], [25,function(){ H.line('A3'); }], [27,function(){ duel.t0=H.t; duel.on=true; }],
  [52.5,function(){ H.line('A4'); }], [55,function(){ mirror.state='wait'; mirror.t=0; }]]);
H.resets.push(function(){ d1871.close(); show.stop(); pend=null; resetRoom(); });
var own=H.scene.children.slice(n0);   // this file's scene-level objects
H.onBegin(function(){ roomLayer(); H.stations.forEach(function(s){ if(s.n===2){ s.name='Suite 1871 \u00B7 Angell'; s.desc='the night the house was wired \u00B7 watch the mirror, then the window'; } }); });
})();
