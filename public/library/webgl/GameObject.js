function GameObject()
{
  this.m_transform = new Transform();
  this.parent = null;
  this.components = new Array();
  this.children = new Array();

  this.absolutePosition = function()
  {
    if (this.parent != null)
    {
      var transformation = mat4.create();
      var p = this.parent;
      while(p != null)
      {
        mat4.multiply( transformation, transformation, p.m_transform.toMatrix() );
      }
      var pos = vec3.create();
      return vec3.transformMat4(pos, pos, transformation);
    }
    return this.m_transform.position;
  }

  this.update = function()
  {
    var i;
    for(i in this.children)
      this.children[i].update();

    for(i in this.components)
      this.components[i].update();
  }

  this.draw = function(gl)
  {
    Game.pushMatrix();

    mat4.multiply( Game.mMatrix, Game.mMatrix, this.m_transform.toMatrix() );

    var i;
    for(i in this.components)
      this.components[i].draw(gl);

    for(i in this.children)
      this.children[i].draw(gl);

    Game.popMatrix();
  }

  this.addChildGameObject = function(child)
  {
    if (child.parent != null)
      child.parent.removeChildGameObject(child);

    if (this.children.indexOf(child) == -1)
    {
      child.parent = this;
      this.children.push(child);
    }
  }

  this.removeChildGameObject = function(child)
  {
    var i = this.children.indexOf(child);
    if (i != -1)
    {
      this.children.splice(i, 1);
      child.parent = null;
    }
  }

  this.addComponent = function(component)
  {
    if (this.components.indexOf(component) == -1)
    {
      component.m_gameObject = this;
      this.components.push(component);
    }
  }

  this.getComponent = function(componentType)
  {
    for(i in this.components)
    {
      if (this.components[i] instanceof componentType)
        return this.components[i];
    }
  }

  this.removeComponent = function(component)
  {
    var i = this.components.indexOf(component);
    if (i != -1)
    {
      component.m_gameObject = null;
      this.components.splice(i, 1);
    }
  }

  this.deserialize = function(xml)
  {
    if (xml.hasChildNodes())
    {
      for(var i in xml.childNodes)
      {
        if (xml.childNodes[i].tagName != undefined)
        {
          if (xml.childNodes[i].tagName == "components")
          {
            for(var j in xml.childNodes[i].childNodes)
            {
              if ( xml.childNodes[i].childNodes[j].tagName != undefined )
              {
                var component = Game.stringToFunction( xml.childNodes[i].childNodes[j].tagName );
                component.deserialize( xml.childNodes[i].childNodes[j] );
                this.addComponent( component );
              }
            }
          }
          else if (xml.childNodes[i].tagName == "children")
          {
            for(var j in xml.childNodes[i].childNodes)
            {
              if ( xml.childNodes[i].childNodes[j].tagName != undefined )
              {
                var child = Game.stringToFunction( xml.childNodes[i].childNodes[j].tagName );
                child.deserialize( xml.childNodes[i].childNodes[j] );
                this.addChildGameObject( child );
              }
            }
          }
          else
          {
            throw new Error("GameObject prefab can only have <children> and <components> : Attempted " + xml.childNodes[i].tagName);
          }
        }
      }
    }
  }
}