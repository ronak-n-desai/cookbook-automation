import RecipeScraper from '@/components/RecipeScraper';

export const metadata = {
  title: 'Recipe Scraper — Cookbook',
  description: 'Paste any recipe URL to instantly extract ingredients and instructions ready to copy into your spreadsheet.',
};

export default function ScraperPage() {
  return (
    <main className="main-content">
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '2.5rem',
            marginBottom: '0.75rem',
            background: 'var(--accent-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Recipe Scraper
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto' }}>
          Paste any recipe URL below. We'll extract the ingredients and instructions so you can copy them straight into your spreadsheet.
        </p>
      </div>

      <RecipeScraper />
    </main>
  );
}
