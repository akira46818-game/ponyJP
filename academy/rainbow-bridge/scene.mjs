const PALETTES={
  meadow:['#cae6e8','#f3f3db','#bfd8b4','#9ebf9d'],flowers:['#e0e9e5','#fff1db','#d4dcae','#a9c3a0'],
  forest:['#d3e8e0','#e8efd4','#b2cfb1','#85b39c'],night:['#777fa8','#c7bdd3','#b1b8c7','#899fb4'],
  castle:['#dcdde9','#fcf0df','#d3d8bf','#a4c5ad']
};
const flower=(x,y,c='#f2b5c2',size=1)=>`<g transform="translate(${x} ${y}) scale(${size})"><path d="M0 0v18m0-5q-9-9-12-4m12 0q8-10 12-7" stroke="#769e77" stroke-width="3" fill="none"/><g fill="${c}"><circle cy="-7" r="6"/><circle cx="7" cy="-1" r="6"/><circle cx="4" cy="7" r="6"/><circle cx="-5" cy="7" r="6"/><circle cx="-7" cy="-2" r="6"/></g><circle r="4" fill="#fff4bc"/></g>`;
const cloud=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})" fill="#fffdf3" opacity=".82"><rect x="-60" y="0" width="130" height="28" rx="14"/><circle cx="-22" cy="0" r="28"/><circle cx="18" cy="-8" r="36"/><circle cx="48" cy="6" r="21"/></g>`;
export function drawLandscape(level){
  const [sky,low,hill,back]=PALETTES[level.theme],a=level.start,b=level.end,night=level.theme==='night';
  let extra=night?`<path d="M818 64a39 39 0 1 0 48 51a41 41 0 0 1-48-51" fill="#fff1b9"/>`:`<circle cx="816" cy="102" r="38" fill="#f8df9f"/><circle cx="816" cy="102" r="48" fill="none" stroke="#f6e7be" stroke-width="2" stroke-dasharray="3 9"/>`;
  if(night)for(let i=0;i<23;i++)extra+=`<path d="M${135+i*31} ${80+(i*47%150)}v6m-3-3h6" stroke="#fff5cc" stroke-width="2" opacity="${.35+(i%4)*.17}"/>`;
  else extra+=cloud(260,116,.72)+cloud(670,156,.55)+cloud(990,216,.7);
  if(level.theme==='forest')extra+=`<g fill="#6e9d83" opacity=".6"><path d="M35 330V190L-20 305H12L-34 350H82L52 305H83Z"/><path d="M950 295V170L905 260H927L890 310H1002L974 260H1000Z"/></g>`;
  if(level.theme==='castle')extra+=`<g transform="translate(870 ${b.y-130})"><path d="M-24 132V35H40V132" fill="#f3e6cf" stroke="#cbbba5" stroke-width="2"/><path d="M-45 132V36H-16V132M34 132V36H63V132" fill="#e5dbc4" stroke="#c4b59d" stroke-width="2"/><path d="M-50 36L-30 3L-10 36M29 36L49 3L69 36" fill="#d59cac"/><path d="M-2 132V103Q8 89 18 103V132" fill="#9caeaa"/><path d="M-30 4V-14L-7-7L-30-1" fill="#e5b35d" stroke="#c59c65" stroke-width="2"/><path d="M-1 58V75H17V58Z" fill="#a9cfcc"/></g>`;
  let plants='';
  for(let i=0;i<7;i++){plants+=flower(38+i*28,a.y+26+(i%2)*20,i%2?'#f2cba7':'#eab0bd',.55);plants+=flower(820+i*25,b.y+30+(i%3)*17,i%2?'#d2c1e4':'#f2cd93',.5);}
  const waves=Array.from({length:10},(_,i)=>`<path d="M${290+(i*67%340)} ${445+(i*37%100)}q25 5 57 0"/>`).join('');
  return `<rect width="1000" height="560" fill="${sky}"/><rect width="1000" height="560" fill="url(#sky)" opacity="${night?.12:.48}"/>
    <path d="M0 282Q180 112 370 284Q540 182 740 276Q890 162 1000 245V560H0Z" fill="${back}" opacity=".28"/>
    <path d="M0 310Q190 210 355 315Q570 205 775 304Q920 235 1000 265V560H0Z" fill="${hill}" opacity=".63"/>
    <path d="M390 560Q510 420 460 330Q500 312 545 330Q510 440 700 560Z" fill="url(#river)"/>
    <path d="M0 465Q300 405 540 441Q750 412 1000 465V560H0Z" fill="url(#river)"/>
    <g fill="none" stroke="#eefbf5" stroke-width="3" stroke-linecap="round" opacity=".55">${waves}</g>
    ${extra}
    <path d="M0 ${a.y+7}Q140 ${a.y-17} 258 ${a.y+14}L235 560H0Z" fill="url(#bank)"/>
    <path d="M0 ${a.y+7}Q140 ${a.y-17} 258 ${a.y+14}" stroke="${hill}" stroke-width="17" fill="none" stroke-linecap="round"/>
    <path d="M742 ${b.y+14}Q860 ${b.y-17} 1000 ${b.y+7}V560H765Z" fill="url(#bank)"/>
    <path d="M742 ${b.y+14}Q860 ${b.y-17} 1000 ${b.y+7}" stroke="${hill}" stroke-width="17" fill="none" stroke-linecap="round"/>
    <g fill="none" stroke="#b29c79" stroke-width="2" opacity=".26"><path d="M220 ${a.y+64}l-11 23m7 23l-8 25M784 ${b.y+65}l8 28m-4 14l7 28M70 490l27 4m788-24l31 3"/></g>
    ${plants}<g fill="${low}" opacity=".4"><ellipse cx="95" cy="485" rx="40" ry="7"/><ellipse cx="900" cy="490" rx="35" ry="5"/></g>`;
}
export function drawRocks(level){return level.rocks.map(r=>`<g><ellipse cx="${r.x+3}" cy="${r.y+r.r-5}" rx="${r.r}" ry="13" fill="#577f7e" opacity=".13"/><path d="M${r.x-r.r} ${r.y+20}Q${r.x-r.r-5} ${r.y-r.r+8} ${r.x-12} ${r.y-r.r}Q${r.x+r.r-5} ${r.y-r.r-12} ${r.x+r.r} ${r.y+14}Q${r.x+r.r} ${r.y+r.r} ${r.x} ${r.y+r.r}Q${r.x-r.r} ${r.y+r.r} ${r.x-r.r} ${r.y+20}Z" fill="#a7b8b2"/><path d="M${r.x-r.r+12} ${r.y-3}Q${r.x-25} ${r.y-r.r+4} ${r.x+8} ${r.y-r.r+11}" fill="none" stroke="#d2dcd0" stroke-width="9" stroke-linecap="round"/><path d="M${r.x+11} ${r.y+18}l15 16m-50 13l19 3" fill="none" stroke="#8c9e98" stroke-width="3" stroke-linecap="round"/><ellipse cx="${r.x-15}" cy="${r.y-r.r+5}" rx="25" ry="8" fill="#a9c592"/></g>`).join('');}
export function drawMarkers(level){const a=level.start,b=level.end;return `<circle class="marker-ring" cx="${a.x}" cy="${a.y}" r="38" fill="#fff8db" fill-opacity=".3" stroke="#fffef0" stroke-width="4"/><circle cx="${a.x}" cy="${a.y}" r="11" fill="#f4ca73" stroke="#fff8dc" stroke-width="4"/>${flower(a.x,a.y,'#f7b8c8',1.2)}<text x="${a.x}" y="${a.y+65}" text-anchor="middle" font-size="16" font-weight="bold" fill="#748c68">ここから</text><circle cx="${b.x}" cy="${b.y}" r="30" fill="#fff4c6" opacity=".5"/><path d="M${b.x+35} ${b.y+3}V${b.y-91}" stroke="#a98f72" stroke-width="5" stroke-linecap="round"/><path d="M${b.x+36} ${b.y-88}h54l-13 17 13 17h-54Z" fill="#e7a0b4"/><path d="M${b.x+52} ${b.y-74}l6 7 12-13" fill="none" stroke="#fff5de" stroke-width="3"/><text x="${b.x}" y="${b.y+63}" text-anchor="middle" font-size="16" font-weight="bold" fill="#748c68">ゴール</text>`;}
export function pathData(points){return points.map((p,i)=>(i?'L':'M')+p.x.toFixed(1)+' '+p.y.toFixed(1)).join(' ');}
export function drawBridge(points){
  if(points.length<2)return '';
  const d=pathData(points),colors=['#ea94ad','#efb87e','#eed689','#aed19a','#8cc7bd','#8cbcd9','#b5a5d4'];
  return `<path d="${d}" transform="translate(0 10)" fill="none" stroke="#fffdf0" stroke-width="29" stroke-linejoin="round" stroke-linecap="round"/>`+colors.map((color,i)=>`<path d="${d}" transform="translate(0 ${i*3.3})" fill="none" stroke="${color}" stroke-width="4.3" stroke-linejoin="round" stroke-linecap="round"/>`).join('');
}
