'use client';

import { useState } from 'react';

// --- Core scraping logic (mirrors scrape_recipe.py) ---

function formatIngredients(ingredientGroups) {
  const lines = [];
  for (const group of ingredientGroups) {
    const purpose = group.purpose;
    if (purpose) {
      lines.push(`### ${purpose.replace(/\b\w/g, (c) => c.toUpperCase())}`);
    }
    for (const ing of group.ingredients || []) {
      lines.push(`- ${ing.toLowerCase()}`);
    }
    if (purpose && group !== ingredientGroups[ingredientGroups.length - 1]) {
      lines.push('');
    }
  }
  return lines.join('\n');
}

function formatInstructions(instructionsList, sourceUrl = null) {
  const formatted = instructionsList
    .map((inst, i) => {
      let text = inst.trim();
      if (!text) return "";
      // Capitalize the first letter of every sentence
      text = text.replace(/(^|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());
      return `${i + 1}. ${text}`;
    })
    .join('\n');

  if (sourceUrl) {
    return `${formatted}\n\nSource: [Original Recipe](${sourceUrl})`;
  }
  return formatted;
}

function extractRecipeFromLD(ldJson) {
  // Handle @graph arrays (common on many sites)
  if (ldJson['@graph']) {
    const recipe = ldJson['@graph'].find((item) => {
      const type = item['@type'];
      const typeList = Array.isArray(type) ? type : [type];
      return typeList.includes('Recipe');
    });
    if (recipe) return recipe;
  }
  // Handle root-level @type (may be a string OR an array like ['Recipe','NewsArticle'])
  const type = ldJson['@type'];
  const typeList = Array.isArray(type) ? type : [type];
  if (typeList.includes('Recipe')) {
    return ldJson;
  }
  return null;
}

function parseRecipeFromHtml(html) {
  const scriptRegex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1].trim());
      // Handle both single objects and arrays at the root
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const candidate of candidates) {
        const recipe = extractRecipeFromLD(candidate);
        if (recipe) return recipe;
      }
    } catch {
      // malformed JSON-LD, skip
    }
  }
  return null;
}

function parseInstructions(recipe) {
  const raw = recipe.recipeInstructions;
  if (!raw) return [];
  if (typeof raw === 'string') {
    // Plain text — split on newlines or numbered patterns
    return raw
      .split(/\n+/)
      .map((s) => s.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);
  }
  if (Array.isArray(raw)) {
    const steps = [];
    for (const item of raw) {
      if (typeof item === 'string') {
        steps.push(item.trim());
      } else if (item['@type'] === 'HowToStep') {
        steps.push((item.text || item.name || '').trim());
      } else if (item['@type'] === 'HowToSection') {
        for (const step of item.itemListElement || []) {
          steps.push((step.text || step.name || '').trim());
        }
      }
    }
    return steps.filter(Boolean);
  }
  return [];
}

function parseIngredients(recipe) {
  const raw = recipe.recipeIngredient;
  if (!Array.isArray(raw)) return [{ purpose: null, ingredients: [] }];
  return [{ purpose: null, ingredients: raw.map((s) => s.trim()) }];
}

// --- Component ---

export default function RecipeScraper() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [copiedField, setCopiedField] = useState(null);

  async function handleScrape(e) {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    setTitle('');
    setIngredients('');
    setInstructions('');

    try {
      // ── Cloudflare Worker CORS proxy ──
      const WORKER_URL = 'https://cookbook-proxy.ronak-n-desai.workers.dev';

      const targetUrl = url.trim();
      const proxyUrl = `${WORKER_URL}?url=${encodeURIComponent(targetUrl)}`;

      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error(`Proxy returned HTTP ${res.status}`);
      const html = await res.text();
      if (!html) throw new Error('Proxy returned an empty response.');

      const recipe = parseRecipeFromHtml(html);
      if (!recipe) {
        throw new Error(
          "Could not find structured recipe data (schema.org) on this page. The site may not support automatic scraping."
        );
      }

      const instructionsList = parseInstructions(recipe);
      const ingredientGroups = parseIngredients(recipe);

      setTitle(recipe.name || 'Recipe');
      setIngredients(formatIngredients(ingredientGroups));
      setInstructions(formatInstructions(instructionsList, targetUrl));
    } catch (err) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text, field) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  }

  const hasResults = title && (ingredients || instructions);

  return (
    <div className="scraper-container">
      <form className="scraper-form" onSubmit={handleScrape}>
        <div className="scraper-input-row">
          <input
            id="recipe-url-input"
            className="search-input scraper-url-input"
            type="url"
            placeholder="Paste a recipe URL here…"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            disabled={loading}
          />
          <button
            id="scrape-recipe-btn"
            className="scraper-btn"
            type="submit"
            disabled={loading || !url.trim()}
          >
            {loading ? (
              <span className="scraper-spinner" />
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                Scrape Recipe
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="scraper-error" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {hasResults && (
        <div className="scraper-results">
          <h2 className="scraper-recipe-title">{title}</h2>

          <div className="scraper-output-grid">
            {/* Ingredients */}
            <div className="scraper-output-panel">
              <div className="scraper-panel-header">
                <h3>Ingredients</h3>
                <button
                  id="copy-ingredients-btn"
                  className={`scraper-copy-btn ${copiedField === 'ingredients' ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(ingredients, 'ingredients')}
                >
                  {copiedField === 'ingredients' ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
              <textarea
                id="ingredients-output"
                className="scraper-textarea"
                readOnly
                value={ingredients}
                rows={Math.max(8, ingredients.split('\n').length + 2)}
              />
            </div>

            {/* Instructions */}
            <div className="scraper-output-panel">
              <div className="scraper-panel-header">
                <h3>Instructions</h3>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  {url && (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textDecoration: 'underline' }}
                    >
                      View Original
                    </a>
                  )}
                  <button
                    id="copy-instructions-btn"
                    className={`scraper-copy-btn ${copiedField === 'instructions' ? 'copied' : ''}`}
                    onClick={() => copyToClipboard(instructions, 'instructions')}
                  >
                    {copiedField === 'instructions' ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
              <textarea
                id="instructions-output"
                className="scraper-textarea"
                readOnly
                value={instructions}
                rows={Math.max(8, instructions.split('\n').length + 2)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
