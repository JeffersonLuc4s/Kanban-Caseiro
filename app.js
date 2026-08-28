const STORAGE_KEY = 'organiza-kanban-cards';
const IDEAS_STORAGE_KEY = 'organiza-ideas';
const statuses = { backlog: 'CAIXA DE ENTRADA', doing: 'EM PRODUÇÃO', done: 'CONCLUÍDO' };
const priorityLabels = { low: 'tranquilo', medium: 'importante', high: 'urgente' };
const WORKFLOWS_STORAGE_KEY = 'organiza-workflows';
const SCRIPTS_STORAGE_KEY = 'organiza-scripts';
const REFERENCES_STORAGE_KEY = 'organiza-references';
const SCRIPT_SPEAKING_RATE = 150;
const HISTORY_STORAGE_KEY = 'organiza-daily-history';
const SUPABASE_URL = 'https://bflozrxprlgurhhtrtvd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_dzLx3RfdGPukXv2cbWVQfQ_gbsNTYdT';
const TRANSFER_BUCKET = 'device-transfers';
const SUPABASE_PROJECT_ID = new URL(SUPABASE_URL).hostname.split('.')[0];
const TRANSFER_RESUMABLE_ENDPOINT = `https://${SUPABASE_PROJECT_ID}.storage.supabase.co/storage/v1/upload/resumable`;
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
let currentUser = null;
let cloudSaveTimer = null;
let loadingCloudData = false;
const seedCards = [
  { id: 'seed-1', title: 'Definir prioridades da semana', description: 'Escolher as três coisas que realmente merecem minha atenção nos próximos dias.', priority: 'high', status: 'doing', createdAt: Date.now() - 86400000 },
  { id: 'seed-2', title: 'Organizar referências do projeto', description: 'Juntar links, anotações e inspirações em um só lugar.', priority: 'medium', status: 'backlog', createdAt: Date.now() - 172800000 },
  { id: 'seed-3', title: 'Revisar orçamento mensal', description: '', priority: 'low', status: 'backlog', createdAt: Date.now() - 259200000 },
  { id: 'seed-4', title: 'Configurar meu espaço', description: 'O quadro está pronto para receber as próximas ideias.', priority: 'low', status: 'done', createdAt: Date.now() - 345600000 }
];

let cards = loadCards();
let ideas = loadIdeas();
let workflows = loadWorkflows();
let scripts = loadScripts();
let referenceCollections = loadReferenceCollections();
let historyEntries = loadHistoryEntries();
let selectedHistoryDate = getTodayDate();
applyDailyRollover();
let selectedScriptId = scripts[0]?.id;
let selectedScriptCategory = scripts[0]?.category || scripts[0]?.name;
let selectedReferenceCollectionId = referenceCollections[0]?.id;
let editingReferenceId = null;
let transferFiles = [];
let pendingTransferPath = null;
let namingScriptId = null;
let namingScriptMode = 'script';
let selectedWorkflowId = workflows[0]?.id;
let editingWorkflowCardId = null;
let connectMode = false;
let connectSourceId = null;
let connectionAction = 'connect';
let namingWorkflowId = null;
let editingId = null;
const modalBackdrop = document.querySelector('#modalBackdrop');
const cardForm = document.querySelector('#cardForm');
const cardTitle = document.querySelector('#cardTitle');
const cardDescription = document.querySelector('#cardDescription');
const cardPriority = document.querySelector('#cardPriority');
const cardStatus = document.querySelector('#cardStatus');
const modalTitle = document.querySelector('#modalTitle');
const modalStatusLabel = document.querySelector('#modalStatusLabel');
const deleteCardButton = document.querySelector('#deleteCardButton');
const ideaModalBackdrop = document.querySelector('#ideaModalBackdrop');
const editIdeaForm = document.querySelector('#editIdeaForm');
const editIdeaTitle = document.querySelector('#editIdeaTitle');
const editIdeaDescription = document.querySelector('#editIdeaDescription');
let editingIdeaId = null;
const kanbanPage = document.querySelector('#kanbanPage');
const ideasPage = document.querySelector('#ideasPage');
const kanbanNav = document.querySelector('#kanbanNav');
const ideasNav = document.querySelector('#ideasNav');
const workflowNav = document.querySelector('#workflowNav');
const scriptsPage = document.querySelector('#scriptsPage');
const workflowPage = document.querySelector('#workflowPage');
const workflowTabs = document.querySelector('#workflowTabs');
const workflowNodes = document.querySelector('#workflowNodes');
const workflowLines = document.querySelector('#workflowLines');
const workflowCanvas = document.querySelector('#workflowCanvas');
const workflowEmpty = document.querySelector('#workflowEmpty');
const workflowModalBackdrop = document.querySelector('#workflowModalBackdrop');
const workflowCardForm = document.querySelector('#workflowCardForm');
const workflowCardTitle = document.querySelector('#workflowCardTitle');
const workflowCardDescription = document.querySelector('#workflowCardDescription');
const workflowImageInput = document.querySelector('#workflowImageInput');
const deleteWorkflowCard = document.querySelector('#deleteWorkflowCard');
const workflowNameModalBackdrop = document.querySelector('#workflowNameModalBackdrop');
const workflowNameForm = document.querySelector('#workflowNameForm');
const workflowNameInput = document.querySelector('#workflowNameInput');
const scriptsNav = document.querySelector('#scriptsNav');
const planningNav = document.querySelector('#planningNav');
const planningPage = document.querySelector('#planningPage');
const referencesNav = document.querySelector('#referencesNav');
const referencesPage = document.querySelector('#referencesPage');
const transfersNav = document.querySelector('#transfersNav');
const transfersPage = document.querySelector('#transfersPage');
const transferFileInput = document.querySelector('#transferFileInput');
const transferGrid = document.querySelector('#transferGrid');
const transferUploadStatus = document.querySelector('#transferUploadStatus');
const deleteTransferModalBackdrop = document.querySelector('#deleteTransferModalBackdrop');
const referenceCollectionsElement = document.querySelector('#referenceCollections');
const referenceGrid = document.querySelector('#referenceGrid');
const referenceImageInput = document.querySelector('#referenceImageInput');
const referenceModalBackdrop = document.querySelector('#referenceModalBackdrop');
const referenceForm = document.querySelector('#referenceForm');
const referenceTitle = document.querySelector('#referenceTitle');
const referenceNotes = document.querySelector('#referenceNotes');
const referenceCollectionModalBackdrop = document.querySelector('#referenceCollectionModalBackdrop');
const referenceCollectionForm = document.querySelector('#referenceCollectionForm');
const referenceCollectionName = document.querySelector('#referenceCollectionName');
const deleteReferenceCollectionModalBackdrop = document.querySelector('#deleteReferenceCollectionModalBackdrop');
const siteToast = document.querySelector('#siteToast');
let siteToastTimer = null;
const planningForm = document.querySelector('#planningForm');
const planningTitle = document.querySelector('#planningTitle');
const planningDescription = document.querySelector('#planningDescription');
const planningPriority = document.querySelector('#planningPriority');
const plannedList = document.querySelector('#plannedList');
const scriptTabs = document.querySelector('#scriptTabs');
const scriptList = document.querySelector('#scriptList');
const scriptCategoryName = document.querySelector('#scriptCategoryName');
const scriptCategoryCount = document.querySelector('#scriptCategoryCount');
const deleteScriptButton = document.querySelector('#deleteScriptButton');
const scriptTitle = document.querySelector('#scriptTitle');
const scriptBody = document.querySelector('#scriptBody');
const scriptSaved = document.querySelector('#scriptSaved');
const scriptNameModalBackdrop = document.querySelector('#scriptNameModalBackdrop');
const scriptNameForm = document.querySelector('#scriptNameForm');
const scriptNameInput = document.querySelector('#scriptNameInput');
const historyDate = document.querySelector('#historyDate');
const dailyEntryForm = document.querySelector('#dailyEntryForm');
const dailyEntryText = document.querySelector('#dailyEntryText');
const entryDateLabel = document.querySelector('#entryDateLabel');
const entrySavedStatus = document.querySelector('#entrySavedStatus');

function loadCards() {
  try {
    const savedCards = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedCards) ? savedCards : seedCards;
  } catch (error) {
    return seedCards;
  }
}

function loadIdeas() {
  try {
    const savedIdeas = JSON.parse(localStorage.getItem(IDEAS_STORAGE_KEY));
    return Array.isArray(savedIdeas) ? savedIdeas : [];
  } catch (error) {
    return [];
  }
}

function loadWorkflows() {
  try {
    const savedWorkflows = JSON.parse(localStorage.getItem(WORKFLOWS_STORAGE_KEY));
    if (Array.isArray(savedWorkflows) && savedWorkflows.length) return savedWorkflows;
  } catch (error) {
    // Use the starter workflow when saved data is unavailable.
  }
  return [{ id: crypto.randomUUID(), name: 'Vídeos de IA para TikTok Shop', nodes: [{ id: crypto.randomUUID(), title: 'Definir produto', description: 'Escolher o produto e o ângulo do vídeo.', x: 50, y: 55 }, { id: crypto.randomUUID(), title: 'Criar roteiro', description: 'Escrever o gancho, demonstração e chamada para ação.', x: 330, y: 185 }, { id: crypto.randomUUID(), title: 'Publicar no TikTok Shop', description: 'Revisar, exportar e publicar o vídeo.', x: 610, y: 55 }], links: [] }];
}

function loadScripts() {
  try {
    const savedScripts = JSON.parse(localStorage.getItem(SCRIPTS_STORAGE_KEY));
    if (Array.isArray(savedScripts) && savedScripts.length) return savedScripts.map((script) => ({ ...script, category: script.category || script.name, name: script.category ? (script.name || script.title || 'Novo roteiro') : (script.title || script.name || 'Novo roteiro') }));
  } catch (error) {
    // Fall through to starter scripts.
  }
  return [
    { id: crypto.randomUUID(), name: 'Roteiro: vídeo longo', category: 'Vídeos do YouTube (longo)', title: 'Roteiro: vídeo longo', body: '<p><strong>Abertura</strong></p><p>Apresente o tema e a promessa do vídeo.</p><ul><li>Gancho nos primeiros segundos</li><li>Contexto rápido para quem chegou agora</li></ul><p><strong>Desenvolvimento</strong></p><ol><li>Explique o primeiro ponto</li><li>Mostre um exemplo prático</li></ol>', updatedAt: Date.now() },
    { id: crypto.randomUUID(), name: 'Roteiro: vídeo curto', category: 'TikTok / Reels', title: 'Roteiro: vídeo curto', body: '<p>Gancho direto e visual.</p><ul><li>Problema</li><li>Solução</li><li>Chamada para ação</li></ul>', updatedAt: Date.now() }
  ];
}

function getTodayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
}

function loadHistoryEntries() {
  try {
    const savedEntries = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY));
    return Array.isArray(savedEntries) ? savedEntries : [];
  } catch (error) {
    return [];
  }
}

function saveHistoryEntries() {
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyEntries));
  scheduleCloudSave();
}

function loadReferenceCollections() {
  try {
    const savedCollections = JSON.parse(localStorage.getItem(REFERENCES_STORAGE_KEY));
    return Array.isArray(savedCollections) ? savedCollections : [];
  } catch (error) {
    return [];
  }
}

function getWorkspaceData() {
  return { cards, ideas, workflows, scripts, referenceCollections, historyEntries, version: 2 };
}

function saveWorkspaceLocally() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(ideas));
  localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(workflows));
  localStorage.setItem(SCRIPTS_STORAGE_KEY, JSON.stringify(scripts));
  localStorage.setItem(REFERENCES_STORAGE_KEY, JSON.stringify(referenceCollections));
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historyEntries));
}

function renderWorkspace() {
  render();
  renderIdeas();
  renderWorkflows();
  renderScripts();
  renderReferences();
  renderHistory();
  renderPlanning();
}

async function persistCloudData() {
  if (!currentUser || loadingCloudData) return;
  const { error } = await supabaseClient.from('user_workspaces').upsert({ user_id: currentUser.id, data: getWorkspaceData(), updated_at: new Date().toISOString() });
  if (error) {
    document.querySelectorAll('.saved-status').forEach((item) => { item.textContent = 'erro ao sincronizar'; });
    console.error('Falha ao sincronizar workspace:', error.message);
  }
}

function scheduleCloudSave() {
  if (!currentUser || loadingCloudData) return;
  clearTimeout(cloudSaveTimer);
  cloudSaveTimer = setTimeout(persistCloudData, 500);
}

async function loadCloudWorkspace() {
  loadingCloudData = true;
  const { data, error } = await supabaseClient.from('user_workspaces').select('data').eq('user_id', currentUser.id).maybeSingle();
  if (error) {
    loadingCloudData = false;
    throw error;
  }
  if (data?.data) {
    cards = Array.isArray(data.data.cards) ? data.data.cards : [];
    ideas = Array.isArray(data.data.ideas) ? data.data.ideas : [];
    workflows = Array.isArray(data.data.workflows) && data.data.workflows.length ? data.data.workflows : workflows;
    scripts = Array.isArray(data.data.scripts) && data.data.scripts.length ? data.data.scripts : scripts;
    referenceCollections = Array.isArray(data.data.referenceCollections) ? data.data.referenceCollections : referenceCollections;
    historyEntries = Array.isArray(data.data.historyEntries) ? data.data.historyEntries : [];
    selectedWorkflowId = workflows[0]?.id;
    selectedScriptId = scripts[0]?.id;
    selectedScriptCategory = scripts[0]?.category || scripts[0]?.name;
    selectedReferenceCollectionId = referenceCollections[0]?.id;
    saveWorkspaceLocally();
  }
  applyDailyRollover();
  loadingCloudData = false;
  renderWorkspace();
  if (!data) await persistCloudData();
}

function applyDailyRollover() {
  const today = getTodayDate();
  let cardsChanged = false;
  let historyChanged = false;
  cards = cards.flatMap((card) => {
    if (!card.activeDate) {
      card.activeDate = today;
      cardsChanged = true;
    }
    if (card.status === 'done' && card.activeDate < today) {
      const completedDate = card.completedAt || card.activeDate;
      const existingEntry = historyEntries.find((entry) => entry.date === completedDate);
      const completedCard = { id: card.id, title: card.title, description: card.description || '', priority: card.priority, completedAt: completedDate };
      if (existingEntry) {
        existingEntry.completedCards ||= [];
        if (!existingEntry.completedCards.some((item) => item.id === card.id)) existingEntry.completedCards.push(completedCard);
      } else {
        historyEntries.push({ date: completedDate, text: '', completedCards: [completedCard], updatedAt: completedDate });
      }
      historyChanged = true;
      cardsChanged = true;
      return [];
    }
    if (card.status === 'backlog' && card.activeDate < today) {
      card.carriedFrom = card.activeDate;
      card.activeDate = today;
      cardsChanged = true;
    }
    return [card];
  });
  if (historyChanged) saveHistoryEntries();
  if (cardsChanged) saveCards();
}

function updateCardStatus(card, status) {
  card.status = status;
  card.activeDate = getTodayDate();
  if (status === 'done') card.completedAt = getTodayDate();
  else delete card.completedAt;
  if (status !== 'backlog') delete card.carriedFrom;
  return card;
}

function formatHistoryDate(dateValue, options = { day: 'numeric', month: 'long', year: 'numeric' }) {
  return new Intl.DateTimeFormat('pt-BR', options).format(new Date(`${dateValue}T12:00:00`));
}

function renderHistory() {
  const entry = historyEntries.find((item) => item.date === selectedHistoryDate);
  historyDate.value = selectedHistoryDate;
  entryDateLabel.textContent = formatHistoryDate(selectedHistoryDate, { weekday: 'long', day: 'numeric', month: 'long' });
  dailyEntryText.value = entry?.text || '';
  const completedCards = entry?.completedCards || [];
  document.querySelector('#historyCompletedCards').innerHTML = completedCards.length
    ? `<div class="history-completed-heading"><strong>Concluídas neste dia</strong><span>${completedCards.length}</span></div>${completedCards.map((card) => `<article class="history-completed-card priority-${card.priority}"><span class="card-tag">${priorityLabels[card.priority] || 'tarefa'}</span><strong>${escapeHtml(card.title)}</strong>${card.description ? `<p>${escapeHtml(card.description)}</p>` : ''}</article>`).join('')}`
    : '';
  entrySavedStatus.textContent = entry ? `Salvo em ${formatHistoryDate(entry.updatedAt || entry.date, { day: 'numeric', month: 'short' })}` : 'Ainda não salvo';
  const sortedEntries = [...historyEntries].sort((a, b) => b.date.localeCompare(a.date));
  const grouped = sortedEntries.reduce((groups, item) => {
    const month = formatHistoryDate(item.date, { month: 'long', year: 'numeric' });
    (groups[month] ||= []).push(item);
    return groups;
  }, {});
  document.querySelector('#historyList').innerHTML = Object.entries(grouped).map(([month, entries]) => `<section class="history-month"><h3>${month}</h3>${entries.map((item) => `<button class="history-item ${item.date === selectedHistoryDate ? 'active' : ''}" type="button" data-history-date="${item.date}"><time>${formatHistoryDate(item.date, { day: '2-digit', month: 'short' })}</time><span>${escapeHtml(item.text?.slice(0, 100) || `${item.completedCards?.length || 0} concluída(s)`)}</span></button>`).join('')}</section>`).join('');
  document.querySelectorAll('[data-history-date]').forEach((item) => item.addEventListener('click', () => { selectedHistoryDate = item.dataset.historyDate; renderHistory(); }));
  document.querySelector('#historyCount').textContent = `${historyEntries.length} ${historyEntries.length === 1 ? 'registro' : 'registros'}`;
  document.querySelector('#historyEmpty').hidden = historyEntries.length > 0;
}

function saveCards() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  document.querySelector('.saved-status').innerHTML = '<span class="status-dot"></span>salvo agora';
  scheduleCloudSave();
}

function saveIdeas() {
  localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(ideas));
  scheduleCloudSave();
}

function saveWorkflows() {
  localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(workflows));
  scheduleCloudSave();
}

function saveScripts() {
  localStorage.setItem(SCRIPTS_STORAGE_KEY, JSON.stringify(scripts));
  scheduleCloudSave();
}

function getSelectedScript() {
  return scripts.find((script) => script.id === selectedScriptId) || scripts[0];
}

function renderScripts() {
  const script = getSelectedScript();
  if (!script) {
    scriptTabs.innerHTML = '';
    scriptList.innerHTML = '';
    scriptCategoryName.textContent = 'Nenhum roteiro';
    scriptCategoryCount.textContent = '0 roteiros';
    scriptTitle.value = '';
    scriptBody.innerHTML = '';
    updateScriptWordCount();
    deleteScriptButton.hidden = true;
    return;
  }
  selectedScriptId = script.id;
  selectedScriptCategory = script.category || script.name;
  const categories = [...new Set(scripts.map((item) => item.category || item.name))];
  scriptTabs.innerHTML = categories.map((category) => `<button class="script-tab ${category === selectedScriptCategory ? 'active' : ''}" type="button" data-script-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`).join('');
  scriptTabs.querySelectorAll('[data-script-category]').forEach((tab) => tab.addEventListener('click', () => { selectedScriptCategory = tab.dataset.scriptCategory; selectedScriptId = scripts.find((item) => (item.category || item.name) === selectedScriptCategory)?.id; renderScripts(); }));
  const categoryScripts = scripts.filter((item) => (item.category || item.name) === selectedScriptCategory);
  scriptList.innerHTML = categoryScripts.map((item) => `<button class="script-list-item ${item.id === script.id ? 'active' : ''}" type="button" data-script-id="${item.id}"><span class="script-list-marker">≡</span><span><strong>${escapeHtml(item.name)}</strong><small>${item.title ? escapeHtml(item.title) : 'Sem título'}</small></span></button>`).join('');
  scriptList.querySelectorAll('[data-script-id]').forEach((item) => item.addEventListener('click', () => { selectedScriptId = item.dataset.scriptId; renderScripts(); }));
  scriptCategoryName.textContent = selectedScriptCategory;
  scriptCategoryCount.textContent = `${categoryScripts.length} ${categoryScripts.length === 1 ? 'roteiro' : 'roteiros'}`;
  scriptTitle.value = script.title || '';
  scriptBody.innerHTML = script.body || '<p><br></p>';
  deleteScriptButton.hidden = false;
  updateScriptWordCount();
}

function deleteCurrentScript() {
  const script = getSelectedScript();
  if (!script || !window.confirm(`Excluir o roteiro "${script.name}"?`)) return;
  const category = script.category || script.name;
  scripts = scripts.filter((item) => item.id !== script.id);
  const nextScript = scripts.find((item) => (item.category || item.name) === category) || scripts[0];
  selectedScriptId = nextScript?.id;
  selectedScriptCategory = nextScript?.category || nextScript?.name || category;
  saveScripts();
  renderScripts();
}

function persistCurrentScript() {
  const script = getSelectedScript();
  if (!script) return;
  script.title = scriptTitle.value.trim();
  script.name = script.title || 'Novo roteiro';
  script.body = scriptBody.innerHTML;
  script.updatedAt = Date.now();
  saveScripts();
  scriptSaved.textContent = 'salvo agora';
  const currentScriptLabel = scriptList.querySelector(`[data-script-id="${script.id}"] strong`);
  if (currentScriptLabel) currentScriptLabel.textContent = script.name;
}

function updateScriptWordCount() {
  const text = scriptBody.textContent.trim();
  const wordCount = text ? text.split(/\s+/).length : 0;
  const estimatedSeconds = Math.round((wordCount / SCRIPT_SPEAKING_RATE) * 60);
  const minutes = Math.floor(estimatedSeconds / 60);
  const seconds = estimatedSeconds % 60;
  const formattedDuration = minutes ? `${minutes}min ${String(seconds).padStart(2, '0')}s` : `${seconds}s`;
  document.querySelector('#scriptWordCount').textContent = wordCount;
  document.querySelector('#scriptDuration').textContent = formattedDuration;
}

function createScript() {
  const category = selectedScriptCategory || 'Nova categoria';
  const script = { id: crypto.randomUUID(), name: 'Novo roteiro', category, title: 'Novo roteiro', body: '<p><br></p>', updatedAt: Date.now() };
  scripts.push(script);
  selectedScriptId = script.id;
  saveScripts();
  renderScripts();
  scriptTitle.focus();
  scriptTitle.select();
}

function renameScript() {
  namingScriptMode = 'category';
  namingScriptId = selectedScriptCategory;
  document.querySelector('#scriptNameModalKicker').textContent = 'CATEGORIA DE ROTEIROS';
  document.querySelector('#scriptNameModalTitle').textContent = 'Renomear categoria';
  scriptNameInput.value = selectedScriptCategory;
  scriptNameModalBackdrop.hidden = false;
  requestAnimationFrame(() => scriptNameInput.focus());
}

function openNewScriptNameEditor() {
  namingScriptMode = 'script';
  namingScriptId = null;
  document.querySelector('#scriptNameModalKicker').textContent = 'ROTEIRO';
  document.querySelector('#scriptNameModalTitle').textContent = 'Novo roteiro';
  scriptNameInput.value = '';
  scriptNameModalBackdrop.hidden = false;
  requestAnimationFrame(() => scriptNameInput.focus());
}

function openNewCategoryNameEditor() {
  namingScriptMode = 'category';
  namingScriptId = null;
  document.querySelector('#scriptNameModalKicker').textContent = 'CATEGORIA DE ROTEIROS';
  document.querySelector('#scriptNameModalTitle').textContent = 'Nova categoria';
  scriptNameInput.value = '';
  scriptNameModalBackdrop.hidden = false;
  requestAnimationFrame(() => scriptNameInput.focus());
}

function closeScriptNameEditor() {
  scriptNameModalBackdrop.hidden = true;
  namingScriptId = null;
  scriptNameForm.reset();
}

function applyScriptFormat(format) {
  scriptBody.focus();
  if (format === 'ul') document.execCommand('insertUnorderedList');
  else if (format === 'ol') document.execCommand('insertOrderedList');
  else document.execCommand('formatBlock', false, 'p');
  document.querySelectorAll('.script-format').forEach((button) => button.classList.toggle('active', button.dataset.format === format));
  persistCurrentScript();
}

function getSelectedWorkflow() {
  return workflows.find((workflow) => workflow.id === selectedWorkflowId) || workflows[0];
}

function renderWorkflows() {
  const workflow = getSelectedWorkflow();
  if (!workflow) return;
  selectedWorkflowId = workflow.id;
  workflowTabs.innerHTML = workflows.map((item) => `<button class="workflow-tab ${item.id === workflow.id ? 'active' : ''}" type="button" data-workflow-id="${item.id}">${escapeHtml(item.name)}</button>`).join('');
  workflowTabs.querySelectorAll('[data-workflow-id]').forEach((tab) => tab.addEventListener('click', () => { selectedWorkflowId = tab.dataset.workflowId; connectMode = false; connectSourceId = null; renderWorkflows(); }));
  workflowNodes.innerHTML = '';
  resetWorkflowLines();
  workflowEmpty.hidden = workflow.nodes.length > 0;
  workflowNodes.classList.toggle('connect-active', connectMode);
  workflowCanvas.classList.toggle('connect-active', connectMode);
  workflow.nodes.forEach((node) => workflowNodes.appendChild(createWorkflowNode(node)));
  workflow.links.forEach((link) => drawWorkflowLink(link, workflow));
  document.querySelector('#workflowNodeCount').textContent = workflow.nodes.length;
  const connectButton = document.querySelector('#connectModeButton');
  const disconnectButton = document.querySelector('#disconnectModeButton');
  connectButton.classList.toggle('active', connectMode && connectionAction === 'connect');
  disconnectButton.classList.toggle('active', connectMode && connectionAction === 'disconnect');
  connectButton.innerHTML = connectMode && connectionAction === 'connect' ? '× Cancelar conexão' : '＋ Conectar';
  disconnectButton.innerHTML = connectMode && connectionAction === 'disconnect' ? '× Cancelar desconexão' : '− Desconectar';
}

function createWorkflowNode(node) {
  const element = document.createElement('article');
  element.className = `workflow-node${connectSourceId === node.id ? ' selected' : ''}`;
  element.dataset.nodeId = node.id;
  element.style.left = `${node.x}px`;
  element.style.top = `${node.y}px`;
  const descriptionText = summarizeWorkflowDescription(node.description);
  const descriptionImage = getWorkflowDescriptionImage(node.description);
  element.innerHTML = `<div class="node-handle">⠿</div><button class="node-edit" type="button" aria-label="Editar card do workflow" title="Editar card">✎</button><span class="node-number">${getSelectedWorkflow().nodes.indexOf(node) + 1}</span><h3>${escapeHtml(node.title)}</h3>${descriptionImage ? `<img class="node-thumbnail" src="${escapeHtml(descriptionImage)}" alt="Imagem do detalhe">` : ''}${descriptionText ? `<p>${escapeHtml(descriptionText)}</p>` : ''}`;
  element.addEventListener('click', (event) => {
    if (event.target.closest('.node-edit')) return;
    if (connectMode) {
      if (!connectSourceId) connectSourceId = node.id;
      else if (connectSourceId !== node.id) {
        const workflow = getSelectedWorkflow();
        const exists = workflow.links.some((link) => link.from === connectSourceId && link.to === node.id);
        if (connectionAction === 'connect' && !exists) workflow.links.push({ from: connectSourceId, to: node.id });
        if (connectionAction === 'disconnect') workflow.links = workflow.links.filter((link) => !(link.from === connectSourceId && link.to === node.id) && !(link.from === node.id && link.to === connectSourceId));
        connectSourceId = null;
        saveWorkflows();
      }
      renderWorkflows();
      return;
    }
  });
  element.querySelector('.node-edit').addEventListener('click', () => openWorkflowCardEditor(node.id));
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;
  element.addEventListener('pointerdown', (event) => {
    if (connectMode || event.target.closest('button')) return;
    dragging = true;
    offsetX = event.clientX - node.x - workflowCanvas.getBoundingClientRect().left;
    offsetY = event.clientY - node.y - workflowCanvas.getBoundingClientRect().top;
    element.setPointerCapture(event.pointerId);
    element.classList.add('moving');
  });
  element.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const bounds = workflowCanvas.getBoundingClientRect();
    node.x = Math.max(12, Math.min(event.clientX - bounds.left - offsetX, workflowCanvas.clientWidth - element.offsetWidth - 12));
    node.y = Math.max(12, Math.min(event.clientY - bounds.top - offsetY, workflowCanvas.clientHeight - element.offsetHeight - 12));
    element.style.left = `${node.x}px`;
    element.style.top = `${node.y}px`;
    renderWorkflowLinesOnly();
  });
  element.addEventListener('pointerup', () => { if (dragging) { dragging = false; element.classList.remove('moving'); saveWorkflows(); } });
  return element;
}

function summarizeWorkflowDescription(description = '') {
  const container = document.createElement('div');
  container.innerHTML = description;
  const text = container.textContent.replace(/\s+/g, ' ').trim();
  return text.length > 80 ? `${text.slice(0, 80).trimEnd()}...` : text;
}

function getWorkflowDescriptionImage(description = '') {
  const container = document.createElement('div');
  container.innerHTML = description;
  return container.querySelector('img')?.getAttribute('src') || '';
}

function renderWorkflowLinesOnly() {
  const workflow = getSelectedWorkflow();
  resetWorkflowLines();
  workflow.links.forEach((link) => drawWorkflowLink(link, workflow));
}

function resetWorkflowLines() {
  workflowLines.innerHTML = '<defs><marker id="workflow-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M 0 0 L 8 4 L 0 8 z" fill="#86aabd"></path></marker></defs>';
}

function drawWorkflowLink(link, workflow) {
  const from = workflow.nodes.find((node) => node.id === link.from);
  const to = workflow.nodes.find((node) => node.id === link.to);
  if (!from || !to) return;
  const startX = from.x + 120;
  const startY = from.y + 52;
  const endX = to.x + 2;
  const endY = to.y + 52;
  const curve = Math.max(45, Math.abs(endX - startX) / 2);
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', `M ${startX} ${startY} C ${startX + curve} ${startY}, ${endX - curve} ${endY}, ${endX} ${endY}`);
  path.setAttribute('class', 'workflow-link');
  path.setAttribute('tabindex', '0');
  path.setAttribute('aria-label', 'Desconectar esta linha');
  path.addEventListener('click', () => {
    workflow.links = workflow.links.filter((item) => item !== link);
    saveWorkflows();
    renderWorkflows();
  });
  workflowLines.appendChild(path);
}

function openWorkflowCardEditor(nodeId = null) {
  const node = getSelectedWorkflow().nodes.find((item) => item.id === nodeId);
  editingWorkflowCardId = nodeId;
  document.querySelector('#workflowModalTitle').textContent = node ? 'Editar card' : 'Novo card';
  workflowCardTitle.value = node?.title || '';
  workflowCardDescription.innerHTML = node?.description || '';
  deleteWorkflowCard.hidden = !node;
  workflowModalBackdrop.hidden = false;
  requestAnimationFrame(() => workflowCardTitle.focus());
}

function closeWorkflowCardEditor() {
  workflowModalBackdrop.hidden = true;
  editingWorkflowCardId = null;
  workflowCardForm.reset();
  workflowCardDescription.innerHTML = '';
}

function removeWorkflowCard() {
  if (!editingWorkflowCardId || !window.confirm('Excluir este card e suas conexões?')) return;
  const workflow = getSelectedWorkflow();
  workflow.nodes = workflow.nodes.filter((node) => node.id !== editingWorkflowCardId);
  workflow.links = workflow.links.filter((link) => link.from !== editingWorkflowCardId && link.to !== editingWorkflowCardId);
  saveWorkflows();
  renderWorkflows();
  closeWorkflowCardEditor();
}

function openWorkflowNameEditor(workflowId = null) {
  namingWorkflowId = workflowId;
  document.querySelector('#workflowNameModalTitle').textContent = workflowId ? 'Renomear workflow' : 'Novo workflow';
  workflowNameInput.value = workflowId ? getSelectedWorkflow().name : '';
  workflowNameModalBackdrop.hidden = false;
  requestAnimationFrame(() => workflowNameInput.focus());
}

function closeWorkflowNameEditor() {
  workflowNameModalBackdrop.hidden = true;
  namingWorkflowId = null;
  workflowNameForm.reset();
}

function renderIdeas() {
  const groups = { pending: '#pendingIdeas', completed: '#completedIdeas', discarded: '#discardedIdeas' };
  Object.entries(groups).forEach(([status, selector]) => {
    const list = document.querySelector(selector);
    list.innerHTML = '';
    ideas.filter((idea) => idea.status === status).forEach((idea) => list.appendChild(createIdeaElement(idea)));
  });
  const counts = { pending: '#pendingSectionCount', completed: '#completedSectionCount', discarded: '#discardedSectionCount' };
  Object.entries(counts).forEach(([status, selector]) => { document.querySelector(selector).textContent = ideas.filter((idea) => idea.status === status).length; });
  document.querySelector('#pendingIdeasCount').textContent = ideas.filter((idea) => idea.status === 'pending').length;
  document.querySelector('#pendingEmpty').hidden = ideas.some((idea) => idea.status === 'pending');
}

function createIdeaElement(idea) {
  const element = document.createElement('article');
  element.className = `idea-item idea-${idea.status}`;
  const actions = idea.status === 'pending'
    ? '<div class="idea-actions"><button type="button" class="idea-edit" data-idea-edit aria-label="Editar ideia" title="Editar ideia">✎</button><button type="button" class="idea-complete" data-idea-action="completed" aria-label="Concluir ideia" title="Concluir ideia">✓</button><button type="button" class="idea-discard" data-idea-action="discarded" aria-label="Descartar ideia" title="Descartar ideia">×</button></div>'
    : '<button type="button" class="restore-idea" data-idea-action="pending"><span>↶</span> Voltar para explorar</button>';
  element.innerHTML = `<div class="idea-check" aria-hidden="true">${idea.status === 'completed' ? '✓' : idea.status === 'discarded' ? '×' : '✦'}</div><div class="idea-copy"><h3>${escapeHtml(idea.title)}</h3>${idea.description ? `<p>${escapeHtml(idea.description)}</p>` : ''}<time>${formatDate(idea.createdAt)}</time></div>${actions}`;
  element.querySelector('[data-idea-edit]')?.addEventListener('click', () => openIdeaEditor(idea.id));
  element.querySelectorAll('[data-idea-action]').forEach((button) => button.addEventListener('click', () => updateIdeaStatus(idea.id, button.dataset.ideaAction)));
  return element;
}

function openIdeaEditor(ideaId) {
  const idea = ideas.find((item) => item.id === ideaId);
  if (!idea) return;
  editingIdeaId = ideaId;
  editIdeaTitle.value = idea.title;
  editIdeaDescription.value = idea.description || '';
  ideaModalBackdrop.hidden = false;
  requestAnimationFrame(() => editIdeaTitle.focus());
}

function closeIdeaEditor() {
  ideaModalBackdrop.hidden = true;
  editingIdeaId = null;
  editIdeaForm.reset();
}

function updateIdeaStatus(ideaId, status) {
  ideas = ideas.map((idea) => idea.id === ideaId ? { ...idea, status, updatedAt: Date.now() } : idea);
  saveIdeas();
  renderIdeas();
}

function getSelectedReferenceCollection() {
  return referenceCollections.find((collection) => collection.id === selectedReferenceCollectionId);
}

function saveReferences() {
  localStorage.setItem(REFERENCES_STORAGE_KEY, JSON.stringify(referenceCollections));
  scheduleCloudSave();
}

function renderReferences() {
  let collection = getSelectedReferenceCollection();
  if (!collection && referenceCollections.length) {
    selectedReferenceCollectionId = referenceCollections[0].id;
    collection = referenceCollections[0];
  }
  referenceCollectionsElement.innerHTML = referenceCollections.map((item) => `<button class="reference-collection-tab ${item.id === selectedReferenceCollectionId ? 'active' : ''}" type="button" data-reference-collection="${item.id}">${escapeHtml(item.name)} <span>${item.items?.length || 0}</span></button>`).join('');
  referenceCollectionsElement.querySelectorAll('[data-reference-collection]').forEach((button) => button.addEventListener('click', () => {
    selectedReferenceCollectionId = button.dataset.referenceCollection;
    renderReferences();
  }));
  document.querySelector('#deleteReferenceCollectionButton').hidden = !collection;
  referenceImageInput.disabled = !collection;
  document.querySelector('.reference-upload-button').classList.toggle('disabled', !collection);
  document.querySelector('#referenceCollectionTitle').textContent = collection?.name || 'Nenhuma coleção';
  const items = collection?.items || [];
  document.querySelector('#referenceCount').textContent = `${items.length} ${items.length === 1 ? 'referência' : 'referências'}`;
  referenceGrid.innerHTML = items.map((item) => `<article class="reference-card" data-reference-id="${item.id}" tabindex="0"><div class="reference-card-image"><img src="${item.image}" alt="${escapeHtml(item.title)}" loading="lazy"><div class="reference-card-actions"><button type="button" data-copy-reference="${item.id}" aria-label="Copiar ${escapeHtml(item.title)}" title="Copiar imagem">▣</button><button type="button" data-delete-reference="${item.id}" aria-label="Excluir ${escapeHtml(item.title)}" title="Excluir referência">×</button></div></div><div class="reference-card-content"><strong>${escapeHtml(item.title)}</strong>${item.notes ? `<p>${escapeHtml(item.notes)}</p>` : '<p class="reference-no-notes">Adicionar observações</p>'}</div></article>`).join('');
  referenceGrid.querySelectorAll('[data-reference-id]').forEach((card) => {
    card.addEventListener('click', (event) => { if (!event.target.closest('.reference-card-actions')) openReferenceEditor(card.dataset.referenceId); });
    card.addEventListener('keydown', (event) => { if (event.key === 'Enter' && event.target === card) openReferenceEditor(card.dataset.referenceId); });
  });
  referenceGrid.querySelectorAll('[data-delete-reference]').forEach((button) => button.addEventListener('click', () => removeReference(button.dataset.deleteReference)));
  referenceGrid.querySelectorAll('[data-copy-reference]').forEach((button) => button.addEventListener('click', () => copyReferenceImage(button.dataset.copyReference)));
  document.querySelector('#referenceEmpty').hidden = Boolean(collection && items.length);
  const empty = document.querySelector('#referenceEmpty');
  empty.querySelector('strong').textContent = collection ? 'Esta coleção ainda está vazia.' : 'Crie sua primeira coleção visual.';
  empty.querySelector('p').textContent = collection ? 'Adicione uma ou várias imagens para criar seus cards de referência.' : 'Depois, envie várias imagens para transformá-las em cards de referência.';
}

function createReferenceCollection() {
  referenceCollectionForm.reset();
  referenceCollectionModalBackdrop.hidden = false;
  requestAnimationFrame(() => referenceCollectionName.focus());
}

function closeReferenceCollectionModal() {
  referenceCollectionModalBackdrop.hidden = true;
  referenceCollectionForm.reset();
}

function saveNewReferenceCollection(name) {
  const collection = { id: crypto.randomUUID(), name, items: [], createdAt: Date.now() };
  referenceCollections.push(collection);
  selectedReferenceCollectionId = collection.id;
  saveReferences();
  renderReferences();
  closeReferenceCollectionModal();
}

function deleteReferenceCollection() {
  const collection = getSelectedReferenceCollection();
  if (!collection) return;
  document.querySelector('#deleteReferenceCollectionName').textContent = `“${collection.name}”`;
  deleteReferenceCollectionModalBackdrop.hidden = false;
}

function closeDeleteReferenceCollectionModal() {
  deleteReferenceCollectionModalBackdrop.hidden = true;
}

function confirmDeleteReferenceCollection() {
  const collection = getSelectedReferenceCollection();
  if (!collection) return closeDeleteReferenceCollectionModal();
  referenceCollections = referenceCollections.filter((item) => item.id !== collection.id);
  selectedReferenceCollectionId = referenceCollections[0]?.id;
  saveReferences();
  renderReferences();
  closeDeleteReferenceCollectionModal();
  showSiteToast('Coleção excluída.');
}

function resizeReferenceImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('error', reject);
    reader.addEventListener('load', () => {
      const image = new Image();
      image.addEventListener('error', reject);
      image.addEventListener('load', () => {
        const maximumSize = 1000;
        const scale = Math.min(1, maximumSize / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', .72));
      });
      image.src = reader.result;
    });
    reader.readAsDataURL(file);
  });
}

async function addReferenceImages(files) {
  const collection = getSelectedReferenceCollection();
  if (!collection || !files.length) return;
  const images = await Promise.all([...files].filter((file) => file.type.startsWith('image/')).map(async (file, index) => ({
    id: crypto.randomUUID(),
    title: file.name?.replace(/\.[^.]+$/, '') || `Imagem colada ${index + 1}`,
    notes: '',
    image: await resizeReferenceImage(file),
    createdAt: Date.now()
  })));
  collection.items = [...(collection.items || []), ...images];
  try {
    saveReferences();
    renderReferences();
    showSiteToast(`${images.length} ${images.length === 1 ? 'imagem adicionada' : 'imagens adicionadas'}.`);
  } catch (error) {
    collection.items.splice(-images.length, images.length);
    window.alert('Não foi possível salvar todas as imagens. Tente enviar menos arquivos por vez.');
  }
}

function showSiteToast(message) {
  clearTimeout(siteToastTimer);
  siteToast.textContent = message;
  siteToast.hidden = false;
  requestAnimationFrame(() => siteToast.classList.add('visible'));
  siteToastTimer = setTimeout(() => {
    siteToast.classList.remove('visible');
    setTimeout(() => { siteToast.hidden = true; }, 180);
  }, 2600);
}

function convertImageToPngBlob(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('error', reject);
    image.addEventListener('load', () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      canvas.getContext('2d').drawImage(image, 0, 0);
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Falha ao preparar imagem')), 'image/png');
    });
    image.src = source;
  });
}

async function copyReferenceImage(referenceId) {
  const reference = getSelectedReferenceCollection()?.items?.find((item) => item.id === referenceId);
  if (!reference) return;
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    showSiteToast('Seu navegador não permite copiar imagens diretamente.');
    return;
  }
  try {
    const blob = await convertImageToPngBlob(reference.image);
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    showSiteToast('Imagem copiada. Agora você pode colar onde quiser.');
  } catch (error) {
    showSiteToast('Não foi possível copiar a imagem. Permita o acesso à área de transferência.');
  }
}

function openReferenceEditor(referenceId) {
  const reference = getSelectedReferenceCollection()?.items?.find((item) => item.id === referenceId);
  if (!reference) return;
  editingReferenceId = reference.id;
  referenceTitle.value = reference.title;
  referenceNotes.value = reference.notes || '';
  document.querySelector('#referenceModalPreview').src = reference.image;
  referenceModalBackdrop.hidden = false;
  requestAnimationFrame(() => referenceTitle.focus());
}

function closeReferenceEditor() {
  editingReferenceId = null;
  referenceForm.reset();
  referenceModalBackdrop.hidden = true;
}

function removeReference(referenceId) {
  const collection = getSelectedReferenceCollection();
  const reference = collection?.items?.find((item) => item.id === referenceId);
  if (!reference || !window.confirm(`Excluir a referência "${reference.title}"?`)) return;
  collection.items = collection.items.filter((item) => item.id !== referenceId);
  saveReferences();
  renderReferences();
  if (!referenceModalBackdrop.hidden) closeReferenceEditor();
}

function getOriginalTransferName(storageName) {
  const separator = storageName.indexOf('--');
  if (separator < 0) return storageName;
  const storedName = storageName.slice(separator + 2);
  if (!storedName.startsWith('b64_')) return storedName;
  try {
    const encodedName = storedName.slice(4).split('.')[0];
    const base64 = encodedName.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const bytes = Uint8Array.from(atob(paddedBase64), (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch (error) {
    return 'arquivo';
  }
}

function encodeTransferName(fileName) {
  const bytes = new TextEncoder().encode(fileName);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  const encodedName = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const extensionMatch = fileName.match(/\.([a-z0-9]{1,10})$/i);
  const safeExtension = extensionMatch ? `.${extensionMatch[1].toLowerCase()}` : '';
  return `b64_${encodedName}${safeExtension}`;
}

function formatFileSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function getTransferMimeType(file) {
  if (file.type) return file.type;
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeTypes = {
    mp4: 'video/mp4', mov: 'video/quicktime', m4v: 'video/x-m4v', webm: 'video/webm',
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic', heif: 'image/heif'
  };
  return mimeTypes[extension] || 'application/octet-stream';
}

function isTransferMediaFile(file) {
  const mimeType = getTransferMimeType(file);
  return mimeType.startsWith('image/') || mimeType.startsWith('video/');
}

async function renderTransfers() {
  if (!currentUser) return;
  const refreshButton = document.querySelector('#refreshTransfersButton');
  refreshButton.disabled = true;
  const { data, error } = await supabaseClient.storage.from(TRANSFER_BUCKET).list(currentUser.id, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
  refreshButton.disabled = false;
  if (error) {
    transferGrid.innerHTML = '';
    document.querySelector('#transferEmpty').hidden = false;
    showSiteToast('Não foi possível carregar os arquivos. Verifique se o Storage foi configurado.');
    return;
  }
  transferFiles = (data || []).filter((file) => file.name !== '.emptyFolderPlaceholder');
  const legacyFiles = transferFiles.filter((file) => {
    const storedName = file.name.slice(file.name.indexOf('--') + 2);
    return storedName.startsWith('b64_') && !/\.[a-z0-9]{1,10}$/i.test(storedName);
  });
  if (legacyFiles.length) {
    let movedAnyFile = false;
    for (const file of legacyFiles) {
      const originalName = getOriginalTransferName(file.name);
      const extensionMatch = originalName.match(/\.([a-z0-9]{1,10})$/i);
      if (!extensionMatch) continue;
      const newName = `${file.name}.${extensionMatch[1].toLowerCase()}`;
      const { error: moveError } = await supabaseClient.storage.from(TRANSFER_BUCKET).move(`${currentUser.id}/${file.name}`, `${currentUser.id}/${newName}`);
      if (!moveError) movedAnyFile = true;
    }
    if (movedAnyFile) return renderTransfers();
  }
  const filesWithUrls = await Promise.all(transferFiles.map(async (file) => {
    const path = `${currentUser.id}/${file.name}`;
    const { data: signedData } = await supabaseClient.storage.from(TRANSFER_BUCKET).createSignedUrl(path, 3600);
    return { ...file, path, signedUrl: signedData?.signedUrl || '' };
  }));
  document.querySelector('#transferFileCount').textContent = `${filesWithUrls.length} ${filesWithUrls.length === 1 ? 'arquivo' : 'arquivos'}`;
  document.querySelector('#transferEmpty').hidden = filesWithUrls.length > 0;
  transferGrid.innerHTML = filesWithUrls.map((file) => {
    const name = getOriginalTransferName(file.name);
    const mimeType = file.metadata?.mimetype || file.metadata?.contentType || '';
    const preview = mimeType.startsWith('video/')
      ? `<video src="${file.signedUrl}" controls preload="metadata"></video>`
      : `<img src="${file.signedUrl}" alt="${escapeHtml(name)}" loading="lazy">`;
    return `<article class="transfer-card"><div class="transfer-preview">${preview}<span>${mimeType.startsWith('video/') ? 'VÍDEO' : 'IMAGEM'}</span></div><div class="transfer-card-info"><strong title="${escapeHtml(name)}">${escapeHtml(name)}</strong><small>${formatFileSize(file.metadata?.size)}</small><div class="transfer-main-actions"><button class="secondary-button" type="button" data-download-transfer="${file.path}" data-download-name="${escapeHtml(name)}">↓ Baixar</button><button class="secondary-button transfer-share-button" type="button" data-share-transfer="${file.path}" data-share-name="${escapeHtml(name)}" data-share-type="${escapeHtml(mimeType)}">↗ Salvar/compartilhar</button><button class="transfer-delete" type="button" data-delete-transfer="${file.path}" data-delete-name="${escapeHtml(name)}" aria-label="Excluir arquivo" title="Excluir arquivo">×</button></div></div></article>`;
  }).join('');
  transferGrid.querySelectorAll('[data-download-transfer]').forEach((button) => button.addEventListener('click', () => downloadTransferFile(button.dataset.downloadTransfer, button.dataset.downloadName)));
  transferGrid.querySelectorAll('[data-share-transfer]').forEach((button) => button.addEventListener('click', () => shareTransferFile(button.dataset.shareTransfer, button.dataset.shareName, button.dataset.shareType)));
  transferGrid.querySelectorAll('[data-delete-transfer]').forEach((button) => button.addEventListener('click', () => openDeleteTransferModal(button.dataset.deleteTransfer, button.dataset.deleteName)));
}

function uploadOriginalTransferFile(file, accessToken) {
  return new Promise((resolve, reject) => {
    const encodedName = encodeTransferName(file.name);
    const objectName = `${currentUser.id}/${Date.now()}-${crypto.randomUUID()}--${encodedName}`;
    const contentType = getTransferMimeType(file);
    if (file.size <= 6 * 1024 * 1024) {
      document.querySelector('#transferUploadName').textContent = `Enviando ${file.name}`;
      supabaseClient.storage.from(TRANSFER_BUCKET).upload(objectName, file, { cacheControl: '3600', contentType, upsert: false }).then(({ error }) => {
        if (error) reject(error);
        else {
          document.querySelector('#transferUploadPercent').textContent = '100%';
          document.querySelector('#transferProgressBar').style.width = '100%';
          resolve(objectName);
        }
      });
      return;
    }
    const upload = new tus.Upload(file, {
      endpoint: TRANSFER_RESUMABLE_ENDPOINT,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: { authorization: `Bearer ${accessToken}` },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      chunkSize: 6 * 1024 * 1024,
      metadata: { bucketName: TRANSFER_BUCKET, objectName, contentType, cacheControl: '3600' },
      onError: reject,
      onProgress: (uploaded, total) => {
        const percentage = total ? Math.round((uploaded / total) * 100) : 0;
        document.querySelector('#transferUploadName').textContent = `Enviando ${file.name}`;
        document.querySelector('#transferUploadPercent').textContent = `${percentage}%`;
        document.querySelector('#transferProgressBar').style.width = `${percentage}%`;
      },
      onSuccess: () => resolve(objectName)
    });
    upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length) upload.resumeFromPreviousUpload(previousUploads[0]);
      upload.start();
    }).catch(reject);
  });
}

async function uploadTransferFiles(files) {
  const acceptedFiles = [...files].filter(isTransferMediaFile);
  if (!acceptedFiles.length || !currentUser) return showSiteToast('Selecione uma imagem ou um vídeo compatível.');
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session?.access_token) return showSiteToast('Sua sessão expirou. Entre novamente para enviar arquivos.');
  transferUploadStatus.hidden = false;
  document.querySelector('.transfer-upload-button').classList.add('disabled');
  try {
    for (const file of acceptedFiles) await uploadOriginalTransferFile(file, session.access_token);
    showSiteToast(`${acceptedFiles.length} ${acceptedFiles.length === 1 ? 'arquivo enviado' : 'arquivos enviados'} sem alteração de qualidade.`);
    await renderTransfers();
  } catch (error) {
    showSiteToast(`Falha no envio: ${error.message || 'tente novamente'}.`);
  } finally {
    transferUploadStatus.hidden = true;
    document.querySelector('.transfer-upload-button').classList.remove('disabled');
    document.querySelector('#transferProgressBar').style.width = '0%';
  }
}

async function downloadTransferFile(path, originalName) {
  const { data, error } = await supabaseClient.storage.from(TRANSFER_BUCKET).createSignedUrl(path, 60, { download: originalName });
  if (error || !data?.signedUrl) return showSiteToast('Não foi possível preparar o download.');
  const link = document.createElement('a');
  link.href = data.signedUrl;
  link.download = originalName;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function shareTransferFile(path, originalName, mimeType) {
  if (!navigator.share || typeof File === 'undefined') {
    showSiteToast('O compartilhamento não está disponível neste navegador. Iniciando o download.');
    return downloadTransferFile(path, originalName);
  }
  showSiteToast('Preparando o arquivo original...');
  const { data, error } = await supabaseClient.storage.from(TRANSFER_BUCKET).download(path);
  if (error || !data) return showSiteToast('Não foi possível preparar o arquivo.');
  const file = new File([data], originalName, { type: mimeType || data.type || 'application/octet-stream', lastModified: Date.now() });
  if (navigator.canShare && !navigator.canShare({ files: [file] })) {
    showSiteToast('Este celular não permite compartilhar esse formato. Iniciando o download.');
    return downloadTransferFile(path, originalName);
  }
  try {
    await navigator.share({ files: [file], title: originalName });
  } catch (error) {
    if (error.name !== 'AbortError') showSiteToast('Não foi possível abrir as opções de compartilhamento.');
  }
}

function openDeleteTransferModal(path, name) {
  pendingTransferPath = path;
  document.querySelector('#deleteTransferName').textContent = `“${name}”`;
  deleteTransferModalBackdrop.hidden = false;
}

function closeDeleteTransferModal() {
  pendingTransferPath = null;
  deleteTransferModalBackdrop.hidden = true;
}

async function confirmDeleteTransfer() {
  if (!pendingTransferPath) return;
  const path = pendingTransferPath;
  const { error } = await supabaseClient.storage.from(TRANSFER_BUCKET).remove([path]);
  if (error) return showSiteToast('Não foi possível excluir o arquivo.');
  closeDeleteTransferModal();
  showSiteToast('Arquivo excluído.');
  await renderTransfers();
}

function showPage(page) {
  const showingIdeas = page === 'ideas';
  const showingWorkflow = page === 'workflow';
  const showingScripts = page === 'scripts';
  const showingPlanning = page === 'planning';
  const showingReferences = page === 'references';
  const showingTransfers = page === 'transfers';
  kanbanPage.hidden = showingIdeas || showingWorkflow || showingScripts || showingPlanning || showingReferences || showingTransfers;
  ideasPage.hidden = !showingIdeas;
  workflowPage.hidden = !showingWorkflow;
  scriptsPage.hidden = !showingScripts;
  planningPage.hidden = !showingPlanning;
  referencesPage.hidden = !showingReferences;
  transfersPage.hidden = !showingTransfers;
  kanbanNav.classList.toggle('active', !showingIdeas && !showingWorkflow && !showingScripts && !showingPlanning && !showingReferences && !showingTransfers);
  ideasNav.classList.toggle('active', showingIdeas);
  workflowNav.classList.toggle('active', showingWorkflow);
  scriptsNav.classList.toggle('active', showingScripts);
  planningNav.classList.toggle('active', showingPlanning);
  referencesNav.classList.toggle('active', showingReferences);
  transfersNav.classList.toggle('active', showingTransfers);
  kanbanNav.toggleAttribute('aria-current', !showingIdeas && !showingWorkflow && !showingScripts && !showingPlanning && !showingReferences && !showingTransfers);
  ideasNav.toggleAttribute('aria-current', showingIdeas);
  workflowNav.toggleAttribute('aria-current', showingWorkflow);
  scriptsNav.toggleAttribute('aria-current', showingScripts);
  planningNav.toggleAttribute('aria-current', showingPlanning);
  referencesNav.toggleAttribute('aria-current', showingReferences);
  transfersNav.toggleAttribute('aria-current', showingTransfers);
  if (showingIdeas) renderIdeas();
  if (showingWorkflow) renderWorkflows();
  if (showingScripts) renderScripts();
  if (showingPlanning) renderPlanning();
  if (showingReferences) renderReferences();
  if (showingTransfers) renderTransfers();
}

function formatDate(timestamp) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(timestamp).replace('.', '');
}

function renderPlanning() {
  const tomorrow = getTomorrowDate();
  document.querySelector('#tomorrowLabel').textContent = formatHistoryDate(tomorrow, { weekday: 'short', day: 'numeric', month: 'short' });
  const plannedCards = cards.filter((card) => card.activeDate === tomorrow && card.status === 'backlog');
  plannedList.innerHTML = plannedCards.map((card) => `<article class="planned-item"><span class="planning-check">＋</span><div><strong>${escapeHtml(card.title)}</strong>${card.description ? `<p>${escapeHtml(card.description)}</p>` : ''}<small>${priorityLabels[card.priority]}</small></div><button type="button" class="planned-remove" data-planned-id="${card.id}" aria-label="Remover tarefa programada" title="Remover tarefa programada">×</button></article>`).join('');
  plannedList.querySelectorAll('[data-planned-id]').forEach((button) => button.addEventListener('click', () => { cards = cards.filter((card) => card.id !== button.dataset.plannedId); saveCards(); renderPlanning(); }));
  document.querySelector('#plannedCount').textContent = `${plannedCards.length} ${plannedCards.length === 1 ? 'tarefa' : 'tarefas'}`;
  document.querySelector('#plannedEmpty').hidden = plannedCards.length > 0;
}

function render() {
  document.querySelectorAll('.cards-list').forEach((list) => { list.innerHTML = ''; });
  document.querySelectorAll('.column').forEach((column) => {
    const status = column.dataset.status;
    const statusCards = cards.filter((card) => card.status === status && (!card.activeDate || card.activeDate <= getTodayDate()));
    const list = column.querySelector('.cards-list');
    column.querySelector('.column-count').textContent = statusCards.length;
    statusCards.forEach((card) => list.appendChild(createCardElement(card)));
  });
  document.querySelector('#totalCards').textContent = cards.length;
}

function createCardElement(card) {
  const element = document.createElement('article');
  element.className = `task-card priority-${card.priority}`;
  element.draggable = true;
  element.dataset.id = card.id;
  element.setAttribute('tabindex', '0');
  element.setAttribute('role', 'button');
  element.setAttribute('aria-label', `Abrir card ${card.title}`);
  element.innerHTML = `
    <div class="card-topline"><span class="card-tag ${card.status === 'backlog' && card.carriedFrom ? 'yesterday-tag' : ''}">${card.status === 'backlog' && card.carriedFrom ? 'ontem' : priorityLabels[card.priority]}</span><time class="card-date">${formatDate(card.createdAt)}</time></div>
    <h3>${escapeHtml(card.title)}</h3>
    ${card.description ? `<p class="card-preview">${escapeHtml(card.description)}</p>` : ''}
    <div class="card-footer"><span>${card.description ? 'Detalhes disponíveis' : 'Sem detalhes ainda'}</span><span class="card-detail-icon">↗</span></div>
  `;
  element.addEventListener('click', () => openModal(card.id));
  element.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openModal(card.id); } });
  element.addEventListener('dragstart', (event) => {
    event.dataTransfer.setData('text/plain', card.id);
    event.dataTransfer.effectAllowed = 'move';
    element.classList.add('dragging');
  });
  element.addEventListener('dragend', () => {
    element.classList.remove('dragging');
    clearDropIndicator();
  });
  const showCardDropIndicator = (event) => {
    if (element.classList.contains('dragging')) return;
    event.preventDefault();
    const bounds = element.getBoundingClientRect();
    clearDropIndicator();
    element.classList.add(event.clientY < bounds.top + bounds.height / 2 ? 'drop-before' : 'drop-after');
  };
  element.addEventListener('dragenter', showCardDropIndicator);
  element.addEventListener('dragover', showCardDropIndicator);
  return element;
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character]));
}

function moveCard(cardId, status, pointerY, dropzone) {
  const movingCard = cards.find((card) => card.id === cardId);
  if (!movingCard) return;

  cards = cards.filter((card) => card.id !== cardId);
  updateCardStatus(movingCard, status);

  const targetCard = [...dropzone.querySelectorAll('.task-card:not(.dragging)')].find((cardElement) => {
    const bounds = cardElement.getBoundingClientRect();
    return pointerY < bounds.top + bounds.height / 2;
  });
  const targetIndex = targetCard ? cards.findIndex((card) => card.id === targetCard.dataset.id) : cards.length;
  const insertionIndex = targetIndex < 0 ? cards.length : targetIndex;
  cards.splice(insertionIndex, 0, movingCard);
}

function clearDropIndicator() {
  document.querySelectorAll('.drop-before, .drop-after').forEach((card) => {
    card.classList.remove('drop-before', 'drop-after');
  });
}

function updateDropIndicator(dropzone, pointerY) {
  clearDropIndicator();
  const cardsInZone = [...dropzone.querySelectorAll('.task-card:not(.dragging)')];
  const targetCard = cardsInZone.find((card) => {
    const bounds = card.getBoundingClientRect();
    return pointerY < bounds.top + bounds.height / 2;
  });
  (targetCard || cardsInZone.at(-1))?.classList.add(targetCard ? 'drop-before' : 'drop-after');
}

function openModal(cardId = null, status = 'backlog') {
  editingId = cardId;
  const card = cards.find((item) => item.id === cardId);
  modalTitle.textContent = card ? 'Detalhes do card' : 'Criar novo card';
  modalStatusLabel.textContent = card ? statuses[card.status] : statuses[status];
  cardTitle.value = card?.title || '';
  cardDescription.value = card?.description || '';
  cardPriority.value = card?.priority || 'medium';
  cardStatus.value = card?.status || status;
  deleteCardButton.hidden = !card;
  document.querySelector('#saveCardButton').textContent = card ? 'Salvar alterações' : 'Criar card';
  modalBackdrop.hidden = false;
  requestAnimationFrame(() => cardTitle.focus());
}

function closeModal() {
  modalBackdrop.hidden = true;
  editingId = null;
  cardForm.reset();
}

cardForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(cardForm);
  const values = { title: formData.get('title').trim(), description: formData.get('description').trim(), priority: formData.get('priority'), status: formData.get('status') };
  if (!values.title) return;
  if (editingId) {
    cards = cards.map((card) => card.id === editingId ? updateCardStatus({ ...card, ...values }, values.status) : card);
  } else {
    cards.unshift({ id: crypto.randomUUID(), ...values, createdAt: Date.now(), activeDate: getTodayDate(), ...(values.status === 'done' ? { completedAt: getTodayDate() } : {}) });
  }
  saveCards();
  render();
  closeModal();
});

deleteCardButton.addEventListener('click', () => {
  if (!editingId || !window.confirm('Excluir este card?')) return;
  cards = cards.filter((card) => card.id !== editingId);
  saveCards();
  render();
  closeModal();
});

document.querySelector('#newCardButton').addEventListener('click', () => openModal());
kanbanNav.addEventListener('click', () => showPage('kanban'));
ideasNav.addEventListener('click', () => showPage('ideas'));
workflowNav.addEventListener('click', () => showPage('workflow'));
scriptsNav.addEventListener('click', () => showPage('scripts'));
referencesNav.addEventListener('click', () => showPage('references'));
transfersNav.addEventListener('click', () => showPage('transfers'));
planningNav.addEventListener('click', () => showPage('planning'));
planningForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = planningTitle.value.trim();
  if (!title) return;
  cards.push({ id: crypto.randomUUID(), title, description: planningDescription.value.trim(), priority: planningPriority.value, status: 'backlog', activeDate: getTomorrowDate(), createdAt: Date.now() });
  saveCards();
  planningForm.reset();
  renderPlanning();
  planningTitle.focus();
});
historyDate.addEventListener('change', () => { selectedHistoryDate = historyDate.value || getTodayDate(); renderHistory(); });
dailyEntryForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = dailyEntryText.value.trim();
  const existingEntry = historyEntries.find((entry) => entry.date === selectedHistoryDate);
  if (!text) {
    if (existingEntry?.completedCards?.length) {
      existingEntry.text = '';
      existingEntry.updatedAt = selectedHistoryDate;
    } else historyEntries = historyEntries.filter((entry) => entry.date !== selectedHistoryDate);
  } else if (existingEntry) {
    existingEntry.text = text;
    existingEntry.updatedAt = selectedHistoryDate;
  } else {
    historyEntries.push({ date: selectedHistoryDate, text, updatedAt: selectedHistoryDate });
  }
  saveHistoryEntries();
  renderHistory();
});
document.querySelector('#ideaForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const title = formData.get('title').trim();
  if (!title) return;
  ideas.unshift({ id: crypto.randomUUID(), title, description: formData.get('description').trim(), status: 'pending', createdAt: Date.now() });
  saveIdeas();
  renderIdeas();
  event.currentTarget.reset();
  document.querySelector('#ideaTitle').focus();
});
editIdeaForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!editingIdeaId) return;
  const formData = new FormData(editIdeaForm);
  const title = formData.get('title').trim();
  if (!title) return;
  ideas = ideas.map((idea) => idea.id === editingIdeaId ? { ...idea, title, description: formData.get('description').trim(), updatedAt: Date.now() } : idea);
  saveIdeas();
  renderIdeas();
  closeIdeaEditor();
});
document.querySelector('#ideaModalClose').addEventListener('click', closeIdeaEditor);
document.querySelector('#cancelIdeaEdit').addEventListener('click', closeIdeaEditor);
ideaModalBackdrop.addEventListener('click', (event) => { if (event.target === ideaModalBackdrop) closeIdeaEditor(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !ideaModalBackdrop.hidden) closeIdeaEditor(); });

document.querySelector('#newWorkflowButton').addEventListener('click', () => {
  openWorkflowNameEditor();
});
document.querySelector('#renameWorkflowButton').addEventListener('click', () => {
  openWorkflowNameEditor(getSelectedWorkflow().id);
});
workflowNameForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = workflowNameInput.value.trim();
  if (!name) return;
  if (namingWorkflowId) {
    getSelectedWorkflow().name = name;
  } else {
    const workflow = { id: crypto.randomUUID(), name, nodes: [], links: [] };
    workflows.push(workflow);
    selectedWorkflowId = workflow.id;
  }
  saveWorkflows();
  renderWorkflows();
  closeWorkflowNameEditor();
});
document.querySelector('#workflowNameModalClose').addEventListener('click', closeWorkflowNameEditor);
document.querySelector('#cancelWorkflowName').addEventListener('click', closeWorkflowNameEditor);
workflowNameModalBackdrop.addEventListener('click', (event) => { if (event.target === workflowNameModalBackdrop) closeWorkflowNameEditor(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !workflowNameModalBackdrop.hidden) closeWorkflowNameEditor(); });

document.querySelector('#newScriptButton').addEventListener('click', openNewScriptNameEditor);
document.querySelector('#newScriptInCategoryButton').addEventListener('click', openNewScriptNameEditor);
document.querySelector('#newScriptCategoryButton').addEventListener('click', openNewCategoryNameEditor);
document.querySelector('#renameScriptButton').addEventListener('click', renameScript);
deleteScriptButton.addEventListener('click', deleteCurrentScript);
scriptNameForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = scriptNameInput.value.trim();
  if (!name) return;
  if (namingScriptMode === 'category' && namingScriptId) {
    scripts.forEach((script) => { if ((script.category || script.name) === namingScriptId) script.category = name; });
    selectedScriptCategory = name;
  } else if (namingScriptMode === 'category') {
    const script = { id: crypto.randomUUID(), name: 'Novo roteiro', category: name, title: 'Novo roteiro', body: '<p><br></p>', updatedAt: Date.now() };
    scripts.push(script);
    selectedScriptCategory = name;
    selectedScriptId = script.id;
  } else {
    const script = { id: crypto.randomUUID(), name, category: selectedScriptCategory || 'Roteiros', title: name, body: '<p><br></p>', updatedAt: Date.now() };
    scripts.push(script);
    selectedScriptId = script.id;
  }
  saveScripts();
  renderScripts();
  closeScriptNameEditor();
});
document.querySelector('#scriptNameModalClose').addEventListener('click', closeScriptNameEditor);
document.querySelector('#cancelScriptName').addEventListener('click', closeScriptNameEditor);
scriptNameModalBackdrop.addEventListener('click', (event) => { if (event.target === scriptNameModalBackdrop) closeScriptNameEditor(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !scriptNameModalBackdrop.hidden) closeScriptNameEditor(); });
document.querySelector('#newReferenceCollectionButton').addEventListener('click', createReferenceCollection);
document.querySelector('#deleteReferenceCollectionButton').addEventListener('click', deleteReferenceCollection);
document.querySelector('#confirmDeleteReferenceCollection').addEventListener('click', confirmDeleteReferenceCollection);
document.querySelector('#deleteReferenceCollectionModalClose').addEventListener('click', closeDeleteReferenceCollectionModal);
document.querySelector('#cancelDeleteReferenceCollection').addEventListener('click', closeDeleteReferenceCollectionModal);
deleteReferenceCollectionModalBackdrop.addEventListener('click', (event) => { if (event.target === deleteReferenceCollectionModalBackdrop) closeDeleteReferenceCollectionModal(); });
referenceCollectionForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = referenceCollectionName.value.trim();
  if (name) saveNewReferenceCollection(name);
});
document.querySelector('#referenceCollectionModalClose').addEventListener('click', closeReferenceCollectionModal);
document.querySelector('#cancelReferenceCollection').addEventListener('click', closeReferenceCollectionModal);
referenceCollectionModalBackdrop.addEventListener('click', (event) => { if (event.target === referenceCollectionModalBackdrop) closeReferenceCollectionModal(); });
referenceImageInput.addEventListener('change', async (event) => {
  try {
    await addReferenceImages(event.target.files);
  } catch (error) {
    window.alert('Não foi possível processar uma das imagens. Verifique o arquivo e tente novamente.');
  }
  event.target.value = '';
});
referenceForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const reference = getSelectedReferenceCollection()?.items?.find((item) => item.id === editingReferenceId);
  if (!reference) return;
  reference.title = referenceTitle.value.trim();
  reference.notes = referenceNotes.value.trim();
  reference.updatedAt = Date.now();
  saveReferences();
  renderReferences();
  closeReferenceEditor();
});
document.querySelector('#deleteReferenceButton').addEventListener('click', () => removeReference(editingReferenceId));
document.querySelector('#referenceModalClose').addEventListener('click', closeReferenceEditor);
document.querySelector('#cancelReferenceEdit').addEventListener('click', closeReferenceEditor);
referenceModalBackdrop.addEventListener('click', (event) => { if (event.target === referenceModalBackdrop) closeReferenceEditor(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !referenceModalBackdrop.hidden) closeReferenceEditor(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !referenceCollectionModalBackdrop.hidden) closeReferenceCollectionModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !deleteReferenceCollectionModalBackdrop.hidden) closeDeleteReferenceCollectionModal(); });
document.addEventListener('paste', async (event) => {
  if (referencesPage.hidden || !referenceModalBackdrop.hidden || !referenceCollectionModalBackdrop.hidden || !deleteReferenceCollectionModalBackdrop.hidden) return;
  const imageFiles = [...(event.clipboardData?.items || [])].filter((item) => item.type.startsWith('image/')).map((item) => item.getAsFile()).filter(Boolean);
  if (!imageFiles.length) return;
  event.preventDefault();
  if (!getSelectedReferenceCollection()) {
    showSiteToast('Crie uma coleção antes de colar imagens.');
    return;
  }
  try {
    await addReferenceImages(imageFiles);
  } catch (error) {
    showSiteToast('Não foi possível adicionar a imagem colada.');
  }
});
transferFileInput.addEventListener('change', async (event) => {
  await uploadTransferFiles(event.target.files);
  event.target.value = '';
});
document.querySelector('#refreshTransfersButton').addEventListener('click', renderTransfers);
document.querySelector('#confirmDeleteTransfer').addEventListener('click', confirmDeleteTransfer);
document.querySelector('#deleteTransferModalClose').addEventListener('click', closeDeleteTransferModal);
document.querySelector('#cancelDeleteTransfer').addEventListener('click', closeDeleteTransferModal);
deleteTransferModalBackdrop.addEventListener('click', (event) => { if (event.target === deleteTransferModalBackdrop) closeDeleteTransferModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !deleteTransferModalBackdrop.hidden) closeDeleteTransferModal(); });
scriptTitle.addEventListener('input', persistCurrentScript);
scriptBody.addEventListener('input', () => { updateScriptWordCount(); persistCurrentScript(); });
document.querySelectorAll('.script-format').forEach((button) => {
  button.addEventListener('mousedown', (event) => event.preventDefault());
  button.addEventListener('click', () => applyScriptFormat(button.dataset.format));
});
document.querySelector('#connectModeButton').addEventListener('click', () => {
  if (connectMode && connectionAction === 'connect') connectMode = false;
  else { connectMode = true; connectionAction = 'connect'; }
  connectSourceId = null;
  renderWorkflows();
});
document.querySelector('#disconnectModeButton').addEventListener('click', () => {
  if (connectMode && connectionAction === 'disconnect') connectMode = false;
  else { connectMode = true; connectionAction = 'disconnect'; }
  connectSourceId = null;
  renderWorkflows();
});
document.querySelector('#newWorkflowCardButton').addEventListener('click', () => openWorkflowCardEditor());
document.querySelector('#emptyWorkflowCardButton').addEventListener('click', () => openWorkflowCardEditor());
workflowCardForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(workflowCardForm);
  const title = formData.get('title').trim();
  if (!title) return;
  const workflow = getSelectedWorkflow();
  if (editingWorkflowCardId) {
    workflow.nodes = workflow.nodes.map((node) => node.id === editingWorkflowCardId ? { ...node, title, description: workflowCardDescription.innerHTML.trim() } : node);
  } else {
    const index = workflow.nodes.length;
    workflow.nodes.push({ id: crypto.randomUUID(), title, description: workflowCardDescription.innerHTML.trim(), x: 35 + (index % 3) * 265, y: 35 + Math.floor(index / 3) * 145 });
  }
  saveWorkflows();
  renderWorkflows();
  closeWorkflowCardEditor();
});
document.querySelector('#workflowModalClose').addEventListener('click', closeWorkflowCardEditor);
document.querySelector('#cancelWorkflowCard').addEventListener('click', closeWorkflowCardEditor);
deleteWorkflowCard.addEventListener('click', removeWorkflowCard);
workflowImageInput.addEventListener('change', (event) => {
  const [file] = event.target.files;
  if (file) insertWorkflowImage(file);
  event.target.value = '';
});
workflowCardDescription.addEventListener('paste', (event) => {
  const image = [...(event.clipboardData?.items || [])].find((item) => item.type.startsWith('image/'));
  if (!image) return;
  event.preventDefault();
  insertWorkflowImage(image.getAsFile());
});
function insertWorkflowImage(file) {
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    const sourceImage = new Image();
    sourceImage.addEventListener('load', () => {
      const maximumSize = 1000;
      const scale = Math.min(1, maximumSize / Math.max(sourceImage.naturalWidth, sourceImage.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(sourceImage.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(sourceImage.naturalHeight * scale));
      canvas.getContext('2d').drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
      const image = document.createElement('img');
      image.src = canvas.toDataURL('image/jpeg', .78);
      image.alt = 'Imagem adicionada ao detalhe';
      image.className = 'workflow-detail-image';
      workflowCardDescription.appendChild(image);
      workflowCardDescription.focus();
    });
    sourceImage.src = reader.result;
  });
  reader.readAsDataURL(file);
}

function optimizeStoredWorkflowImages() {
  const imageJobs = [];
  workflows.forEach((workflow) => workflow.nodes.forEach((node) => {
    const container = document.createElement('div');
    container.innerHTML = node.description || '';
    container.querySelectorAll('img[src^="data:image"]').forEach((image) => {
      if (image.src.length < 250000) return;
      imageJobs.push(new Promise((resolve) => {
        const sourceImage = new Image();
        sourceImage.addEventListener('load', () => {
          const maximumSize = 1000;
          const scale = Math.min(1, maximumSize / Math.max(sourceImage.naturalWidth, sourceImage.naturalHeight));
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, Math.round(sourceImage.naturalWidth * scale));
          canvas.height = Math.max(1, Math.round(sourceImage.naturalHeight * scale));
          canvas.getContext('2d').drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
          image.src = canvas.toDataURL('image/jpeg', .78);
          node.description = container.innerHTML;
          resolve();
        });
        sourceImage.addEventListener('error', resolve);
        sourceImage.src = image.src;
      }));
    });
  }));
  Promise.all(imageJobs).then(() => {
    if (!imageJobs.length) return;
    saveWorkflows();
    renderWorkflows();
  });
}
workflowModalBackdrop.addEventListener('click', (event) => { if (event.target === workflowModalBackdrop) closeWorkflowCardEditor(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !workflowModalBackdrop.hidden) closeWorkflowCardEditor(); });
document.querySelectorAll('[data-add-status]').forEach((button) => button.addEventListener('click', () => openModal(null, button.dataset.addStatus)));
document.querySelector('#modalClose').addEventListener('click', closeModal);
document.querySelector('#cancelButton').addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (event) => { if (event.target === modalBackdrop) closeModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && !modalBackdrop.hidden) closeModal(); });

document.querySelectorAll('[data-dropzone]').forEach((zone) => {
  zone.addEventListener('dragover', (event) => {
    event.preventDefault();
    zone.classList.add('drag-over');
    updateDropIndicator(zone, event.clientY);
  });
  zone.addEventListener('dragleave', (event) => { if (!zone.contains(event.relatedTarget)) zone.classList.remove('drag-over'); });
  zone.addEventListener('drop', (event) => {
    event.preventDefault();
    zone.classList.remove('drag-over');
    clearDropIndicator();
    const cardId = event.dataTransfer.getData('text/plain');
    moveCard(cardId, zone.dataset.dropzone, event.clientY, zone);
    saveCards();
    render();
  });
});

const authScreen = document.querySelector('#authScreen');
const authForm = document.querySelector('#authForm');
const authMessage = document.querySelector('#authMessage');
const authEmail = document.querySelector('#authEmail');
const authPassword = document.querySelector('#authPassword');

function showAuthMessage(message, success = false) {
  authMessage.textContent = message;
  authMessage.classList.toggle('success', success);
}

async function openUserWorkspace(user) {
  currentUser = user;
  document.querySelector('#profileEmail').textContent = user.email;
  document.querySelector('#profileName').textContent = user.user_metadata?.name || user.email.split('@')[0];
  document.querySelector('#profileAvatar').textContent = (user.email[0] || 'U').toUpperCase();
  try {
    await loadCloudWorkspace();
    authScreen.hidden = true;
  } catch (error) {
    showAuthMessage(`Não foi possível carregar seus dados: ${error.message}`);
  }
}

authForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showAuthMessage('Entrando...', true);
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email: authEmail.value.trim(), password: authPassword.value });
  if (error) return showAuthMessage(error.message === 'Invalid login credentials' ? 'E-mail ou senha incorretos.' : error.message);
  await openUserWorkspace(data.user);
});

document.querySelector('#signupButton').addEventListener('click', async () => {
  if (!authEmail.reportValidity() || !authPassword.reportValidity()) return;
  showAuthMessage('Criando sua conta...', true);
  const { data, error } = await supabaseClient.auth.signUp({
    email: authEmail.value.trim(),
    password: authPassword.value,
    options: { emailRedirectTo: window.location.origin }
  });
  if (error) return showAuthMessage(error.message);
  if (data.session) await openUserWorkspace(data.user);
  else showAuthMessage('Conta criada. Confirme o link enviado ao seu e-mail e depois entre.', true);
});

document.querySelector('#logoutButton').addEventListener('click', async () => {
  await persistCloudData();
  await supabaseClient.auth.signOut();
  [STORAGE_KEY, IDEAS_STORAGE_KEY, WORKFLOWS_STORAGE_KEY, SCRIPTS_STORAGE_KEY, REFERENCES_STORAGE_KEY, HISTORY_STORAGE_KEY].forEach((key) => localStorage.removeItem(key));
  window.location.reload();
});

supabaseClient.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') authScreen.hidden = false;
});

async function initializeAuth() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session?.user) await openUserWorkspace(session.user);
  else authScreen.hidden = false;
}

render();
renderIdeas();
renderWorkflows();
optimizeStoredWorkflowImages();
renderScripts();
renderReferences();
renderHistory();
renderPlanning();
initializeAuth();
