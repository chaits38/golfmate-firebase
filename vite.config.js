import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index:       resolve(__dirname, 'public/index.html'),
        signup:      resolve(__dirname, 'public/signup.html'),
        dashboard:   resolve(__dirname, 'public/dashboard.html'),
        'new-round': resolve(__dirname, 'public/new-round.html'),
        history:     resolve(__dirname, 'public/history.html'),
        stats:       resolve(__dirname, 'public/stats.html'),
        courses:     resolve(__dirname, 'public/courses.html'),
        leaderboard: resolve(__dirname, 'public/leaderboard.html'),
      }
    }
  }
});
