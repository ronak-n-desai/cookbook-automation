import Link from 'next/link';

export default function RecipeCard({ recipe }) {
  const description = recipe.Description || recipe.Tags;

  return (
    <Link href={`/recipe/${recipe.slug}`} className="recipe-card">
      <div className="recipe-meta">
        <span className="tag-badge">{recipe['Cuisine Type'] || 'General'}</span>
        <span>{recipe.Meal || 'Any Time'}</span>
      </div>
      
      <h3>{recipe['Recipe Name']}</h3>
      
      {description && (
        <p className="recipe-card-description" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1rem', lineHeight: '1.4' }}>
          {description}
        </p>
      )}
    </Link>
  );
}
