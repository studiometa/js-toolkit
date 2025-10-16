class ComponentTree {
  constructor() {
    this.tree = {};
    this.components = new Map();
    this.enabled = process.env.NODE_ENV === 'development';
  }
  
  addComponent(name, instance, parent = null) {
    if (!this.enabled) return;
    
    const id = `${name}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const componentData = { 
      name, 
      instance, 
      parent,
      id,
      refs: instance.$refs || {},
      options: instance.$options || {}
    };
    
    this.components.set(id, componentData);
    
    if (!parent) {
      this.tree[id] = { name, children: [] };
    } else {
      // Parent er children e add korbo
      const parentData = this.components.get(parent);
      if (parentData) {
        if (!parentData.children) parentData.children = [];
        parentData.children.push(componentData);
      }
    }
    
    console.log(`➕ Component added: ${name}`, { id, parent });
    return id;
  }
  
  removeComponent(id) {
    if (!this.enabled) return;
    
    const component = this.components.get(id);
    if (component) {
      this.components.delete(id);
      console.log(`➖ Component removed: ${component.name}`, { id });
    }
  }
  
  logTree() {
    if (!this.enabled) return;
    
    console.group('🌳 Component Tree');
    this.components.forEach((comp, id) => {
      if (!comp.parent) {
        this._logComponent(comp, 0);
      }
    });
    console.groupEnd();
  }
  
  _logComponent(component, depth = 0) {
    const indent = '  '.repeat(depth);
    console.log(`${indent}${component.name} (${component.id})`);
    
    if (component.children) {
      component.children.forEach(child => {
        this._logComponent(child, depth + 1);
      });
    }
  }
}

export default new ComponentTree();
