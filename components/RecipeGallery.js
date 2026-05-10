'use client';

import { useState, useMemo } from 'react';
import RecipeCard from './RecipeCard';

export default function RecipeGallery({ recipes }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('');

  // Extract unique filter options
  const cuisines = useMemo(() => {
    const set = new Set(recipes.map(r => r['Cuisine Type']).filter(Boolean));
    return Array.from(set).sort();
  }, [recipes]);

  const meals = useMemo(() => {
    const set = new Set(recipes.map(r => r.Meal).filter(Boolean));
    return Array.from(set).sort();
  }, [recipes]);

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = recipe['Recipe Name']?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            recipe.Tags?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCuisine = selectedCuisine ? recipe['Cuisine Type'] === selectedCuisine : true;
      const matchesMeal = selectedMeal ? recipe.Meal === selectedMeal : true;
      
      return matchesSearch && matchesCuisine && matchesMeal;
    });
  }, [recipes, searchQuery, selectedCuisine, selectedMeal]);

  return (
    <>
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search recipes or tags..." 
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select 
          className="filter-select"
          value={selectedCuisine}
          onChange={(e) => setSelectedCuisine(e.target.value)}
        >
          <option value="">All Cuisines</option>
          {cuisines.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select 
          className="filter-select"
          value={selectedMeal}
          onChange={(e) => setSelectedMeal(e.target.value)}
        >
          <option value="">All Meals</option>
          {meals.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {filteredRecipes.length > 0 ? (
        <div className="recipe-grid">
          {filteredRecipes.map(recipe => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No recipes found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      )}
    </>
  );
}
