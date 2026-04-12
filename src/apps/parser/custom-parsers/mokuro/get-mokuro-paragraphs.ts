import { Paragraph } from '../../../batches/types';

// OPTIMIZATION: Compile Regex once.
// Matches vertical text punctuation common in manga (Vertical Ellipses, Double Bangs, etc.)
const REPLACEMENT_REGEX = /．．．|．．|！！|！？/g;

// Map for O(1) lookup during text normalization
const REPLACEMENTS: Record<string, string> = {
  '．．．': '…',
  '．．': '…',
  '！！': '‼',
  '！？': '⁉',
};

// Extracts text from Mokuro DOM elements for tokenization.
export const getMokuroParagraphs = (
  node: Node | Element,
  _filter?: (node: Node | Element) => boolean,
): Paragraph[] => {
  const page = node as HTMLElement;
  // getElementsByClassName returns a live HTMLCollection (faster than querySelectorAll)
  const textBoxes = page.getElementsByClassName('textBox');
  const result: Paragraph[] = [];

  for (const box of Array.from(textBoxes)) {
    const fragments = [];
    let offset = 0;

    for (const child of Array.from(box.children)) {
      const p = child as HTMLElement;

      if (p.tagName !== 'P') {
        continue;
      }

      // TreeWalker: Efficiently finds all text nodes while skipping junk
      const walker = document.createTreeWalker(p, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          // Skip empty text nodes or Svelte artifacts (zero-width spaces)
          // This filters them out before they even reach the loop below.
          if (!node.nodeValue || node.nodeValue.length === 0) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        },
      });

      let textNode: Text | null;

      while ((textNode = walker.nextNode() as Text)) {
        let text = textNode.data;

        // Normalize punctuation (Single pass regex)
        // We use a callback to only run the replacement if a match is found.
        const normalized = text.replace(REPLACEMENT_REGEX, (match) => REPLACEMENTS[match]);

        // Update DOM only if strictly necessary (Minimize Reflows)
        if (normalized !== text) {
          textNode.data = normalized;
          text = normalized;
        }

        const length = text.length;

        if (length === 0) {
          continue;
        } // Safety check for empty post-replace strings

        const start = offset;
        const end = start + length;

        offset = end;

        fragments.push({
          node: textNode,
          start,
          end,
          length,
          hasRuby: false, // Mokuro text is usually flat text, no ruby tags
        });
      }
    }

    if (fragments.length > 0) {
      result.push(fragments as unknown as Paragraph);
    }
  }

  return result;
};
