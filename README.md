# osama-fawad.github.io

This is my personal portfolio website, built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

## CV download behavior

- I put my CV PDF files inside `public/cv/`.
- The **Download CV** buttons automatically download the most recently modified `.pdf` file from that folder.
- If no PDF is found, the app falls back to `/cv/CV.pdf`.

## Prerequisites

- Activate the Conda environment named `portfolio`

## Setup (first time)

```bash
export PATH="/home/osama/miniconda3/envs/portfolio/bin:$PATH"
cd /home/osama/Desktop/PROJECTS/osama-fawad.github.io
npm install --legacy-peer-deps
```

## Run locally (recommended for development)

```bash
export PATH="/home/osama/miniconda3/envs/portfolio/bin:$PATH"
cd /home/osama/Desktop/PROJECTS/osama-fawad.github.io
npm run dev -- --port 3000
```

Then I open:

- `http://localhost:3000`

This mode automatically updates the page when I change code.

## Static build (optional)

If I want to generate static HTML files, I run:

```bash
export PATH="/home/osama/miniconda3/envs/portfolio/bin:$PATH"
cd /home/osama/Desktop/PROJECTS/osama-fawad.github.io
npm run build
```

The generated static files are placed in `out/`.

I can open the built site directly from `out/en/index.html` using a browser or a file server.

## Summary

- To develop and preview changes instantly: use `npm run dev -- --port 3000`
- To view the final static output: run `npm run build` and open `out/en/index.html`
- The dev server reloads automatically when code changes; static HTML does not update until you rebuild
