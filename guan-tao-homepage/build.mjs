import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(fs.readFileSync(path.join(root, 'content.json'), 'utf8'));
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const t = (lang, zh, en) => lang === 'zh' ? zh : en;
const files = {home:'index.html', publications:'publications.html'};
const icon = name => {
  const paths = {
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
    github:'<path d="M9 19c-4 1-4-2-6-2m12 5v-4a3.5 3.5 0 0 0-1-2.7c3.3-.4 6.8-1.6 6.8-7.3a5.7 5.7 0 0 0-1.5-4 5.3 5.3 0 0 0-.1-4S18 0 15 2a13.4 13.4 0 0 0-6 0C6 0 4.8 0 4.8 0a5.3 5.3 0 0 0-.1 4 5.7 5.7 0 0 0-1.5 4c0 5.7 3.5 6.9 6.8 7.3A3.5 3.5 0 0 0 9 18v4"/>'
  };
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+paths[name]+'</svg>';
};

function sidebar(lang, page) {
  const prefix = lang === 'en' ? '../' : '';
  const nav = {home:t(lang,'个人简介','About'),publications:t(lang,'论文发表','Publications')};
  return '<header class="profile-sidebar"><a class="avatar" href="index.html"><img src="'+prefix+'assets/tao-guan.jpg" alt="关涛 / Tao Guan" width="227" height="227" fetchpriority="high"></a>'+
    '<h1 class="profile-name"><span class="profile-name-en">Tao Guan</span><span class="profile-name-divider"> · </span><span class="profile-name-zh" lang="zh-CN">关涛</span></h1>'+
    '<p class="profile-position">'+t(lang,'博士研究生 · 四川大学','Ph.D. Student @ Sichuan University')+'</p>'+
    '<p class="profile-education">'+t(lang,'硕士 · 四川大学<br>学士 · 东北大学','M.E. @ Sichuan University<br>B.E. @ Northeastern University')+'</p>'+
    '<p class="profile-tagline">'+t(lang,'智能决策 · 约束控制','Decision-making · Constrained Control')+'</p>'+
    '<div class="profile-contact"><a class="profile-email" href="mailto:'+esc(data.email)+'">'+icon('mail')+esc(data.email)+'</a>'+
    '<div class="social-icons"><a href="https://github.com/'+esc(data.github)+'" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub">'+icon('github')+'</a><a href="mailto:'+esc(data.email)+'" aria-label="'+t(lang,'发送邮件','Email')+'" title="'+t(lang,'发送邮件','Email')+'">'+icon('mail')+'</a></div></div>'+
    '<nav class="detail-nav" aria-label="'+t(lang,'主导航','Main navigation')+'">'+Object.entries(files).map(([key,file])=>'<a href="'+file+'"'+(key===page?' aria-current="page"':'')+'>'+nav[key]+'</a>').join('')+
    '<a class="language-switch" href="'+(lang==='zh'?'en/':'../')+files[page]+'" lang="'+(lang==='zh'?'en':'zh-CN')+'">'+t(lang,'English','中文')+'</a></nav></header>';
}

function paper(p, lang) {
  const titleLang = p.language === 'zh' ? 'zh-CN' : 'en';
  const url = p.doi ? 'https://doi.org/'+p.doi : 'https://scholar.google.com/scholar?q='+encodeURIComponent('"'+p.title+'"');
  const authors = esc(p.authors).replace(/T\. Guan\*?|关涛/g, name=>'<strong>'+name+'</strong>');
  return '<article class="paper" data-year="'+p.year+'" data-search="'+esc([p.title,p.authors,p.journal,p.translation||''].join(' ').toLowerCase())+'">'+
    '<div class="paper-label"><span class="badge">'+esc(p.short)+'</span></div><div class="paper-body">'+
    '<h4 class="paper-title" lang="'+titleLang+'"><a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(p.title)+'</a></h4>'+
    (lang==='en'&&p.translation?'<p class="translation">'+esc(p.translation)+' <span>(English translation)</span></p>':'')+
    '<p class="authors" lang="'+titleLang+'">'+authors+'</p><p class="journal" lang="'+titleLang+'"><em>'+esc(p.journal)+'</em>, '+p.year+'.</p>'+
    '<div class="paper-links"><a class="pill-link" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+(p.doi?t(lang,'论文链接','Paper'):t(lang,'学术检索','Scholar search'))+'</a>'+
    (p.role!=='co'?'<span class="role-label">'+(p.role==='first'?t(lang,'第一作者','First author'):t(lang,'通信作者','Corresponding author'))+'</span>':'')+'</div></div></article>';
}

function paperGroups(papers, lang) {
  // Newest year first; within each year, first authorship leads,
  // followed by TASE/TAC. Preserve the source order for equal priorities.
  const priority = p => [p.role === 'first' ? 0 : 1, ['T-ASE','TAC'].includes(p.short) ? 0 : 1, p.role === 'corresponding' ? 0 : 1];
  const ordered = [...papers].sort((a,b) => {
    if (a.year !== b.year) return b.year - a.year;
    const ap = priority(a), bp = priority(b);
    return ap[0] - bp[0] || ap[1] - bp[1] || ap[2] - bp[2];
  });
  const years = [...new Set(papers.map(p=>p.year))].sort((a,b)=>b-a);
  return years.map(year=>'<div class="paper-year-group" data-group-year="'+year+'"><h3 class="year-heading">'+year+'</h3><div class="paper-list">'+ordered.filter(p=>p.year===year).map(p=>paper(p,lang)).join('')+'</div></div>').join('');
}

function education(lang) {
  const items = [
    [t(lang,'2023.09 — 至今','Sep 2023 — Present'),t(lang,'博士研究生 · 航空宇航科学与技术','Ph.D. · Aeronautical and Astronautical Science and Technology'),t(lang,'四川大学','Sichuan University'),t(lang,'控制方向','Control')],
    ['2020.09 — 2023.06',t(lang,'硕士 · 电子信息','Master’s degree · Electronic Information'),t(lang,'四川大学','Sichuan University'),t(lang,'控制方向','Control')],
    ['2016.09 — 2020.06',t(lang,'学士 · 自动化','Bachelor’s degree · Automation'),t(lang,'东北大学','Northeastern University'),'']
  ];
  return '<div class="edu-timeline">'+items.map(e=>'<article class="edu-item"><div class="edu-left"><span class="edu-time">'+e[0]+'</span><span class="edu-dot" aria-hidden="true"></span></div><div class="edu-card"><div><h3 class="edu-degree">'+e[1]+'</h3><p class="edu-school">'+e[2]+'</p>'+(e[3]?'<p class="edu-notes">'+e[3]+'</p>':'')+'</div></div></article>').join('')+'</div>';
}

function honors(lang) {
  const items = [
    [t(lang,'2025 年 12 月','Dec 2025'),t(lang,'中国科协青年科技人才培育工程博士生专项计划','CAST doctoral student talent development program'),t(lang,'托举学会：中国自动化学会','Supported by the Chinese Association of Automation')],
    [t(lang,'博士期间','Doctoral studies'),t(lang,'国家奖学金','National Scholarship'),''],
    [t(lang,'本科期间','Undergraduate studies'),t(lang,'全国大学生电子设计竞赛国家一等奖','National First Prize, National Undergraduate Electronic Design Contest'),t(lang,'四旋翼组','Quadrotor category')],
    [t(lang,'本科期间','Undergraduate studies'),t(lang,'国家励志奖学金（两次）','National Encouragement Scholarship (twice)'),''],
    [t(lang,'本科期间','Undergraduate studies'),t(lang,'蓝桥杯国家二等奖','National Second Prize, Lanqiao Cup'),''],
    [t(lang,'本科期间','Undergraduate studies'),t(lang,'校三好学生','University Merit Student'),'']
  ];
  return '<ul class="honors-list">'+items.map(h=>'<li><strong>'+h[1]+'</strong><span class="honor-date"> · '+h[0]+'</span>'+(h[2]?'<span class="honor-note">'+h[2]+'</span>':'')+'</li>').join('')+'</ul>';
}

function home(lang) {
  const bio = t(lang,
    '我目前是<strong>四川大学</strong>航空宇航科学与技术专业的博士研究生，研究方向为<strong>复杂约束下的智能决策与控制</strong>。',
    'I am a Ph.D. student in Aeronautical and Astronautical Science and Technology at <strong>Sichuan University</strong>. My research focuses on <strong>intelligent decision-making and control under complex constraints</strong>.');
  const bio2 = t(lang,
    '我于 2023 年获得四川大学电子信息硕士学位，于 2020 年获得东北大学自动化学士学位。研究涉及受约束非线性控制、模型预测控制、高性能控制、强化学习、模仿学习、轨迹规划等。',
    'I received my master’s degree in Electronic Information from Sichuan University in 2023 and my bachelor’s degree in Automation from Northeastern University in 2020. My research interests include constrained nonlinear control, model predictive control, high-performance control, reinforcement learning, imitation learning, and trajectory planning.');
  return '<h2 id="about">'+t(lang,'个人简介','About Me')+'</h2><p>'+bio+'</p><p>'+bio2+'</p>'+
    '<h2 id="education">'+t(lang,'教育经历','Education')+'</h2>'+education(lang)+
    '<h2 id="honors">'+t(lang,'荣誉与奖励','Honors & Awards')+'</h2>'+honors(lang)+
    '<h2 id="publications">'+t(lang,'论文发表','Publications')+'</h2><div class="publications">'+paperGroups(data.papers,lang)+'</div>'+
    '<h2 id="contact">'+t(lang,'联系方式','Contact')+'</h2><div class="contact-card"><p>'+t(lang,'欢迎围绕智能决策、受约束控制与航天器姿态控制开展学术交流。','I welcome discussions on intelligent decision-making, constrained control, and spacecraft attitude control.')+'</p><a href="mailto:'+esc(data.email)+'">'+esc(data.email)+'</a></div>';
}

function publications(lang) {
  return '<h2 id="publications">'+t(lang,'论文发表','Publications')+'</h2><p>'+t(lang,'期刊论文 11 篇，其中第一作者 6 篇、通信作者 1 篇。','11 journal publications, including 6 as first author and 1 as corresponding author.')+'</p><p class="muted">'+t(lang,'姓名加粗标示；* 表示通信作者。','My name is shown in bold; * denotes corresponding author.')+'</p>'+
    '<div class="publication-controls"><label class="sr-only" for="paper-search">'+t(lang,'搜索论文','Search publications')+'</label><input id="paper-search" type="search" placeholder="'+t(lang,'搜索标题、作者或期刊','Search title, author, or journal')+'" autocomplete="off"><label class="sr-only" for="paper-year">'+t(lang,'按年份筛选','Filter by year')+'</label><select id="paper-year"><option value="all">'+t(lang,'全部年份','All years')+'</option>'+[...new Set(data.papers.map(p=>p.year))].sort((a,b)=>b-a).map(y=>'<option value="'+y+'">'+y+'</option>').join('')+'</select></div>'+
    '<p class="result-count" id="result-count" aria-live="polite" data-suffix="'+t(lang,'篇论文','publications')+'">11 '+t(lang,'篇论文','publications')+'</p><div class="publications">'+paperGroups(data.papers,lang)+'</div><p class="empty-state" id="no-results" hidden>'+t(lang,'没有匹配的论文，请更换关键词或年份。','No matching publications. Try another keyword or year.')+'</p>';
}

for (const lang of ['zh','en']) {
  const prefix = lang==='en'?'../':'';
  for (const page of Object.keys(files)) {
    const title = ({home:t(lang,'个人简介','About Me'),publications:t(lang,'论文发表','Publications')})[page]+' | '+t(lang,data.nameZh,data.nameEn);
    const desc=t(lang,'关涛，四川大学博士研究生。研究方向：复杂约束下的智能决策与控制、航天器姿态控制、分布鲁棒模型预测控制。','Tao Guan, Ph.D. student at Sichuan University. Research: intelligent decision-making and control under complex constraints, spacecraft attitude control, and distributionally robust MPC.');
    const url = new URL((lang==='en'?'en/':'')+(page==='home'?'':files[page]),data.siteUrl).href;
    const html='<!doctype html>\n<html lang="'+(lang==='zh'?'zh-CN':'en')+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><meta name="description" content="'+desc+'"><meta name="theme-color" content="#f7f8fb"><link rel="icon" href="'+prefix+'assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="'+prefix+'assets/style.css"><script src="'+prefix+'assets/site.js" defer></script><link rel="canonical" href="'+esc(url)+'"><link rel="alternate" hreflang="zh-CN" href="'+prefix+files[page]+'"><link rel="alternate" hreflang="en" href="'+prefix+'en/'+files[page]+'"><meta property="og:type" content="profile"><meta property="og:title" content="'+title+'"><meta property="og:description" content="'+desc+'"><meta property="og:url" content="'+esc(url)+'"><meta property="og:image" content="'+new URL('assets/tao-guan.jpg',data.siteUrl).href+'"></head>\n'+
      '<body><a class="skip-link" href="#main">'+t(lang,'跳转到正文','Skip to content')+'</a><div class="wrapper">'+sidebar(lang,page)+'<main class="site-content" id="main" tabindex="-1">'+({home,publications})[page](lang)+'<footer class="site-footer"><p>© 2026 '+esc(t(lang,data.nameZh,data.nameEn))+' · '+t(lang,'四川大学','Sichuan University')+'</p></footer></main></div></body></html>\n';
    const dir=lang==='en'?path.join(root,'en'):root;
    fs.mkdirSync(dir,{recursive:true});
    fs.writeFileSync(path.join(dir,files[page]),html);
  }
  // Retain old URLs as redirects so existing uploaded files need no manual deletion.
  const dir=lang==='en'?path.join(root,'en'):root;
  const target='index.html#education';
  const canonical=new URL(lang==='en'?'en/':'',data.siteUrl).href;
  const redirect='<!doctype html>\n<html lang="'+(lang==='zh'?'zh-CN':'en')+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url='+target+'"><link rel="canonical" href="'+esc(canonical)+'"><title>'+t(lang,'关涛 · 个人简介','Tao Guan · About Me')+'</title></head><body><p><a href="'+target+'">'+t(lang,'查看个人简介中的教育经历与荣誉奖励','View education and honors on the About page')+'</a></p></body></html>\n';
  fs.writeFileSync(path.join(dir,'background.html'),redirect);
}
console.log('Built 4 bilingual content pages and 2 legacy redirects.');
