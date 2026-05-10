# Cookbook Automation

Automated static site cookbook pulled from a Google Sheets CSV.

Built using Next.js.

## How to Update Recipes

Because this is a statically generated site, adding a new recipe to your Google Sheet will not *instantly* show up on the website. The site needs to be rebuilt to pull in the newest data. 

Follow these steps to update your live site:

1. **Update the Google Sheet:**
   - Open your linked Google Sheet.
   - Add, edit, or delete rows as needed. (Remember that if your ingredients or instructions contain commas, you don't need to do anything special—Google handles the formatting for you).
   - *Note: Changes to a web-published Google Sheet can sometimes take up to 5 minutes to propagate on Google's servers.*

2. **Trigger a New Build (Manual):**
   - Go to your GitHub repository in your web browser.
   - Click on the **Actions** tab at the top.
   - On the left sidebar, click on the **Deploy Next.js site to Pages** workflow.
   - On the right side of the screen, click the **Run workflow** dropdown button, and then click the green **Run workflow** button.
   - Wait for the action to complete (turn green). Your live site is now updated!

3. **Automatic Updates:**
   - A GitHub Action is also scheduled to run automatically on the **1st of every month**. Any changes made to the sheet before then will be automatically deployed on that day without you having to click anything.
