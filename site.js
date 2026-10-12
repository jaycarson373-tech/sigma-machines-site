(() => {
  const $ = selector => document.querySelector(selector);
  let config = {}, toastTimer;
  const missionDetails = {
    foryou: 'Baddie radar, booting up. An adult fashion and creator feed for a machine that urgently needs to touch grass.',
    gym: 'Gym fits, fitness creators, and training edits. Bro has watched 400 reps and done approximately zero.',
    fashion: 'Streetwear and outfit checks. The machine is farming aura from a browser window.',
    brainrot: 'Memes, cursed edits, and deep-fried rabbit holes. The last brain cell is on annual leave.',
    night: 'Night-out fits and city edits. It was one more scroll three hours ago.'
  };
  function notice(title, text) {
    $('#notice-title').textContent = title;
    $('#notice-text').textContent = text;
    $('#notice').showModal();
  }
  function safeUrl(value, hosts) {
    try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password && (!hosts || hosts.includes(u.hostname)) ? u.href : ''; } catch { return ''; }
  }
  function external(value, hosts, title, message) {
    const url = safeUrl(value, hosts);
    if (url) window.open(url, '_blank', 'noopener,noreferrer'); else notice(title, message);
  }
  function route() {
    const page = ['machine', 'missions'].includes(location.hash.slice(1)) ? location.hash.slice(1) : 'watch';
    for (const key of ['watch', 'machine', 'missions']) $(`#${key}-view`).hidden = key !== page;
    document.querySelectorAll('[data-nav]').forEach(a => { if (a.dataset.nav === page) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    document.title = `SIGMA — ${page === 'watch' ? 'Super Intelligence Gooning Machines' : page === 'machine' ? 'The Machine' : 'Missions'}`;
  }
  window.addEventListener('hashchange', route); route();
  $('#buy').addEventListener('click', () => external(config.tokenUrl, ['pump.fun', 'www.pump.fun'], 'Token launch pending.', 'The official $SIGMA token link will appear here at launch. No contract address has been announced on this site yet.'));
  $('#watch-pump').addEventListener('click', () => external(config.tokenUrl, ['pump.fun', 'www.pump.fun'], 'First transmission pending.', 'The pump.fun stream will be linked here once the token and broadcast are ready. The machine is not broadcasting yet.'));
  $('#connect').addEventListener('click', () => notice('Burn voting opens at launch.', 'Wallet connection and verified token burns are not enabled yet. Explore the mission previews for now. No votes or burns are being recorded.'));
  $('#x-link').addEventListener('click', () => external(config.xUrl, ['x.com', 'www.x.com'], 'X account coming soon.', 'The official SIGMA account will be linked here once it is created.'));
  $('#tiktok-link').addEventListener('click', () => external(config.tiktokUrl, ['www.tiktok.com', 'tiktok.com'], 'TikTok account coming soon.', 'The machine’s official TikTok account will be linked here once it is created.'));
  $('#about').addEventListener('click', () => { location.hash = 'machine'; });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelectorAll('.dialog-close, .dialog-done').forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
  });
  function selectMission(item) {
    const button = item.querySelector('.mission-button'), opening = button.getAttribute('aria-expanded') !== 'true';
    document.querySelectorAll('.mission-button').forEach(b => b.setAttribute('aria-expanded', 'false'));
    document.querySelectorAll('.mission-detail').forEach(d => { d.hidden = true; d.replaceChildren(); });
    if (!opening) return;
    button.setAttribute('aria-expanded', 'true');
    const detail = item.querySelector('.mission-detail'); detail.hidden = false;
    const tag = document.createElement('span'); tag.className = 'detail-tag'; tag.textContent = 'MISSION PREVIEW / NO VOTES CAST';
    const p = document.createElement('p'); p.textContent = missionDetails[item.dataset.mission] || item.dataset.description;
    const action = document.createElement('button'); action.textContent = 'How burn voting will work ↗';
    action.addEventListener('click', () => notice('Burn to choose the next mission.', 'The planned voting system counts verified $SIGMA burns toward a mission. Token details, round timing, and voting rules will be published before voting opens. This preview does not send transactions.'));
    detail.append(tag, p, action);
  }
  $('#mission-list').addEventListener('click', event => { const button = event.target.closest('.mission-button'); if (button) selectMission(button.closest('li')); });
  $('#propose').addEventListener('click', () => $('#proposal').showModal());
  $('#proposal-form').addEventListener('submit', event => {
    event.preventDefault();
    const name = $('#proposal-name').value.trim(), description = $('#proposal-description').value.trim();
    if (!name || !description) return;
    let item = document.querySelector('[data-mission="custom"]');
    if (!item) { item = document.querySelector('[data-mission="foryou"]').cloneNode(true); item.dataset.mission = 'custom'; $('#mission-list').append(item); }
    item.dataset.description = description;
    item.querySelector('.rank').textContent = '06';
    item.querySelector('.mission-copy b').textContent = name;
    item.querySelector('.mission-copy small').textContent = 'Your local preview · not submitted';
    item.querySelector('.mission-button').setAttribute('aria-expanded', 'false');
    selectMission(item); $('#proposal').close();
    $('#toast').textContent = 'Mission preview added. No vote submitted.'; $('#toast').hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4500);
  });
  $('#fullscreen').addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else if ($('#stream-frame').requestFullscreen) await $('#stream-frame').requestFullscreen(); else notice('Fullscreen unavailable.', 'This browser does not support fullscreen for this player. You can expand the browser window instead.'); }
    catch { notice('Fullscreen unavailable.', 'Your browser could not enter fullscreen. You can expand the browser window instead.'); }
  });
  const video = $('#live-video');
  video.addEventListener('playing', () => {
    $('#stream-frame').classList.add('streaming'); $('#stream-status').textContent = 'ON AIR'; $('#session-label').textContent = 'NOW WATCHING'; $('#session-value').textContent = 'The machine’s feed.'; $('#stream-note').textContent = 'Broadcast connected';
  });
  function unavailable() {
    video.hidden = true; $('#stream-frame').classList.remove('streaming'); $('#stream-status').textContent = 'STANDBY'; $('#session-label').textContent = 'TRANSMISSION OFFLINE'; $('#session-value').textContent = 'Standing by.'; $('#stream-note').textContent = 'Stream unavailable · check pump.fun';
  }
  video.addEventListener('error', unavailable); video.addEventListener('ended', unavailable);
  fetch('public-config.json', { cache: 'no-store' }).then(r => { if (!r.ok) throw new Error('Config unavailable'); return r.json(); }).then(data => {
    config = data && typeof data === 'object' ? data : {};
    const stream = safeUrl(config.streamUrl);
    if (stream) { video.src = stream; video.hidden = false; video.play().catch(() => { $('#stream-note').textContent = 'Press play to watch the broadcast'; }); }
  }).catch(() => { $('#stream-note').textContent = 'Awaiting broadcast configuration'; });
})();
