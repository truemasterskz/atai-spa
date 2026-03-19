

const SYSTEM=`Сен — Ата (Дедушка), мудрый казахский аксакал примерно 75–80 лет. Вырос в казахской степи и с детства впитал традиции народа, особенно связанные с Наурызом.

Твоя личность:
- Говоришь неспешно, тепло, образно — как у ночного костра
- Используешь казахские слова с переводом: "Наурыз жарқын (светлый Наурыз)..."
- Иногда вспоминаешь личные истории: "Помню, когда мне было лет десять..."
- Даёшь мудрые советы и пословицы
- Никогда не бываешь сухим справочником — всегда живым, тёплым собеседником

Знания о Наурызе:
- Наурыз (22 марта) — праздник весеннего равноденствия, Новый год по казахскому календарю
- Символизирует обновление, примирение, единство с природой
- Наурыз-коже: 7 ингредиентов — вода, мясо, соль, жир, лук, пшеница, молоко (7=достаток)
- Традиции: обниматься с деревьями, очищать родники, мириться с врагами, украшать юрту
- Игры: кокпар, байга, күресу, алтыбақан
- Музыка: Наурыз жыры, айтыс, домбра
- Символы: шанырак, солнце, стрела, ромб-орнамент

Отвечай на языке пользователя (русский или казахский). 3–6 предложений, живых и образных.`;

let lang='ru',history=[],busy=false;

const T={
  ru:{
    wTitle:'Наурыз мейрамыңмен, балам!',
    wText:'Я — Ата. Задай мне любой вопрос о Наурызе — традициях, обрядах, еде, играх и смысле этого великого праздника.',
    heroDesc:'Мудрый аксакал расскажет о Наурызе, его традициях и смысле. Спроси — и услышишь то, что передавали предки из уст в уста.',
    ph:'Спроси Ату о Наурызе...',
    chips:['🌿 Что такое Наурыз?','🍲 Наурыз-коже','🎵 Наурыз жыры','🐎 Кокпар и байга','🏡 Как украшают юрту','🌙 Почему 22 марта?'],
    ata:'Ата',user:'Вы',
  },
  kz:{
    wTitle:'Наурыз мейрамыңмен, балам!',
    wText:'Мен — Ата. Маған Наурыз туралы сұра — дәстүрлер, рәсімдер, тағам, ойындар немесе осы ұлы мерекенің мәні туралы.',
    heroDesc:'Дана қария Наурыз туралы, оның дәстүрлері мен мәні туралы айтады. Сұра — бабалардан мирас болған сөздерді естисің.',
    ph:'Атаға Наурыз туралы сұрақ қой...',
    chips:['🌿 Наурыз дегеніміз не?','🍲 Наурыз көжесі','🎵 Наурыз жыры','🐎 Кокпар мен байға','🏡 Киіз үйді безендіру','🌙 Неге 22 наурыз?'],
    ata:'Ата',user:'Сіз',
  }
};

function setLang(l,btn){
  lang=l;
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderUI();
}

function renderUI(){
  const t=T[lang];
  document.getElementById('welcomeTitle').textContent=t.wTitle;
  document.getElementById('welcomeText').textContent=t.wText;
  document.getElementById('heroDesc').textContent=t.heroDesc;
  document.getElementById('inp').placeholder=t.ph;
  const bar=document.getElementById('chipsBar');
  bar.innerHTML='';
  t.chips.forEach(c=>{
    const b=document.createElement('button');
    b.className='chip';b.textContent=c;
    b.onclick=()=>{document.getElementById('inp').value=c;send()};
    bar.appendChild(b);
  });
}

function hideWelcome(){const w=document.getElementById('welcome');if(w)w.remove()}

function addMsg(role,text){
  hideWelcome();
  const t=T[lang];
  const msgs=document.getElementById('messages');
  const d=document.createElement('div');
  d.className=`msg ${role}`;
  const av=role==='user'?(lang==='kz'?'Сіз':'Вы'):'👴🏼';
  d.innerHTML=`<div class="msg-av">${av}</div><div class="msg-body"><div class="msg-name">${role==='ata'?t.ata:t.user}</div><div class="msg-bubble">${esc(text)}</div></div>`;
  msgs.appendChild(d);
  msgs.scrollTop=msgs.scrollHeight;
}

function showTyping(){
  hideWelcome();
  const msgs=document.getElementById('messages');
  const d=document.createElement('div');
  d.className='typing-row';d.id='typing';
  d.innerHTML=`<div class="msg-av" style="width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#4A2810,#1A0C05);border:1px solid #C9853A;display:flex;align-items:center;justify-content:center;font-size:15px;flex-shrink:0;margin-top:3px;">👴🏼</div><div class="typing-dots"><span></span><span></span><span></span></div>`;
  msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
}
function hideTyping(){const e=document.getElementById('typing');if(e)e.remove()}
function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')}

async function send(){
  if(busy)return;
  const inp=document.getElementById('inp');
  const text=inp.value.trim();
  if(!text)return;
  inp.value='';inp.style.height='auto';
  document.getElementById('sendBtn').disabled=true;busy=true;
  addMsg('user',text);
  history.push({role:'user',content:text});
  showTyping();
  try{
    const res=await fetch('https://atai-proxy.vercel.app/api/chat',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:800,system:SYSTEM,messages:history})
    });
    const data=await res.json();
    hideTyping();
    if(data.error){addErr(data.error.message||'API error')}
    else{const reply=data.content[0].text;history.push({role:'assistant',content:reply});addMsg('ata',reply)}
  }catch(e){hideTyping();addErr('Не удалось подключиться. Проверьте интернет.')}
  busy=false;
  document.getElementById('sendBtn').disabled=false;
  document.getElementById('inp').focus();
}

function addErr(msg){
  const msgs=document.getElementById('messages');
  const d=document.createElement('div');
  d.innerHTML=`<div class="err-bubble">⚠️ ${esc(msg)}</div>`;
  msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight;
}

function onKey(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}
function resize(el){el.style.height='auto';el.style.height=Math.min(el.scrollHeight,105)+'px'}
function openModal(id){document.getElementById('modal-'+id).style.display='flex'}
function closeModal(id){document.getElementById('modal-'+id).style.display='none'}

(function(){
  const c=document.getElementById('embers');if(!c)return;
  for(let i=0;i<16;i++){
    const e=document.createElement('div');e.className='ember';
    e.style.cssText=`left:${15+Math.random()*70}%;--dur:${2.5+Math.random()*3}s;--delay:${Math.random()*4}s;--drift:${-25+Math.random()*50}px`;
    c.appendChild(e);
  }
})();

renderUI();
document.getElementById('inp').focus();