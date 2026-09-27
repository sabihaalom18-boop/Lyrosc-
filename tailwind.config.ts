import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: { wine: '#722F37', wineDark: '#58181F', gold: '#FFD700' },
      boxShadow: { gold: '0 0 30px rgba(255,215,0,.18)', goldStrong: '0 0 40px rgba(255,215,0,.3)' }
    }
  },
  plugins: []
};
export default config;
