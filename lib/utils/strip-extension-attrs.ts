export const STRIP_EXTENSION_ATTRS_SCRIPT = `(function(){
  function injected(name){
    return name==="bis_skin_checked"
      || name.indexOf("bis_")===0
      || name.indexOf("__processed_")===0
      || name.indexOf("data-new-gr-")===0
      || name==="data-gr-ext-installed"
      || name==="cz-shortcut-listen";
  }
  function strip(el){
    if(!el||!el.attributes)return;
    var names=[];
    for(var i=0;i<el.attributes.length;i++)names.push(el.attributes[i].name);
    for(var j=0;j<names.length;j++)if(injected(names[j]))el.removeAttribute(names[j]);
  }
  function walk(root){
    if(!root)return;
    if(root.nodeType===1)strip(root);
    if(!root.querySelectorAll)return;
    var nodes=root.querySelectorAll("*");
    for(var i=0;i<nodes.length;i++)strip(nodes[i]);
  }
  var obs=new MutationObserver(function(records){
    for(var i=0;i<records.length;i++){
      var rec=records[i];
      if(rec.type==="attributes"&&injected(rec.attributeName||"")){
        rec.target.removeAttribute(rec.attributeName);
      }
      for(var j=0;j<rec.addedNodes.length;j++){
        var node=rec.addedNodes[j];
        if(node.nodeType===1)walk(node);
      }
    }
  });
  obs.observe(document.documentElement,{subtree:true,childList:true,attributes:true});
  walk(document.documentElement);
  function stop(){
    walk(document.documentElement);
    obs.disconnect();
  }
  window.addEventListener("load",function(){setTimeout(stop,2500);});
  setTimeout(stop,8000);
})();`;
