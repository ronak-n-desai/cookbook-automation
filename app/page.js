import { getRecipes } from '@/lib/api';
import RecipeGallery from '@/components/RecipeGallery';

export default async function Home() {
  const recipes = await getRecipes();

  return (
    <main className="main-content">
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Claire & Ronak's Cookbook
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          A collection of our favorite recipes
        </p>
      </div>

      <RecipeGallery recipes={recipes} />
    </main>
  );
}
