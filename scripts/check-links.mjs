/**
 * scripts/check-links.mjs
 *
 * Scans the src/ directory for internal links (href, Link, router.push/replace, redirect, notifications)
 * and resolves them against actual routes in src/app.
 * Supports dynamic segments like [slug], [id], [taskId].
 *
 * Usage:
 *   node scripts/check-links.mjs
 *
 * Exits with code 1 if any broken or mismatched internal links are found.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const appDir = path.resolve(projectRoot, "src/app");
const srcDir = path.resolve(projectRoot, "src");

// 1. Collect all valid page routes from src/app
function collectAppRoutes(dir, baseRoute = "") {
  const routes = [];
  if (!fs.existsSync(dir)) return routes;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      // Ignore API routes
      if (entry.name === "api") continue;

      // Handle Route Groups e.g. (marketing) -> do not add to URL path
      if (entry.name.startsWith("(") && entry.name.endsWith(")")) {
        routes.push(...collectAppRoutes(path.join(dir, entry.name), baseRoute));
      } else {
        const seg = entry.name;
        routes.push(...collectAppRoutes(path.join(dir, entry.name), `${baseRoute}/${seg}`));
      }
    } else if (
      entry.name === "page.tsx" ||
      entry.name === "page.ts" ||
      entry.name === "page.jsx" ||
      entry.name === "page.js"
    ) {
      routes.push(baseRoute === "" ? "/" : baseRoute);
    }
  }
  return routes;
}

const validRoutes = collectAppRoutes(appDir);

// Convert a route pattern to a RegExp (e.g. /internships/[slug] -> ^/internships/[^/]+$)
function routeToRegex(route) {
  if (!route.includes("[")) {
    return new RegExp(`^${route}$`);
  }
  // Replace [param] with [^/]+ and catch-all [...param] with .+
  const pattern = route
    .replace(/\[\.\.\.[^\]]+\]/g, ".+")
    .replace(/\[[^\]]+\]/g, "[^/]+");
  return new RegExp(`^${pattern}$`);
}

const routeRegexes = validRoutes.map((r) => ({
  route: r,
  regex: routeToRegex(r),
}));

function isValidRoute(urlPath) {
  if (!urlPath || urlPath === "/" || urlPath === "") return true;

  // Clean query strings and hashes
  const clean = urlPath.split("?")[0].split("#")[0];
  if (clean === "" || clean === "/") return true;

  // Match against exact route list or regexes
  return routeRegexes.some(({ regex }) => regex.test(clean));
}

// 2. Scan src files for internal link occurrences
function getSourceFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      files.push(...getSourceFiles(full));
    } else if (
      entry.name.endsWith(".tsx") ||
      entry.name.endsWith(".ts") ||
      entry.name.endsWith(".jsx") ||
      entry.name.endsWith(".js")
    ) {
      files.push(full);
    }
  }
  return files;
}

const sourceFiles = getSourceFiles(srcDir);
const brokenLinks = [];

// Check whether a target string looks like an internal path
function shouldCheckPath(p) {
  if (!p || typeof p !== "string") return false;
  if (!p.startsWith("/")) return false;
  if (p.startsWith("//")) return false; // protocol-relative URL
  if (p.startsWith("/api/")) return false; // api endpoint
  if (p.startsWith("/_next/")) return false; // next assets
  // Static files with extensions
  if (/\.(png|jpe?g|svg|ico|webp|gif|pdf|txt|xml|json|woff2?|ttf|eot)$/i.test(p)) {
    return false;
  }
  return true;
}

for (const filePath of sourceFiles) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const relFile = path.relative(projectRoot, filePath).replace(/\\/g, "/");

  // Skip this script itself
  if (relFile.includes("check-links")) continue;

  lines.forEach((lineText, lineIdx) => {
    const lineNum = lineIdx + 1;

    // 1. Static href="..." or href='...'
    const staticHrefMatches = lineText.matchAll(/href\s*=\s*["'](\/[^"'#?]*)["'#?]/g);
    for (const m of staticHrefMatches) {
      const p = m[1];
      if (shouldCheckPath(p) && !isValidRoute(p)) {
        brokenLinks.push({
          file: relFile,
          line: lineNum,
          link: p,
          snippet: lineText.trim(),
        });
      }
    }

    // 2. Template href={`/something...`}
    const templateHrefMatches = lineText.matchAll(/href\s*=\s*\{`(\/[^`$#?]*)/g);
    for (const m of templateHrefMatches) {
      const prefix = m[1];
      if (shouldCheckPath(prefix)) {
        // Strip trailing slash for comparison
        const normPrefix = prefix.length > 1 && prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
        const matchesAny = validRoutes.some((r) => {
          if (r === normPrefix) return true;
          if (r.startsWith(normPrefix + "/")) return true;
          if (r.includes("[")) {
            const rBase = r.split("/[")[0];
            if (rBase !== "" && rBase !== "/") {
              if (rBase === normPrefix || rBase.startsWith(normPrefix + "/") || normPrefix.startsWith(rBase + "/")) {
                return true;
              }
            }
          }
          return false;
        });
        if (!matchesAny) {
          brokenLinks.push({
            file: relFile,
            line: lineNum,
            link: prefix + "...",
            snippet: lineText.trim(),
          });
        }
      }
    }

    // 3. router.push(...) or router.replace(...)
    const routerMatches = lineText.matchAll(/router\.(?:push|replace)\s*\(\s*["'`](\/[^"'`#?]*)["'`#?]/g);
    for (const m of routerMatches) {
      const p = m[1];
      if (shouldCheckPath(p) && !isValidRoute(p)) {
        brokenLinks.push({
          file: relFile,
          line: lineNum,
          link: p,
          snippet: lineText.trim(),
        });
      }
    }

    // 4. redirect(...)
    const redirectMatches = lineText.matchAll(/redirect\s*\(\s*["'`](\/[^"'`#?]*)["'`#?]/g);
    for (const m of redirectMatches) {
      const p = m[1];
      if (shouldCheckPath(p) && !isValidRoute(p)) {
        brokenLinks.push({
          file: relFile,
          line: lineNum,
          link: p,
          snippet: lineText.trim(),
        });
      }
    }

    // 5. link: "..." (notification links, etc.)
    const notifMatches = lineText.matchAll(/link\s*:\s*["'`](\/[^"'`#?]*)["'`#?]/g);
    for (const m of notifMatches) {
      const p = m[1];
      if (shouldCheckPath(p) && !isValidRoute(p)) {
        brokenLinks.push({
          file: relFile,
          line: lineNum,
          link: p,
          snippet: lineText.trim(),
        });
      }
    }
  });
}

// Print summary
console.log("=".repeat(70));
console.log("INTERNAL LINK CHECKER  --  CodeElevate");
console.log("=".repeat(70));
console.log(`Discovered ${validRoutes.length} valid app page routes in src/app:`);
validRoutes.sort().forEach((r) => console.log(`  ✓ ${r}`));
console.log(`\nScanned ${sourceFiles.length} source files in src/`);

if (brokenLinks.length > 0) {
  console.log("\n" + "!".repeat(70));
  console.log(`FAILED: Found ${brokenLinks.length} broken or mismatched internal link(s):`);
  console.log("!".repeat(70));
  brokenLinks.forEach((item, idx) => {
    console.log(`\n[${idx + 1}] ${item.file}:${item.line}`);
    console.log(`    Link:    "${item.link}"`);
    console.log(`    Snippet: ${item.snippet}`);
  });
  console.log("\n" + "=".repeat(70));
  process.exit(1);
} else {
  console.log("\n" + "✓".repeat(70));
  console.log("SUCCESS: All internal links resolve to valid src/app pages!");
  console.log("✓".repeat(70));
  process.exit(0);
}
