import TableOfContent from '@studiometa/js-toolkit/components/TableOfContent';
import template from '@studiometa/js-toolkit-docs/components/TableOfContent.template.html';

describe('The TableOfContent component', () => {
  let tableOfContentInstance;

  beforeAll(() => {
    document.body.innerHTML = template;
    tableOfContentInstance = new TableOfContent(document.body.firstElementChild).$mount();
  });

  it('should be complete on instantiation', () => {
    let links = document.body.firstElementChild.querySelectorAll('a');
    let sections = document.body.querySelectorAll('section[data-ref="sections[]"]');
    expect(tableOfContentInstance.$el.outerHTML).toBe(document.body.firstElementChild.outerHTML);
    expect(links.length).toBe(sections.length);
    links.forEach((link, i) => {
      expect(link.getAttribute('href')).toBe(`#${sections[i].id}`)
    });
  });
});
