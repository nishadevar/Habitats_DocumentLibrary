/* Shared app shell: sidebar nav + page header icons.
   Edit nav items / icons here once instead of in every screen. */

const ICONS = {
  dashboard:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
  assetPlans:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  requests:'<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
  doc:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  approvals:'<path d="M9 2h6l1 4H8z"/><path d="M4 6h16l-1.5 14a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2z"/>',
  photo:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M21 16l-5-5-4 4-3-3-6 6"/>',
  geo:'<path d="M12 2 3 7l9 5 9-5-9-5Z"/><path d="M3 17l9 5 9-5"/><path d="M3 12l9 5 9-5"/>',
  refs:'<path d="M9 2H4v20l8-5 8 5V2h-5"/>',
  templates:'<rect x="3" y="4" width="18" height="4" rx="1"/><rect x="3" y="11" width="18" height="4" rx="1"/><rect x="3" y="18" width="10" height="3" rx="1"/>',
  transfer:'<path d="M17 3l4 4-4 4"/><path d="M3 7h18"/><path d="M7 21l-4-4 4-4"/><path d="M21 17H3"/>',
  approvalsNav:'<path d="M9 2h6l1 4H8z"/><path d="M4 6h16l-1.5 14a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2z"/><path d="M9 13l2 2 4-4"/>',
  chev:'<path d="M18 15l-6-6-6 6"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>',
  ext:'<path d="M14 4h6v6"/><path d="M10 14 20 4"/><path d="M18 14v6H4V6h6"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>',
  clockCircle:'<circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 2"/>'
};

const NAV = [
  { key:'dashboard', label:'Dashboard', icon:ICONS.dashboard, href:'#' },
  { key:'asset-plans', label:'Asset Plans', icon:ICONS.assetPlans, href:'#' },
  { key:'my-requests', label:'My Requests', icon:ICONS.requests, href:'index.html' },
  { key:'document-library', label:'Document Library', icon:ICONS.doc, children:[
      { key:'surveys', label:'Surveys', icon:ICONS.doc, href:'document-library.html#surveys' },
      { key:'era', label:'Environmental Requirements & Approvals', icon:ICONS.approvals, href:'document-library.html#era' },
      { key:'photographs', label:'Photographs', icon:ICONS.photo, href:'document-library.html#photographs' },
      { key:'geospatial', label:'Geospatial Data', icon:ICONS.geo, href:'document-library.html#geospatial' },
    ]},
  { key:'references', label:'References', icon:ICONS.refs, children:[
      { key:'templates', label:'Templates', icon:ICONS.templates, href:'#' },
    ]},
  { key:'data-transfer', label:'Data Transfer', icon:ICONS.transfer, href:'data-transfer.html' },
  { key:'approvals', label:'Approvals', icon:ICONS.approvalsNav, href:'approvals.html' },
];

function svg(inner, size){ return `<svg class="nav-icon" width="${size||18}" height="${size||18}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${inner}</svg>`; }

function renderSidebar(activeKey){
  let itemsHtml = '';
  NAV.forEach(item=>{
    if(item.children){
      const isOpenActive = item.children.some(c=>c.key===activeKey);
      itemsHtml += `
        <div class="nav-group">
          <div class="nav-group-header">
            ${svg(item.icon)}
            ${item.label}
            <span class="chev">${svg(ICONS.chev,16)}</span>
          </div>
          <div class="subnav">
            ${item.children.map(c=>`
              <a class="subnav-item" href="${c.href}"><span class="dot"></span>${svg(c.icon,16)}${c.label}</a>
            `).join('')}
          </div>
        </div>`;
    } else {
      itemsHtml += `<a class="nav-item${item.key===activeKey?' active':''}" href="${item.href}">${svg(item.icon)}${item.label}</a>`;
    }
  });

  const html = `
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-left">
          <div class="brand-mark"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2"><path d="M12 2 L21 20 H3 Z"/></svg></div>
          <span class="brand-name">habitats</span>
        </div>
        <button class="collapse-btn" aria-label="Collapse sidebar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
      </div>
      <nav class="nav">${itemsHtml}</nav>
      <div class="sidebar-footer">
        <a class="back-link" href="#">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2fae82" stroke-width="2">${ICONS.clockCircle}</svg>
          Back to esmapp
          <span class="ext">${svg(ICONS.ext,14)}</span>
        </a>
        <div class="user-row">
          <span class="user-avatar"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${ICONS.user}</svg></span>
          <span class="user-name">habitat_user</span>
        </div>
      </div>
    </aside>`;
  document.getElementById('sidebar-root').outerHTML = html;
}

function renderHeader(title, subtitle){
  const html = `
    <div class="page-header">
      <h1 class="page-title">${title}</h1>
      <div class="header-icons">
        <span class="icon-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${ICONS.bell}</svg>
          <span class="badge">8</span>
        </span>
        <span class="icon-btn">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${ICONS.mail}</svg>
        </span>
      </div>
    </div>
    ${subtitle ? `<p class="page-subtitle">${subtitle}</p>` : ''}`;
  document.getElementById('header-root').outerHTML = html;
}

function initShell(activeKey, title, subtitle){
  renderSidebar(activeKey);
  renderHeader(title, subtitle);
}
