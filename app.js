const STORAGE_KEY = 'organiza-kanban-cards';
const IDEAS_STORAGE_KEY = 'organiza-ideas';
const statuses = { backlog: 'CAIXA DE ENTRADA', doing: 'EM PRODUÇÃO', done: 'CONCLUÍDO' };
const priorityLabels = { low: 'tranquilo', medium: 'importante', high: 'urgente' };
const WORKFLOWS_STORAGE_KEY = 'organiza-workflows';
const SCRIPTS_STORAGE_KEY = 'organiza-scripts';
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
let selectedScriptId = scripts[0]?.id;
let namingScriptId = null;
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
const scriptTabs = document.querySelector('#scriptTabs');
const scriptTitle = document.querySelector('#scriptTitle');
const scriptBody = document.querySelector('#scriptBody');
const scriptSaved = document.querySelector('#scriptSaved');
const scriptNameModalBackdrop = document.querySelector('#scriptNameModalBackdrop');
const scriptNameForm = document.querySelector('#scriptNameForm');
const scriptNameInput = document.querySelector('#scriptNameInput');

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
    if (Array.isArray(savedScripts) && savedScripts.length) return savedScripts;
  } catch (error) {
    // Fall through to starter scripts.
  }
  return [
    { id: crypto.randomUUID(), name: 'Vídeos do YouTube (longo)', title: 'Roteiro: vídeo longo', body: '<p><strong>Abertura</strong></p><p>Apresente o tema e a promessa do vídeo.</p><ul><li>Gancho nos primeiros segundos</li><li>Contexto rápido para quem chegou agora</li></ul><p><strong>Desenvolvimento</strong></p><ol><li>Explique o primeiro ponto</li><li>Mostre um exemplo prático</li></ol>', updatedAt: Date.now() },
    { id: crypto.randomUUID(), name: 'TikTok / Reels', title: 'Roteiro: vídeo curto', body: '<p>Gancho direto e visual.</p><ul><li>Problema</li><li>Solução</li><li>Chamada para ação</li></ul>', updatedAt: Date.now() }
  ];
}

function saveCards() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  document.querySelector('.saved-status').innerHTML = '<span class="status-dot"></span>salvo agora';
}

function saveIdeas() {
  localStorage.setItem(IDEAS_STORAGE_KEY, JSON.stringify(ideas));
}

function saveWorkflows() {
  localStorage.setItem(WORKFLOWS_STORAGE_KEY, JSON.stringify(workflows));
}

function saveScripts() {
  localStorage.setItem(SCRIPTS_STORAGE_KEY, JSON.stringify(scripts));
}

function getSelectedScript() {
  return scripts.find((script) => script.id === selectedScriptId) || scripts[0];
}

function renderScripts() {
  const script = getSelectedScript();
  if (!script) return;
  selectedScriptId = script.id;
  scriptTabs.innerHTML = scripts.map((item) => `<button class="script-tab ${item.id === script.id ? 'active' : ''}" type="button" data-script-id="${item.id}">${escapeHtml(item.name)}</button>`).join('');
  scriptTabs.querySelectorAll('[data-script-id]').forEach((tab) => tab.addEventListener('click', () => { selectedScriptId = tab.dataset.scriptId; renderScripts(); }));
  scriptTitle.value = script.title || '';
  scriptBody.innerHTML = script.body || '<p><br></p>';
  updateScriptWordCount();
}

function persistCurrentScript() {
  const script = getSelectedScript();
  if (!script) return;
  script.title = scriptTitle.value.trim();
  script.body = scriptBody.innerHTML;
  script.updatedAt = Date.now();
  saveScripts();
  scriptSaved.textContent = 'salvo agora';
}

function updateScriptWordCount() {
  const text = scriptBody.textContent.trim();
  document.querySelector('#scriptWordCount').textContent = text ? text.split(/\s+/).length : 0;
}

function createScript() {
  const script = { id: crypto.randomUUID(), name: 'Novo roteiro', title: 'Novo roteiro', body: '<p><br></p>', updatedAt: Date.now() };
  scripts.push(script);
  selectedScriptId = script.id;
  saveScripts();
  renderScripts();
  scriptTitle.focus();
  scriptTitle.select();
}

function renameScript() {
  const script = getSelectedScript();
  namingScriptId = script.id;
  document.querySelector('#scriptNameModalTitle').textContent = 'Renomear aba';
  scriptNameInput.value = script.name;
  scriptNameModalBackdrop.hidden = false;
  requestAnimationFrame(() => scriptNameInput.focus());
}

function openNewScriptNameEditor() {
  namingScriptId = null;
  document.querySelector('#scriptNameModalTitle').textContent = 'Nova aba de roteiro';
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

function showPage(page) {
  const showingIdeas = page === 'ideas';
  const showingWorkflow = page === 'workflow';
  const showingScripts = page === 'scripts';
  kanbanPage.hidden = showingIdeas || showingWorkflow || showingScripts;
  ideasPage.hidden = !showingIdeas;
  workflowPage.hidden = !showingWorkflow;
  scriptsPage.hidden = !showingScripts;
  kanbanNav.classList.toggle('active', !showingIdeas && !showingWorkflow && !showingScripts);
  ideasNav.classList.toggle('active', showingIdeas);
  workflowNav.classList.toggle('active', showingWorkflow);
  scriptsNav.classList.toggle('active', showingScripts);
  kanbanNav.toggleAttribute('aria-current', !showingIdeas && !showingWorkflow && !showingScripts);
  ideasNav.toggleAttribute('aria-current', showingIdeas);
  workflowNav.toggleAttribute('aria-current', showingWorkflow);
  scriptsNav.toggleAttribute('aria-current', showingScripts);
  if (showingIdeas) renderIdeas();
  if (showingWorkflow) renderWorkflows();
  if (showingScripts) renderScripts();
}

function formatDate(timestamp) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(timestamp).replace('.', '');
}

function render() {
  document.querySelectorAll('.cards-list').forEach((list) => { list.innerHTML = ''; });
  document.querySelectorAll('.column').forEach((column) => {
    const status = column.dataset.status;
    const statusCards = cards.filter((card) => card.status === status);
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
    <div class="card-topline"><span class="card-tag">${priorityLabels[card.priority]}</span><time class="card-date">${formatDate(card.createdAt)}</time></div>
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
  movingCard.status = status;

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
    cards = cards.map((card) => card.id === editingId ? { ...card, ...values } : card);
  } else {
    cards.unshift({ id: crypto.randomUUID(), ...values, createdAt: Date.now() });
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
document.querySelector('#renameScriptButton').addEventListener('click', renameScript);
scriptNameForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = scriptNameInput.value.trim();
  if (!name) return;
  if (namingScriptId) getSelectedScript().name = name;
  else {
    const script = { id: crypto.randomUUID(), name, title: name, body: '<p><br></p>', updatedAt: Date.now() };
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

render();
renderIdeas();
renderWorkflows();
optimizeStoredWorkflowImages();
renderScripts();
