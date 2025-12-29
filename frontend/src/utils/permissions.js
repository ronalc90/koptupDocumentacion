const DEFAULT_MAP = {
  'standards.documentType.create': ['ADMIN', 'PO'],
  'standards.template.create': ['ADMIN', 'PO'],
  'standards.rule.create': ['ADMIN', 'PO'],
  'documents.document.create': ['ADMIN', 'PO', 'DEV'],
  'documents.document.edit': ['ADMIN', 'PO', 'DEV', 'QA'],
  'documents.comment.create': ['ADMIN', 'PO', 'DEV', 'QA'],
  'documents.attachment.upload': ['ADMIN', 'PO', 'DEV'],
  'validation.qaReview.create': ['ADMIN', 'PO', 'QA'],
  'validation.issue.create': ['ADMIN', 'PO', 'QA'],
  'validation.checkpoint.create': ['ADMIN', 'PO', 'QA'],
  'checklist.checklist.create': ['ADMIN', 'PO'],
  'checklist.item.create': ['ADMIN', 'PO', 'DEV', 'QA'],
  'checklist.issue.create': ['ADMIN', 'PO', 'QA'],
  'checklist.certificate.create': ['ADMIN'],
  'audit.complianceReport.create': ['ADMIN', 'PO'],
  'audit.retentionPolicy.create': ['ADMIN'],
  'audit.securityEvent.create': ['ADMIN'],
  'agile.epic.create': ['ADMIN', 'PO'],
  'agile.story.create': ['ADMIN', 'PO'],
  'agile.task.create': ['ADMIN', 'DEV', 'QA'],
};

const ROLES = ['ADMIN', 'PO', 'DEV', 'QA', 'CLIENT'];
const STORAGE_KEY = 'permissionsOverrides';

export const getDefaultMap = () => ({ ...DEFAULT_MAP });

export const loadOverrides = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveOverrides = (overrides) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides || {}));
};

export const resetOverrides = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getAllowedRoles = (action) => {
  const overrides = loadOverrides();
  const base = DEFAULT_MAP[action] || [];
  const ov = overrides[action];
  return Array.isArray(ov) ? ov : base;
};

export const listActions = () => Object.keys(DEFAULT_MAP);

export const listRoles = () => [...ROLES];

export const can = (role, action) => {
  if (role === 'ADMIN') return true;
  const allowed = getAllowedRoles(action);
  return allowed.includes(role);
};
