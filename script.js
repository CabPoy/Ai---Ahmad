// کمک‌کارهای عمومی
const $ = (sel, parent=document) => parent.querySelector(sel);
const $$ = (sel, parent=document) => [...parent.querySelectorAll(sel)];

const state = {
  mode: null,
  emotion: null,
  history: []
};

// شروع تجربه
function startAIZahirExperience(){
  $('#welcome-screen')?.classList.remove('active');
  setTimeout(()=>{
    $('#welcome-screen').style.display='none';
    $('#main-experience').classList.add('active');
  }, 350);
}

document.addEventListener('DOMContentLoaded', () => {
  // دکمه شروع
  $('#start-btn').addEventListener('click', startAIZahirExperience);

  // انتخاب فصل
  $$('.story-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.story-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.mode = btn.dataset.mode;
      $('#story-title').textContent = btn.textContent.trim();
    });
  });

  // احساس
  $$('.emotion').forEach(em => {
    em.addEventListener('click', () => {
      $$('.emotion').forEach(e => e.classList.remove('active'));
      em.classList.add('active');
      state.emotion = em.dataset.emotion;
      flashAssistant(`حس انتخاب‌شده: ${emotionLabel(state.emotion)}`);
    });
  });

  // کنترل‌ها
  $('#new-story-btn').addEventListener('click', generateNewStory);
  $('#poem-btn').addEventListener('click', generatePoem);
  $('#analyze-btn').addEventListener('click', analyzeMusic);
  $('#ask-btn').addEventListener('click', askAIQuestion);

  // انیمیشن ساده ویژوالایزر
  startVisualizer();

  // پیام‌های دوره‌ای دستیار
  cycleAssistantMessages();
});

function emotionLabel(key){
  return key === 'melancholy' ? 'غم‌انگیز' : key === 'romantic' ? 'عاشقانه' : key === 'nostalgic' ? 'نوستالژیک' : 'عادی';
}

function withLoading(fn){
  return async (...args) => {
    $('#loading-state').style.display='flex';
    $('#response-content').innerHTML = '';
    try { await fn(...args); }
    finally { $('#loading-state').style.display='none'; }
  }
}

// مولد متن‌های نمونه (بدون اتصال به API)
const tones = {
  melancholy: ['اندوه نرم شب','مه کم‌سو','دلشوره باران','سایهٔ دلتنگی'],
  romantic: ['شیرینی دیدار','شعلهٔ بوسه','شادی یار','آغوش سحر'],
  nostalgic: ['کوچهٔ قدیم','بوی نان تنور','تهیه‌خانهٔ کابل','خاک خاطره']
};

const seeds = {
  childhood: ['کابلِ صبحگاهان','حیاط مدرسه','اکورديون کوچک','لبخند مادر'],
  youth: ['نوار کاست','مجلس یاران','تمرینِ بی‌پایان','آوازِ بی‌پروا'],
  fame: ['تالار پرنور','افسونِ صدا','نامه‌های عاشقانه','شهر زمزمه'],
  legacy: ['نسل‌های دور','گرامافون زمان','یادِ همیشگی','چراغِ راه']
};

function pick(arr){ return arr[Math.floor(Math.random()*arr.length)] }

const writeBlock = (title, html) => {
  const block = document.createElement('div');
  block.className = 'block';
  if(title){ const h = document.createElement('h4'); h.textContent = title; block.appendChild(h); }
  const div = document.createElement('div');
  div.innerHTML = html;
  block.appendChild(div);
  $('#response-content').appendChild(block);
  return block;
};

const typeInto = async (el, text, delay=12) => {
  el.innerHTML = '';
  for(const ch of text){
    el.innerHTML += ch === '
' ? '<br>' : ch;
    await new Promise(r=>setTimeout(r, delay));
  }
};

// قصه جدید
const generateNewStory = withLoading(async () => {
  const mode = state.mode || 'legacy';
  const emot = state.emotion || 'nostalgic';
  const t = pick(tones[emot]);
  const s1 = pick(seeds[mode]), s2 = pick(seeds[mode]);

  const prose = `در ${s1}، صدایی قد کشید که به ${t} می‌مانست؛
آشنای دوری که هر چه می‌خوانْد، دیوارهای خاموش شهر نرم می‌شد.
احمد، با ${s2} و دلِ بی‌تاب،
در پی هر نت، پنجره‌ای تازه به روی آفتاب گشود.`;

  const block = writeBlock('قصهٔ تازه', '<p></p>');
  const p = block.querySelector('p');
  await typeInto(p, prose, 10);

  addHistory('قصه', prose);
});

// شعر تازه
const generatePoem = withLoading(async () => {
  const emot = state.emotion || 'romantic';
  const t1 = pick(tones[emot]), t2 = pick(tones[emot]);
  const ghazal = [
    `ای بادِ ترانه، خبر از او بیار — از ${t1} گذر کن و به کوچه‌ام ببار`,
    `در چلچراغِ صداش، جانم گرفت — نامش که رسید، شکست اختیار`,
    `هر مصرعِ او، چراغِ محفل است — از لرزشِ نت تا لبِ چنگ و سه‌تار`,
    `گر رفت زِ ما، نرفت زِ دل — او مانده به آوازِ مردم، ماندگار`
  ].join('\n');

  const block = writeBlock('غزل کوتاه', '<pre dir="rtl"></pre>');
  await typeInto(block.querySelector('pre'), ghazal, 8);

  addHistory('شعر', ghazal);
});

// تحلیل آهنگ (نمونهٔ آفلاین)
const analyzeMusic = withLoading(async () => {
  const songs = [
    {title:'زخمی زِ هجران', mood:'melancholy', notes:'مدِ هارمونیک مینور، تکیه بر درجهٔ دوم'},
    {title:'صدای سبز', mood:'romantic', notes:'مدوراسیون نرم به سُل ماژور، خط ملودی صعودی'},
    {title:'یاد کابل', mood:'nostalgic', notes:'دوریان آمیخته با فواصل محلی، کوبه‌های نرم'}
  ];
  const pickSong = pick(songs);
  const emot = emotionLabel(pickSong.mood);

  const html = `
  <p><strong>آهنگ:</strong> ${pickSong.title}</p>
  <p><strong>حال‌وهوا:</strong> ${emot}</p>
  <p><strong>نکات موسیقایی:</strong> ${pickSong.notes}</p>
  <p>پیام ضمنی قطعه، گفت‌وگوی صدا با خاطره است؛ جایی که ریتمْ قدم‌های رهگذران کابل را به یاد می‌آورد.</p>`;

  writeBlock('تحلیل کوتاه', html);
  addHistory('تحلیل', `${pickSong.title} — ${pickSong.notes}`);
});

// پرسش از هوش مصنوعی (بدون API، پاسخ الگویی)
const askAIQuestion = withLoading(async () => {
  const q = $('#user-question').value.trim();
  if(!q){ writeBlock('راهنما', '<p>لطفاً پرسش خود را بنویسید.</p>'); return; }
  const answer = `پرسش شما: «${q}»\n
پاسخ: میراث احمد ظاهر در سه ساحت شنیداری شکل می‌گیرد: رنگ‌آمیزی ملودیکِ شرقی، آراستگی واژه‌ها، و پیوند با زیست‌جهانِ کابل.
برای بررسی عینی، به سازبندی، گسترهٔ صوتی و روایتِ ترانه دقت کنید.`;
  const block = writeBlock('پاسخ هوش مصنوعی', '<pre dir="rtl"></pre>');
  await typeInto(block.querySelector('pre'), answer, 7);
  addHistory('پرسش‌وپاسخ', answer);
});

function addHistory(kind, text){
  const item = document.createElement('div');
  item.className = 'history-item';
  const snippet = text.slice(0, 90).replace(/\n/g,' ') + (text.length>90?'…':'');
  const time = new Date().toLocaleTimeString('fa-IR', {hour:'2-digit', minute:'2-digit'});
  item.innerHTML = `<small>${kind} — ${time}</small><div>${snippet}</div>`;
  $('#story-history').prepend(item);
}

// دستیار شناور
function flashAssistant(msg){
  $('#assistant-text').textContent = msg;
  const holder = $('#floating-assistant');
  holder.style.transform = 'translateY(-6px)';
  setTimeout(()=> holder.style.transform = 'translateY(0)', 220);
}
function cycleAssistantMessages(){
  const msgs = [
    'برای آغاز، یک فصل از زندگی را برگزینید.',
    'حس دلخواه را انتخاب کنید تا زبان متن تغییر کند.',
    'می‌توانید پرسش‌های خود را در کادر کناری بنویسید.'
  ];
  let i=0;
  setInterval(()=>{
    flashAssistant(msgs[i%msgs.length]);
    i++;
  }, 8000);
}

// ویژوالایزر ساده
function startVisualizer(){
  const bars = $$('.visualizer-bar');
  setInterval(()=>{
    bars.forEach((b, idx)=>{
      b.style.height = 10 + Math.floor(Math.random()*42) + 'px';
    });
  }, 180);
}
