import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Helper function to create slugs
export function generateSlug(name) {
  if (!name) return '';
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function getRecipes() {
  let csvText = '';
  
  const sheetUrl = process.env.NEXT_PUBLIC_SHEET_URL;
  
  if (sheetUrl) {
    try {
      const res = await fetch(sheetUrl, { next: { revalidate: 3600 } });
      if (!res.ok) {
        throw new Error(`Failed to fetch CSV from Google Sheets: ${res.statusText}`);
      }
      csvText = await res.text();
    } catch (error) {
      console.error("Error fetching from Google Sheets URL, falling back to local file if available.", error);
      csvText = loadLocalCsv();
    }
  } else {
    // Fallback to local mock data
    csvText = loadLocalCsv();
  }

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((recipe) => ({
          ...recipe,
          slug: generateSlug(recipe['Recipe Name'])
        }));
        resolve(data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
}

function loadLocalCsv() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'recipes.csv');
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error("Could not load local recipes.csv", err);
    return '';
  }
}

export async function getRecipeBySlug(slug) {
  const recipes = await getRecipes();
  return recipes.find((r) => r.slug === slug) || null;
}
