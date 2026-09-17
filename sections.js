'use strict';
document.querySelector('meta[name="theme-color"]')?.setAttribute('content','#101713');
const services=[
 ['Разговор, который ведёт к делу','Помогаем клиенту получить ответ, выбрать подходящий вариант и оставить заявку. Сложный вопрос передаётся сотруднику вместе с контекстом разговора.'],
 ['Характер бренда. Понятный путь.','От структуры и текстов до дизайна и разработки. Создаём сайт, на котором удобно разобраться в предложении и сделать следующий шаг — с телефона или компьютера.'],
 ['Новое качество существующего','Разбираем, где посетители теряются и что мешает пользоваться сайтом. Исправляем навигацию, мобильную версию, скорость и формы обращений.'],
 ['Процессы, связанные между собой','Связываем заявки, учёт клиентов, документы и уведомления. Определяем последовательность действий и точки, где решение должен принимать человек.']
];
document.querySelectorAll('[data-service]').forEach(button=>button.addEventListener('click',()=>{
 const n=Number(button.dataset.service);
 document.querySelectorAll('[data-service]').forEach(x=>x.setAttribute('aria-pressed',String(x===button)));
 document.querySelector('#service-title').textContent=services[n][0];document.querySelector('#service-copy').textContent=services[n][1];document.querySelector('#service-number').textContent=String(n+1).padStart(2,'0');
}));
const airships=[['zeppelin.png','Классический цеппелин'],['balloon.png','Ретро-аэростат'],['gold-airship.png','Золотой дирижабль'],['satellite.png','Спутник']];
document.querySelectorAll('[data-airship]').forEach(button=>button.addEventListener('click',()=>{
 const n=Number(button.dataset.airship);const img=document.querySelector('#airship');img.src='assets/'+airships[n][0];img.alt=airships[n][1];document.querySelector('#airship-caption').textContent=String(n+1).padStart(2,'0')+' — '+airships[n][1];document.querySelectorAll('[data-airship]').forEach(x=>x.setAttribute('aria-pressed',String(x===button)));
}));
document.querySelectorAll('[data-case]').forEach(button=>button.addEventListener('click',()=>{
 const catalog=button.dataset.case==='1';const img=document.querySelector('#case-image');img.src='assets/neodrain-'+(catalog?'catalog':'home')+'.webp';img.alt=catalog?'Каталог NeoDrain':'Главная страница NeoDrain';document.querySelector('#case-caption').textContent=catalog?'От типа продукции — к подбору и расчёту.':'От знакомства с компанией — к выбору продукции.';document.querySelectorAll('[data-case]').forEach(x=>x.setAttribute('aria-pressed',String(x===button)));
}));
if(document.querySelector('#brief-form')){
const form=document.querySelector('#brief-form');const steps=[...document.querySelectorAll('[data-step]')];let step=0;let briefText='';
const titles=['Чем занимается<br><em>ваша компания?</em>','Откуда приходят<br><em>ваши клиенты?</em>','Что приходится<br><em>делать вручную?</em>','Какие инструменты<br><em>уже работают?</em>','Какой результат<br><em>вы хотите получить?</em>','Как к вам<br><em>обращаться?</em>'];
function showStep(){steps.forEach((field,i)=>{field.hidden=i!==step;field.disabled=i!==step;});document.querySelector('#contact-title').innerHTML=titles[step];document.querySelector('#step-count').textContent='Вопрос '+(step+1)+' из 6';document.querySelector('#brief-back').hidden=step===0;document.querySelector('#brief-next').textContent=step===5?'Собрать бриф ↗':'Продолжить ↗';document.querySelector('#brief-error').textContent='';document.querySelector('#contact-title').focus({preventScroll:true});}
document.querySelector('#brief-back').addEventListener('click',()=>{step=Math.max(0,step-1);showStep();});
form.addEventListener('input',()=>{document.querySelector('#brief-error').textContent='';});
form.addEventListener('submit',event=>{
 event.preventDefault();const invalid=[...steps[step].querySelectorAll('input,textarea')].find(input=>input.required&&!input.value.trim());
 if(invalid){document.querySelector('#brief-error').textContent='Пожалуйста, заполните это поле.';invalid.focus({preventScroll:true});return;}
 if(step===1&&!steps[1].querySelector('input:checked')){document.querySelector('#brief-error').textContent='Выберите хотя бы один канал.';return;}
 if(step<5){step++;showStep();return;}
 steps.forEach(field=>{field.disabled=false;});const data=new FormData(form);const rows=[['Компания и продукт',data.get('business')],['Каналы обращений',data.getAll('channels').join(', ')],['Ручная работа',data.get('manual')],['Текущие инструменты',data.get('systems')],['Желаемый результат',data.get('goal')],['Имя',data.get('person')],['Компания',data.get('company')],['Контакт',data.get('contact')]];
 briefText='GIFS — БРИФ ПРОЕКТА\n\n'+rows.filter(([,value])=>value).map(([label,value])=>label+'\n'+value).join('\n\n');form.hidden=true;document.querySelector('#brief-result').hidden=false;document.querySelector('#contact-title').innerHTML='Ваш бриф<br><em>готов.</em>';document.querySelector('#step-count').textContent='Бриф составлен';document.querySelector('#contact-title').focus({preventScroll:true});
});
document.querySelector('#brief-edit').addEventListener('click',()=>{form.hidden=false;document.querySelector('#brief-result').hidden=true;step=0;showStep();});
document.querySelector('#brief-download').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob(['\uFEFF',briefText],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='GIFS-бриф.txt';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);document.querySelector('#download-status').textContent='Бриф подготовлен к скачиванию.';});

}
