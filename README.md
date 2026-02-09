# CompAI - Static Image Compositor

This is a **pure static** HTML/JS application for generating product image collages.  
No build steps, no Node.js, and no backend API keys required.

## Features
- **Smart Layouts:** Choose from 8 predefined templates.
- **Variable Pool:** Upload multiple product images to generate unique combinations instantly.
- **Fixed Hero:** Lock a specific image to the main slot.
- **High Res Export:** Support for 1K, 2K, and 4K output.
- **Package Download:** Download the composite + source images in a single ZIP.
- **Client-side only:** All processing happens in your browser. Images are never uploaded to a server.

## Deployment Guide (Vercel)

1.  **Create Repo:** Push this folder to a GitHub repository.
2.  **Import to Vercel:** Go to Vercel dashboard -> Add New -> Project -> Import your repo.
3.  **Configure:**
    -   **Framework Preset:** Select **Other** (or None).
    -   **Build Command:** Leave empty.
    -   **Output Directory:** Leave empty (it defaults to root).
4.  **Deploy:** Click Deploy.

That's it! Your site will be live instantly.

## Local Development
Simply double-click `index.html` to open it in your browser.