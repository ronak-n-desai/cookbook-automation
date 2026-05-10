import Link from 'next/link';

export default function RecipeCard({ recipe }) {
  const tags = recipe.Tags ? recipe.Tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <Link href={`/recipe/${recipe.slug}`} className="recipe-card">
      <div className="recipe-meta">
        <span className="tag-badge">{recipe['Cuisine Type'] || 'General'}</span>
        <span>{recipe.Meal || 'Any Time'}</span>
      </div>
      
      <h3>{recipe['Recipe Name']}</h3>
      
      {tags.length > 0 && (
        <div className="recipe-card-tags">
          {tags.map((tag, i) => (
            <span key={i} className="tag">#{tag}</span>
          ))}
        </div>
      )}
    </Link>
  );
}
