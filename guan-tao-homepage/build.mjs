import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(fs.readFileSync(path.join(root,'content.json'),'utf8'));
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text = (lang, zh, en) => lang === 'zh' ? zh : en;
const labels = {
 zh: {home:'首页',publications:'论文发表',background:'教育与荣誉',skip:'跳转到正文',lang:'English',all:'全部年份',search:'搜索论文',placeholder:'搜索标题、作者或期刊',results:'篇论文',none:'没有匹配的论文，请更换关键词或年份。',first:'第一作者',corresponding:'通信作者',paper:'论文链接',lookup:'学术检索',selected:'代表性论文',more:'查看全部论文',contact:'学术交流',copyright:'个人学术主页',role:'博士研究生',university:'四川大学',degree:'航空宇航科学与技术 · 控制方向',expected:'预计 2027 年 6 月毕业'},
 en: {home:'Home',publications:'Publications',background:'Education & Honors',skip:'Skip to content',lang:'中文',all:'All years',search:'Search publications',placeholder:'Search title, author, or journal',results:'publications',none:'No matching publications. Try another keyword or year.',first:'First author',corresponding:'Corresponding author',paper:'Paper',lookup:'Scholar search',selected:'Selected publications',more:'View all publications',contact:'Get in touch',copyright:'Academic homepage',role:'Ph.D. Student',university:'Sichuan University',degree:'Aeronautical and Astronautical Science and Technology · Control',expected:'Expected graduation: June 2027'}
};

function paper(p,lang,compact=false) {
 const l=labels[lang];
 const titleLang=p.language==='zh'?'zh-CN':'en';
 const url=p.doi?'https://doi.org/'+p.doi:'https://scholar.google.com/scholar?q='+encodeURIComponent('"'+p.title+'"');
 const authors=esc(p.authors).replace(/T\. Guan\*?|关涛/g,m=>'<strong>'+m+'</strong>');
 return `<article class="paper" data-year="${p.year}" data-search="${esc([p.title,p.authors,p.journal,p.translation||''].join(' ').toLowerCase())}">
 <div class="paper-label"><span>${esc(p.short)}</span><small>${p.year}</small></div>
 <div class="paper-body"><h3 lang="${titleLang}">${esc(p.title)}</h3>${lang==='en'&&p.translation?`<p class="translation">${esc(p.translation)} <span>(English translation)</span></p>`:''}
 <p class="authors" lang="${titleLang}">${authors}</p><p class="journal" lang="${p.language==='zh'?'zh-CN':'en'}">${esc(p.journal)}, ${p.year}.</p>
 <div class="paper-links"><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${p.doi?l.paper:l.lookup} <span aria-hidden="true">↗</span></a>${p.role!=='co'?`<span class="role-label">${l[p.role]}</span>`:''}</div></div></article>`;
}
function home(lang) {
 const l=labels[lang], name=lang==='zh'?data.nameZh:data.nameEn;
 const bio=text(lang,
 `我目前是四川大学航空宇航科学与技术专业的博士研究生，研究方向为<strong>复杂约束下的智能决策与控制</strong>，预计于 2027 年 6 月毕业。此前，我于 2023 年获得四川大学电子信息硕士学位，于 2020 年获得东北大学自动化学士学位。`,
 `I am a Ph.D. student in Aeronautical and Astronautical Science and Technology at Sichuan University, working on <strong>intelligent decision-making and control under complex constraints</strong>. I expect to graduate in June 2027. I received my master's degree in Electronic Information from Sichuan University in 2023 and my bachelor's degree in Automation from Northeastern University in 2020.`);
 const bio2=text(lang,
 '我的研究涉及受约束非线性系统控制、航天器姿态控制、固定时间与预设性能控制，以及分布鲁棒模型预测控制。相关成果发表于 IEEE Transactions on Automatic Control、IEEE Transactions on Systems, Man, and Cybernetics: Systems 等期刊。',
 'My research interests include constrained nonlinear control, spacecraft attitude control, fixed-time and prescribed-performance control, and distributionally robust model predictive control. My work has appeared in journals including IEEE Transactions on Automatic Control and IEEE Transactions on Systems, Man, and Cybernetics: Systems.');
 return `<section class="intro" aria-labelledby="name"><div class="intro-copy"><p class="eyebrow">${l.university} <span>/</span> ${l.role}</p><h1 id="name">${esc(name)} <span>${esc(lang==='zh'?data.nameEn:data.nameZh)}</span></h1><p class="subtitle">${l.degree}</p><div class="biography"><p>${bio}</p><p>${bio2}</p></div><div class="contact-links"><a href="mailto:${esc(data.email)}"><span aria-hidden="true">✉</span> ${esc(data.email)}</a>${data.github?`<a href="https://github.com/${esc(data.github)}" target="_blank" rel="noopener noreferrer">GitHub ↗</a>`:''}</div></div><aside class="profile"><div class="photo-frame"><img src="${lang==='en'?'../':''}assets/tao-guan.jpg" alt="${esc(data.nameZh)} / ${esc(data.nameEn)}" width="227" height="227" fetchpriority="high"></div><p>${l.university}</p><small>${l.expected}</small></aside></section>
 <section class="research" aria-labelledby="research-title"><h2 id="research-title">${text(lang,'研究方向','Research interests')}</h2><ul><li>${text(lang,'受约束非线性控制','Constrained nonlinear control')}</li><li>${text(lang,'航天器姿态控制','Spacecraft attitude control')}</li><li>${text(lang,'固定时间与预设性能控制','Fixed-time & prescribed-performance control')}</li><li>${text(lang,'分布鲁棒模型预测控制','Distributionally robust MPC')}</li></ul></section>
 <section class="section news" aria-labelledby="news-title"><div class="section-heading"><h2 id="news-title">${text(lang,'最新动态','News')}</h2><span class="section-note">${text(lang,'学术与研究','Academic milestones')}</span></div><dl><div><dt>2025.12</dt><dd>${text(lang,'入选中国科协青年科技人才培育工程博士生专项计划，托举学会为中国自动化学会。','Selected for the doctoral student program of the China Association for Science and Technology (CAST) young scientific talent development initiative, supported by the Chinese Association of Automation.')}</dd></div><div><dt>2023.09</dt><dd>${text(lang,'开始在四川大学攻读航空宇航科学与技术专业博士学位。','Began Ph.D. studies in Aeronautical and Astronautical Science and Technology at Sichuan University.')}</dd></div></dl></section>
 <section class="section" aria-labelledby="selected-title"><div class="section-heading"><h2 id="selected-title">${l.selected}</h2><a href="publications.html">${l.more} <span aria-hidden="true">→</span></a></div><div class="paper-list">${['unwinding','barrier','dro'].map(id=>paper(data.papers.find(p=>p.id===id),lang,true)).join('')}</div></section>
 <section class="contact-section"><h2>${l.contact}</h2><p>${text(lang,'欢迎围绕智能决策、受约束控制与航天器姿态控制开展学术交流。','I welcome discussions on intelligent decision-making, constrained control, and spacecraft attitude control.')}</p><a href="mailto:${esc(data.email)}">${esc(data.email)} <span aria-hidden="true">↗</span></a></section>`;
}
function publications(lang){
 const l=labels[lang];
 return `<div class="page-heading"><p class="eyebrow">${text(lang,'研究成果','Research output')}</p><h1>${l.publications}</h1><p>${text(lang,'期刊论文 11 篇，其中第一作者 6 篇、通信作者 1 篇。','11 journal publications, including 6 as first author and 1 as corresponding author.')}</p><p class="muted">${text(lang,'姓名加粗标示；* 表示通信作者。','My name is shown in bold; * denotes corresponding author.')}</p></div>
 <div class="publication-controls"><div class="search-field"><label class="sr-only" for="paper-search">${l.search}</label><span aria-hidden="true">⌕</span><input id="paper-search" type="search" placeholder="${l.placeholder}" autocomplete="off"></div><label class="sr-only" for="paper-year">${text(lang,'按年份筛选','Filter by year')}</label><select id="paper-year"><option value="all">${l.all}</option>${[...new Set(data.papers.map(p=>p.year))].sort((a,b)=>b-a).map(y=>`<option value="${y}">${y}</option>`).join('')}</select></div><p class="result-count" id="result-count" aria-live="polite" data-suffix="${l.results}">${data.papers.length} ${l.results}</p>
 <div class="paper-list publications-list">${data.papers.map(p=>paper(p,lang)).join('')}</div><p class="empty-state" id="no-results" hidden>${l.none}</p>`;
}
function background(lang){
 const education=[
 ['2023.09 — 2027.06',text(lang,'博士研究生','Ph.D. Student'),text(lang,'四川大学','Sichuan University'),text(lang,'航空宇航科学与技术（控制方向）','Aeronautical and Astronautical Science and Technology (Control)'),text(lang,'预计 2027 年 6 月毕业','Expected graduation: June 2027')],
 ['2020.09 — 2023.06',text(lang,'硕士','Master’s degree'),text(lang,'四川大学','Sichuan University'),text(lang,'电子信息（控制方向）','Electronic Information (Control)'), ''],
 ['2016.09 — 2020.06',text(lang,'学士','Bachelor’s degree'),text(lang,'东北大学','Northeastern University'),text(lang,'自动化','Automation'), '']
 ];
 const honors=[
 ['2025.12',text(lang,'中国科协青年科技人才培育工程博士生专项计划','CAST doctoral student talent development program'),text(lang,'托举学会：中国自动化学会','Supported by the Chinese Association of Automation')],
 [text(lang,'博士期间','Doctoral studies'),text(lang,'国家奖学金','National Scholarship'),text(lang,'博士研究生国家奖学金','National Scholarship for doctoral students')],
 [text(lang,'本科期间','Undergraduate studies'),text(lang,'全国大学生电子设计竞赛国家一等奖','National First Prize, National Undergraduate Electronic Design Contest'),text(lang,'四旋翼组','Quadrotor category')],
 [text(lang,'本科期间','Undergraduate studies'),text(lang,'国家励志奖学金（两次）','National Encouragement Scholarship (twice)'), ''],
 [text(lang,'本科期间','Undergraduate studies'),text(lang,'蓝桥杯国家二等奖','National Second Prize, Lanqiao Cup'), ''],
 [text(lang,'本科期间','Undergraduate studies'),text(lang,'校三好学生','University Merit Student'), '']
 ];
 return `<div class="page-heading"><p class="eyebrow">${text(lang,'学术经历','Academic background')}</p><h1>${labels[lang].background}</h1><p>${text(lang,'从自动化到复杂约束下的智能决策与控制。','From automation to intelligent decision-making and control under complex constraints.')}</p></div><section class="section" aria-labelledby="education-title"><h2 id="education-title">${text(lang,'教育经历','Education')}</h2><div class="education-list">${education.map(e=>`<article class="education-entry"><div class="education-date">${e[0]}</div><div><p class="education-degree">${e[1]}</p><h3>${e[2]}</h3><p>${e[3]}</p>${e[4]?`<small>${e[4]}</small>`:''}</div></article>`).join('')}</div></section><section class="section" aria-labelledby="honors-title"><h2 id="honors-title">${text(lang,'荣誉与奖励','Honors & awards')}</h2><div class="honors-list">${honors.map(h=>`<article class="honor"><div class="honor-date">${h[0]}</div><div><h3>${h[1]}</h3>${h[2]?`<p>${h[2]}</p>`:''}</div></article>`).join('')}</div></section>`;
}
const files={home:'index.html',publications:'publications.html',background:'background.html'};
for (const lang of ['zh','en']) {
 const l=labels[lang], prefix=lang==='en'?'../':'';
 for (const page of Object.keys(files)){
  const title=(page==='home'?text(lang,'关涛 | 四川大学','Tao Guan | Sichuan University'):l[page]+' | '+text(lang,'关涛','Tao Guan'));
  const desc=text(lang,'关涛，四川大学博士研究生。研究方向：复杂约束下的智能决策与控制、航天器姿态控制、分布鲁棒模型预测控制。','Tao Guan is a Ph.D. student at Sichuan University researching intelligent decision-making and control under complex constraints, spacecraft attitude control, and distributionally robust MPC.');
  const html=`<!doctype html>
<html lang="${lang==='zh'?'zh-CN':'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${desc}"><meta name="theme-color" content="#ffffff"><title>${title}</title><link rel="icon" href="${prefix}assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${prefix}assets/style.css"><script src="${prefix}assets/site.js" defer></script><meta property="og:type" content="profile"><meta property="og:title" content="${title}"><meta property="og:description" content="${desc}"><link rel="alternate" hreflang="zh-CN" href="${prefix}${files[page]}"><link rel="alternate" hreflang="en" href="${prefix}en/${files[page]}"></head>
<body><a class="skip-link" href="#main">${l.skip}</a><header class="site-header"><div class="header-inner"><a class="brand" href="index.html" aria-label="${text(lang,'关涛，首页','Tao Guan, home')}"><span class="brand-mark" aria-hidden="true">TG<span>.</span></span><span class="brand-name">${esc(text(lang,data.nameZh,data.nameEn))}</span></a><nav aria-label="${text(lang,'主导航','Main navigation')}">${Object.entries(files).map(([key,file])=>`<a href="${file}"${key===page?' aria-current="page"':''}>${l[key]}</a>`).join('')}</nav><a class="language-switch" href="${lang==='zh'?'en/':'../'}${files[page]}" lang="${lang==='zh'?'en':'zh-CN'}" aria-label="${text(lang,'Switch to English','切换为中文')}">${l.lang}<span aria-hidden="true"> ↗</span></a></div></header>
<main id="main" class="container" tabindex="-1">${({home,publications,background})[page](lang)}</main>
<footer class="site-footer"><div class="footer-inner"><p>© 2026 ${esc(text(lang,data.nameZh,data.nameEn))}<span class="footer-dot">·</span>${l.copyright}</p><a href="mailto:${esc(data.email)}">${l.contact} <span aria-hidden="true">↗</span></a></div></footer></body></html>`;
  const dir=lang==='en'?path.join(root,'en'):root;fs.mkdirSync(dir,{recursive:true});
  const url=data.siteUrl?new URL((lang==='en'?'en/':'')+files[page],data.siteUrl).href:'';
  const metadata=url?`<link rel="canonical" href="${esc(url)}"><meta property="og:url" content="${esc(url)}"><meta property="og:image" content="${esc(new URL('assets/tao-guan.jpg',data.siteUrl).href)}">`:'';
  fs.writeFileSync(path.join(dir,files[page]),html.replace('</head>',metadata+'</head>')+'\n');
 }
}
console.log('Built 6 static pages in Chinese and English.');
