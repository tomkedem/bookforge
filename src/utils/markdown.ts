import { marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import hljs from 'highlight.js';

// Configure marked ONCE at module load time (not per-request).
// In Astro dev mode, frontmatter re-executes on every request.
// Calling marked.use() in frontmatter would stack plugins, causing
// exponential highlighting and eventual OOM.

marked.use(
  markedHighlight({
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    },
  })
);

const renderer = new marked.Renderer();
renderer.code = ({ text, lang }) => {
  const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
  const langAttr = lang ? ` data-lang="${lang}"` : '';
  return `<pre${langAttr}><code class="hljs language-${language}">${text}</code></pre>`;
};
marked.use({ renderer });

export { marked };
