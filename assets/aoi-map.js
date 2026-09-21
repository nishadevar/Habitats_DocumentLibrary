/* Reusable "draw an Area of Interest" map step — Point / Line / Polygon,
   multiple shapes at once. Mounted inside any modal step via AOIMap.mount(). */

const AOIMap = (function(){
  let uid = 0;

  function svgIcon(inner, size){
    return `<svg width="${size||15}" height="${size||15}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${inner}</svg>`;
  }
  const ICON = {
    point:'<circle cx="12" cy="12" r="3"/>',
    line:'<path d="M5 19 19 5"/><circle cx="5" cy="19" r="2"/><circle cx="19" cy="5" r="2"/>',
    polygon:'<path d="m12 3 8 6-3 9H7L4 9Z"/>',
    close:'<path d="M18 6 6 18M6 6l12 12"/>',
    check:'<path d="M20 6 9 17l-5-5"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    chev:'<path d="M6 9l6 6 6-6"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    minus:'<path d="M5 12h14"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/>'
  };
  const TYPE_LABEL = { polygon:'Polygon', line:'Line', point:'Point' };

  function pts(points){ return points.map(p=>p[0]+','+p[1]).join(' '); }

  function shapeMarkup(g){
    const color = g.type==='polygon' ? '#2fae82' : g.type==='line' ? '#2f5fa8' : '#7c4fd6';
    if(g.type==='polygon') return `<polygon points="${pts(g.points)}" fill="${color}2e" stroke="${color}" stroke-width="2"/>`;
    if(g.type==='line') return `<polyline points="${pts(g.points)}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
    const p = g.points[0];
    return `<circle cx="${p[0]}" cy="${p[1]}" r="7" fill="${color}" stroke="#fff" stroke-width="2"/>`;
  }

  function minPointsFor(type){ return type==='polygon' ? 3 : 2; }

  /**
   * Mount a map-drawing step into containerEl.
   * opts: { shapes: [{id,type,points}], onChange(shapes) }
   * returns: { getShapes(), setShapes(arr) }
   */
  function mount(containerEl, opts){
    opts = opts || {};
    const gridId = 'aoi-grid-' + (++uid);
    let shapes = (opts.shapes || []).map(s => ({ ...s, id: s.id || (++uid) }));
    let nextId = shapes.reduce((m,s)=>Math.max(m, s.id||0), uid) + 1;
    let drawMode = null;
    let currentPoints = [];

    containerEl.innerHTML = `
      <div class="banner banner-info aoi-tip">
        ${svgIcon(ICON.info,16)}
        <span>You're not limited to one shape — <strong>add as many polygons, lines and points as this document needs.</strong> Each one is added to the list below and can be edited or removed on its own.</span>
      </div>
      <div class="map-stage">
        <svg class="map-canvas mode-off" viewBox="0 0 1000 460">
          <defs>
            <pattern id="${gridId}" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e6e5" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="1000" height="460" fill="#eef1f0"/>
          <rect width="1000" height="460" fill="url(#${gridId})"/>
          <g class="geom-layer"></g>
        </svg>
        <div class="map-search-overlay">${svgIcon(ICON.search,15)}<span>Search ELR, lineside, route, region, grid, w3w, place</span>${svgIcon(ICON.chev,14)}</div>
        <div class="map-loc-chips-row">
          <span class="map-loc-chips-label" style="display:none;">Added so far:</span>
          <div class="map-loc-chips"></div>
        </div>
        <div class="map-zoom"><span title="Zoom in">${svgIcon(ICON.plus,13)}</span><span title="Zoom out">${svgIcon(ICON.minus,13)}</span></div>
        <div class="map-pill">
          <button class="map-pill-btn" data-tool="point">${svgIcon(ICON.point)}Point</button>
          <button class="map-pill-btn" data-tool="line">${svgIcon(ICON.line)}Line</button>
          <button class="map-pill-btn" data-tool="polygon">${svgIcon(ICON.polygon)}Polygon</button>
          <span class="map-pill-divider pill-extra" style="display:none;"></span>
          <button class="map-pill-btn pill-finish pill-extra" style="display:none;" disabled>${svgIcon(ICON.check,14)}Add shape</button>
          <button class="map-pill-btn pill-cancel pill-extra" style="display:none;" title="Cancel this shape">${svgIcon(ICON.close,14)}</button>
        </div>
      </div>
      <div class="map-below-hint">${svgIcon(ICON.info,13)}<span class="hint-text"></span></div>
    `;

    const svgEl = containerEl.querySelector('.map-canvas');
    const layerEl = containerEl.querySelector('.geom-layer');
    const chipsEl = containerEl.querySelector('.map-loc-chips');
    const chipsLabelEl = containerEl.querySelector('.map-loc-chips-label');
    const hintEl = containerEl.querySelector('.hint-text');
    const toolBtns = [...containerEl.querySelectorAll('.map-pill-btn[data-tool]')];
    const finishBtn = containerEl.querySelector('.pill-finish');
    const cancelBtn = containerEl.querySelector('.pill-cancel');
    const dividerEl = containerEl.querySelector('.map-pill-divider');

    function svgPointFromEvent(evt){
      const rect = svgEl.getBoundingClientRect();
      const x = Math.round((evt.clientX - rect.left) / rect.width * 1000);
      const y = Math.round((evt.clientY - rect.top) / rect.height * 460);
      return [Math.max(6,Math.min(994,x)), Math.max(6,Math.min(454,y))];
    }

    function notify(){ if(opts.onChange) opts.onChange(shapes.slice()); }

    function commit(type, points){
      shapes.push({ id: nextId++, type, points: points.map(p=>p.slice()) });
      notify();
    }

    function removeShape(id){
      const shape = shapes.find(s=>s.id===id);
      if(!shape) return;
      if(!confirm(`Are you sure you want to delete this ${TYPE_LABEL[shape.type].toLowerCase()}? This cannot be undone. Every other shape stays exactly as it is.`)) return;
      shapes = shapes.filter(s=>s.id!==id);
      notify();
      render();
    }

    function previewMarkup(){
      if(!drawMode || drawMode==='point' || currentPoints.length===0) return '';
      return `<polyline points="${pts(currentPoints)}" fill="none" stroke="#0e3d37" stroke-width="2" stroke-dasharray="5,5"/>`
        + currentPoints.map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="#0e3d37"/>`).join('');
    }

    function render(){
      layerEl.innerHTML = shapes.map(shapeMarkup).join('') + previewMarkup();

      const counters = { polygon:0, line:0, point:0 };
      chipsEl.innerHTML = shapes.map(s=>{
        counters[s.type]++;
        return `<span class="loc-chip" data-id="${s.id}">
          <span class="loc-chip-icon type-${s.type}">${svgIcon(ICON[s.type],10)}</span>
          ${TYPE_LABEL[s.type]} ${counters[s.type]}
          <button class="loc-chip-remove" data-remove="${s.id}" title="Remove">${svgIcon(ICON.close,9)}</button>
        </span>`;
      }).join('');
      chipsLabelEl.style.display = shapes.length ? '' : 'none';

      toolBtns.forEach(b=>b.classList.toggle('active', drawMode===b.dataset.tool));
      const showExtra = drawMode==='line' || drawMode==='polygon';
      dividerEl.style.display = showExtra ? '' : 'none';
      finishBtn.style.display = showExtra ? '' : 'none';
      cancelBtn.style.display = showExtra ? '' : 'none';
      if(showExtra) finishBtn.disabled = currentPoints.length < minPointsFor(drawMode);
      svgEl.classList.toggle('mode-off', !drawMode);

      if(!drawMode){
        hintEl.innerHTML = shapes.length
          ? `<strong>${shapes.length}</strong> shape${shapes.length===1?'':'s'} added. Pick Point, Line or Polygon to add <strong>another one</strong> — or continue when you're done.`
          : `Pick Point, Line or Polygon below to start. You're not limited to one — draw as many shapes as this document needs.`;
      } else if(drawMode==='point'){
        hintEl.innerHTML = `Click anywhere on the map to drop a point. Point stays selected, so you can drop <strong>several points in a row</strong>.`;
      } else {
        const need = minPointsFor(drawMode);
        hintEl.textContent = currentPoints.length < need
          ? `Click to place ${TYPE_LABEL[drawMode].toLowerCase()} points (at least ${need}) — ${currentPoints.length} placed.`
          : `Keep clicking to add points, or select Add shape to save this ${TYPE_LABEL[drawMode].toLowerCase()} — you can then start another.`;
      }
    }

    function setMode(type){
      drawMode = (drawMode === type) ? null : type;
      currentPoints = [];
      render();
    }

    toolBtns.forEach(b => b.addEventListener('click', () => setMode(b.dataset.tool)));

    svgEl.addEventListener('click', (evt) => {
      if(!drawMode) return;
      const p = svgPointFromEvent(evt);
      if(drawMode === 'point'){
        commit('point', [p]);
        render();
        return;
      }
      currentPoints.push(p);
      render();
    });

    finishBtn.addEventListener('click', () => {
      if(currentPoints.length < minPointsFor(drawMode)) return;
      commit(drawMode, currentPoints);
      currentPoints = [];
      render();
    });

    cancelBtn.addEventListener('click', () => {
      currentPoints = [];
      render();
    });

    chipsEl.addEventListener('click', (evt) => {
      const btn = evt.target.closest('[data-remove]');
      if(btn) removeShape(Number(btn.dataset.remove));
    });

    render();

    return {
      getShapes: () => shapes.slice(),
      setShapes: (arr) => { shapes = (arr||[]).map(s=>({...s})); render(); notify(); }
    };
  }

  return { mount, TYPE_LABEL };
})();
