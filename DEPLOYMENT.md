# 🚀 Deployment Guide

## GitHub Repository Setup

After creating your repository on GitHub, run these commands in your terminal:

```bash
# Add GitHub remote
git remote add origin https://github.com/sunilrathore24/kanban-board.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## GitHub Pages Setup

1. Go to your repository on GitHub: https://github.com/sunilrathore24/kanban-board
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**, select **GitHub Actions** (NOT "Deploy from a branch")
5. The workflow will automatically deploy your Storybook

## Automatic Deployment

The repository includes a GitHub Actions workflow that will:
- ✅ Automatically build Storybook on every push to main
- ✅ Deploy to GitHub Pages
- ✅ Make your Kanban board available at: `https://sunilrathore24.github.io/kanban-board/`

## Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Build Storybook
npm run build-storybook

# Deploy to GitHub Pages (requires gh-pages package)
npm install --save-dev gh-pages
npx gh-pages -d storybook-static
```

## Environment Variables (Optional)

For production deployments, you may want to set:
- `NODE_ENV=production`
- Custom API endpoints
- WebSocket server URLs

## Troubleshooting

### Build Fails
- Check Node.js version (requires 18+)
- Clear node_modules: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build`

### GitHub Pages Not Working
- Ensure repository is public
- Check GitHub Actions tab for build errors
- Verify Pages source is set to "GitHub Actions"

### Storybook Not Loading
- Check browser console for errors
- Verify all assets are loading correctly
- Check if base URL needs adjustment

## Custom Domain (Optional)

To use a custom domain:
1. Add a `CNAME` file to the repository root
2. Configure DNS settings with your domain provider
3. Update GitHub Pages settings

## Security Considerations

- Keep dependencies updated
- Review GitHub Actions permissions
- Use environment variables for sensitive data
- Enable branch protection rules for production
