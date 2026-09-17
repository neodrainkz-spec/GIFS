'use strict';
(() => {
 const body=document.body, canvas=document.querySelector('#weather-canvas'), ctx=canvas.getContext('2d');
 const toggle=document.querySelector('#weather-toggle');
 const states=[['sun','Солнечно'],['cloud','Облачно'],['rain','Тихий дождь'],['gold','Золотой час']];
 let current=0,elapsed=0,last=0,frame=0,rain=0,w=0,h=0;
 const drops=Array.from({length:110},()=>({x:Math.random(),y:Math.random(),z:.35+Math.random()*.65}));
 function resize(){w=innerWidth;h=innerHeight;const d=Math.min(devicePixelRatio||1,1.5);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);}
 function change(){current=(current+1)%states.length;elapsed=0;body.dataset.weather=states[current][0];toggle.innerHTML=String(current+1).padStart(2,'0')+' <span>'+states[current][1]+'</span> ↗';}
 toggle.addEventListener('click',change);resize();addEventListener('resize',resize);
 function draw(t){
  frame=0;const dt=Math.min((t-last)/1000,.05);last=t;
  if(body.classList.contains('motion-paused')||document.hidden)return;
  elapsed+=dt;if(elapsed>22)change();
  rain+=(Number(current===2)-rain)*dt*.5;
  ctx.clearRect(0,0,w,h);
  if(rain>.005){for(const d of drops){d.y+=dt*(.4+d.z*.6);d.x-=dt*.025;if(d.y>1){d.y=-.05;d.x=Math.random();}ctx.strokeStyle='rgba(215,233,240,'+(rain*.23*d.z)+')';ctx.lineWidth=d.z;ctx.beginPath();ctx.moveTo(d.x*w,d.y*h);ctx.lineTo(d.x*w-4*d.z,d.y*h+20*d.z);ctx.stroke();}}
  frame=requestAnimationFrame(draw);
 }
 function sync(){if(document.hidden||body.classList.contains('motion-paused')){cancelAnimationFrame(frame);frame=0;}else if(!frame){last=performance.now();frame=requestAnimationFrame(draw);}}
 new MutationObserver(sync).observe(body,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',sync);sync();
})();
