/* Hotel Alice Lloyd: check-out. The staff wing to Suite 1872, the night corridor with the Night Manager (invented staff),
   and the check-out desk in the exit alcove, where Dean Lloyd overrules him.
   Zone: the upper room outside Room 2 (x 222-458, z 102-243) and the exit alcove (x 262-378, z 62-98). */
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
var PI=Math.PI, capBox=document.getElementById('caption'), CREAM=0xf2efe6;
function X(v){ return v*SC; }

// ---------- structure: divider UD on z=182 (staff wing south, night corridor north), the Night Manager's office, the desk ----------
H.curtain(330,182,448,182); H.curtain(330,182,330,195);
H.curtain(295,100,295,108); var nmp=H.curtain(295,108,295,138,M.curtN); H.curtain(295,138,295,195);
[[275,66,290,66],[290,66,290,96],[290,96,275,96],[275,96,275,66]].forEach(function(s){ H.seg(s[0],s[1],s[2],s[3]); H.map.walls.push(s); });   // check-out desk

// ---------- helpers ----------
var G=H.cull(H.group(0,0),[[218,40,702,250],[300,245,445,300]]);   // + the approach to the gap, so the wing does not pop in
function inG(m){ G.add(m); return m; }
function bx(w,h,d,x,y,z,ry,rz){ var m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d)); m.position.set(X(x),y,X(z)); m.rotation.set(0,ry||0,rz||0); return m; }   // unparented, for H.merge
function mb(w,h,d,x,y,z,rz){ var m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d)); m.position.set(x,y,z); m.rotation.z=rz||0; return m; }   // meters, local
function cy(r1,r2,h,x,y,z,s,rz){ var m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,s||12)); m.position.set(X(x),y,X(z)); m.rotation.z=rz||0; return m; }
function merge(list,mat){ return inG(H.merge(list,mat)); }
function cnv(w,h,draw){ var c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h); return c; }
function ctex(w,h,draw){ var t=new THREE.CanvasTexture(cnv(w,h,draw)); t.anisotropy=4; return t; }
function fit(g,txt,x,y,maxW,fs,font){ do{ g.font=font.replace('#',fs); fs--; } while(fs>7 && g.measureText(txt).width>maxW); g.fillText(txt,x,y); }
function signDraw(lines,o){ return function(g,w,h){ var b=o.bw||0; g.fillStyle=o.bg; g.fillRect(0,0,w,h);
  if(o.border){ g.strokeStyle=o.border; g.lineWidth=b; g.strokeRect(b*1.5,b*1.5,w-b*3,h-b*3); }
  g.fillStyle=o.fg; g.textAlign='center'; g.textBaseline='middle'; var tot=0; o.sizes.forEach(function(s){ tot+=s*1.22; }); var y=h/2-tot/2;
  lines.forEach(function(l,i){ var s=o.sizes[i]; y+=s*0.61; fit(g,l,w/2,y+s*0.04,w-b*4-24,s,(i===0&&o.boldFirst?'bold ':'')+'#px Georgia,serif'); y+=s*0.61; }); }; }
function signTex(lines,o){ return ctex(o.w,o.h,signDraw(lines,o)); }
// the four gold-on-black signs share one 512x512 atlas and one mesh (tint baked in): [lines, opts, tint, atlas x, y]
var SGN={bg:'#1d1a16',fg:'#d9b76a',border:'#8a6a2a',boldFirst:1}, SIGNS=[
  [['STAFF WING','GUESTS KEEP TO THE RUNNER'],{w:512,h:220,bw:7,sizes:[66,32]},0.78,0,0],
  [['CHECK-OUT','LATE MINUTES ASSESSED'],{w:512,h:160,bw:6,sizes:[58,28]},0.85,0,220],
  [['NIGHT MANAGER','OFFICE'],{w:384,h:124,bw:5,sizes:[42,24]},0.7,0,380],
  [['KEY RETURN'],{w:128,h:43,bw:2,sizes:[18]},0.8,384,380]];
var signAtlas=ctex(512,512,function(g){ SIGNS.forEach(function(s){ var o=s[1]; for(var k in SGN) o[k]=SGN[k];
  g.drawImage(cnv(o.w,o.h,signDraw(s[0],o)),s[3],s[4]); g.globalCompositeOperation='multiply'; var v=s[2]*255|0; g.fillStyle='rgb('+v+','+v+','+v+')'; g.fillRect(s[3],s[4],o.w,o.h); g.globalCompositeOperation='source-over'; }); });
function signCell(i,w,h,x,y,z,ry){ var s=SIGNS[i]; return cell(w,h,x,y,z,ry,s[3]/512,(s[3]+s[1].w)/512,1-(s[4]+s[1].h)/512,1-s[4]/512); }
function basic(t,k){ return new THREE.MeshBasicMaterial({map:t,color:new THREE.Color(k||1,k||1,k||1)}); }
function cell(w,h,x,y,z,ry,u0,u1,v0,v1){ var m=new THREE.Mesh(new THREE.PlaneGeometry(w,h)), uv=m.geometry.attributes.uv;   // plane showing one atlas cell
  for(var i=0;i<uv.count;i++) uv.setXY(i,u0+(u1-u0)*uv.getX(i),v0+(v1-v0)*uv.getY(i)); m.position.set(X(x),y,X(z)); m.rotation.y=ry||0; return m; }
function flat(w,h,mat,x,y,z){ var m=H.plane(w,h,mat,x,y,z,0,G); m.rotation.set(-PI/2,0,PI/2); return m; }   // lies on the desk, reads from the east

// Dean Lloyd, head and shoulders: waved 1940s hair, white collar, pearls. u = unit (about half a face height)
function dean(g,cx,cy,u,o){ o=o||{};
  var P=o.bw?{dress:'#2e2e2e',skin:'#cdcdcd',hair:'#4c4c4c',wave:'#7a7a7a',line:'#5a5a5a',lip:'#707070',pearl:'#f4f4f4',collar:'#e6e6e6',eye:'#1c1c1c'}:
    o.holo?{dress:'#3450c0',skin:'#e8a47c',hair:'#6a4028',wave:'#c08a5a',line:'#7a4a38',lip:'#ff5a6a',pearl:'#ffffff',collar:'#dfe8ff',eye:'#140c2a'}:
    {dress:'#24203a',skin:'#e6c8a8',hair:'#4a3a30',wave:'#7a6452',line:'#a8836a',lip:'#a4524e',pearl:'#f6f0e2',collar:'#ece6d8',eye:'#2a1e18'};
  var lw=function(k){ g.lineWidth=Math.max(1,k*u); };
  g.save(); g.lineCap='round';
  g.fillStyle=P.dress; g.beginPath(); g.moveTo(cx-2.3*u,cy+4.4*u); g.lineTo(cx-2.2*u,cy+2.2*u); g.quadraticCurveTo(cx-2.0*u,cy+1.45*u,cx-0.55*u,cy+1.2*u);
  g.lineTo(cx+0.55*u,cy+1.2*u); g.quadraticCurveTo(cx+2.0*u,cy+1.45*u,cx+2.2*u,cy+2.2*u); g.lineTo(cx+2.3*u,cy+4.4*u); g.closePath(); g.fill();
  g.fillStyle=P.skin; g.fillRect(cx-0.28*u,cy+0.6*u,0.56*u,0.75*u);
  g.fillStyle=P.collar; g.beginPath(); g.moveTo(cx-0.72*u,cy+1.22*u); g.lineTo(cx,cy+2.0*u); g.lineTo(cx+0.72*u,cy+1.22*u); g.lineTo(cx+0.36*u,cy+1.18*u);
  g.lineTo(cx,cy+1.62*u); g.lineTo(cx-0.36*u,cy+1.18*u); g.closePath(); g.fill();
  g.fillStyle=P.hair; g.beginPath(); g.ellipse(cx,cy-0.2*u,1.0*u,1.02*u,0,0,7); g.fill();
  g.beginPath(); g.ellipse(cx-0.8*u,cy+0.35*u,0.32*u,0.5*u,0,0,7); g.ellipse(cx+0.8*u,cy+0.35*u,0.32*u,0.5*u,0,0,7); g.fill();
  g.fillStyle=P.skin; g.beginPath(); g.ellipse(cx,cy+0.08*u,0.7*u,0.9*u,0,0,7); g.fill();
  g.fillStyle=P.hair; g.beginPath(); g.ellipse(cx,cy-0.62*u,0.86*u,0.42*u,0,PI,2*PI); g.lineTo(cx+0.86*u,cy-0.5*u);
  g.quadraticCurveTo(cx+0.1*u,cy-0.24*u,cx-0.86*u,cy-0.5*u); g.closePath(); g.fill();
  g.strokeStyle=P.wave; lw(0.07);
  for(var i=0;i<3;i++){ g.beginPath(); for(var k=0;k<=10;k++){ var xx=cx-0.78*u+k*0.156*u, yy=cy-(0.98-i*0.17)*u+Math.sin(k*1.5+i*1.2)*0.06*u; if(k) g.lineTo(xx,yy); else g.moveTo(xx,yy); } g.stroke(); }
  g.fillStyle=P.eye;
  if(o.shut){ g.fillRect(cx-0.42*u,cy-0.05*u,0.24*u,0.05*u); g.fillRect(cx+0.18*u,cy-0.05*u,0.24*u,0.05*u); }
  else { g.beginPath(); g.ellipse(cx-0.3*u,cy-0.03*u,0.1*u,0.075*u,0,0,7); g.fill(); g.beginPath(); g.ellipse(cx+0.3*u,cy-0.03*u,0.1*u,0.075*u,0,0,7); g.fill(); }
  g.strokeStyle=P.line; lw(0.05); g.beginPath(); g.moveTo(cx-0.46*u,cy-0.2*u); g.quadraticCurveTo(cx-0.3*u,cy-0.29*u,cx-0.14*u,cy-0.2*u);
  g.moveTo(cx+0.14*u,cy-0.2*u); g.quadraticCurveTo(cx+0.3*u,cy-0.29*u,cx+0.46*u,cy-0.2*u); g.moveTo(cx+0.02*u,cy+0.04*u); g.lineTo(cx-0.05*u,cy+0.3*u); g.lineTo(cx+0.06*u,cy+0.33*u); g.stroke();
  g.fillStyle=P.lip; g.beginPath(); if(o.open) g.ellipse(cx,cy+0.56*u,0.16*u,0.1*u,0,0,7); else g.ellipse(cx,cy+0.54*u,0.18*u,0.045*u,0,0,7); g.fill();
  g.fillStyle=P.pearl; for(var p=0;p<13;p++){ var a=0.16*PI+p*0.68*PI/12; g.beginPath(); g.arc(cx+Math.cos(a)*0.52*u,cy+1.0*u+Math.sin(a)*0.34*u,Math.max(0.8,0.066*u),0,7); g.fill(); }
  g.restore(); }
function photoFrame(g,x,y,w,h,shut){   // gold-framed black-and-white photo of the Dean
  g.fillStyle='#2b2119'; g.fillRect(x,y,w,h); g.fillStyle='#b8873b'; g.fillRect(x+6,y+6,w-12,h-12); g.fillStyle='#e8e2d0'; g.fillRect(x+10,y+10,w-20,h-20);
  var ix=x+18, iy=y+18, iw=w-36, ih=h-36, gr=g.createRadialGradient(ix+iw/2,iy+ih*0.35,4,ix+iw/2,iy+ih*0.35,ih*0.8); gr.addColorStop(0,'#b0b0b0'); gr.addColorStop(1,'#5a5a5a');
  g.save(); g.beginPath(); g.rect(ix,iy,iw,ih); g.clip(); g.fillStyle=gr; g.fillRect(ix,iy,iw,ih); dean(g,ix+iw/2,iy+ih*0.4,iw*0.26,{bw:1,shut:shut}); g.restore(); }

// ---------- staff wing (the way in) ----------
var runnerTex=H.canvasTex(256,256,function(g,w,h){ var r=H.rng(9); g.fillStyle='#7c141c'; g.fillRect(0,0,w,h);
  for(var i=0;i<2400;i++){ g.fillStyle='rgba(0,0,0,'+(r()*0.2).toFixed(2)+')'; g.fillRect(r()*w,r()*h,2,2); }
  g.fillStyle='#2a0508'; g.fillRect(0,0,w,18); g.fillRect(0,h-18,w,18); g.fillStyle='#c9a24a'; g.fillRect(0,23,w,5); g.fillRect(0,h-28,w,5);
  g.strokeStyle='#b88a3a'; g.lineWidth=4; g.beginPath(); g.moveTo(w/2,54); g.lineTo(w-34,h/2); g.lineTo(w/2,h-54); g.lineTo(34,h/2); g.closePath(); g.stroke();
  g.fillStyle='#b88a3a'; g.beginPath(); g.arc(w/2,h/2,11,0,7); g.fill(); g.beginPath(); g.arc(0,h/2,7,0,7); g.arc(w,h/2,7,0,7); g.fill(); });
runnerTex.size=[0.96,0.96];
inG(H.floorPatch(340,186,458,210,H.lam(0xffffff,{map:runnerTex})));
// three staff-door facades on UD's south face: one atlas, one mesh (faintly self-lit: the only light is on the far side of UD)
var doorTex=ctex(768,512,function(g){ [['NIGHT OPERATOR'],['HOUSE MOTHER'],['LINEN','HOUSEKEEPING']].forEach(function(nm,i){ var x0=i*256;
  g.fillStyle='#2b2119'; g.fillRect(x0,0,256,512); g.fillStyle='#17110c'; g.fillRect(x0+15,15,226,497); g.fillStyle='#6e4a2c'; g.fillRect(x0+21,21,214,491);
  g.strokeStyle='rgba(40,22,10,0.28)'; g.lineWidth=1; for(var k=0;k<30;k++){ g.beginPath(); g.moveTo(x0+24+k*7,21); g.lineTo(x0+24+k*7+Math.sin(k*2.3)*3,512); g.stroke(); }
  [[60,176],[292,184]].forEach(function(p){ g.strokeStyle='#3e2814'; g.lineWidth=5; g.strokeRect(x0+46,p[0],164,p[1]); g.strokeStyle='#94693f'; g.lineWidth=2; g.strokeRect(x0+53,p[0]+7,150,p[1]-14); });
  g.fillStyle='#7a5a1a'; g.fillRect(x0+56,136,144,54); g.fillStyle='#d4ad55'; g.fillRect(x0+59,139,138,48); g.fillStyle='#2a1a08'; g.textAlign='center'; g.textBaseline='middle';
  if(nm.length>1){ fit(g,nm[0],x0+128,152,126,17,'bold #px Georgia,serif'); fit(g,nm[1],x0+128,173,126,17,'bold #px Georgia,serif'); } else fit(g,nm[0],x0+128,163,126,19,'bold #px Georgia,serif');
  g.fillStyle='#efe6cf'; g.beginPath(); g.moveTo(x0+168,266); g.lineTo(x0+222,266); g.lineTo(x0+222,392); g.lineTo(x0+168,392); g.closePath(); g.fill();
  g.fillStyle='#6e4a2c'; g.beginPath(); g.arc(x0+195,282,9,0,7); g.fill(); g.fillStyle='#8c1c1c'; g.font='bold 15px Georgia,serif'; g.fillText('STAFF',x0+195,322); g.fillText('ONLY',x0+195,344);
  g.fillRect(x0+176,360,38,2); g.fillStyle='#d4a849'; g.beginPath(); g.arc(x0+195,282,8,0,7); g.fill(); g.fillRect(x0+160,277,38,10);
  g.fillStyle='#a8823a'; g.fillRect(x0+21,474,214,30); g.fillStyle='#d4ad55'; g.fillRect(x0+21,476,214,3); }); });
merge([350,378,406].map(function(x,i){ return cell(1.05,2.2,x,1.1,182.6,0,i/3,(i+1)/3,0,1); }),new THREE.MeshLambertMaterial({map:doorTex,emissive:0xffffff,emissiveMap:doorTex,emissiveIntensity:0.2}));
// last year's portrait TV, slim on UD (nudged to x 433 so its bezel clears the linen door's casing)
function tvCanvas(empty){ return cnv(256,160,function(g,w,h){ var gr=g.createLinearGradient(0,0,w,0); gr.addColorStop(0,'#050a1c'); gr.addColorStop(0.5,'#15244e'); gr.addColorStop(1,'#050a1c'); g.fillStyle=gr; g.fillRect(0,0,w,h);
  var fx=w/2-48, fy=5, fw=96, fh=150, ix=fx+11, iy=fy+11, iw=fw-22, ih=fh-22;
  g.fillStyle='#6e5220'; g.fillRect(fx,fy,fw,fh); g.fillStyle='#e0bd6c'; g.fillRect(fx+3,fy+3,fw-6,fh-6); g.fillStyle='#9a7a34'; g.fillRect(fx+8,fy+8,fw-16,fh-16);
  g.fillStyle='#2b2433'; g.fillRect(ix,iy,iw,ih);
  if(!empty){ g.save(); g.beginPath(); g.rect(ix,iy,iw,ih); g.clip(); dean(g,w/2,iy+48,24); g.restore(); }
  g.fillStyle='rgba(0,0,0,0.2)'; for(var y=0;y<h;y+=3) g.fillRect(0,y,w,1); }); }
var tvP=tvCanvas(false), tvE=tvCanvas(true), tvFade=0, tvFading=false;
function drawTV(g,t,w,h){ if(!tvP) return;   // the portrait crossfades to the empty frame (no static: photosensitivity)
  g.drawImage(tvP,0,0); if(tvFade>0){ g.globalAlpha=tvFade; g.drawImage(tvE,0,0); g.globalAlpha=1; }
  g.fillStyle='rgba(180,200,255,0.06)'; g.fillRect(0,((t*22)%(h+40))-20,w,14); }
H.box(1.01,0.61,0.04,M.black,433,1.45,183.0,0,G);
var tvScr=H.screen(256,160,drawTV,{x:433,z:190,range:8,every:3});
H.plane(0.97,0.57,new THREE.MeshBasicMaterial({map:tvScr.tex}),433,1.45,183.6,0,G);
// Housekeeping linen cart against the z=245 wall
var cart=[bx(0.9,0.03,0.5,415,0.16,236),bx(0.9,0.03,0.5,415,0.5,236),bx(0.9,0.03,0.5,415,0.88,236),bx(0.03,0.03,0.46,403.2,0.98,236)];
[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(function(s){ cart.push(bx(0.03,0.9,0.03,415+s[0]*10.9,0.47,236+s[1]*5.9)); cart.push(bx(0.08,0.1,0.05,415+s[0]*10,0.05,236+s[1]*5)); });
merge(cart,M.metal);
var lin=[], lr=H.rng(12); [[0.175,3],[0.515,3],[0.895,2]].forEach(function(s){ [409,421].forEach(function(x){ for(var k=0;k<s[1];k++) lin.push(bx(0.36,0.065,0.3,x+(lr()-0.5)*1.2,s[0]+0.036+k*0.074,236+(lr()-0.5)*0.8)); }); });   // folded towels
merge(lin,M.paper);
H.box(0.3,0.55,0.42,H.lam(0x2a3552,{map:H.tex.folds}),398,0.62,236,0,G);   // laundry bag on the cart's west end
H.plane(0.42,0.11,H.lam(0xffffff,{map:signTex(['HOUSEKEEPING'],{w:384,h:100,bg:'#efe6cf',fg:'#2a3a5a',border:'#2a3a5a',bw:3,sizes:[46],boldFirst:1})}),415,0.705,229.5,PI,G);

// ---------- night corridor (the way back) ----------
var carpetTex=H.canvasTex(256,256,function(g,w,h){ var r=H.rng(5); g.fillStyle='#4a0f17'; g.fillRect(0,0,w,h);
  for(var i=0;i<3000;i++){ g.fillStyle='rgba(0,0,0,'+(r()*0.2).toFixed(2)+')'; g.fillRect(r()*w,r()*h,2,2); }
  g.strokeStyle='#9a7430'; g.lineWidth=5; g.beginPath(); g.moveTo(0,h/2); g.lineTo(w/2,0); g.lineTo(w,h/2); g.lineTo(w/2,h); g.closePath(); g.stroke();
  g.strokeStyle='#2c5a58'; g.lineWidth=3; g.beginPath(); g.moveTo(w/2,50); g.lineTo(w-50,h/2); g.lineTo(w/2,h-50); g.lineTo(50,h/2); g.closePath(); g.stroke();
  g.fillStyle='#b8903c'; [[0,0],[w,0],[0,h],[w,h],[w/2,h/2]].forEach(function(p){ g.beginPath(); g.arc(p[0],p[1],10,0,7); g.fill(); });
  g.fillStyle='#2c5a58'; g.beginPath(); g.arc(w/2,h/2,5,0,7); g.fill(); });
carpetTex.size=[0.8,0.8];
inG(H.floorPatch(298,104,458,180,H.lam(0xffffff,{map:carpetTex})));
// KEY RETURN reader on the x=460 wall
var keyRing=new THREE.MeshBasicMaterial({color:CREAM,fog:false}), kr=new THREE.Mesh(new THREE.TorusGeometry(0.03,0.007,8,24),keyRing);
kr.position.set(X(457.3),1.2,X(140)); kr.rotation.y=-PI/2; G.add(kr);
// LED dot-matrix sign: blank until C3, then YOUR STAY HAS BEEN EXTENDED scrolls
var LED=[], ledOn=false, ledT0=0;
(function(){ var txt='YOUR STAY HAS BEEN EXTENDED', c=document.createElement('canvas'), g=c.getContext('2d'); g.font='bold 13px Arial,Helvetica,sans-serif';
  c.width=Math.ceil(g.measureText(txt).width)+4; c.height=16; g=c.getContext('2d'); g.fillStyle='#000'; g.fillRect(0,0,c.width,16);
  g.fillStyle='#fff'; g.font='bold 13px Arial,Helvetica,sans-serif'; g.textBaseline='middle'; g.fillText(txt,2,8.5);
  var d=g.getImageData(0,0,c.width,16).data; for(var x=0;x<c.width;x++){ var m=0; for(var y=0;y<16;y++) if(d[(y*c.width+x)*4]>110) m|=1<<y; LED.push(m); } })();
var ledBase=cnv(256,64,function(g,w,h){ g.fillStyle='#060101'; g.fillRect(0,0,w,h); g.fillStyle='#2c0808'; for(var c=0;c<64;c++) for(var r=0;r<16;r++) g.fillRect(c*4+1,r*4+1,2,2);
  g.strokeStyle='#3c3c3c'; g.lineWidth=2; g.strokeRect(1,1,w-2,h-2); });
function drawLED(g,t,w,h){ if(!ledBase) return; g.drawImage(ledBase,0,0); if(!ledOn) return; var n=LED.length, off=Math.floor((t-ledT0)*20)%(n+64);
  g.fillStyle='#ff3a26'; for(var c=0;c<64;c++){ var k=c+off-64; if(k<0||k>=n||!LED[k]) continue; for(var r=0;r<16;r++) if(LED[k]>>r&1) g.fillRect(c*4+0.5,r*4+0.5,3.2,3.2); } }
var ledScr=H.screen(256,64,drawLED,{x:425,z:110,range:10,every:3});
H.plane(0.9,0.22,new THREE.MeshBasicMaterial({map:ledScr.tex}),425,2.3,102.3,0,G);
// chalk tally marks on UD's north face
var chalkTex=ctex(512,512,function(g){ var r=H.rng(77); g.strokeStyle=g.fillStyle='rgba(236,234,222,0.88)'; g.lineCap='round';
  function ln(a,b,c,d){ g.lineWidth=4+r()*2.5; g.beginPath(); g.moveTo(a+r()*3,b+r()*3); g.lineTo(c+r()*3,d+r()*3); g.stroke(); }
  function tally(x,y,n){ for(var k=0;k<n;k++){ var gx=x+Math.floor(k/5)*74, i=k%5; if(i<4) ln(gx+i*13,y,gx+i*13+(r()-0.5)*6,y+62); else ln(gx-8,y+50,gx+48,y+10); } }
  [[0,19,12],[256,23,17]].forEach(function(c,ci){ tally(24,c[0]+18,c[1]); tally(40,c[0]+96,c[2]);
    g.save(); g.translate(ci?300:330,c[0]+206); g.rotate(ci?0.06:-0.07); g.font='bold 62px "Marker Felt","Chalkboard SE","Comic Sans MS",cursive'; g.textAlign='center'; g.textBaseline='middle';
    g.fillText(ci?'LATE!':'LATE',0,0); g.restore(); ln(ci?210:250,c[0]+240,ci?400:410,c[0]+236); }); });
merge([cell(1.0,0.5,360,1.6,181.4,PI,0,1,0.5,1),cell(1.0,0.5,405,1.6,181.4,PI,0,1,0,0.5)],H.lam(0xffffff,{map:chalkTex,transparent:true,depthWrite:false}));
// the Night Manager (invented staff), scene level so H.keepAway can place him; he waits behind his red portiere
var nm=H.figure(0x0e0e12,0xd6c6ae); nm.position.set(X(280),0,X(123)); nm.rotation.y=PI/2;
(function(){ var cap=new THREE.Mesh(new THREE.CylinderGeometry(0.125,0.13,0.08,14)); cap.position.set(0,1.66,0);
  nm.add(H.merge([mb(0.32,0.34,0.2,0,0.17,0),mb(0.07,0.07,0.46,-0.21,1.2,0.2),mb(0.07,0.07,0.46,0.21,1.2,0.2),cap,mb(0.2,0.015,0.1,0,1.625,0.12)],nm.children[0].material));
  var sash=new THREE.Mesh(new THREE.TorusGeometry(0.19,0.028,6,22),H.lam(0x9a0e18)); sash.position.y=1.02; sash.rotation.set(PI/2,0.55,0); nm.add(sash);
  var eyes=new THREE.Mesh(new THREE.PlaneGeometry(0.13,0.035),new THREE.MeshBasicMaterial({map:ctex(64,16,function(g){ g.fillStyle='#fff0c8'; g.beginPath(); g.ellipse(17,8,8,4,0,0,7); g.ellipse(47,8,8,4,0,0,7); g.fill(); }),transparent:true,depthWrite:false}));
  eyes.position.set(0,1.53,0.133); nm.add(eyes); })();

// ---------- exit alcove: the check-out desk ----------
H.box(0.6,1.0,1.2,M.wood,282.5,0.5,81,0,G);
var clerkFig=H.figure(0x2a2f3a,0xd9c2a4,G); clerkFig.position.set(X(268),0,X(81)); clerkFig.rotation.y=PI/2;
(function(){ var t=ctex(64,128,function(g){ g.fillStyle='#1a1410'; g.beginPath(); g.ellipse(17,13,5,3.5,0,0,7); g.ellipse(47,13,5,3.5,0,0,7); g.fill();   // face (rows 0-32, clear) over shirt (32-128)
    g.strokeStyle='#9a5a4a'; g.lineWidth=2; g.beginPath(); g.moveTo(24,27); g.quadraticCurveTo(32,30,40,27); g.stroke(); g.translate(0,32);
    g.fillStyle='#2a2f3a'; g.fillRect(0,0,64,96); g.fillStyle='#ece6d8'; g.beginPath(); g.moveTo(14,0); g.lineTo(32,58); g.lineTo(50,0); g.fill();
    g.fillStyle='#8a1418'; g.beginPath(); g.moveTo(20,6); g.lineTo(32,12); g.lineTo(44,6); g.lineTo(44,20); g.lineTo(32,14); g.lineTo(20,20); g.fill(); g.fillStyle='#c9a24a'; g.fillRect(40,40,16,6); });
  var f=cell(0.12,0.05,0,1.51,0,0,0,1,0.75,1), c=cell(0.2,0.3,0,1.17,0,0,0,1,0,0.75); f.position.z=0.131; c.position.z=0.182;
  clerkFig.add(H.merge([f,c],H.lam(0xffffff,{map:t,alphaTest:0.5}))); })();
var dome=new THREE.Mesh(new THREE.SphereGeometry(0.04,16,8,0,2*PI,0,PI/2)); dome.position.set(X(287),1.012,X(68));
merge([bx(0.61,0.03,1.21,282.5,0.97,81), cy(0.046,0.05,0.012,287,1.006,68,16), dome, cy(0.006,0.006,0.03,287,1.06,68,6), cy(0.012,0.012,0.008,287,1.078,68,10),   // desk edge, bell
  bx(0.07,0.11,0.03,457.8,1.2,140,-PI/2), bx(0.07,0.11,0.03,290.4,0.95,81,PI/2)],M.brass);                                                          // key readers
var deskRing=new THREE.MeshBasicMaterial({color:CREAM,fog:false}), dr=new THREE.Mesh(new THREE.TorusGeometry(0.03,0.007,8,24),deskRing);
dr.position.set(X(290.95),0.95,X(81)); dr.rotation.y=PI/2; G.add(dr);
// holo fan (tier 2): the Dean as 40 rings x 90 spokes of LEDs
function fanCanvas(open){ var p=cnv(128,128,function(g){ g.fillStyle='#000'; g.fillRect(0,0,128,128); dean(g,64,54,23,{holo:1,open:open}); }), d=p.getContext('2d').getImageData(0,0,128,128).data;
  return cnv(256,256,function(f){ f.fillStyle='#000'; f.fillRect(0,0,256,256);
    for(var i=0;i<40;i++){ var r=(i+0.5)/40*124, s=Math.max(1.5,Math.min(4.2,r*2*PI/90*0.62));
      for(var j=0;j<90;j++){ var a=j/90*2*PI, x=128+Math.cos(a)*r, y=128+Math.sin(a)*r, k=((y>>1)*128+(x>>1))*4, R=d[k], Gc=d[k+1], B=d[k+2]; if(R+Gc+B<30) continue;
        f.fillStyle='rgb('+Math.min(255,R*1.15|0)+','+Math.min(255,Gc*1.15|0)+','+Math.min(255,B*1.25|0)+')'; f.fillRect(x-s/2,y-s/2,s,s); } } }); }
var fanC=fanCanvas(false), fanO=fanCanvas(true), fanOn=false;
function drawFan(g,t,w,h){ g.fillStyle='#000'; g.fillRect(0,0,w,h); if(!fanOn || !fanC) return;
  var talk=capBox && capBox.textContent.indexOf('DEAN LLOYD')===0 && Math.sin(t*11)>0;
  g.globalAlpha=0.95+0.04*Math.sin(t*9); g.drawImage(talk?fanO:fanC,0,0); g.globalAlpha=1; }
var fanScr=H.screen(256,256,drawFan,{x:284,z:72,range:5,every:2}), fanMat=H.holoMat(fanScr.tex);
var fan=new THREE.Group(); fan.position.set(X(284),1.36,X(72)); fan.rotation.y=PI/2; G.add(fan);
fan.add(new THREE.Mesh(new THREE.CircleGeometry(0.21,48),fanMat));
var seam=new THREE.Mesh(new THREE.PlaneGeometry(0.42,0.004),new THREE.MeshBasicMaterial({color:0x5a6068})); seam.position.z=0.004; fan.add(seam);   // the blade; 1.5 rev/s (true speed would alias at 72 Hz)
var blurMat=new THREE.MeshBasicMaterial({color:0xdfe8ff,transparent:true,opacity:0,depthWrite:false,fog:false}), blur=new THREE.Mesh(new THREE.CircleGeometry(0.215,48),blurMat); blur.position.z=0.006; fan.add(blur);
H.box(0.14,0.62,0.48,H.lam(0xcfe0ff,{transparent:true,opacity:0.08,depthWrite:false}),283.6,1.31,72,0,G);   // clear case
// tier 1 fallback: the 1940s radio with its amber dial, and her framed photo standing on it
H.box(0.2,0.24,0.3,M.wood,284,1.12,92,0,G);
H.plane(0.13,0.03,new THREE.MeshBasicMaterial({map:ctex(128,32,function(g,w,h){ var gr=g.createLinearGradient(0,0,0,h); gr.addColorStop(0,'#ffcf7a'); gr.addColorStop(1,'#d8801e'); g.fillStyle=gr; g.fillRect(0,0,w,h);
  g.fillStyle='#5a3208'; for(var i=0;i<15;i++) g.fillRect(8+i*8,i%2?18:12,1.5,i%2?10:16); g.fillStyle='#b01010'; g.fillRect(70,4,3,h-8); })}),286.56,1.217,92,PI/2,G);
H.plane(0.1,0.13,H.lam(0xffffff,{map:ctex(128,166,function(g,w,h){ photoFrame(g,0,0,w,h,false); })}),285.2,1.31,92,PI/2,G);
// the register, and the late-minutes slip laid across its edge
var regMat=H.lam(0xffffff,{map:ctex(384,256,function(g,w,h){ var r=H.rng(3); g.fillStyle='#efe6cf'; g.fillRect(0,0,w,h);
  g.fillStyle='#7a2a22'; g.textAlign='center'; g.textBaseline='middle'; g.font='bold 22px Georgia,serif'; g.fillText('REGISTER',w/2,22);
  g.strokeStyle='#9ab0c8'; g.lineWidth=1.5; for(var y=46;y<h;y+=28){ g.beginPath(); g.moveTo(10,y); g.lineTo(w-10,y); g.stroke(); }
  g.strokeStyle='#c46a6a'; g.beginPath(); g.moveTo(44,36); g.lineTo(44,h); g.stroke();
  g.strokeStyle='rgba(60,50,70,0.45)'; g.lineWidth=2; for(var l=0;l<5;l++){ var y0=46+l*28-9, e=54+110+r()*180; g.beginPath(); g.moveTo(54,y0); for(var x=54;x<e;x+=5) g.lineTo(x,y0+Math.sin(x*0.35+l*2)*3.5); g.stroke(); }
  g.fillStyle='#1d2a44'; g.textAlign='left'; fit(g,'CHECKED OUT · PARTY OF '+(H.party||'GUEST'),52,172,w-60,22,'bold #px Georgia,serif'); })});
flat(0.3,0.2,regMat,282,1.012,82);
var slipC=document.createElement('canvas'); slipC.width=192; slipC.height=480; var slipT=new THREE.CanvasTexture(slipC); slipT.anisotropy=4;
function slipText(){ return ['LATE MINUTES ASSESSED','PARTY OF '+(H.party||'GUEST'),'SIGNED OUT 1949 · RETURNED 2026 · 77 YEARS LATE','EXAMINATION '+(H.stay.exam||0)+' OF 2 · A. C. LLOYD, DEAN OF WOMEN']; }   // short chunks: the VR HUD shows one line
function drawSlip(){ var g=slipC.getContext('2d'), w=192, h=480, y=34;
  g.fillStyle='#f4c4d0'; g.fillRect(0,0,w,h); g.fillStyle='#e2a8b8'; for(var x=6;x<w;x+=12){ g.beginPath(); g.arc(x,0,4,0,7); g.fill(); }
  g.fillStyle='#3a1a24'; g.textAlign='center'; g.textBaseline='middle';
  [['LATE MINUTES',26,'bold '],['ASSESSED',26,'bold '],['',10],['PARTY OF',17,''],[H.party||'GUEST',24,'bold '],['',10],['SIGNED OUT 1949',18,''],['RETURNED 2026',18,''],
   ['77 YEARS LATE',25,'bold '],['',10],['EXAMINATION '+(H.stay.exam||0)+' OF 2',18,''],['',16],['A. C. Lloyd',30,'italic '],['A. C. LLOYD, DEAN OF WOMEN',13,'']].forEach(function(l){
    y+=l[1]*0.62; if(l[0]) fit(g,l[0],w/2,y,w-18,l[1],l[2]+'#px Georgia,serif'); y+=l[1]*0.62; if(l[0]==='A. C. Lloyd'){ g.fillRect(34,y-4,w-68,1.5); y+=6; } });
  slipT.needsUpdate=true; }
drawSlip();
var slip=flat(0.12,0.3,H.lam(0xffffff,{map:slipT}),282,1.014,86.4); slip.scale.set(0.001,0.001,0.001); slip.visible=false;
function growSlip(){ drawSlip(); slip.visible=true; H.tween(2,function(p){ var s=Math.max(0.001,1-Math.pow(1-p,3)); slip.scale.set(s,s,s); }); }
// the alcove walls: corkboard (the photo blinks), NO VACANCY, EXIT, the check-out sign behind the clerk
function corkTex(shut){ return ctex(512,392,function(g,w,h){ var r=H.rng(1949);
  g.fillStyle='#4a301b'; g.fillRect(0,0,w,h); g.fillStyle='#6b4a2e'; g.fillRect(5,5,w-10,h-10); g.fillStyle='#b98a55'; g.fillRect(16,16,w-32,h-32);
  for(var i=0;i<2600;i++){ g.fillStyle=(r()<0.55?'rgba(90,55,25,':'rgba(225,190,140,')+(0.15+r()*0.3).toFixed(2)+')'; g.fillRect(16+r()*(w-34),16+r()*(h-34),2,2); }
  function pin(x,y,c){ g.fillStyle='rgba(0,0,0,0.35)'; g.beginPath(); g.arc(x+2,y+3,6,0,7); g.fill(); g.fillStyle=c||'#c0282a'; g.beginPath(); g.arc(x,y,6,0,7); g.fill();
    g.fillStyle='rgba(255,255,255,0.6)'; g.beginPath(); g.arc(x-2,y-2,2,0,7); g.fill(); }
  function card(x,y,cw,ch,rot,bg,fn){ g.save(); g.translate(x,y); g.rotate(rot); g.fillStyle='rgba(0,0,0,0.3)'; g.fillRect(-cw/2+3,-ch/2+4,cw,ch); g.fillStyle=bg; g.fillRect(-cw/2,-ch/2,cw,ch); fn(cw,ch); g.restore(); }
  function star(x,y,s){ g.fillStyle='#d4a020'; g.beginPath(); for(var k=0;k<10;k++){ var a=-PI/2+k*PI/5, q=k%2?s*0.45:s; g.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q); } g.closePath(); g.fill(); }
  g.textAlign='center'; g.textBaseline='middle';
  card(256,50,304,46,-0.012,'#f6f1e4',function(cw){ g.fillStyle='#1d2a44'; fit(g,'EMPLOYEE OF THE MONTH',0,2,cw-18,26,'bold #px Georgia,serif'); }); pin(118,34); pin(394,34);
  card(256,188,148,172,-0.035,'#f2efe6',function(cw,ch){ var ix=-cw/2+9, iy=-ch/2+9, iw=cw-18, ih=ch-30, gr=g.createRadialGradient(0,-30,8,0,-30,100);
    gr.addColorStop(0,'#b4b4b4'); gr.addColorStop(1,'#5a5a5a'); g.save(); g.beginPath(); g.rect(ix,iy,iw,ih); g.clip(); g.fillStyle=gr; g.fillRect(ix,iy,iw,ih); dean(g,0,iy+56,26,{bw:1,shut:shut}); g.restore();
    g.fillStyle='#666'; g.font='italic 12px Georgia,serif'; g.fillText('1949',cw/2-26,ch/2-11); }); pin(256,108);
  card(256,322,176,60,0.02,'#f6f1e4',function(cw){ g.fillStyle='#1d2a44'; fit(g,'A. C. LLOYD',0,-11,cw-16,28,'bold #px Georgia,serif'); g.fillStyle='#7a2a22'; fit(g,'SINCE 1949',0,16,cw-16,19,'#px Georgia,serif'); }); pin(256,294,'#2a6ab0');
  card(100,196,132,104,0.07,'#f2efe6',function(cw,ch){ var ix=-cw/2+7, iy=-ch/2+7, iw=cw-14, ih=ch-24; g.fillStyle='#b8b8b8'; g.fillRect(ix,iy,iw,ih); g.fillStyle='#6c6c6c'; g.fillRect(ix+6,iy+ih*0.34,iw-12,ih*0.46);
    g.fillStyle='#d6d6d6'; for(var a=0;a<3;a++) for(var b=0;b<9;b++) g.fillRect(ix+10+b*12,iy+ih*0.4+a*9,7,5); g.fillStyle='#484848'; g.fillRect(ix,iy+ih*0.8,iw,ih*0.2);
    g.fillStyle='#666'; g.font='italic 11px Georgia,serif'; g.fillText('1949',0,ch/2-9); }); pin(98,148);
  card(414,200,124,150,-0.05,'#f6f1e4',function(cw,ch){ g.fillStyle='#7a2a22'; fit(g,'EVERY MONTH',0,-ch/2+16,cw-14,17,'bold #px Georgia,serif');
    var mo=['J','F','M','A','M','J','J','A','S','O','N','D']; for(var k=0;k<12;k++){ var sx=-40+(k%3)*40, sy=-ch/2+44+Math.floor(k/3)*27; star(sx,sy,9); g.fillStyle='#555'; g.font='10px Georgia,serif'; g.fillText(mo[k],sx,sy+13); } }); pin(414,128);
}); }
var corkO=corkTex(false), corkS=corkTex(true), corkMat=H.lam(0xffffff,{map:corkO});
H.plane(1.15,0.88,corkMat,305,1.6,62.2,0,G);
H.plane(1.0,0.25,new THREE.MeshBasicMaterial({map:ctex(512,128,function(g,w,h){ g.fillStyle='#0b0304'; g.fillRect(0,0,w,h); g.textAlign='center'; g.textBaseline='middle';
  g.font='bold 72px "Arial Narrow",Arial,sans-serif'; g.shadowColor='#ff1e3c'; g.shadowBlur=24; g.fillStyle='#ff3a50'; g.fillText('NO VACANCY',w/2,h/2+4); g.fillText('NO VACANCY',w/2,h/2+4);
  g.shadowBlur=0; g.strokeStyle='#ffd6dc'; g.lineWidth=2; g.strokeText('NO VACANCY',w/2,h/2+4); })}),285,2.3,62.2,0,G);
var exitOpts={glow:1,bg:'#1a0404',fg:'#ff3030',w:256,h:128,fs:64};
var exitMat=basic(H.textTexture(['EXIT'],exitOpts));   // the hanging EXIT in the alcove opening: two back-to-back faces, so it reads from both sides
merge([cell(0.52,0.22,320,2.42,101.7,0,0,1,0,1),cell(0.52,0.22,320,2.42,100.3,PI,0,1,0,1),cell(0.52,0.22,345,2.35,62.3,0,0,1,0,1)],exitMat);   // + the one over the door
merge([signCell(0,0.7,0.3,332.2,1.8,225,PI/2),signCell(1,0.9,0.28,262.2,2.12,81,PI/2),signCell(2,0.34,0.11,295.8,1.6,150,PI/2),signCell(3,0.15,0.05,457.8,1.35,140,-PI/2)],new THREE.MeshBasicMaterial({map:signAtlas}));
// fluorescent tube over the alcove
var tubeMat=H.glow(0xdfe8ff,0.9);
H.box(1.2,0.05,0.16,tubeMat,320,2.66,80,0,G);
merge([bx(0.56,0.26,0.05,320,2.42,101), bx(0.012,0.2,0.012,314,2.63,101), bx(0.012,0.2,0.012,326,2.63,101), bx(1.26,0.03,0.2,320,2.705,80),   // EXIT housing + rods, tube housing
  bx(0.12,0.015,0.12,283.0,1.0075,72), bx(0.02,0.35,0.02,283.0,1.18,72), cy(0.025,0.025,0.04,283.3,1.36,72,12,PI/2)],M.dark);                                                     // fan stand + motor hub

// ---------- lights (3 of 3), grilles, lines ----------
var hallL=H.plight(400,160,2.3,0xffb870,0.35,10);   // warm and dim over both halves; turns red at C3
var nmL=H.plight(302,122,1.7,0xff2a1a,0,5);         // the Night Manager's burst
var fluorL=H.plight(320,80,2.5,0xdfe8ff,0.55,8);    // the alcove; stutters about every 20 s
H.grille('wing',332.2,2.2,215,PI/2); H.grille('tv',433,2.0,183.7,0); H.grille('keyslot',457.8,1.6,145,-PI/2); H.grille('night',390,2.3,102.2,0);
H.grille('radio',286.7,1.12,92,PI/2); H.grille('exit',322,2.3,62.2,0);
H.ambience({kind:'hum',freq:120,gain:0.018,x:320,z:80});   // the tube's buzz
H.addLines({
  C1:{at:'wing',t:'This is the staff wing. Housekeeping and the night manager signed on in 1949, never signed out, and take closing hours very seriously.'},
  C2:{at:'tv',t:'If you are looking for my portrait, I have gone ahead to the desk.'},
  C3:{at:'keyslot',t:'Your key says your stay has been extended. That is the Night Manager’s doing, not mine; I would walk briskly.'},
  C4:{at:'night',t:'Mr. Night Manager, that will do. Walk, do not run.'},
  X1:{at:'radio',t:'There you are. Closing hours came and went long ago; by my arithmetic you are seventy-seven years late, and the desk will assess your late minutes.'},
  X2:{at:'radio',t:'The Daily once called me ‘firm when firmness is required, but wise in making exceptions.’ Tonight I am making one: you may go.'},
  X3:{at:'radio',t:'You met four women who came to a University that was not yet sure it wanted women, and made it theirs anyway. It is yours now; take good care of it.'},
  X4:{at:'exit',t:'I once warned students against being ‘so taken up with the side shows’ that they missed the big tent; this was a side show, and the big tent is out there. Say their names on your way home: Angell, Kleinstueck, Hinsdale, Palmer. Good night.'}
});
function clerk(t){ H.say(t,{who:'THE CLERK',voice:false}); }

// ---------- zones and state ----------
var c1T=-1, deskGreen=false, x2Wait=false, slipWait=false, tvPend=false, nmOut=false, burstRe=0, stut=-1, stutNext=14, rnd=H.rng(20), coWait=0;
// C1 queues as the guest enters the wing (behind any Hinsdale/Kleinstueck line still playing), so it lands ahead of the Palmer door's P1
var zC1=H.narrateIds(['C1'],[330,183,458,245],{when:function(){ return !!H.stay.hinsdaleDone; },then:function(){ c1T=H.t; }});
function showing(txt){ return !!capBox && capBox.textContent.indexOf(txt)>=0; }
var zC2=H.narrateIds(['C2'],[405,184,458,215],{when:function(){ return zC1.fired && H.t-c1T>0.5 && (H.quiet() || showing('This is the staff wing')); },then:function(){ tvPend=true; }});   // only while the guest is still by the TV: queues right behind C1
var zC3=H.zone({x1:405,z1:115,x2:458,z2:181,once:true,when:function(){ return !!H.stay.palmerDone; },enter:function(){
  keyRing.color.setHex(0xff2a1a); H.sfx.tone(110,0.4,0.2,{type:'square',x:457,z:140}); ledOn=true; ledT0=H.t;
  var c0=new THREE.Color(0xffb870), c1=new THREE.Color(0xff2010); H.tween(1.5,function(p){ hallL.color.copy(c0).lerp(c1,p); hallL.intensity=0.35+0.1*p; });
  H.line('C3',{interrupt:true}); H.stay.extended=true; }}); H.nzones.push(zC3);   // cuts Palmer's closing lines: the guest has already gone back the way they came
function nmAt(x,z){ nm.position.set(X(x),0,X(z)); }
var zB=H.zone({x1:318,z1:102,x2:350,z2:135,once:true,when:function(){ return !!H.stay.extended && H.heading(-1,0); },exit:function(){ burstRe=20; },enter:function(){
  nmp.visible=false; nmOut=true;
  H.tween(0.25,function(p){ nmAt(280+24*p,123-2*p); },function(){ H.after(1.5,function(){ H.tween(1.5,function(p){ nmAt(304-24*p,121+2*p); },function(){ nmp.visible=true; nmOut=false; nm.rotation.y=PI/2; }); }); });
  nmL.intensity=1.8; H.tween(1,function(p){ nmL.intensity=1.8*(1-p)*(1-p); });   // one flash, no strobe
  H.sfx.sting({x:298,z:123}); H.sfx.bang({x:298,z:123}); H.scare('CHECK-OUT WAS IN 1949!',1.6);
  if(!zCO.fired) H.line('C4',{interrupt:true}); }}); H.nzones.push(zB);   // C4 always lands during the burst (he cuts her off; she answers), but a re-armed burst never cuts the desk
function capSeq(list,d){ list.forEach(function(s,i){ H.after(i*d,function(){ H.cap(s); }); }); H.after(list.length*d,function(){ H.cap(''); }); }
// the whole desk script is queued at once (no silent gaps for a stale line from another room to slip into); the slip grows as the clerk speaks
var SIGN='Late minutes. Sign here, please.';
var co=H.cue([[0,function(){ co.done=false; H.line('X1',{interrupt:true}); clerk(SIGN); H.line('X2'); H.line('X3'); slipWait=true; x2Wait=true; }],   // the reader turns green near the end of X2 (timed from when X2 shows)
 [H.lineDur('X1')+1.6+0.066*SIGN.length+H.lineDur('X2')+H.lineDur('X3'),function(){ co.done=true; }]]);
co.done=false;
function toDesk(){ return !!(H.stay.extended||H.stay.palmerDone||H.stay.suites['1872']); }   // a party that turned back before the bust (no palmerDone) still gets its check-out
var zCO=H.zone({x1:296,z1:64,x2:350,z2:98,once:true,when:function(){ return toDesk() && (H.quiet() || coWait>8); },enter:function(){ co.go(); }}); H.nzones.push(zCO);   // waits for C4 (or a closing line already playing), never more than 8 s
var zX4=H.narrateIds(['X4'],[300,62,362,80],{when:function(){ return !!co.done; },then:function(){ H.after(12,function(){
  H.cap(H.renderer.xr.isPresenting?'Pull the trigger at the door to check in again.':'Press Enter at the door to check in again.'); }); }});
H.useIn(300,62,362,80,function(){ if(zX4.fired) H.replay(); });   // use at the exit door (or where the route ends in front of it) checks in again, only once the Dean has said good night

H.onUpdate(function(dt,t){
  if(tvPend && showing('looking for my portrait')){ tvPend=false; tvFading=true; }   // the portrait empties as C2 starts
  if(tvFading){ tvFade=Math.min(1,tvFade+dt/0.8); if(tvFade>=1) tvFading=false; }
  coWait=(!zCO.fired && H.inBox(296,64,350,98))?coWait+dt:0;
  if(!fanOn && !zCO.fired && coWait>0 && toDesk()){ fanOn=true; H.fade(fanMat,1,1.5); }   // her hologram spins up as the guest reaches the desk
  if(slipWait && showing('Sign here')){ slipWait=false; growSlip(); capSeq(slipText(),2); }
  fanScr.range=(fanOn||fanMat.opacity>0.001)?5:0; ledScr.range=ledOn?10:0;   // idle screens stop uploading
  if(!deskGreen) deskRing.color.setHex(H.stay.extended?0xff2a1a:CREAM);
  if(x2Wait && capBox && capBox.textContent.indexOf('firm when firmness')>0){ x2Wait=false; H.after(H.lineDur('X2')-1.2,function(){ deskGreen=true; deskRing.color.setHex(0x3fd47f); H.sfx.ding({x:290,z:81}); }); }
  if(fanOn) seam.rotation.z+=dt*1.5*2*PI; blurMat.opacity=0.03*fanMat.opacity;
  var cm=(t%4)<0.16?corkS:corkO; if(corkMat.map!==cm) corkMat.map=cm;
  if(nmOut){ var h=H.headPos(); H.keepAway(nm,1.0); nm.rotation.y=Math.atan2(h.x-nm.position.x,h.z-nm.position.z); }
  if(burstRe>0 && !H.inBox(318,102,350,135)){ burstRe-=dt; if(burstRe<=0) zB.fired=false; }
  if(stut<0){ stutNext-=dt; if(stutNext<=0) stut=0; }
  else { stut+=dt; var k=stut<0.6?H.flick(stut+0.25,2,0.5):1; fluorL.intensity=0.55*k; tubeMat.emissiveIntensity=0.9*k; if(stut>=0.6){ stut=-1; stutNext=17+rnd()*6; } }
});
H.onBegin(function(){ H.stations.forEach(function(s){ if(s.n===6){ s.name='Check-out'; s.desc='late minutes assessed · Enter or trigger at the door to check in again'; } }); });
H.resets.push(function(){
  co.stop(); co.done=false; fanOn=false; fanMat.opacity=0; blurMat.opacity=0; seam.rotation.z=0; slip.scale.set(0.001,0.001,0.001); slip.visible=false;
  tvFade=0; tvFading=false; ledOn=false; drawLED(ledScr.ctx,0,256,64); ledScr.tex.needsUpdate=true; keyRing.color.setHex(CREAM); deskRing.color.setHex(CREAM); deskGreen=false; x2Wait=false; slipWait=false; tvPend=false; coWait=0;
  hallL.color.setHex(0xffb870); hallL.intensity=0.35; nmL.intensity=0; fluorL.intensity=0.55; tubeMat.emissiveIntensity=0.9; stut=-1; stutNext=14;
  nmAt(280,123); nm.rotation.y=PI/2; nmp.visible=true; nmOut=false; burstRe=0; c1T=-1;
  [zC1,zC2,zC3,zB,zCO,zX4].forEach(function(z){ z.fired=false; });
});
})();
