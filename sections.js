'use strict';
document.querySelector('meta[name="theme-color"]')?.setAttribute('content','#101713');

const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
const canAnimate=()=>!reduceMotion.matches&&typeof Element!=='undefined'&&Element.prototype.animate;
const animateElement=(el,keyframes,options)=>{
 if(!el||!canAnimate())return Promise.resolve();
 try{return el.animate(keyframes,options).finished.catch(()=>{});}catch{return Promise.resolve();}
};

const services=[
 ['Разговор, который ведёт к делу','Помогаем клиенту получить ответ, выбрать подходящий вариант и оставить заявку. Сложный вопрос передаётся сотруднику вместе с контекстом разговора.'],
 ['Характер бренда. Понятный путь.','От структуры и текстов до дизайна и разработки. Создаём сайт, на котором удобно разобраться в предложении и сделать следующий шаг — с телефона или компьютера.'],
 ['Новое качество существующего','Разбираем, где посетители теряются и что мешает пользоваться сайтом. Исправляем навигацию, мобильную версию, скорость и формы обращений.'],
 ['Процессы, связанные между собой','Связываем заявки, учёт клиентов, документы и уведомления. Определяем последовательность действий и точки, где решение должен принимать человек.']
];
let serviceBusy=false;
document.querySelectorAll('[data-service]').forEach(button=>button.addEventListener('click',async()=>{
 if(serviceBusy||button.getAttribute('aria-pressed')==='true')return;
 serviceBusy=true;
 const n=Number(button.dataset.service);const panel=document.querySelector('.service-body>div');
 await animateElement(panel,[{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(8px)'}],{duration:150,easing:'ease-out',fill:'forwards'});
 document.querySelectorAll('[data-service]').forEach(x=>x.setAttribute('aria-pressed',String(x===button)));
 document.querySelector('#service-title').textContent=services[n][0];document.querySelector('#service-copy').textContent=services[n][1];document.querySelector('#service-number').textContent=String(n+1).padStart(2,'0');
 await animateElement(panel,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:430,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'});
 serviceBusy=false;
}));

const airships=[['zeppelin.png','Классический цеппелин'],['balloon.png','Ретро-аэростат'],['gold-airship.png','Золотой дирижабль'],['satellite.png','Спутник']];
document.querySelectorAll('[data-airship]').forEach(button=>button.addEventListener('click',async()=>{
 const n=Number(button.dataset.airship);const img=document.querySelector('#airship');if(!img)return;
 await animateElement(img,[{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(8px) scale(.985)'}],{duration:170,easing:'ease-out',fill:'forwards'});
 img.src='assets/'+airships[n][0];img.alt=airships[n][1];try{await img.decode();}catch{}
 document.querySelector('#airship-caption').textContent=String(n+1).padStart(2,'0')+' — '+airships[n][1];document.querySelectorAll('[data-airship]').forEach(x=>x.setAttribute('aria-pressed',String(x===button)));
 await animateElement(img,[{opacity:0,transform:'translateY(10px) scale(.985)'},{opacity:1,transform:'translateY(0) scale(1)'}],{duration:500,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'});
}));

document.querySelectorAll('[data-case]').forEach(button=>button.addEventListener('click',async()=>{
 if(button.getAttribute('aria-pressed')==='true')return;
 const catalog=button.dataset.case==='1';const img=document.querySelector('#case-image');
 await animateElement(img,[{opacity:1,transform:'translateX(0) scale(1)'},{opacity:0,transform:'translateX(-10px) scale(.99)'}],{duration:180,easing:'ease-out',fill:'forwards'});
 img.src='assets/neodrain-'+(catalog?'catalog':'home')+'.webp';img.alt=catalog?'Каталог NeoDrain':'Главная страница NeoDrain';try{await img.decode();}catch{}
 document.querySelector('#case-caption').textContent=catalog?'От типа продукции — к подбору и расчёту.':'От знакомства с компанией — к выбору продукции.';document.querySelectorAll('[data-case]').forEach(x=>x.setAttribute('aria-pressed',String(x===button)));
 await animateElement(img,[{opacity:0,transform:'translateX(12px) scale(.99)'},{opacity:1,transform:'translateX(0) scale(1)'}],{duration:520,easing:'cubic-bezier(.16,1,.3,1)',fill:'forwards'});
}));

if(document.querySelector('#brief-form')){
 const form=document.querySelector('#brief-form');const steps=[...document.querySelectorAll('[data-step]')];let step=0;let briefText='';
 const titles=['Чем занимается<br><em>ваша компания?</em>','Откуда приходят<br><em>ваши клиенты?</em>','Что приходится<br><em>делать вручную?</em>','Какие инструменты<br><em>уже работают?</em>','Какой результат<br><em>вы хотите получить?</em>','Как к вам<br><em>обращаться?</em>'];
 function showStep(){
  steps.forEach((field,i)=>{field.hidden=i!==step;field.disabled=i!==step;});
  const title=document.querySelector('#contact-title');title.innerHTML=titles[step];
  document.querySelector('#step-count').textContent='Вопрос '+(step+1)+' из 6';document.querySelector('#brief-back').hidden=step===0;document.querySelector('#brief-next').textContent=step===5?'Собрать бриф ↗':'Продолжить ↗';document.querySelector('#brief-error').textContent='';title.focus({preventScroll:true});
  const active=steps[step];
  animateElement(active,[{opacity:0,transform:'translateX(12px)'},{opacity:1,transform:'translateX(0)'}],{duration:420,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
  animateElement(title,[{opacity:.3,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:360,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
 }
 document.querySelector('#brief-back').addEventListener('click',()=>{step=Math.max(0,step-1);showStep();});
 form.addEventListener('input',()=>{document.querySelector('#brief-error').textContent='';});
 form.addEventListener('submit',event=>{
  event.preventDefault();const invalid=[...steps[step].querySelectorAll('input,textarea')].find(input=>input.required&&!input.value.trim());
  if(invalid){document.querySelector('#brief-error').textContent='Пожалуйста, заполните это поле.';invalid.focus({preventScroll:true});return;}
  if(step===1&&!steps[1].querySelector('input:checked')){document.querySelector('#brief-error').textContent='Выберите хотя бы один канал.';return;}
  if(step<5){step++;showStep();return;}
  steps.forEach(field=>{field.disabled=false;});const data=new FormData(form);const rows=[['Компания и продукт',data.get('business')],['Каналы обращений',data.getAll('channels').join(', ')],['Ручная работа',data.get('manual')],['Текущие инструменты',data.get('systems')],['Желаемый результат',data.get('goal')],['Имя',data.get('person')],['Компания',data.get('company')],['Контакт',data.get('contact')]];
  briefText='GIFS — БРИФ ПРОЕКТА\n\n'+rows.filter(([,value])=>value).map(([label,value])=>label+'\n'+value).join('\n\n');form.hidden=true;const result=document.querySelector('#brief-result');result.hidden=false;const title=document.querySelector('#contact-title');title.innerHTML='Ваш бриф<br><em>готов.</em>';document.querySelector('#step-count').textContent='Бриф составлен';title.focus({preventScroll:true});
  animateElement(result,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'translateY(0)'}],{duration:520,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
 });
 document.querySelector('#brief-edit').addEventListener('click',()=>{form.hidden=false;document.querySelector('#brief-result').hidden=true;step=0;showStep();});
 document.querySelector('#brief-download').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob(['\uFEFF',briefText],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='GIFS-бриф.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);document.querySelector('#download-status').textContent='Бриф подготовлен к скачиванию.';});
}
