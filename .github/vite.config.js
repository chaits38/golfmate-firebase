import { defineConfig } from 'vite';

export default defineConfig({
  root: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index:       'public/index.html',
        signup:      'public/signup.html',
        dashboard:   'public/dashboard.html',
        'new-round': 'public/new-round.html',
        history:     'public/history.html',
        stats:       'public/stats.html',
        courses:     'public/courses.html',
        leaderboard: 'public/leaderboard.html',
      }
    }
  }
});