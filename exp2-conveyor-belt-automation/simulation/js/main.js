/* ════════════════════════════════════════════════════════════════
   CONVEYOR BELT SIMULATOR — COMPLETE JS
   ════════════════════════════════════════════════════════════════ */
'use strict';

/* ── DOM shortcuts ── */
const $=id=>document.getElementById(id);
const cv=$('simCanvas'), cx=cv.getContext('2d');

/* sliders */
const slS=$('slS'),slL=$('slL'),slR=$('slR'),slN=$('slN');

/* ── Physics ── */
function phys(){
  const s=+slS.value,l=+slL.value,r=+slR.value,n=+slN.value;
  const power =+((r*l)/1000*(fO?1.8:1)*(fM?1.2:1)).toFixed(2);
  const temp  =+(25+l*.65+r*.016+(fM?35:0)+(fO?12:0)).toFixed(1);
  const effectiveS = fM ? s * 0.6 : (fO ? s * 0.55 : s);
  const trans =+(n/effectiveS).toFixed(2);
  const si = Math.max(600, 2800 / (effectiveS || 0.1));
  const thru  =+(3600000 / si).toFixed(0);
  const eff   =+Math.max(10,100-l*.7-(r-800)*.02-(fM?45:0)-(fO?35:0)).toFixed(1);
  const health=+Math.max(0,100-Math.max(0,(temp-40)*2)-(fM?35:0)-(fO?25:0)).toFixed(1);
  const tRisk =+Math.min(100,Math.max(0,(temp-40)*3.5+(fM?45:0))).toFixed(1);
  const oRisk =+Math.min(100,Math.max(0,(l-25)*4.5+(fO?55:0))).toFixed(1);
  const mtbf  =+(2000/Math.max(1,tRisk+oRisk+1)).toFixed(0);
  return{s,l,r,n,temp,power,trans,thru,eff,health,tRisk,oRisk,mtbf};
}

/* ── State ── */
let running=true,fM=false,fO=false,noisy=true;
let runId=0,itemsOut=0,wear=5,uptime=0;
let logData=[];
let beltOff=0,rollerA=0,lastTS=0;
let boxes=[],boxN=0,lastSpawn=0;

/* ── Chart.js ── */
Chart.defaults.font.family="'Inter',sans-serif";

/* Health doughnut */
const hChart=new Chart($('cHealth').getContext('2d'),{
  type:'doughnut',
  data:{datasets:[{data:[100,0],backgroundColor:['#10b981','#e2e8f0'],borderWidth:0,circumference:270,rotation:225}]},
  options:{cutout:'76%',plugins:{legend:{display:false},tooltip:{enabled:false}},events:[],animation:{duration:300}}
});
function updHealth(h){
  const c=h>80?'#10b981':h>60?'#f59e0b':'#ef4444';
  hChart.data.datasets[0].data=[h,100-h];
  hChart.data.datasets[0].backgroundColor[0]=c;
  hChart.update('none');
  $('healthNum').textContent=Math.round(h);
  $('healthNum').style.color=c;
  const p=$('healthPill');
  if(h>85){p.className='hpill ok';p.textContent='Excellent';}
  else if(h>65){p.className='hpill mod';p.textContent='Moderate';}
  else{p.className='hpill crit';p.textContent='Critical';}
}

/* Full gauges */
function mkSemi(id,col,max){
  return new Chart($(id).getContext('2d'),{
    type:'doughnut',
    data:{datasets:[{data:[0,max],backgroundColor:[col,'#e2e8f0'],borderWidth:0}]},
    options:{cutout:'75%',plugins:{legend:{display:false},tooltip:{enabled:false}},events:[],animation:{duration:250},maintainAspectRatio:false}
  });
}
const gT=mkSemi('cTemp','#f59e0b',120);
const gL=mkSemi('cLoad','#06b6d4',50);
const gS=mkSemi('cSpd', '#ec4899',10);
const gE=mkSemi('cEff', '#3b82f6',100);
function setSemi(ch,v,max){ch.data.datasets[0].data=[Math.min(v,max),Math.max(0,max-v)];ch.update('none');}

/* Waveform */
const N=50,wLbl=Array(N).fill('');
const dT=Array(N).fill(null),dL=Array(N).fill(null),dS=Array(N).fill(null),dH=Array(N).fill(null);
const wChart=new Chart($('cWave').getContext('2d'),{
  type:'line',
  data:{labels:wLbl,datasets:[
    {label:'Temp', data:dT,borderColor:'#f59e0b',borderWidth:2,pointRadius:0,tension:.4,fill:false},
    {label:'Load', data:dL,borderColor:'#06b6d4',borderWidth:2,pointRadius:0,tension:.4,fill:false},
    {label:'Speed',data:dS,borderColor:'#ec4899',borderWidth:2,pointRadius:0,tension:.4,fill:false},
    {label:'Health',data:dH,borderColor:'#3b82f6',borderWidth:2,pointRadius:0,tension:.4,fill:false},
  ]},
  options:{responsive:true,maintainAspectRatio:false,animation:{duration:0},
    scales:{
      x:{grid:{color:'rgba(0,0,0,.04)'},ticks:{display:false}},
      y:{min:0,max:120,grid:{color:'rgba(0,0,0,.04)'},ticks:{font:{size:10},color:'#94a3b8'}}
    },
    plugins:{legend:{display:false},tooltip:{mode:'index',intersect:false}}}
});
function pushWave(p){
  const n=noisy?(()=>(Math.random()-.5)*2):(()=>0);
  dT.shift();dT.push(+(p.temp+n()).toFixed(2));
  dL.shift();dL.push(+(p.l+n()*.4).toFixed(2));
  dS.shift();dS.push(+(p.s+n()*.3).toFixed(2));
  dH.shift();dH.push(+(p.health+n()).toFixed(2));
  wChart.update();
}

/* ════════════════════════════════════════════
   CANVAS SIMULATION ENGINE
   ════════════════════════════════════════════ */
const RR=50;  /* roller radius */
const MAR=110; /* margin to roller centre */
const BT=14;   /* belt thickness */

/* Round rect helper */
function rr(x,y,w,h,r){
  cx.beginPath();
  cx.moveTo(x+r,y);cx.lineTo(x+w-r,y);cx.arcTo(x+w,y,x+w,y+r,r);
  cx.lineTo(x+w,y+h-r);cx.arcTo(x+w,y+h,x+w-r,y+h,r);
  cx.lineTo(x+r,y+h);cx.arcTo(x,y+h,x,y+h-r,r);
  cx.lineTo(x,y+r);cx.arcTo(x,y,x+r,y,r);
  cx.closePath();
}

function drawAll(){
  const W=cv.width, H=cv.height;
  const CY=H/2-5;
  const LX=MAR, RX=W-MAR;
  const bTop=CY-RR, bBot=CY+RR;
  const floorY=H-35;

  /* 1. Background */
  const bg=cx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#060c1a');bg.addColorStop(1,'#0c1525');
  cx.fillStyle=bg;cx.fillRect(0,0,W,H);

  /* Grid */
  cx.save();cx.strokeStyle='rgba(59,130,246,.06)';cx.lineWidth=1;
  for(let x=0;x<W;x+=50){cx.beginPath();cx.moveTo(x,0);cx.lineTo(x,H);cx.stroke();}
  for(let y=0;y<H;y+=50){cx.beginPath();cx.moveTo(0,y);cx.lineTo(W,y);cx.stroke();}
  cx.restore();

  /* Ceiling pipe */
  cx.save();
  cx.strokeStyle='#1e293b';cx.lineWidth=9;
  cx.beginPath();cx.moveTo(0,12);cx.lineTo(W,12);cx.stroke();
  cx.strokeStyle='#334155';cx.lineWidth=5;
  cx.beginPath();cx.moveTo(0,12);cx.lineTo(W,12);cx.stroke();
  cx.strokeStyle='rgba(148,163,184,.1)';cx.lineWidth=1;
  cx.beginPath();cx.moveTo(0,12);cx.lineTo(W,12);cx.stroke();
  for(let x=90;x<W;x+=130){
    cx.strokeStyle='#1e293b';cx.lineWidth=3;
    cx.beginPath();cx.moveTo(x,12);cx.lineTo(x,38);cx.stroke();
    cx.beginPath();cx.arc(x,38,4,0,Math.PI*2);cx.fillStyle='#334155';cx.fill();
  }
  cx.restore();

  /* Floor */
  const fg=cx.createLinearGradient(0,floorY,0,H);
  fg.addColorStop(0,'#1e293b');fg.addColorStop(1,'#0f172a');
  cx.fillStyle=fg;cx.fillRect(0,floorY,W,H-floorY);
  cx.strokeStyle='rgba(148,163,184,.2)';cx.lineWidth=1;
  cx.beginPath();cx.moveTo(0,floorY);cx.lineTo(W,floorY);cx.stroke();
  /* hazard stripes */
  cx.save();cx.globalAlpha=.12;cx.strokeStyle='#f59e0b';cx.lineWidth=5;
  for(let x=-60;x<W+60;x+=32){cx.beginPath();cx.moveTo(x,floorY);cx.lineTo(x+24,H);cx.stroke();}
  cx.restore();

  /* 2. Motor housing (left) */
  {
    const mw=52,mh=96,mx=LX-80,my=CY-mh/2;
    cx.save();
    cx.shadowColor='rgba(0,0,0,.7)';cx.shadowBlur=18;cx.shadowOffsetY=6;
    const mg=cx.createLinearGradient(mx,0,mx+mw,0);
    mg.addColorStop(0,'#1e293b');mg.addColorStop(.5,'#334155');mg.addColorStop(1,'#1e293b');
    cx.fillStyle=mg;rr(mx,my,mw,mh,6);cx.fill();cx.restore();
    cx.strokeStyle='#475569';cx.lineWidth=1.5;rr(mx,my,mw,mh,6);cx.stroke();
    /* fins */
    cx.strokeStyle='rgba(0,0,0,.5)';cx.lineWidth=2;
    for(let i=0;i<7;i++){const fy=my+9+i*11;cx.beginPath();cx.moveTo(mx+5,fy);cx.lineTo(mx+mw-5,fy);cx.stroke();}
    /* shaft */
    cx.fillStyle='#475569';cx.fillRect(mx+mw,CY-5,26,10);
    /* LED */
    const lok=running&&!fM;
    cx.beginPath();cx.arc(mx+mw/2,my+mh-13,5,0,Math.PI*2);
    cx.fillStyle=lok?'#10b981':'#ef4444';cx.shadowColor=lok?'#10b981':'#ef4444';cx.shadowBlur=10;cx.fill();cx.shadowBlur=0;
    /* labels */
    cx.font='bold 9px Inter';cx.textAlign='center';cx.fillStyle='#60a5fa';
    cx.fillText('MOTOR',mx+mw/2,my+mh+16);
    cx.font='8px Inter';cx.fillStyle='#94a3b8';
    cx.fillText(Math.round(slR.value)+' RPM',mx+mw/2,my+mh+27);
  }

  /* 3. Belt body */
  {
    /* top run */
    cx.save();
    cx.shadowColor='rgba(0,0,0,.5)';cx.shadowBlur=10;cx.shadowOffsetY=4;
    const tg=cx.createLinearGradient(0,bTop-BT/2,0,bTop+BT/2);
    tg.addColorStop(0,'#475569');tg.addColorStop(.5,'#334155');tg.addColorStop(1,'#1e293b');
    cx.fillStyle=tg;cx.fillRect(LX,bTop-BT/2,RX-LX,BT);cx.restore();
    /* moving ribs */
    cx.save();cx.beginPath();cx.rect(LX,bTop-BT/2,RX-LX,BT);cx.clip();
    cx.strokeStyle='rgba(203,213,225,.35)';cx.lineWidth=2.5;
    const sp=28,st=LX+(beltOff%sp);
    for(let x=st-sp;x<RX+sp;x+=sp){cx.beginPath();cx.moveTo(x,bTop-BT/2-1);cx.lineTo(x,bTop+BT/2+1);cx.stroke();}
    cx.restore();
    cx.fillStyle='rgba(255,255,255,.07)';cx.fillRect(LX,bTop-BT/2,RX-LX,3);
    cx.strokeStyle='#1e293b';cx.lineWidth=1.5;cx.strokeRect(LX,bTop-BT/2,RX-LX,BT);
    /* bottom return run */
    const bg2=cx.createLinearGradient(0,bBot-BT/2,0,bBot+BT/2);
    bg2.addColorStop(0,'#1e293b');bg2.addColorStop(1,'#0f172a');
    cx.fillStyle=bg2;cx.fillRect(LX,bBot-BT/2,RX-LX,BT);
    cx.strokeStyle='#0f172a';cx.lineWidth=1;cx.strokeRect(LX,bBot-BT/2,RX-LX,BT);
    /* support legs */
    cx.fillStyle='#334155';
    const legY=bBot+BT/2;
    [(RX-LX)*.25+LX,(RX-LX)*.5+LX,(RX-LX)*.75+LX].forEach(lx2=>{
      cx.fillRect(lx2-6,legY,12,floorY-legY);
      cx.fillStyle='#475569';cx.fillRect(lx2-14,floorY-5,28,6);cx.fillStyle='#334155';
    });
  }

  /* 4. Rollers */
  function drawRoller(x,y,ang,primary){
    cx.save();
    cx.shadowColor='rgba(0,0,0,.7)';cx.shadowBlur=18;cx.shadowOffsetY=6;
    const rg=cx.createRadialGradient(x-RR*.35,y-RR*.35,RR*.05,x,y,RR);
    rg.addColorStop(0,'#94a3b8');rg.addColorStop(.5,'#475569');rg.addColorStop(1,'#1e293b');
    cx.beginPath();cx.arc(x,y,RR,0,Math.PI*2);cx.fillStyle=rg;cx.fill();cx.restore();
    /* rim */
    cx.beginPath();cx.arc(x,y,RR,0,Math.PI*2);cx.strokeStyle='#334155';cx.lineWidth=4;cx.stroke();
    /* grip bands */
    [-RR*.18,RR*.18].forEach(d=>{
      cx.beginPath();cx.arc(x,y+d,RR,0,Math.PI*2);cx.strokeStyle='rgba(0,0,0,.4)';cx.lineWidth=4;cx.stroke();
    });
    /* spokes */
    cx.save();cx.translate(x,y);cx.rotate(ang);
    for(let i=0;i<6;i++){
      const a=(i/6)*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
      cx.beginPath();cx.moveTo(c*RR*.22,s*RR*.22);cx.lineTo(c*RR*.82,s*RR*.82);
      cx.strokeStyle='rgba(203,213,225,.55)';cx.lineWidth=2.5;cx.stroke();
      cx.beginPath();cx.arc(c*RR*.66,s*RR*.66,2.5,0,Math.PI*2);
      cx.fillStyle='rgba(148,163,184,.8)';cx.fill();
    }
    /* hub */
    cx.beginPath();cx.arc(0,0,RR*.22,0,Math.PI*2);
    cx.fillStyle=primary?'#2563eb':'#475569';cx.fill();
    cx.strokeStyle='#0f172a';cx.lineWidth=2;cx.stroke();
    cx.beginPath();cx.arc(0,0,RR*.1,0,Math.PI*2);cx.fillStyle='#cbd5e1';cx.fill();
    cx.restore();
    /* shine */
    const sh=cx.createRadialGradient(x-RR*.4,y-RR*.4,0,x,y,RR);
    sh.addColorStop(0,'rgba(255,255,255,.18)');sh.addColorStop(.7,'rgba(255,255,255,0)');
    cx.beginPath();cx.arc(x,y,RR,0,Math.PI*2);cx.fillStyle=sh;cx.fill();
    /* label */
    cx.font='bold 9px Inter';cx.textAlign='center';cx.fillStyle=primary?'#60a5fa':'#94a3b8';
    cx.fillText(primary?'DRIVE':'IDLER',x,y+RR+20);
  }
  drawRoller(LX,CY,rollerA,true);
  drawRoller(RX,CY,rollerA,false);

  /* 5. Exit chute */
  {
    const cX=RX+RR-6,cY=bTop;
    const cg=cx.createLinearGradient(cX,cY,cX+45,cY+100);
    cg.addColorStop(0,'#334155');cg.addColorStop(1,'#1e293b');
    cx.fillStyle=cg;
    cx.beginPath();cx.moveTo(cX,cY);cx.lineTo(cX+40,cY);cx.lineTo(cX+58,cY+100);cx.lineTo(cX+18,cY+100);cx.closePath();
    cx.fill();cx.strokeStyle='#475569';cx.lineWidth=1.5;cx.stroke();
    cx.fillStyle='#1e293b';cx.fillRect(cX+8,cY+98,56,22);
    cx.strokeStyle='#334155';cx.lineWidth=1;cx.strokeRect(cX+8,cY+98,56,22);
    cx.font='bold 8px Inter';cx.textAlign='center';cx.fillStyle='#64748b';cx.fillText('OUTPUT',cX+36,cY+114);
    cx.fillStyle='#34d399';cx.font='bold 9px Inter';cx.fillText(`${itemsOut} items`,cX+36,cY+130);
  }

  /* 6. Boxes on belt */
  const BW=46,BH=38;
  const entX=LX+95,extX=RX-95;
  let entBlk=false,extBlk=false;

  boxes.forEach(b=>{
    if(!b.falling&&b.x<entX&&b.x+BW>entX) entBlk=true;
    if(!b.falling&&b.x<extX&&b.x+BW>extX) extBlk=true;
    const by=b.falling?b.fy:(bTop-BH-2);
    /* shadow */
    cx.save();
    cx.shadowColor='rgba(0,0,0,.6)';cx.shadowBlur=12;cx.shadowOffsetX=2;cx.shadowOffsetY=5;
    cx.fillStyle=b.col;cx.globalAlpha=b.a??1;
    rr(b.x,by,BW,BH,5);cx.fill();cx.restore();
    cx.save();cx.globalAlpha=b.a??1;
    /* 3D highlights */
    cx.fillStyle='rgba(255,255,255,.22)';cx.fillRect(b.x,by,BW,5);
    cx.fillStyle='rgba(255,255,255,.12)';cx.fillRect(b.x,by,5,BH);
    cx.fillStyle='rgba(0,0,0,.22)';cx.fillRect(b.x,by+BH-5,BW,5);
    cx.fillStyle='rgba(0,0,0,.14)';cx.fillRect(b.x+BW-5,by,5,BH);
    cx.strokeStyle='rgba(0,0,0,.3)';cx.lineWidth=1;rr(b.x,by,BW,BH,5);cx.stroke();
    cx.fillStyle='rgba(255,255,255,.95)';cx.font='bold 12px Inter';
    cx.textAlign='center';cx.textBaseline='middle';cx.fillText(b.lbl,b.x+BW/2,by+BH/2);
    cx.textBaseline='alphabetic';cx.restore();
  });

  /* 7. Sensors */
  function drawSensor(x,blocked,lbl){
    const col=blocked?'#f59e0b':'#10b981';
    /* housings */
    cx.fillStyle='#1e293b';
    [-18,8].forEach(d=>{rr(x+d,bTop-30,10,13,3);cx.fill();rr(x+d,bBot+17,10,13,3);cx.fill();});
    /* eyes */
    [[bTop-24],[bBot+23]].forEach(([ey])=>{
      [-13,13].forEach(dx=>{
        cx.beginPath();cx.arc(x+dx,ey,3.5,0,Math.PI*2);
        cx.fillStyle=col;cx.shadowColor=col;cx.shadowBlur=8;cx.fill();cx.shadowBlur=0;
      });
    });
    /* beam */
    cx.save();cx.setLineDash([5,4]);cx.strokeStyle=col;cx.lineWidth=2;cx.globalAlpha=.8;
    cx.shadowColor=col;cx.shadowBlur=10;
    cx.beginPath();cx.moveTo(x,bTop-16);cx.lineTo(x,bBot+16);cx.stroke();
    cx.lineWidth=6;cx.globalAlpha=.15;
    cx.beginPath();cx.moveTo(x,bTop-16);cx.lineTo(x,bBot+16);cx.stroke();
    cx.restore();
    cx.fillStyle=col;cx.font='bold 8px Inter';cx.textAlign='center';cx.fillText(lbl,x,bBot+42);
  }
  drawSensor(entX,entBlk,'ENTRY');
  drawSensor(extX,extBlk,'EXIT');

  /* 8. HUD overlay */
  {
    cx.save();cx.globalAlpha=.78;cx.fillStyle='#0f172a';rr(12,10,210,74,7);cx.fill();
    cx.globalAlpha=1;cx.strokeStyle='rgba(59,130,246,.3)';cx.lineWidth=1;rr(12,10,210,74,7);cx.stroke();cx.restore();
    const row=(k,v,col,y)=>{
      cx.fillStyle='#64748b';cx.font='9px Inter';cx.textAlign='left';cx.fillText(k,22,y);
      cx.fillStyle=col;cx.font='bold 11px Inter';cx.textAlign='right';cx.fillText(v,212,y);
    };
    const p2=phys();
    row('BELT SPEED:',`${p2.s.toFixed(1)} m/s`,'#60a5fa',27);
    row('THROUGHPUT:',`${p2.thru} units/hr`,'#34d399',42);
    row('MOTOR TEMP:',`${p2.temp} °C`,p2.temp>70?'#f87171':'#fbbf24',57);
    row('ITEMS OUT:',`${itemsOut}`,'#c084fc',72);
    /* status chip */
    const st=fM||fO?'⚠ FAULT':running?'● RUNNING':'■ PAUSED';
    const sc=fM||fO?'#ef4444':running?'#10b981':'#f59e0b';
    cx.save();cx.globalAlpha=.85;cx.fillStyle='#0f172a';rr(W-122,10,110,26,7);cx.fill();
    cx.globalAlpha=1;cx.fillStyle=sc;cx.font='bold 10px Inter';cx.textAlign='left';
    cx.shadowColor=sc;cx.shadowBlur=6;cx.fillText(st,W-115,27);cx.shadowBlur=0;cx.restore();
  }
}

/* ════════ BOX MANAGEMENT ════════ */
const BOX_COLS=['#f59e0b','#3b82f6','#10b981','#ec4899','#8b5cf6','#06b6d4','#f97316'];

function spawnBox(){
  const LX=MAR,W=cv.width;
  const CY=cv.height/2-5,bTop=CY-RR;
  boxes.push({x:LX-52,fy:bTop-40,vy:0,falling:false,col:BOX_COLS[boxN%BOX_COLS.length],lbl:`P${++boxN}`,a:1});
}

/* ════════ MAIN LOOP ════════ */
function loop(ts){
  requestAnimationFrame(loop);
  const dt=Math.min((ts-lastTS)/1000,.05);
  lastTS=ts;

  /* fixed logical coordinate system, scaled by css aspect-ratio */

  /* visual speed effects */
  let effectiveS = +slS.value;
  if(fO) effectiveS *= 0.55;
  if(fM) effectiveS *= (0.6 + 0.3 * Math.sin(ts/80));

  /* animation */
  if(running){
    const pps=effectiveS*30;
    beltOff+=pps*dt;
    rollerA+=(pps/RR)*dt;
  }

  /* spawn */
  if(running){
    const si=Math.max(600,2800/effectiveS);
    if(ts-lastSpawn>si){spawnBox();lastSpawn=ts;}
  }

  /* move boxes */
  const pps=running?effectiveS*30:0;
  const W=cv.width,CY=cv.height/2-5,bTop=CY-RR,RX=W-MAR;
  for(let i=boxes.length-1;i>=0;i--){
    const b=boxes[i];
    if(!b.falling){
      b.x+=pps*dt;
      if(b.x>RX-RR+8){b.falling=true;b.vy=0;itemsOut++;}
    } else {
      b.vy+=480*dt;b.fy+=b.vy*dt*0.6;b.x+=pps*dt*.3;
      b.a=Math.max(0,1-(b.fy-bTop)/120);
      if(b.a<=0){boxes.splice(i,1);}
    }
  }

  /* draw */
  drawAll();

  /* DOM */
  updDOM();
}

/* ════════ DOM UPDATE ════════ */
let lastDom=0;
function updDOM(){
  const now=performance.now();
  if(now-lastDom<300)return;
  lastDom=now;
  const p=phys();

  $('vS').textContent=`${p.s.toFixed(1)} m/s`;
  $('vL').textContent=`${p.l.toFixed(1)} kg`;
  $('vR').textContent=`${Math.round(p.r)} rpm`;
  $('vN').textContent=`${Math.round(p.n)} m`;

  $('hudS').textContent=`${p.s.toFixed(1)} m/s`;
  $('hudI').textContent=itemsOut;
  $('hudR').textContent=Math.round(p.r);
  const hst=$('hudSt');
  if(fM||fO){hst.textContent='FAULT';hst.className='shu-v r';}
  else if(running){hst.textContent='RUNNING';hst.className='shu-v g';}
  else{hst.textContent='PAUSED';hst.className='shu-v a';}

  $('sE').textContent=running?'Package Detected':'Waiting…';
  $('sW').textContent=`${p.l.toFixed(1)} kg`;
  $('sM').textContent=`${p.temp.toFixed(1)} °C`;
  $('sX').textContent=`${itemsOut} items`;
  $('lE').className=`led ${running?'on':'warn'}`;
  $('lW').className=`led ${p.l>40?'err':p.l>30?'warn':'on'}`;
  $('lM').className=`led ${fM||p.temp>75?'err':p.temp>60?'warn':'on'}`;
  $('lX').className=`led ${fO?'err':'on'}`;

  updHealth(p.health);
  setSemi(gT,p.temp,120);$('mvT').textContent=`${p.temp}°C`;
  setSemi(gL,p.l,50);   $('mvL').textContent=`${p.l} kg`;
  setSemi(gS,p.s,10);   $('mvS').textContent=`${p.s} m/s`;
  setSemi(gE,p.eff,100);$('mvE').textContent=`${p.eff}%`;

  $('kT').textContent=p.thru.toFixed(1);  $('kE').textContent=p.eff.toFixed(1);
  $('kP').textContent=p.power.toFixed(2); $('kTp').textContent=p.temp.toFixed(1);
  $('kTr').textContent=p.trans.toFixed(2);$('kI').textContent=itemsOut;

  wear=Math.min(100,wear+.006);
  setBar('pfT','ptT',p.tRisk);setBar('pfO','ptO',p.oRisk);setBar('pfW','ptW',wear);
  $('psT').textContent=`${p.thru.toFixed(0)} u/hr`;
  $('psP').textContent=`${p.power.toFixed(2)} kW`;
  $('psM').textContent=`${p.mtbf} hr`;
  if(running)uptime+=.3;
  const m=Math.floor(uptime/60),s=Math.floor(uptime%60);
  $('psU').textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

  const banner=$('predB');
  if(fM){banner.className='pb err';banner.textContent='⚠ Motor fault active! Thermal runaway risk.';}
  else if(fO){banner.className='pb warn';banner.textContent='⚡ Overload active. Reduce load immediately.';}
  else if(p.health<70){banner.className='pb warn';banner.textContent='⚡ Elevated stress. Monitor parameters.';}
  else{banner.className='pb ok';banner.textContent='✅ All systems nominal. Baseline telemetry stable.';}

  pushWave(p);
}

function setBar(fid,tid,v){
  $(fid).style.width=`${v}%`;
  $(fid).style.background=v>65?'#ef4444':v>35?'#f59e0b':'#3b82f6';
  $(tid).textContent=`${v.toFixed(0)}%`;
}

/* ════════ CONTROLS ════════ */
[slS,slL,slR,slN].forEach(s=>s.addEventListener('input',()=>lastDom=0));

$('togRun').addEventListener('change',e=>{
  running=e.target.checked;
  const tb=$('telemBadge');
  tb.innerHTML=running?'<span class="pdot"></span>Telemetry Active':'<span class="pdot" style="background:#ef4444;animation:none"></span>Simulation Paused';
  tb.style.cssText=running?'':'background:rgba(239,68,68,.15);border-color:rgba(239,68,68,.3);color:#f87171;';
});
$('togNoise').addEventListener('change',e=>noisy=e.target.checked);

$('btnReset').addEventListener('click',()=>{
  slS.value=2;slL.value=10;slR.value=800;slN.value=5;
  fM=fO=false;
  $('btnFM').textContent='⚡ Trigger Motor Fault';$('btnFM').style.background='';
  $('btnFO').textContent='⚠ Simulate Overload';$('btnFO').style.background='';
  wear=5;uptime=0;itemsOut=0;boxes=[];boxN=0;
  dT.fill(null);dL.fill(null);dS.fill(null);dH.fill(null);
  wChart.update();lastDom=0;
});

$('btnFM').addEventListener('click',()=>{
  fM=!fM;
  $('btnFM').textContent=fM?'✓ Clear Motor Fault':'⚡ Trigger Motor Fault';
  $('btnFM').style.background=fM?'#fca5a5':'';lastDom=0;
});
$('btnFO').addEventListener('click',()=>{
  fO=!fO;
  $('btnFO').textContent=fO?'✓ Clear Overload':'⚠ Simulate Overload';
  $('btnFO').style.background=fO?'#fde68a':'';lastDom=0;
});

/* ════════ DATA LOG ════════ */
$('btnRec').addEventListener('click',()=>{
  const p=phys();runId++;
  const ts=new Date().toLocaleTimeString();
  const st=p.health>80?'Excellent':p.health>60?'Warning':'Critical';
  const stCls=p.health>80?'ok':p.health>60?'warn':'crit';
  const hCls=p.health>80?'ok':p.health>60?'warn':'crit';
  const row=document.createElement('tr');
  row.innerHTML=`
    <td class="td-run">RUN-${String(runId).padStart(3,'0')}</td>
    <td>${ts}</td>
    <td>${p.s.toFixed(1)}</td>
    <td>${p.l.toFixed(1)}</td>
    <td>${Math.round(p.r)}</td>
    <td>${p.temp}</td>
    <td>${p.power}</td>
    <td>${p.eff}</td>
    <td><span class="td-health ${hCls}">${p.health.toFixed(1)}%</span></td>
    <td><span class="status-pill ${stCls}">${st}</span></td>`;
  $('tBody').appendChild(row);
  logData.push({runId,ts,...p,st});
});
$('btnExp').addEventListener('click',()=>{
  if(!logData.length){alert('Record some data first!');return;}
  const hdr='Run,Time,Speed,Load,RPM,Temp,Power,Eff,Health,Status';
  const rows=logData.map(d=>[d.runId,d.ts,d.s,d.l,d.r,d.temp,d.power,d.eff,d.health.toFixed(1),d.st].join(','));
  const a=Object.assign(document.createElement('a'),{href:URL.createObjectURL(new Blob([[hdr,...rows].join('\n')],{type:'text/csv'})),download:`conveyor_exp2_${Date.now()}.csv`});
  a.click();
});
$('btnClr').addEventListener('click',()=>{$('tBody').innerHTML='';logData=[];runId=0;});

/* ════════ INIT — set canvas before first frame ════════ */
(()=>{
  cv.width  = 900;
  cv.height = 300;
})();

requestAnimationFrame(loop);