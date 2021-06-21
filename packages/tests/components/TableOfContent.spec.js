import TableOfContent from '@studiometa/js-toolkit/components/TableOfContent';
import template from '@studiometa/js-toolkit-docs/components/TableOfContent.template.html';

describe('The TableOfContent component', () => {
  let tableOfContentInstance;
  let sections = `<section id="first-section" class="js-section">
    <h2>First section</h2>
  </section>
  <section id="second-section" class="js-section">
    <h2>Second section</h2>
  </section>
  <section id="third-section" class="js-section">
    <h2>Third section</h2>
  </section>`

  beforeAll(() => {
    document.body.innerHTML = template + sections;
    tableOfContentInstance = new TableOfContent(document.body.firstElementChild).$mount();
  });

  it('should be complete on instantiation', () => {
    let links = document.body.firstElementChild.querySelectorAll('a');
    let sections = document.body.querySelectorAll('section.js-section');
    expect(tableOfContentInstance.$el.outerHTML).toBe(document.body.firstElementChild.outerHTML);
    expect(links.length).toBe(sections.length);
    links.forEach((link, i) => {
      expect(link.getAttribute('href')).toBe(`#${sections[i].id}`)
    });
  });
});
