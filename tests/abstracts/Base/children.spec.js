import { getComponentElements } from '~/abstracts/Base/children';

describe('The component resolution', () => {
  it('should resolve components by name', () => {
    const component1 = document.createElement('div');
    component1.setAttribute('data-component', 'Component');
    const component2 = document.createElement('div');
    component2.setAttribute('data-component', 'OtherComponent');
    document.body.appendChild(component1);
    document.body.appendChild(component2);
    expect(getComponentElements('Component')).toEqual([component1]);
  });

  it('should resolve components by CSS selector', () => {
    const component1 = document.createElement('div');
    component1.classList.add('component');
    const component2 = document.createElement('div');
    component2.setAttribute('data-component', 'component');
    document.body.appendChild(component1);
    document.body.appendChild(component2);
    expect(getComponentElements('.component')).toEqual([component1]);
  });

  it('should resolve components by complex selector', () => {
    const link1 = document.createElement('a');
    link1.href = 'https://www.studiometa.fr';
    const link2 = document.createElement('a');
    link2.href = '#anchor';
    document.body.appendChild(link1);
    document.body.appendChild(link2);
    expect(getComponentElements('a[href^="#"]')).toEqual([link2]);
  });

  it('should resolve components from a custom root element', () => {
    const root = document.createElement('div');
    const component = document.createElement('div');
    component.setAttribute('data-component', 'Component');
    root.appendChild(component);
    expect(getComponentElements('Component', root)).toEqual([component]);
  });
});
