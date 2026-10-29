import { FLAVORS } from './model.mjs';

// A rounded scoop with a softly ruffled, nearly flat base, like hand-scooped ice cream.
const SCOOP = 'M-70-2 C-76-8-70-19-70-24 C-69-59-38-84-4-85 C32-88 66-63 70-27 Q70-19 74-12 Q80-4 71 2 Q65 9 57 5 Q50 13 40 8 Q30 15 20 10 Q10 17 0 11 Q-10 17-21 10 Q-31 15-40 8 Q-51 12-58 5 Q-67 9-70-2Z';

function starPoints(cx, cy, r) {
  return Array.from({ length:10 }, (_, i) => {
    const a=i*Math.PI/5-Math.PI/2, k=i%2?r*.45:r;
    return (cx+Math.cos(a)*k).toFixed(1)+','+(cy+Math.sin(a)*k).toFixed(1);
  }).join(' ');
}

function scoopSurface(flavor, layer) {
  // Stable small crescent-shaped scoop marks: they stay still when toppings change.
  let marks='';
  for (let n=0; n<38; n++) {
    const x=((n*47+layer*13)%119)-59, y=-13-((n*23+layer*7)%62);
    const w=4+(n*7%12), h=1.3+(n%4)*.5;
    marks+=`<path d="M${x} ${y}q${w*.5} ${-h} ${w} -.7" stroke="${flavor.dark}" stroke-opacity=".15" stroke-width="1.5"/>
      <path d="M${x+.8} ${y-1.3}q${w*.5} ${-h} ${w-1} -.7" stroke="#fffdf5" stroke-opacity=".38" stroke-width="1.6"/>`;
  }
  return `<g fill="none" stroke-linecap="round">${marks}
    <path d="M-58-16q10-8 21-7m-8-19q15-9 28-6m23 22q16-10 31-5m-15-26q11-3 19 0m-64-13q12-5 22-3" stroke="${flavor.dark}" stroke-opacity=".12" stroke-width="3"/>
    <path d="M-59-19q10-8 21-7m-8-19q15-9 28-6m23 22q16-10 31-5m-15-26q11-3 19 0" stroke="#fffdf5" stroke-opacity=".28" stroke-width="2.5"/>
    <path d="M-60-4l4-8m10 13l4-10m11 14l3-10m12 12l2-9m13 11l-1-10m15 8l-3-9m15 6l-4-10m14 5l-5-9" stroke="${flavor.dark}" stroke-opacity=".2" stroke-width="2"/>
  </g>`;
}

export function renderIceCream(scoops, topping, animate=false) {
  const count=scoops.length;
  const step=83;
  let defs=`<linearGradient id="coneShade" x1="0" x2="1"><stop stop-color="#c38a45"/><stop offset=".38" stop-color="#f1cf8b"/><stop offset="1" stop-color="#bd803d"/></linearGradient>
    <pattern id="waffle" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M-11 0L22 33M0-11L33 22M-11 22L22-11M0 33L33 0" fill="none" stroke="#9c632c" stroke-opacity=".36" stroke-width="2.2"/><path d="M-10-1L23 32M1-12L34 21M-10 23L23-10M1 34L34 1" fill="none" stroke="#fff0bf" stroke-opacity=".55" stroke-width=".9"/></pattern>
    <filter id="scoopGrain" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".48" numOctaves="3" seed="8" result="grain"/><feColorMatrix in="grain" type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".22"/></feComponentTransfer><feComposite in2="SourceGraphic" operator="in"/><feBlend in="SourceGraphic" mode="soft-light"/></filter>`;
  let layers='';
  scoops.forEach((id, i) => {
    const flavor=FLAVORS.find(f=>f.id===id), y=229-i*step, scale=1-i*.025;
    defs+=`<radialGradient id="scoop${i}" cx="32%" cy="25%" r="78%"><stop stop-color="#fff9ea"/><stop offset=".3" stop-color="${flavor.color}"/><stop offset=".7" stop-color="${flavor.color}"/><stop offset="1" stop-color="${flavor.dark}"/></radialGradient>
      <radialGradient id="scoopLight${i}" cx="27%" cy="20%" r="65%"><stop stop-color="#fffdf6" stop-opacity=".36"/><stop offset=".75" stop-color="#fffdf6" stop-opacity="0"/></radialGradient>
      <clipPath id="scoopClip${i}"><path d="${SCOOP}"/></clipPath>`;
    layers+=`<g transform="translate(150 ${y}) scale(${scale})"><g class="${animate&&i===count-1?'new-scoop':''}">
      <ellipse cx="2" cy="7" rx="65" ry="10" fill="#70452e" opacity=".13"/>
      <path d="${SCOOP}" fill="url(#scoop${i})" stroke="${flavor.dark}" stroke-opacity=".32" stroke-width="1" filter="url(#scoopGrain)"/>
      <g clip-path="url(#scoopClip${i})"><path d="${SCOOP}" fill="url(#scoopLight${i})"/>${scoopSurface(flavor,i)}</g>
    </g></g>`;
  });
  const top=count?229-(count-1)*step-85*(1-(count-1)*.025):144;
  if (topping&&count) {
    if (topping==='star') layers+=`<g transform="rotate(12 165 ${top+4})"><polygon points="${starPoints(165,top+4,22)}" fill="#ffda65" stroke="#d7a03d" stroke-width="2"/><path d="M157 ${top}l7-10" stroke="#fff5bb" stroke-width="4" stroke-linecap="round"/></g>`;
    if (topping==='berry') layers+=`<g transform="translate(165 ${top+5}) rotate(14)"><path d="M-20 0C-21-24 22-24 21 0Q16 18 0 25Q-16 17-20 0" fill="#ed7590" stroke="#c64d69" stroke-width="2"/><path d="M0-15L-17-23L-10-9L3-14L16-10L22-25L7-19L3-29Z" fill="#70a977"/><g fill="#ffe6ab"><ellipse cx="-10" cy="0" rx="1.5" ry="2.5"/><ellipse cx="7" cy="-2" rx="1.5" ry="2.5"/><ellipse cx="0" cy="13" rx="1.5" ry="2.5"/></g></g>`;
    if (topping==='rainbow') {
      ['#ef91ac','#f1bc74','#eee0a3','#a6c99b','#8ac8de'].forEach((c,i) => {
        const r=28-i*5;
        layers+=`<path d="M${157-r} ${top+10}A${r} ${r} 0 0 1 ${157+r} ${top+10}" stroke="${c}" stroke-width="6" fill="none"/>`;
      });
      layers+=`<g fill="#fffdf5"><ellipse cx="128" cy="${top+10}" rx="12" ry="7"/><ellipse cx="187" cy="${top+10}" rx="12" ry="7"/></g>`;
    }
  }
  const empty=count?'':`<g transform="translate(150 229)"><path d="${SCOOP}" fill="#fffef7" fill-opacity=".6" stroke="#d6c3a7" stroke-dasharray="5 6" stroke-width="2"/><text x="0" y="-24" text-anchor="middle" font-size="30" fill="#c6b19a">＋</text></g>`;
  // Zoom out for three/four scoops so every scoop stays round and decorations fit.
  const viewTop=Math.min(0,Math.floor(top-34));
  return `<svg viewBox="0 ${viewTop} 300 ${340-viewTop}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${defs}</defs>
    <ellipse cx="150" cy="325" rx="64" ry="9" fill="#b99b69" opacity=".13"/>
    <path d="M94 229L150 324L206 229Z" fill="url(#coneShade)" stroke="#b5844f" stroke-width="2"/>
    <path d="M94 229L150 324L206 229Z" fill="url(#waffle)"/>
    <ellipse cx="150" cy="229" rx="56" ry="9" fill="#e9bd7b" stroke="#c6955c" stroke-width="2"/>
    ${empty}${layers}</svg>`;
}
