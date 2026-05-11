import sys
sys.stdout.reconfigure(encoding='utf-8')
import argparse
try:
    from recipe_scrapers import scrape_me
except ImportError:
    print("Please install the required package first:")
    print("pip install recipe-scrapers")
    sys.exit(1)

def format_ingredients(ingredient_groups):
    """
    Formats the ingredients into a markdown bulleted list.
    Handles groups (e.g. Marinade, Sauce) if the website provides them.
    """
    output = []
    for group in ingredient_groups:
        purpose = group.get("purpose")
        if purpose:
            # Subheaders in Title Case
            output.append(f"### {purpose.title()}")
        
        for ing in group.get("ingredients", []):
            # All ingredient text in lowercase
            output.append(f"- {ing.lower()}")
            
        # Add a blank line between sections for readability
        if purpose and group != ingredient_groups[-1]:
            output.append("")
            
    return "\n".join(output)

def format_instructions(instructions_list):
    """
    Formats the instructions into a markdown numbered list.
    """
    output = []
    for i, inst in enumerate(instructions_list, 1):
        # Keep original instruction text capitalization
        output.append(f"{i}. {inst}")
    return "\n".join(output)

def main():
    parser = argparse.ArgumentParser(description="Scrape a recipe URL and format it for the Cookbook spreadsheet.")
    parser.add_argument("url", help="The URL of the recipe to scrape")
    args = parser.parse_args()

    print(f"Scraping: {args.url}\n")
    try:
        # wild_mode=True allows it to scrape almost any site using schema.org Recipe metadata
        scraper = scrape_me(args.url)
        
        # Try to get ingredient groups (subheaders) if the site supports it
        try:
            ig = scraper.ingredient_groups()
            ingredients_md = format_ingredients(ig)
        except Exception:
            # Fallback if the site just has a flat list of ingredients without subheaders
            ingredients_md = format_ingredients([{"purpose": None, "ingredients": scraper.ingredients()}])
            
        instructions_md = format_instructions(scraper.instructions_list())
        
        print("="*60)
        print(f"RECIPE: {scraper.title()}")
        print("="*60)
        
        print("\n\n⬇️ INGREDIENTS (Copy below this line) ⬇️")
        print("-" * 40)
        print(ingredients_md)
        print("-" * 40)
        
        print("\n\n⬇️ INSTRUCTIONS (Copy below this line) ⬇️")
        print("-" * 40)
        print(instructions_md)
        print("-" * 40)
        print("\nDone!")
        
    except Exception as e:
        print(f"Error scraping recipe. The site might block scraping or not use standard recipe formatting.")
        print(f"Details: {e}")

if __name__ == "__main__":
    main()
