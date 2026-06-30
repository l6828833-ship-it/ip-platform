import { trpc } from "@/lib/trpc";
import { useEffect } from "react";

// Attribute used to tag every node we inject so we can clean it up / avoid
// injecting the same markup twice.
const MARKER_ATTR = "data-custom-code";

/**
 * Parses an HTML string and appends its nodes to `target`. Plain
 * innerHTML assignment does NOT execute <script> tags, so we recreate each
 * script element manually so analytics / tracking / chat snippets actually run.
 */
function injectHtml(target: HTMLElement, html: string, marker: string) {
  if (!html.trim()) return;

  const template = document.createElement("template");
  template.innerHTML = html;

  const nodes = Array.from(template.content.childNodes);
  for (const node of nodes) {
    if (node instanceof HTMLScriptElement) {
      // Recreate scripts so the browser executes them.
      const script = document.createElement("script");
      for (const attr of Array.from(node.attributes)) {
        script.setAttribute(attr.name, attr.value);
      }
      script.text = node.text;
      script.setAttribute(MARKER_ATTR, marker);
      target.appendChild(script);
    } else {
      if (node instanceof HTMLElement) {
        node.setAttribute(MARKER_ATTR, marker);
      }
      target.appendChild(node);
    }
  }
}

function removeInjected(marker: string) {
  document
    .querySelectorAll(`[${MARKER_ATTR}="${marker}"]`)
    .forEach((el) => el.remove());
}

/**
 * Injects admin-configured custom HTML into the page <head> and <body>.
 * Renders nothing. The markup is managed by admins via Admin > Custom Code.
 */
export default function CustomCodeInjector() {
  const { data } = trpc.settings.publicCustomCode.useQuery(undefined, {
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const headHtml = data?.headHtml ?? "";
  const bodyHtml = data?.bodyHtml ?? "";

  useEffect(() => {
    if (!headHtml) return;
    removeInjected("head");
    injectHtml(document.head, headHtml, "head");
    return () => removeInjected("head");
  }, [headHtml]);

  useEffect(() => {
    if (!bodyHtml) return;
    removeInjected("body");
    injectHtml(document.body, bodyHtml, "body");
    return () => removeInjected("body");
  }, [bodyHtml]);

  return null;
}
