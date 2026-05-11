import { getRecipes, getRecipeBySlug } from '@/lib/api';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

// Generate static routes at build time
export async function generateStaticParams() {
  const recipes = await getRecipes();
  return recipes.map((recipe) => ({
    slug: recipe.slug,
  }));
}

export default async function RecipePage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const recipe = await getRecipeBySlug(slug);

  if (!recipe) {
    return (
      <div className="main-content empty-state">
        <h1>Recipe not found</h1>
        <Link href="/" style={{ color: 'var(--accent-color)' }}>← Back to home</Link>
      </div>
    );
  }

  const ingredients = recipe.Ingredients ? recipe.Ingredients.split('\n').filter(Boolean) : [];
  const description = recipe.Description || recipe.Tags;

  return (
    <main className="main-content">
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>←</span> Back to home
        </Link>
      </div>

      <header className="recipe-header">
        <h1 className="recipe-title">{recipe['Recipe Name']}</h1>
        <div className="recipe-meta" style={{ justifyContent: 'flex-start', gap: '1.5rem', fontSize: '1rem' }}>
          <span className="tag-badge">{recipe['Cuisine Type']}</span>
          <span>{recipe.Meal}</span>
        </div>
        {description && (
          <p className="recipe-description" style={{ marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.6' }}>
            {description}
          </p>
        )}
      </header>

      <div className="recipe-content">
        <aside className="ingredients-panel">
          <h3>Ingredients</h3>
          {ingredients.length > 0 ? (
            <ul className="ingredients-list">
              {ingredients.map((ing, idx) => (
                <li key={idx}>{ing}</li>
              ))}
            </ul>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No ingredients listed.</p>
          )}
        </aside>

        <section className="markdown-content">
          {recipe.Instructions ? (
            <ReactMarkdown>{recipe.Instructions}</ReactMarkdown>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No instructions provided.</p>
          )}
        </section>
      </div>
    </main>
  );
}
