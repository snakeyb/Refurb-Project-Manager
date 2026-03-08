export interface EspoContext {
  entityType?: string;
  entityId?: string;
  entityName?: string;
  espoUrl?: string;
  authToken?: string;
}

let cachedContext: EspoContext | null = null;

export function initEspoContext(): EspoContext {
  if (cachedContext) return cachedContext;

  const params = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  const ctx: EspoContext = {
    entityType: params.get("entityType") || hashParams.get("entityType") || undefined,
    entityId: params.get("entityId") || hashParams.get("entityId") || undefined,
    entityName: params.get("entityName") || hashParams.get("entityName") || undefined,
    espoUrl: params.get("espoUrl") || hashParams.get("espoUrl") || undefined,
    authToken: hashParams.get("auth") || undefined,
  };

  if (ctx.authToken || ctx.espoUrl) {
    const cleanUrl = window.location.pathname + window.location.search;
    window.history.replaceState(null, "", cleanUrl);
  }

  cachedContext = ctx;
  return ctx;
}

export function getEspoContext(): EspoContext {
  return cachedContext || initEspoContext();
}

export function setEspoContext(ctx: Partial<EspoContext>): void {
  cachedContext = { ...getEspoContext(), ...ctx };
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

export function hasEspoConnection(): boolean {
  const ctx = getEspoContext();
  return !!(ctx.espoUrl && ctx.authToken);
}

export function hasEspoEntityContext(): boolean {
  const ctx = getEspoContext();
  return !!(ctx.entityType && ctx.entityId);
}
