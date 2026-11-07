(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const app = $('#app'), modalRoot = $('#modalRoot'), toastRoot = $('#toastRoot');
  const state = {
    user: null, page: 'home', repo: null, file: null, developer: null, developerRepos: [], repos: [], developers: [], query: '', language: localStorage.getItem('cv-lang') || 'uz',
    theme: localStorage.getItem('cv-theme') || 'midnight', registerRole: 'developer'
  };
  let selectedAvatarData = null;
  const translations = {
    uz: { explore: 'Ochiq loyihalar', tagline: 'Loyihalaringiz uchun tartibli va zamonaviy makon.', sub: 'Loyihalarni kashf eting, havolalar va rasmlarni ko‘ring, o‘zingiznikini ulashing.', repositories: 'Loyihalar', projects: 'loyiha', create: 'Loyiha joylash', search: 'Repozitoriylarni qidirish...', empty: 'Hozircha loyiha topilmadi.', signin: 'Kirish', signup: 'Ro‘yxatdan o‘tish', my: 'Mening profilim', logout: 'Chiqish', developer: 'Dasturchi', user: 'Foydalanuvchi', files: 'Fayllar', watch: 'Faylni tanlang', download: 'Kodni yuklab olish', addFile: 'Fayl qo‘shish', description: 'Tavsif', projectName: 'Loyiha nomi', username: 'Username', gmail: 'Gmail', password: 'Parol', role: 'Hisob turi', newProject: 'Yangi repozitoriy', newFile: 'Yangi kod fayli', fileName: 'Fayl nomi (masalan: src/app.js)', code: 'Kod matni', save: 'Saqlash', cancel: 'Bekor qilish', noFiles: 'Bu repozitoriyda fayl yo‘q.', signRequired: 'Kirish talab qilinadi', signRequiredText: 'Bu amalni bajarish uchun CodeVault hisobingizga kiring.', switchLogin: 'Hisobingiz bormi? Kirish', switchSignup: 'Hisobingiz yo‘qmi? Ro‘yxatdan o‘ting', welcome: 'Xush kelibsiz', profile: 'Profil', theme: 'Interfeys ranglari', chooseFile: 'Faylni tanlang', delete: 'O‘chirish', language: 'Til', noProjects: 'Hali loyihangiz yo‘q.', createFirst: 'Birinchi loyihangizni yarating.', updated: 'Yangilangan', owner: 'Muallif', email: 'Email', roleDeveloper: 'Developer — loyiha yaratish va boshqarish', roleUser: 'User — ko‘rish va yuklab olish', about: 'CodeVault — loyihalaringizni namoyish qilish maydoni.' },
    en: { explore: 'Explore projects', tagline: 'A clean, modern home for your projects.', sub: 'Discover projects, open links, view previews and share your own.', repositories: 'Projects', projects: 'projects', create: 'Publish project', search: 'Search repositories...', empty: 'No projects found yet.', signin: 'Sign in', signup: 'Create account', my: 'My profile', logout: 'Sign out', developer: 'Developer', user: 'User', files: 'Files', watch: 'Choose a file', download: 'Download source', addFile: 'Add file', description: 'Description', projectName: 'Project name', username: 'Username', gmail: 'Gmail', password: 'Password', role: 'Account type', newProject: 'New repository', newFile: 'New code file', fileName: 'File name (e.g. src/app.js)', code: 'Code content', save: 'Save', cancel: 'Cancel', noFiles: 'This repository has no files.', signRequired: 'Sign in required', signRequiredText: 'Sign in to your CodeVault account to continue.', switchLogin: 'Already have an account? Sign in', switchSignup: 'New to CodeVault? Create account', welcome: 'Welcome', profile: 'Profile', theme: 'Appearance colors', chooseFile: 'Select a file', delete: 'Delete', language: 'Language', noProjects: 'You have no projects yet.', createFirst: 'Create your first repository.', updated: 'Updated', owner: 'Owner', email: 'Email', roleDeveloper: 'Developer — create and manage projects', roleUser: 'User — browse and download', about: 'CodeVault — a place to showcase projects.' },
    ru: { explore: 'Открытые проекты', tagline: 'Современное пространство для ваших проектов.', sub: 'Находите проекты, открывайте ссылки, смотрите изображения и делитесь своими.', repositories: 'Проекты', projects: 'проектов', create: 'Опубликовать проект', search: 'Поиск репозиториев...', empty: 'Проекты пока не найдены.', signin: 'Войти', signup: 'Регистрация', my: 'Мой профиль', logout: 'Выйти', developer: 'Разработчик', user: 'Пользователь', files: 'Файлы', watch: 'Выберите файл', download: 'Скачать код', addFile: 'Добавить файл', description: 'Описание', projectName: 'Название проекта', username: 'Имя пользователя', gmail: 'Gmail', password: 'Пароль', role: 'Тип аккаунта', newProject: 'Новый репозиторий', newFile: 'Новый файл кода', fileName: 'Имя файла (например: src/app.js)', code: 'Исходный код', save: 'Сохранить', cancel: 'Отмена', noFiles: 'В репозитории пока нет файлов.', signRequired: 'Требуется вход', signRequiredText: 'Войдите в CodeVault, чтобы продолжить.', switchLogin: 'Уже есть аккаунт? Войти', switchSignup: 'Нет аккаунта? Регистрация', welcome: 'Добро пожаловать', profile: 'Профиль', theme: 'Цвета интерфейса', chooseFile: 'Выберите файл', delete: 'Удалить', language: 'Язык', noProjects: 'У вас пока нет проектов.', createFirst: 'Создайте свой первый репозиторий.', updated: 'Обновлено', owner: 'Автор', email: 'Email', roleDeveloper: 'Developer — создание и управление', roleUser: 'User — просмотр и скачивание', about: 'CodeVault — пространство для ваших проектов.' },
    kk: { explore: 'Ашық жобалар', tagline: 'Жобаларыңызға арналған заманауи кеңістік.', sub: 'Жобаларды тауып, сілтемелер мен суреттерді қарап, өз жобаңызды бөлісіңіз.', repositories: 'Жобалар', projects: 'жоба', create: 'Жобаны жариялау', search: 'Репозиторийлерді іздеу...', empty: 'Әзірге жоба табылмады.', signin: 'Кіру', signup: 'Тіркелу', my: 'Менің профилім', logout: 'Шығу', developer: 'Әзірлеуші', user: 'Пайдаланушы', files: 'Файлдар', watch: 'Файлды таңдаңыз', download: 'Кодты жүктеу', addFile: 'Файл қосу', description: 'Сипаттама', projectName: 'Жоба атауы', username: 'Пайдаланушы аты', gmail: 'Gmail', password: 'Құпиясөз', role: 'Аккаунт түрі', newProject: 'Жаңа репозиторий', newFile: 'Жаңа код файлы', fileName: 'Файл атауы (мысалы: src/app.js)', code: 'Код мәтіні', save: 'Сақтау', cancel: 'Болдырмау', noFiles: 'Бұл репозиторийде файл жоқ.', signRequired: 'Кіру қажет', signRequiredText: 'Жалғастыру үшін CodeVault аккаунтына кіріңіз.', switchLogin: 'Аккаунтыңыз бар ма? Кіру', switchSignup: 'Аккаунтыңыз жоқ па? Тіркелу', welcome: 'Қош келдіңіз', profile: 'Профиль', theme: 'Интерфейс түстері', chooseFile: 'Файлды таңдаңыз', delete: 'Жою', language: 'Тіл', noProjects: 'Әзірге жобаңыз жоқ.', createFirst: 'Алғашқы репозиторийіңізді жасаңыз.', updated: 'Жаңартылды', owner: 'Автор', email: 'Email', roleDeveloper: 'Developer — жоба жасау және басқару', roleUser: 'User — көру және жүктеу', about: 'CodeVault — жобаларыңызды көрсету алаңы.' }
  };
  const t = key => (translations[state.language] || translations.uz)[key] || key;
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const date = s => new Date(s).toLocaleDateString();
  function toast(message, error = false) { const el = document.createElement('div'); el.className = 'toast' + (error ? ' error' : ''); el.textContent = message; toastRoot.append(el); setTimeout(() => el.remove(), 3200) }
  function successSound() { try { const Ctx = window.AudioContext || window.webkitAudioContext; if (!Ctx) return; const ctx = new Ctx(), now = ctx.currentTime;[740, 988].forEach((hz, i) => { const osc = ctx.createOscillator(), gain = ctx.createGain(); osc.type = 'sine'; osc.frequency.value = hz; gain.gain.setValueAtTime(.0001, now + i * .085); gain.gain.exponentialRampToValueAtTime(.055, now + i * .085 + .018); gain.gain.exponentialRampToValueAtTime(.0001, now + i * .085 + .19); osc.connect(gain); gain.connect(ctx.destination); osc.start(now + i * .085); osc.stop(now + i * .085 + .2) }); setTimeout(() => ctx.close(), 500) } catch (_) { } }
  async function api(url, options = {}) { const res = await fetch(url, { credentials: 'same-origin', ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } }); const data = await res.json().catch(() => ({})); if (!res.ok) throw new Error(data.error || 'Something went wrong'); return data }
  function progress(label, task) { const wrap = document.createElement('div'); wrap.className = 'progress-wrap'; wrap.innerHTML = `<div class="progress-card"><div class="liquid"><div class="liquid-fill"></div><div class="liquid-percent">0%</div></div><p>${esc(label)}</p></div>`; document.body.append(wrap); const fill = wrap.querySelector('.liquid-fill'), pct = wrap.querySelector('.liquid-percent'); let n = 0; const timer = setInterval(() => { n = Math.min(92, n + Math.max(1, (92 - n) * .08)); fill.style.height = n + '%'; pct.textContent = Math.floor(n) + '%' }, 90); return Promise.resolve().then(task).then(result => { clearInterval(timer); fill.style.height = '100%'; pct.textContent = '100%'; wrap.querySelector('p').textContent = '✓ Completed'; return new Promise(r => setTimeout(() => { wrap.remove(); r(result) }, 450)) }, err => { clearInterval(timer); wrap.remove(); throw err }) }
  function setTheme(theme) { state.theme = theme; document.body.dataset.theme = theme; localStorage.setItem('cv-theme', theme); renderThemeMenu(false); if (state.page === 'settings') render() }
  function setLanguage(lang) { state.language = lang; localStorage.setItem('cv-lang', lang); $('#language').value = lang; $('#search').placeholder = t('search'); render() }
  async function loadRepos() { const d = await api('/api/repos?q=' + encodeURIComponent(state.query)); state.repos = d.repos }
  async function loadDevelopers() { const d = await api('/api/developers'); state.developers = d.developers }
  function renderHome() { return `<section class="hero"><div><div class="eyebrow">YOUR CODE. YOUR SPACE.</div><h1>${t('tagline')}</h1><p>${t('sub')}</p><button class="btn primary" data-action="${state.user ? 'my' : 'signup'}">${state.user ? t('my') : t('signup')} ↗</button></div><div class="hero-orb">⌘</div></section><div class="section-head"><h2>${t('repositories')} <span class="muted">(${state.repos.length})</span></h2><span class="small muted">${state.repos.length} ${t('projects')}</span></div>${state.repos.length ? `<div class="repo-grid">${state.repos.map(repoCard).join('')}</div>` : `<div class="empty">${t('empty')}</div>`}<div class="section-head"><h2>Developer hamjamiyati</h2><span class="small muted">${state.developers.length} dasturchi</span></div>${state.developers.length ? `<div class="developer-grid">${state.developers.map(developerCard).join('')}</div>` : `<div class="empty">Hozircha developer profillari yo‘q.</div>`}` }

  function repoCard(r) { return `<article class="repo-card" data-action="open-repo" data-id="${r.id}">${r.projectImageData ? `<img class="repo-cover" src="${r.projectImageData}" alt="${esc(r.name)} preview">` : ''}<h3>▣ ${esc(r.name)}</h3><p>${esc(r.description || 'No description provided.')}</p><div class="repo-meta"><span><i class="repo-dot"></i>${esc(r.ownerName)}</span><span>${r.projectUrl ? '↗ Link' : '▧ Image'} · ${date(r.updatedAt)}</span></div></article>` }
  function renderRepo() { const r = state.repo; if (!r) return ''; const can = state.user?.role === 'developer' && state.user.id === r.ownerId; return `<div class="page-title"><div><div class="eyebrow">PROJECT / ${esc(r.ownerName)}</div><h1>${esc(r.name)}</h1><p>${esc(r.description || '')}</p></div><div>${can ? `<button class="btn danger" data-action="delete-repo">${t('delete')}</button>` : ''}</div></div><section class="project-showcase glass-card">${r.projectImageData ? `<img class="project-preview" src="${r.projectImageData}" alt="${esc(r.name)} preview">` : ''}${r.projectUrl ? `<a class="btn primary project-open" href="${esc(r.projectUrl)}" target="_blank" rel="noopener noreferrer">Loyihani ochish ↗</a>` : ''}</section>` }
  function developerCard(d) { const followed = (state.user?.followingIds || []).includes(d.id); return `<article class="developer-card glass-card"><button class="developer-main" data-action="open-developer" data-id="${d.id}"><span class="profile-avatar">${d.avatarUrl ? `<img src="${esc(d.avatarUrl)}" alt="">` : esc((d.displayName || d.username)[0].toUpperCase())}</span><span><b>${esc(d.displayName || d.username)}</b><small>@${esc(d.username)} · ${d.followersCount} followers</small><small>${esc(d.bio || 'Developer profile')}</small></span></button>${state.user && state.user.id !== d.id ? `<button class="btn follow-btn" data-action="${followed ? 'unfollow' : 'follow'}" data-id="${d.id}">${followed ? 'Obunani bekor qilish' : '＋ Obuna bo‘lish'}</button>` : ''}</article>` }
  function renderMy() {
    if (!state.user) return renderAuth('login'); const mine = state.repos.filter(r => r.ownerId === state.user.id); const u = state.user; return `<div class="profile-heading"><div class="eyebrow">CODEVAULT / PROFILE</div><h1>Profil</h1><p class="muted">Hisobingiz, omboringiz va developer sahifangiz.</p></div><div class="profile-card glass-card"><div class="profile-avatar">${u.avatarUrl ? `<img src="${esc(u.avatarUrl)}" alt="">` : esc((u.displayName || u.username)[0].toUpperCase())}</div><div style="flex:1"><h2>${esc(u.displayName || u.username)}</h2><p>@${esc(u.username)} · ${esc(u.email)}</p><p>${esc(u.role)}</p></div><span class="tag">${u.role}</span></div><section class="settings-card glass-card"><div class="settings-title"><span class="settings-symbol">✎</span><div><h2>Profilni to‘ldirish</h2><p>Ma’lumotlar ixtiyoriy. Developer profilingiz boshqalarga ko‘rinadi.</p></div></div><form id="profileForm"><div class="profile-form-grid"><div class="field"><label>Ko‘rinadigan ism</label><input name="displayName" maxlength="60" value="${esc(u.displayName || '')}" placeholder="Ism yoki taxallus"></div>     <div class="field"><label>Joylashuv</label><input name="location" maxlength="80" value="${esc(u.location || '')}" placeholder="Masalan: Tashkent, Uzbekistan"></div><div class="field"><label>Website (https://)</label><input name="website" type="url" value="${esc(u.website || '')}" placeholder="https://example.com"></div><div class="field"><label>GitHub username</label><input name="github" maxlength="39" value="${esc(u.github || '')}" placeholder="username"></div>   
    
    
<div class="field full">
    <label>Profil rasmi</label>

    <div class="avatar-upload">
        <div class="profile-avatar" id="avatarPreview">
            ${u.avatarUrl
                ? `<img src="${esc(u.avatarUrl)}" alt="Avatar">`
                : esc((u.displayName || u.username)[0].toUpperCase())}
        </div>

        <div>
            <input
                type="file"
                id="avatarPicker"
                accept="image/png,image/jpeg,image/webp"
                hidden
            >

            <button type="button" class="btn" id="chooseAvatar">
                📁 Galereyadan tanlash
            </button>

            <small id="avatarFileName">Rasm tanlanmagan</small>
        </div>
    </div>
</div>


</div>  <div class="field full"><label>Bio / O‘zingiz haqingizda</label><textarea name="bio" maxlength="700" placeholder="Tajriba, qiziqishlar, maqsadlar...">${esc(u.bio || '')}</textarea></div><div class="field full"><label>Ko‘nikmalar (vergul bilan ajrating, 12 tagacha)</label><input name="skills" value="${esc((u.skills || []).join(', '))}" placeholder="JavaScript, Node.js, UI/UX"></div></div><button class="btn primary" type="submit">Profilni saqlash</button></form></section><div class="section-head"><h2>${t('my')}</h2>${u.role === 'developer' ? `<button class="btn primary" data-action="new-project">＋ ${t('create')}</button>` : ''}</div>${mine.length ? `<div class="repo-grid">${mine.map(repoCard).join('')}</div>` : `<div class="empty glass-card">${t('noProjects')}<br><br>${u.role === 'developer' ? t('createFirst') : 'Explore public repositories.'}</div>`}<div class="section-head"><h2>Obuna bo‘lgan developerlar</h2></div><div class="developer-grid">${state.developers.filter(d => (u.followingIds || []).includes(d.id)).map(developerCard).join('') || '<div class="empty">Hozircha obuna yo‘q.</div>'}</div><div class="profile-actions"><button class="btn danger glass-button" data-action="logout">${t('logout')}</button></div>`
  }
  function renderDeveloper() { const d = state.developer; if (!d) return '<div class="empty">Developer topilmadi.</div>'; const followed = (state.user?.followingIds || []).includes(d.id); return `<div class="profile-heading"><div class="eyebrow">CODEVAULT / DEVELOPER</div><h1>${esc(d.displayName || d.username)}</h1><p class="muted">@${esc(d.username)} · ${d.followersCount} followers</p></div><section class="profile-card glass-card"><div class="profile-avatar">${d.avatarUrl ? `<img src="${esc(d.avatarUrl)}" alt="">` : esc((d.displayName || d.username)[0].toUpperCase())}</div><div style="flex:1"><h2>${esc(d.displayName || d.username)}</h2><p>${esc(d.location || '')}</p><p>${esc(d.bio || 'Developer hali bio qo‘shmagan.')}</p></div>${state.user && state.user.id !== d.id ? `<button class="btn primary" data-action="${followed ? 'unfollow' : 'follow'}" data-id="${d.id}">${followed ? 'Obunani bekor qilish' : '＋ Obuna bo‘lish'}</button>` : ''}</section><section class="settings-card glass-card"><h3>Ko‘nikmalar</h3><div class="skill-list">${(d.skills || []).map(x => `<span class="skill-chip">${esc(x)}</span>`).join('') || '<span class="muted">Ko‘nikmalar kiritilmagan.</span>'}</div><p>${d.website ? `<a href="${esc(d.website)}" target="_blank" rel="noopener">Website ↗</a>` : ''} ${d.github ? `<a href="https://github.com/${encodeURIComponent(d.github)}" target="_blank" rel="noopener">GitHub ↗</a>` : ''}</p></section><div class="section-head"><h2>Loyihalari</h2></div>${state.developerRepos.length ? `<div class="repo-grid">${state.developerRepos.map(repoCard).join('')}</div>` : '<div class="empty">Bu developer hozircha loyiha joylamagan.</div>'}` }

  function renderSettings() { const names = [['midnight', 'Midnight'], ['light', 'Daylight'], ['ocean', 'Ocean'], ['violet', 'Violet'], ['rose', 'Rose'], ['amber', 'Amber'], ['cyan', 'Cyan'], ['forest', 'Forest'], ['slate', 'Slate']]; return `<div class="settings-page"><div class="eyebrow">CODEVAULT / PREFERENCES</div><h1>Sozlamalar</h1><p class="muted settings-intro">Ilova ko‘rinishini o‘zingizga moslang.</p><section class="settings-card glass-card"><div class="settings-title"><span class="settings-symbol">◐</span><div><h2>Interfeys ko‘rinishi</h2><p>Rang va kayfiyatni tanlang</p></div></div><div class="theme-grid settings-themes">${names.map(([v, n]) => `<button class="theme-choice ${state.theme === v ? 'active' : ''}" data-action="theme" data-theme="${v}"><span class="theme-dot theme-${v}"></span>${n}</button>`).join('')}</div></section><section class="settings-card glass-card"><div class="settings-title"><span class="settings-symbol">文</span><div><h2>Til / Language</h2><p>Ilova tilini tanlang</p></div></div><select class="settings-language" id="settingsLanguage"><option value="uz" ${state.language === 'uz' ? 'selected' : ''}>O‘zbekcha</option><option value="en" ${state.language === 'en' ? 'selected' : ''}>English</option><option value="ru" ${state.language === 'ru' ? 'selected' : ''}>Русский</option><option value="kk" ${state.language === 'kk' ? 'selected' : ''}>Қазақша</option></select></section><section class="settings-card glass-card"><div class="settings-title"><span class="settings-symbol">ⓘ</span><div><h2>CodeVault</h2><p>Version 1.1 · Your code, your space.</p></div></div></section></div>` }
  function renderAuth(mode) { const signup = mode === 'signup'; return `<div class="form-card"><div class="eyebrow">CODEVAULT ACCOUNT</div><h2>${signup ? t('signup') : t('signin')}</h2><p>${t('about')}</p><form id="authForm">${signup ? `<div class="field"><label>${t('username')}</label><input name="username" required minlength="3" maxlength="24" pattern="[A-Za-z0-9_]+" placeholder="your_username"></div>` : ''}<div class="field"><label>${t('gmail')}</label><input name="email" type="email" required placeholder="name@gmail.com"></div><div class="field"><label>${t('password')}</label><input name="password" type="password" required minlength="8" maxlength="72" placeholder="••••••••"></div>${signup ? `<div class="field"><label>${t('role')}</label><div class="role-pick"><button type="button" class="role-option ${state.registerRole === 'developer' ? 'selected' : ''}" data-action="role" data-role="developer">⌘<br><b>Developer</b><br><span class="small muted">${t('roleDeveloper')}</span></button><button type="button" class="role-option ${state.registerRole === 'user' ? 'selected' : ''}" data-action="role" data-role="user">◉<br><b>User</b><br><span class="small muted">${t('roleUser')}</span></button></div></div>` : ''}<button class="btn primary" style="width:100%;margin-top:8px" type="submit">${signup ? t('signup') : t('signin')} →</button></form><div class="form-footer"><span>${signup ? t('switchLogin') : t('switchSignup')}</span><a data-action="${signup ? 'login' : 'signup'}">${signup ? t('signin') : t('signup')}</a></div></div>` }
  function render() { if (state.user && (state.page === 'login' || state.page === 'signup')) state.page = 'my'; document.body.dataset.theme = state.theme; $('#language').value = state.language; $('#search').placeholder = t('search'); if (state.page === 'home') app.innerHTML = renderHome(); else if (state.page === 'repo') app.innerHTML = renderRepo(); else if (state.page === 'my') app.innerHTML = renderMy(); else if (state.page === 'settings') app.innerHTML = renderSettings(); else if (state.page === 'developer') app.innerHTML = renderDeveloper(); else if (state.page === 'login' || state.page === 'signup') app.innerHTML = renderAuth(state.page); else app.innerHTML = renderHome(); document.querySelectorAll('.dock-item').forEach(b => b.classList.toggle('active', b.dataset.nav === state.page || (state.page === 'repo' && b.dataset.nav === 'home') || (state.page === 'developer' && b.dataset.nav === 'home'))); updateDockSlider(); app.classList.remove('page-enter'); void app.offsetWidth; app.classList.add('page-enter'); app.querySelectorAll('.hero,.section-head,.repo-card,.profile-card,.page-title,.repo-layout,.form-card,.settings-card,.empty,.profile-heading').forEach((el, i) => { el.style.setProperty('--enter-delay', Math.min(i, 10) * 55 + 'ms'); el.classList.add('reveal-item') }); }
  async function go(page) { state.page = page; state.repo = null; state.file = null; history.pushState({ page }, '', page === 'home' ? '/' : `#${page}`); if (page === 'home' || page === 'my') await Promise.all([loadRepos(), loadDevelopers()]); render() }
  async function openDeveloper(id) { const d = await api('/api/developers/' + id); state.developer = d.developer; state.developerRepos = d.repos; state.page = 'developer'; history.pushState({ page: 'developer', id }, '', '#developer/' + id); render() }
  async function openRepo(id) { const d = await api('/api/repos/' + id); state.repo = d.repo; state.file = null; state.page = 'repo'; history.pushState({ page: 'repo', id }, '', '#repo/' + id); render() }
  function modal(title, body, actions) { modalRoot.innerHTML = `<div class="modal-backdrop"><div class="modal glass-card" role="dialog" aria-modal="true"><h3>${title}</h3>${body}<div class="modal-actions">${actions}</div></div></div>`; const backdrop = modalRoot.querySelector('.modal-backdrop'); backdrop.addEventListener('click', e => { if (e.target === backdrop) modalRoot.innerHTML = '' }); }
  function requireSign() { modal(t('signRequired'), `<p>${t('signRequiredText')}</p>`, `<button class="btn" data-action="close-modal">${t('cancel')}</button><button class="btn primary" data-action="login">${t('signin')}</button>`) }

  function renderThemeMenu(toggle = true) { let old = $('.theme-pop'); if (old) old.remove(); if (!toggle) return; const names = [['midnight', 'Midnight'], ['light', 'Daylight'], ['ocean', 'Ocean'], ['violet', 'Violet'], ['rose', 'Rose'], ['amber', 'Amber'], ['cyan', 'Cyan'], ['forest', 'Forest'], ['slate', 'Slate']]; const el = document.createElement('div'); el.className = 'theme-pop'; el.innerHTML = `<div class="panel-head" style="padding:4px 2px 12px;border:0">${t('theme')}</div><div class="theme-grid">${names.map(([v, n]) => `<button class="theme-choice ${state.theme === v ? 'active' : ''}" data-action="theme" data-theme="${v}">◉ ${n}</button>`).join('')}</div>`; document.body.append(el) }
  // Floating, manually draggable Liquid Glass dock indicator.
  let dockDrag = null;
  function dockButtons() { return [...document.querySelectorAll('#mainDock .dock-item')]; }
  function setDockIndicatorTo(button, instant = false) {
    const dock = $('#mainDock'), indicator = $('#dockIndicator');
    if (!dock || !indicator || !button) return;
    const x = button.offsetLeft + (button.offsetWidth - indicator.offsetWidth) / 2;
    indicator.style.transition = instant ? 'none' : '';
    indicator.style.setProperty('--dock-x', `${x}px`);
    indicator.classList.add('ready');
    if (instant) requestAnimationFrame(() => indicator.style.transition = '');
  }
  function updateDockSlider() {
    const buttons = dockButtons(); if (!buttons.length) return;
    const page = (state.page === 'repo' || state.page === 'developer' || state.page === 'login' || state.page === 'signup') ? 'home' : state.page;
    const active = buttons.find(b => b.dataset.nav === page) || buttons[0];
    requestAnimationFrame(() => setDockIndicatorTo(active));
  }
  (function initDockDrag() {
    const dock = $('#mainDock'), indicator = $('#dockIndicator'); if (!dock || !indicator) return;
    indicator.addEventListener('pointerdown', e => {
      dockDrag = { startX: e.clientX, offset: parseFloat(getComputedStyle(indicator).getPropertyValue('--dock-x')) || 0, moved: false };
      indicator.setPointerCapture(e.pointerId); indicator.classList.add('dragging'); e.preventDefault();
    });
    indicator.addEventListener('pointermove', e => {
      if (!dockDrag) return;
      const max = dock.clientWidth - indicator.offsetWidth - 12;
      const x = Math.max(6, Math.min(max, dockDrag.offset + (e.clientX - dockDrag.startX)));
      if (Math.abs(e.clientX - dockDrag.startX) > 5) dockDrag.moved = true;
      indicator.style.setProperty('--dock-x', `${x}px`);
    });
    indicator.addEventListener('pointerup', e => {
      if (!dockDrag) return;
      const wasMoved = dockDrag.moved; dockDrag = null; indicator.classList.remove('dragging');
      const center = indicator.getBoundingClientRect().left + indicator.offsetWidth / 2;
      const nearest = dockButtons().sort((a, b) => Math.abs(a.getBoundingClientRect().left + a.offsetWidth / 2 - center) - Math.abs(b.getBoundingClientRect().left + b.offsetWidth / 2 - center))[0];
      if (wasMoved && nearest) { setDockIndicatorTo(nearest); go(nearest.dataset.nav) } else updateDockSlider();
    });
    indicator.addEventListener('pointercancel', () => { dockDrag = null; indicator.classList.remove('dragging'); updateDockSlider() });
    window.addEventListener('resize', updateDockSlider);
  })();
  $('#themeButton').addEventListener('click', () => renderThemeMenu());
  $('#language').addEventListener('change', e => setLanguage(e.target.value)); document.addEventListener('change', e => { if (e.target.id === 'settingsLanguage') setLanguage(e.target.value) });


  let searchTimer;

  $('#search').addEventListener('input', e => {
    state.query = e.target.value;

    clearTimeout(searchTimer);

    searchTimer = setTimeout(async () => {
      if (state.page !== 'home') return;

      try {
        await loadRepos();

        const grid = app.querySelector('.repo-grid');
        const empty = app.querySelector('.empty');
        const sectionHeads = app.querySelectorAll('.section-head');

        if (!grid && !empty) return;

        const results = state.repos.length
          ? `<div class="repo-grid">${state.repos.map(repoCard).join('')}</div>`
          : `<div class="empty">${t('empty')}</div>`;

        if (grid) {
          grid.outerHTML = results;
        } else {
          empty.outerHTML = results;
        }

        if (sectionHeads[0]) {
          sectionHeads[0].querySelector('h2').innerHTML =
            `${t('repositories')} <span class="muted">(${state.repos.length})</span>`;

          sectionHeads[0].querySelector('.small').textContent =
            `${state.repos.length} ${t('projects')}`;
        }

      } catch (err) {
        toast(err.message, true);
      }
    }, 250);
  });
  $('#accountButton').addEventListener('click', () => go(state.user ? 'my' : 'login'));
  document.addEventListener('click', async e => {
    const el = e.target.closest('[data-action],[data-nav]'); if (!el) return; const nav = el.dataset.nav; if (nav) { e.preventDefault(); return go(['home', 'my', 'settings'].includes(nav) ? nav : 'home') } const a = el.dataset.action;
    try {
      if (a === 'signup' || a === 'login') { modalRoot.innerHTML = ''; return go(state.user ? 'my' : a) }
      if (a === 'close-modal') { modalRoot.innerHTML = ''; return }
      if (a === 'role') { state.registerRole = el.dataset.role; render(); return }
      if (a === 'open-repo') return openRepo(el.dataset.id);
      if (a === 'open-developer') return openDeveloper(el.dataset.id);
      if (a === 'follow' || a === 'unfollow') { if (!state.user) return requireSign(); const method = a === 'follow' ? 'POST' : 'DELETE'; await api(`/api/developers/${el.dataset.id}/follow`, { method }); state.user.followingIds = state.user.followingIds || []; if (a === 'follow' && !state.user.followingIds.includes(el.dataset.id)) state.user.followingIds.push(el.dataset.id); if (a === 'unfollow') state.user.followingIds = state.user.followingIds.filter(x => x !== el.dataset.id); await loadDevelopers(); if (state.page === 'developer') return openDeveloper(el.dataset.id); render(); toast(a === 'follow' ? 'Developerga obuna bo‘lindi' : 'Obuna bekor qilindi'); return }
      if (a === 'new-project') { if (!state.user) return requireSign(); modal(t('newProject'), `<form id="projectForm"><div class="field"><label>${t('projectName')}</label><input name="name" required maxlength="60" placeholder="My portfolio"></div><div class="field"><label>${t('description')} (ixtiyoriy)</label><textarea name="description" maxlength="500" placeholder="Loyiha haqida qisqacha..."></textarea></div><div class="field"><label>Project link (ixtiyoriy)</label><input name="projectUrl" type="url" placeholder="https://example.com"></div><div class="field"><label>Yoki loyiha rasmini tanlang</label><input id="projectImagePicker" type="file" accept="image/png,image/jpeg,image/webp,image/gif"><small id="projectImageName" class="muted">Link yoki rasmning bittasi yetarli.</small><img id="projectImagePreview" class="project-upload-preview" alt="Preview" hidden></div></form>`, `<button class="btn" data-action="close-modal">${t('cancel')}</button><button class="btn primary" form="projectForm">${t('save')}</button>`); $('#projectImagePicker').addEventListener('change', ev => { const f = ev.target.files[0], preview = $('#projectImagePreview'); if (!f) return; if (f.size > 500 * 1024) { toast('Rasm hajmi 500 KB dan oshmasin.', true); ev.target.value = ''; return } const reader = new FileReader(); reader.onload = () => { preview.src = reader.result; preview.hidden = false; $('#projectImageName').textContent = `${f.name} · ${Math.ceil(f.size / 1024)} KB` }; reader.readAsDataURL(f) }); return } if (a === 'delete-repo') { if (!confirm('Delete this repository and its files?')) return; await api(`/api/repos/${state.repo.id}`, { method: 'DELETE' }); await go('my'); toast('Repository deleted'); return }
      if (a === 'logout') { await api('/api/auth/logout', { method: 'POST' }); state.user = null; toast('Signed out'); return go('home') }
      if (a === 'theme') { setTheme(el.dataset.theme); return }
    } catch (err) { toast(err.message, true) }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modalRoot.firstElementChild) modalRoot.innerHTML = '' });
// Avatar tanlash
document.addEventListener('click', e => {
    if (e.target.closest('#chooseAvatar')) {
        $('#avatarPicker')?.click();
    }
});

document.addEventListener('change', e => {
    if (e.target.id !== 'avatarPicker') return;

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        toast('Faqat rasm faylini tanlang', true);
        return;
    }

    $('#avatarFileName').textContent = file.name;
});

// Form yuborish
document.addEventListener('submit', async e => {
    // Sening avvalgi koding...
});
  document.addEventListener('submit', async e => {
    if (e.target.id === 'profileForm') { e.preventDefault(); const body = Object.fromEntries(new FormData(e.target).entries()); body.avatarUrl = selectedAvatarData || state.user.avatarUrl || '';body.skills = String(body.skills || '').split(',').map(x => x.trim()).filter(Boolean).slice(0, 12); try { const d = await api('/api/profile', { method: 'PATCH', body: JSON.stringify(body) }); state.user = d.user; selectedAvatarData = null ;toast('Profil saqlandi'); await loadDevelopers(); render() } catch (err) { toast(err.message, true) } }
    if (e.target.id === 'authForm') { e.preventDefault(); const fd = new FormData(e.target), signup = state.page === 'signup'; try { const body = Object.fromEntries(fd.entries()); if (signup) body.role = state.registerRole; const d = await progress(signup ? 'Creating your account…' : 'Signing in…', () => api('/api/auth/' + (signup ? 'register' : 'login'), { method: 'POST', body: JSON.stringify(body) })); state.user = d.user; toast('Welcome to CodeVault'); await go('my') } catch (err) { toast(err.message, true) } }
    if (e.target.id === 'projectForm') { e.preventDefault(); const form = e.target, body = Object.fromEntries(new FormData(form).entries()), imageFile = $('#projectImagePicker')?.files?.[0]; try { if (imageFile) { body.projectImageData = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('Rasmni o‘qib bo‘lmadi.')); reader.readAsDataURL(imageFile) }) } await progress('Publishing project…', () => api('/api/repos', { method: 'POST', body: JSON.stringify(body) })); modalRoot.innerHTML = ''; await loadRepos(); const r = state.repos.find(x => x.name === body.name && x.ownerId === state.user.id); if (r) await openRepo(r.id); else await go('my'); toast('Loyiha muvaffaqiyatli joylandi'); successSound() } catch (err) { toast(err.message, true) } }
  });
  window.addEventListener('popstate', async () => { const hash = location.hash; if (hash.startsWith('#repo/')) { const d = await api('/api/repos/' + hash.split('/')[1]); state.repo = d.repo; state.file = null; state.page = 'repo'; render() } else if (hash.startsWith('#developer/')) { await openDeveloper(hash.split('/')[1]) } else { state.page = ['my', 'settings', 'login', 'signup'].includes(hash.slice(1)) ? hash.slice(1) : 'home'; state.repo = null; state.file = null; if (state.page === 'home' || state.page === 'my') await Promise.all([loadRepos(), loadDevelopers()]); render() } });
  (async () => { try { const [me] = await Promise.all([api('/api/me'), loadRepos(), loadDevelopers()]); state.user = me.user; render() } catch (e) { render(); toast(e.message, true) } })();
})();