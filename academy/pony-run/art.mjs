const W=600,H=720,HORIZON=186,FLOOR=638;
const palettes=[{sky:'#a8dce1',ground:'#d5e7c2',road:'#e6d9bb',edge:'#f9f2dd'},{sky:'#b9e1e0',ground:'#bfd895',road:'#efe2bb',edge:'#fff1d3'},{sky:'#c9c5e6',ground:'#d6e8ee',road:'#e7e1ed',edge:'#fff9ed'}];
function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
function poly(c,points,color){c.fillStyle=color;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();}
function rect(c,x,y,w,h,color,r=0){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
function star(c,x,y,r,color){const pts=[];for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,k=i%2?r*.46:r;pts.push([x+Math.cos(a)*k,y+Math.sin(a)*k]);}poly(c,pts,color);}
function cloud(c,x,y,s){ellipse(c,x,y,37*s,12*s,'#ffffffb5');ellipse(c,x-14*s,y-9*s,17*s,15*s,'#ffffffb5');ellipse(c,x+10*s,y-12*s,22*s,19*s,'#ffffffb5');}
function project(lane,z){const p=Math.pow(Math.max(0,1-z/180),2);return {x:300+(lane-1)*181*p,y:HORIZON+(FLOOR-HORIZON)*p,p};}
function tree(c,x,y,s,theme){rect(c,x-5*s,y-57*s,10*s,57*s,'#af9774',3*s);ellipse(c,x,y-75*s,31*s,42*s,theme===1?'#80b18b':'#91b99a');ellipse(c,x-12*s,y-80*s,18*s,26*s,'#a9c998');ellipse(c,x+10*s,y-57*s,22*s,25*s,'#91b99a');if(theme===1){for(let i=0;i<4;i++)ellipse(c,x+Math.sin(i*2)*22*s,y-(59+i*10)*s,4*s,4*s,'#f1d8ba');}}
function flower(c,x,y,s,color){c.strokeStyle='#77a17e';c.lineWidth=2*s;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-17*s);c.stroke();for(let i=0;i<5;i++)ellipse(c,x+Math.sin(i*1.256)*5*s,y-20*s+Math.cos(i*1.256)*5*s,4*s,5*s,color);ellipse(c,x,y-20*s,3*s,3*s,'#eac765');}
function house(c,x,y,s,index){const tones=['#e3b7ac','#a9c7bb','#e4cc9f','#b5c7d4'],color=tones[index%4];rect(c,x-39*s,y-100*s,78*s,100*s,color,4*s);poly(c,[[x-48*s,y-98*s],[x,y-135*s],[x+48*s,y-98*s]],'#b78f82');rect(c,x-25*s,y-76*s,18*s,25*s,'#e8f5ec',3*s);rect(c,x+8*s,y-76*s,18*s,25*s,'#e8f5ec',3*s);rect(c,x-10*s,y-34*s,20*s,34*s,'#f7e9d1',7*s);rect(c,x-35*s,y-46*s,70*s,12*s,index%2?'#e7d79e':'#a6bdb1',2*s);for(let i=0;i<4;i++)rect(c,x+(-35+i*18)*s,y-46*s,8*s,12*s,'#fff2da');}
function obstacle(c,p,theme){const s=p.p,x=p.x,y=p.y;ellipse(c,x,y+4*s,45*s,9*s,'#5b72651c');if(theme===1){rect(c,x-42*s,y-48*s,84*s,48*s,'#d9ae7d',9*s);for(let i=0;i<5;i++)flower(c,x+(-29+i*15)*s,y-39*s,s*.95,i%2?'#f6da8c':'#e9a9b4');rect(c,x-46*s,y-46*s,92*s,9*s,'#edc595',4*s);}else{rect(c,x-44*s,y-62*s,88*s,58*s,theme===2?'#ceb9df':'#e5bc7e',12*s);rect(c,x-47*s,y-9*s,94*s,12*s,theme===2?'#bdabd0':'#d5aa6c',5*s);star(c,x,y-33*s,13*s,'#fff2bc');c.strokeStyle='#fff9';c.lineWidth=3*s;c.beginPath();c.moveTo(x-30*s,y-49*s);c.lineTo(x-8*s,y-49*s);c.stroke();}}
export function createPainter(canvas,atlas){
  const c=canvas.getContext('2d');
  return function paint(run,character,time,{reduced=false,active=false}={}){
    const theme=run.stage,pal=palettes[theme],dist=run.distance,t=reduced?0:time;
    const sky=c.createLinearGradient(0,0,0,HORIZON+80);sky.addColorStop(0,pal.sky);sky.addColorStop(1,'#f4f5db');c.fillStyle=sky;c.fillRect(0,0,W,H);
    ellipse(c,475,93,28,28,'#fff0b7');cloud(c,90,75,1.2);cloud(c,370,128,.85);cloud(c,555,165,.6);
    if(theme===2){const colors=['#eaa8b3','#efc592','#f2dc9b','#b7d4ad','#9fcdd9','#c0b5dc'];colors.forEach((col,i)=>{c.strokeStyle=col;c.lineWidth=10;c.beginPath();c.arc(300,200,142-i*10,Math.PI,0);c.stroke();});cloud(c,154,202,.9);cloud(c,445,202,.9);}
    poly(c,[[0,196],[80,139],[145,182],[220,125],[320,197],[420,146],[530,191],[600,152],[600,280],[0,280]],theme===2?'#c5d9d7':'#aacbbc');
    poly(c,[[0,220],[110,183],[200,218],[280,170],[420,223],[510,175],[600,210],[600,300],[0,300]],theme===2?'#edf1e4':'#c4d8ab');
    rect(c,0,HORIZON+45,W,H,pal.ground);
    poly(c,[[278,HORIZON],[322,HORIZON],[650,H],[-50,H]],pal.edge);
    poly(c,[[290,HORIZON],[310,HORIZON],[613,H],[-13,H]],pal.road);
    if(theme===2){['#efb6bf','#f1c8a7','#f1e1b2','#bfd7bb','#b2d6df','#c3bcde'].forEach((col,i)=>poly(c,[[298+i*.7,HORIZON],[-13+i*104.3,H],[-13+(i+1)*104.3,H],[298+(i+1)*.7,HORIZON]],col));}
    for(let j=0;j<18;j++){
      const z=(j*13-dist%13),p1=project(1,z),p2=project(1,z+5);
      for(const lane of [.5,1.5]){const a=project(lane,z),b=project(lane,z+5);poly(c,[[a.x-2*p1.p,a.y],[a.x+2*p1.p,a.y],[b.x+2*p2.p,b.y],[b.x-2*p2.p,b.y]],'#fff9e999');}
      if(j%2===0){for(const side of [-1,1])ellipse(c,300+side*302*p1.p,p1.y,7*p1.p,3*p1.p,'#fff9d9');}
    }
    for(let i=11;i>=0;i--){const z=(i*20+180-dist%240)%240,p=project(1,z);if(p.p<.008)continue;for(const side of [-1,1]){const x=300+side*355*p.p,s=p.p*1.6;if(theme===0&&i%3!==0)house(c,x,p.y,s,i+(side===1?2:0));else if(theme!==2)tree(c,x,p.y,s,theme);else cloud(c,x,p.y-15*s,s*1.2);if(theme===1)flower(c,300+side*282*p.p,p.y,s,'#e9b4c4');}}
    if(LENGTH_FOR_ART-dist<180){const p=project(1,LENGTH_FOR_ART-dist),s=p.p;rect(c,p.x-200*s,p.y-170*s,12*s,170*s,'#a3b3a0',5*s);rect(c,p.x+188*s,p.y-170*s,12*s,170*s,'#a3b3a0',5*s);rect(c,p.x-200*s,p.y-175*s,400*s,52*s,'#fff7df',8*s);c.fillStyle='#69896e';c.textAlign='center';c.font=`800 ${24*s}px sans-serif`;c.fillText('G O A L',p.x,p.y-141*s);for(let i=0;i<7;i++)poly(c,[[p.x+(-170+i*52)*s,p.y-118*s],[p.x+(-145+i*52)*s,p.y-87*s],[p.x+(-120+i*52)*s,p.y-118*s]],['#e9aab3','#e9d497','#b4cfa0'][i%3]);}
    for(const item of [...run.items].reverse()){const z=item.z-dist;if(item.done||z<0||z>178)continue;const p=project(item.lane,z);if(item.kind==='obstacle')obstacle(c,p,theme);else{const y=p.y-43*p.p+Math.sin(t*3+item.z)*3*p.p;ellipse(c,p.x+2*p.p,y+3*p.p,19*p.p,19*p.p,'#d2aa5533');star(c,p.x,y,19*p.p,'#e5ad3b');star(c,p.x,y-1*p.p,15*p.p,'#ffe69a');}}
    const x=300+(run.x-1)*181,base=FLOOR,bob=active&&!reduced?Math.sin(t*14)*4:0,lift=run.jumpHeight*112;
    ellipse(c,x,base+4,43-lift*.08,12-lift*.025,'#586c6330');
    if(atlas.complete&&atlas.naturalWidth){const sw=atlas.naturalWidth/3,sh=atlas.naturalHeight/2,idx=character;const size=196;c.save();c.translate(x,base-lift+bob);c.rotate(active&&!reduced?Math.sin(t*7)*.024:0);c.drawImage(atlas,(idx%3)*sw,Math.floor(idx/3)*sh,sw,sh,-size/2,-size,size,size);c.restore();}
    if(active&&!reduced&&run.jumpHeight<.1)for(let i=0;i<3;i++)ellipse(c,x-32+i*30,base+11+(Math.sin(t*8+i)+1)*6,4,2,'#fff7da88');
  };
}
const LENGTH_FOR_ART=360;
