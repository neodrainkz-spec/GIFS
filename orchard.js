'use strict';
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const motionButton=document.querySelector('#motion-toggle');
 const soundButton=document.querySelector('#sound-toggle');
 const overlay=document.querySelector('.page-transition');
 const status=document.querySelector('#garden-status');
 let busy=false, paused=false, sound=false, audio=null;
 let activeAnimations=[];
 const syncMotion=()=>{document.body.classList.toggle('motion-paused',paused||reduced.matches);motionButton.textContent=paused||reduced.matches?'Включить движение':'Остановить движение';motionButton.setAttribute('aria-pressed',String(paused||reduced.matches));};
 motionButton.addEventListener('click',()=>{paused=!paused;syncMotion();});
 reduced.addEventListener('change',syncMotion);syncMotion();
 soundButton.addEventListener('click',()=>{sound=!sound;soundButton.textContent=sound?'Звук: вкл.':'Звук: выкл.';soundButton.setAttribute('aria-pressed',String(sound));if(sound){try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});}catch{sound=false;soundButton.textContent='Звук недоступен';soundButton.setAttribute('aria-pressed','false');}}});
 function note(frequency,duration,volume,offset=0){if(!sound||!audio)return;try{const t=audio.currentTime+offset;const oscillator=audio.createOscillator();const gain=audio.createGain();oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,t);gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(volume,t+.02);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);oscillator.connect(gain).connect(audio.destination);oscillator.start(t);oscillator.stop(t+duration+.03);}catch{}}
 function reset(){busy=false;for(const animation of activeAnimations)animation.cancel();activeAnimations=[];document.querySelectorAll('.falling-apple,.landing-ring,.landing-spark').forEach(el=>el.remove());document.querySelectorAll('.apple').forEach(el=>{el.classList.remove('picking');el.removeAttribute('aria-disabled');});overlay.classList.remove('active');overlay.style.clipPath='';document.body.removeAttribute('aria-busy');status.textContent='';}
 window.addEventListener('pageshow',reset);
 document.addEventListener('visibilitychange',()=>document.body.classList.toggle('document-hidden',document.hidden));
 function animate(element,keyframes,options){const a=element.animate(keyframes,options);activeAnimations.push(a);return a.finished;}
 document.querySelectorAll('.apple').forEach(link=>link.addEventListener('click',async event=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();if(busy)return;
  const destination=link.href;
  if(reduced.matches||paused||!Element.prototype.animate){location.assign(destination);return;}
  busy=true;document.body.setAttribute('aria-busy','true');document.querySelectorAll('.apple').forEach(el=>el.setAttribute('aria-disabled','true'));status.textContent='Открываем: '+link.dataset.name;
  const img=link.querySelector('img');const rect=img.getBoundingClientRect();const treeBox=document.querySelector('.orchard').getBoundingClientRect();
  const landingY=Math.min(innerHeight-74,treeBox.bottom+18)-rect.height;
  const drop=Math.max(70,landingY-rect.top);
  const drift=link.classList.contains('apple-case')?-20:20;
  const clone=document.createElement('img');clone.src=img.src;clone.alt='';clone.className='falling-apple';Object.assign(clone.style,{left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px'});document.body.append(clone);link.classList.add('picking');
  note(330,.1,.035);
  try{
   await animate(clone,[
    {transform:'translate(0,0) rotate(0deg) scale(1)'},
    {transform:'translate(0,-7px) rotate(-5deg) scale(1.045)',offset:.72},
    {transform:'translate(1px,-6px) rotate(-7deg) scale(1.045)'}
   ],{duration:380,easing:'cubic-bezier(.19,1,.22,1)',fill:'forwards'});

   await animate(clone,[
    {transform:'translate(1px,-6px) rotate(-7deg) scale(1.045)'},
    {transform:`translate(${drift*.24}px,${drop*.24}px) rotate(-1deg) scale(1.035)`,offset:.38},
    {transform:`translate(${drift}px,${drop}px) rotate(17deg) scale(1)`}
   ],{duration:880,easing:'cubic-bezier(.24,.48,.2,1)',fill:'forwards'});

   note(105,.22,.06);note(440,.42,.018,.1);note(660,.48,.014,.18);
   const cx=rect.left+rect.width/2+drift;const cy=rect.top+drop+rect.height;
   const ring=document.createElement('span');ring.className='landing-ring';Object.assign(ring.style,{left:(cx-35)+'px',top:(cy-8)+'px',width:'70px',height:'16px'});document.body.append(ring);
   animate(ring,[{transform:'scale(.45)',opacity:.55},{transform:'scale(2.65)',opacity:0}],{duration:820,easing:'cubic-bezier(.19,1,.22,1)',fill:'forwards'}).catch(()=>{});

   for(let i=0;i<5;i++){
    const spark=document.createElement('span');spark.className='landing-spark';spark.style.left=cx+'px';spark.style.top=cy+'px';document.body.append(spark);
    const angle=(Math.PI*2*i/5)-Math.PI/2;
    animate(spark,[
      {transform:'translate(0,0) scale(.85)',opacity:.55},
      {transform:`translate(${Math.cos(angle)*34}px,${Math.sin(angle)*18}px) scale(0)`,opacity:0}
    ],{duration:760,easing:'cubic-bezier(.19,1,.22,1)',fill:'forwards'}).catch(()=>{});
   }

   await animate(clone,[
    {transform:`translate(${drift}px,${drop}px) rotate(17deg) scale(1,1)`},
    {transform:`translate(${drift+2}px,${drop+2}px) rotate(19deg) scale(1.08,.9)`,offset:.18},
    {transform:`translate(${drift+7}px,${drop-23}px) rotate(27deg) scale(.99,1.025)`,offset:.56},
    {transform:`translate(${drift+11}px,${drop}px) rotate(34deg) scale(1,1)`}
   ],{duration:720,easing:'cubic-bezier(.22,.72,.18,1)',fill:'forwards'});

   overlay.style.setProperty('--cx',cx+'px');overlay.style.setProperty('--cy',cy+'px');overlay.querySelector('.transition-name').textContent=link.dataset.name;overlay.classList.add('active');
   await animate(overlay,[
    {clipPath:`circle(0px at ${cx}px ${cy}px)`},
    {clipPath:`circle(${Math.hypot(innerWidth,innerHeight)}px at ${cx}px ${cy}px)`}
   ],{duration:980,easing:'cubic-bezier(.19,1,.22,1)',fill:'forwards'});
   location.assign(destination);
  }catch{location.assign(destination);}
 }));
})();
