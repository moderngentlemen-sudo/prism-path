// vinext exits immediately after prerender. On Windows that can race native
// worker cleanup (UV_HANDLE_CLOSING). Give successful builds time to settle;
// propagate every failure unchanged. No build errors are suppressed.
import {rm} from 'node:fs/promises';
// Remove old static pages when moving between static and server builds.
await rm(new URL('../dist',import.meta.url),{recursive:true,force:true});
const exit = process.exit.bind(process);
if (process.platform === 'win32') {
  process.exit = (code = 0) => {
    if (code !== 0) return exit(code);
    setTimeout(() => exit(0), 2000);
  };
}
process.argv = [process.argv[0], 'vinext', 'build'];
await import(new URL('./cli.js',import.meta.resolve('vinext')).href);
