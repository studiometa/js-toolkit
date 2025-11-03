import type { Ref } from 'vue';
import { ref, unref } from 'vue';
import { useData } from 'vitepress';

interface Link {
  text: string;
  link: string;
  parent?: Link;
  root?: Link;
  keywords?: string[];
}

interface VitepressLink {
  text: string;
  link?: string;
  items?: VitepressLink[];
  keywords?: string[]
}

/**
 * Add links to the list of links.
 */
function addLinks(
  links: Ref<Link[]>,
  linksSet: Set<string>,
  item: VitepressLink,
  parent?: VitepressLink,
  root?: VitepressLink,
) {
  if (item.link) {
    let { text, link, keywords = [] } = item;

    if (!linksSet.has(link)) {
      const newLink:Link = {
        text, link, keywords
      };

      if (parent) {
        newLink.parent = {
          text: parent.text,
          link: parent.link
        }
      }

      if (root) {
        newLink.root = {
          text: root.text,
          link: root.link
        };
      }

      links.value.push(newLink);
      linksSet.add(link);
    }
  }

  if (Array.isArray(item.items)) {
    item.items.forEach((child) => addLinks(links, linksSet, child, item, parent));
  }
}

export function useAllLinks() {
  const { theme } = useData();
  const { nav, sidebar } = unref(theme);

  const links = ref([]);
  const linkSet = new Set();

  nav.forEach((item) => addLinks(links, linkSet, item));

  Object.entries(sidebar).forEach(([name, item]) => {
    const parent = nav.find(item => name.startsWith(item.link));
    item.forEach((link) => addLinks(links, linkSet, link, parent));
  });

  return {
    links,
  };
}
