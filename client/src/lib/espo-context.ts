export interface EspoContext {
  entityType?: string;
  entityId?: string;
  entityName?: string;
  espoUrl?: string;
}

export function getEspoContext(): EspoContext {
  const params = new URLSearchParams(window.location.search);
  return {
    entityType: params.get("entityType") || undefined,
    entityId: params.get("entityId") || undefined,
    entityName: params.get("entityName") || undefined,
    espoUrl: params.get("espoUrl") || undefined,
  };
}

function isValidHttpUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function buildEspoEntityUrl(espoUrl: string, entityType: string, entityId: string): string | null {
  if (!isValidHttpUrl(espoUrl)) return null;
  const base = espoUrl.replace(/\/+$/, "");
  return `${base}/#${entityType}/view/${entityId}`;
}

export function hasEspoContext(): boolean {
  const ctx = getEspoContext();
  return !!(ctx.entityType && ctx.entityId);
}
