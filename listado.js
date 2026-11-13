(() => {
 'use strict';
 const $=id=>document.getElementById(id);
 const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 const text=(tag,value,className)=>{const el=document.createElement(tag);el.textContent=value;if(className)el.className=className;return el;};
 const money=value=>{const n=Number(String(value??'').replace(/,/g,'').trim());return String(value??'').trim()!==''&&Number.isFinite(n)?'$'+n.toLocaleString('es-CL',{maximumFractionDigits:0}):'No registrado';};
 // Preserve the original unit-price formula, display currency and explain it in the full record.
 const unitPrice=item=>{const price=parseFloat((item.precio||'').replace(/,/g,'').trim());let presentation=parseFloat((item.presentacion||'').replace(/[^0-9.,]/g,'').replace(',','.'));if(!presentation||!Number.isFinite(presentation))presentation=1;const unit=price/presentation;return Number.isFinite(unit)?'$'+unit.toLocaleString('es-CL',{minimumFractionDigits:2,maximumFractionDigits:2}):'No registrado';};
 const hasStock=item=>{const value=String(item.stock??'').trim();return value!==''&&value!=='0';};
 const searchFields=['pa_nombres','pa_dosis','forma','presentacion','laboratorio','bioequivalente','petitorio_minimo','codigo_barra','nombre'];
 const products=rawData.map((item,index)=>({item,index,search:normalize(searchFields.map(key=>item[key]||'').join(' '))}));
 let page=1,view='cards',results=products;const size=24;
 const pill='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 4.5-5 5a7.1 7.1 0 0 0 10 10l5-5a7.1 7.1 0 0 0-10-10Z"/><path d="m7 7 10 10"/></svg>';
 const contact=item=>{const a=text('a','Consultar ↗');a.href='https://wa.me/56942748056?text='+encodeURIComponent('Hola FarmaJovi, quisiera consultar sobre '+item.nombre+' del registro referencial del 19-02-2026.');a.target='_blank';a.rel='noopener noreferrer';return a;};
 function detailButton(product){const button=text('button','Ver ficha completa ↗','details-button');button.type='button';button.dataset.product=String(product.index);button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-label','Ver ficha completa de '+product.item.nombre);return button;}
 function priceBlock(item){const el=document.createElement('div');el.append(text('span','Precio referencial','price-label'),text('div',money(item.precio),'product-price'),text('div','P/U registrado: '+unitPrice(item),'unit-price'));return el;}
 function card(product){const item=product.item,el=document.createElement('article');el.className='product-card';const top=document.createElement('div');top.className='product-top';const symbol=document.createElement('span');symbol.className='product-symbol';symbol.setAttribute('aria-hidden','true');symbol.innerHTML=pill;top.append(symbol);if(normalize(item.bioequivalente)==='si')top.append(text('span','Bioequivalente registrado','badge bio'));else top.append(text('span','Registro referencial','badge'));
  el.append(top,text('h3',item.nombre||'Producto sin nombre'),text('p',[item.pa_nombres,item.pa_dosis].filter(Boolean).join(' · '),'product-ingredient'),text('p',[item.forma,item.presentacion?'Presentación: '+item.presentacion:'',item.laboratorio].filter(Boolean).join(' · '),'product-lab'));
  const row=document.createElement('div');row.className='price-row';const stock=text('div','Stock histórico','stock-tag');stock.append(text('strong',String(item.stock||'No informado')));row.append(priceBlock(item),stock);el.append(row);
  const bottom=document.createElement('div');bottom.className='card-bottom';bottom.append(detailButton(product),contact(item));el.append(bottom);return el;
 }
 function tableRow(product){const item=product.item,tr=document.createElement('tr');const name=document.createElement('td');name.append(text('strong',item.nombre||'Producto sin nombre'),text('small',[item.pa_nombres,item.pa_dosis].filter(Boolean).join(' · ')));const presentation=document.createElement('td');presentation.append(text('span',[item.forma,item.presentacion].filter(Boolean).join(' · ')),text('small',item.laboratorio||'Laboratorio no registrado'));const price=document.createElement('td');price.append(text('div',money(item.precio),'product-price'),text('small','P/U: '+unitPrice(item)));const stock=text('td',String(item.stock||'No informado'));const details=document.createElement('td');details.append(detailButton(product));tr.append(name,presentation,price,stock,details);return tr;}
 function render(){
  const pages=Math.max(1,Math.ceil(results.length/size));page=Math.min(page,pages);
  const start=(page-1)*size,visible=results.slice(start,start+size);
  $('summary').textContent=results.length?results.length.toLocaleString('es-CL')+' productos encontrados · '+(start+1)+'–'+Math.min(start+size,results.length):'0 productos encontrados';
  $('productCards').replaceChildren(...(view==='cards'?visible.map(card):[]));$('tableBody').replaceChildren(...(view==='table'?visible.map(tableRow):[]));
  $('productCards').hidden=view!=='cards'||!results.length;$('productTable').hidden=view!=='table'||!results.length;$('emptyState').hidden=results.length!==0;
  $('pageStatus').textContent='Página '+page+' de '+pages;$('previousPage').disabled=page<=1;$('nextPage').disabled=page>=pages;document.querySelector('.pagination').hidden=!results.length;
  $('clearSearch').hidden=!$('search').value;
  document.querySelectorAll('.quick-btn').forEach(button=>{const active=normalize(button.dataset.query)===normalize($('search').value);button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
 }
 function filter(){
  const tokens=normalize($('search').value).split(/\s+/).filter(Boolean),stock=$('stockFilter').value,bio=$('bioFilter').value;
  results=products.filter(p=>tokens.every(token=>p.search.includes(token))&&(stock==='todos'||(stock==='con'?hasStock(p.item):!hasStock(p.item)))&&(bio==='todos'||(bio==='si'?normalize(p.item.bioequivalente)==='si':normalize(p.item.bioequivalente)!=='si')));
  const order=$('sortOrder').value;if(order==='name')results.sort((a,b)=>String(a.item.nombre).localeCompare(String(b.item.nombre),'es'));if(order==='price-asc'||order==='price-desc'){const numeric=p=>{const value=Number(p.item.precio);return Number.isFinite(value)?value:0;};results.sort((a,b)=>order==='price-asc'?numeric(a)-numeric(b):numeric(b)-numeric(a));}
  page=1;render();
 }
 function reset(){ $('search').value='';$('stockFilter').value='todos';$('bioFilter').value='todos';$('sortOrder').value='original';filter(); }
 let debounce; $('search').addEventListener('input',()=>{clearTimeout(debounce);debounce=setTimeout(filter,120);});
 $('search').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();clearTimeout(debounce);filter();}});
 $('submitSearch').addEventListener('click',()=>{clearTimeout(debounce);filter();});
 ['stockFilter','bioFilter','sortOrder'].forEach(id=>$(id).addEventListener('change',filter));
 $('quickFilters').addEventListener('click',event=>{const button=event.target.closest('[data-query]');if(!button)return;clearTimeout(debounce);$('search').value=button.dataset.query;filter();});
 $('clearSearch').addEventListener('click',()=>{clearTimeout(debounce);$('search').value='';filter();$('search').focus();});
 ['resetFilters','resetEmpty'].forEach(id=>$(id).addEventListener('click',()=>{clearTimeout(debounce);reset();}));
 document.querySelector('.view-toggle').addEventListener('click',event=>{const button=event.target.closest('[data-view]');if(!button)return;view=button.dataset.view;document.querySelectorAll('[data-view]').forEach(el=>el.setAttribute('aria-pressed',String(el===button)));render();});
 function paginate(direction){page+=direction;render();document.querySelector('.results-toolbar').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});}
 $('previousPage').addEventListener('click',()=>paginate(-1));$('nextPage').addEventListener('click',()=>paginate(1));
 const dialog=$('productDialog');
 document.querySelector('.results').addEventListener('click',event=>{
  const button=event.target.closest('[data-product]');if(!button)return;const index=Number(button.dataset.product),item=rawData[index];if(!item)return;
  const content=$('dialogContent');content.replaceChildren(text('p','FICHA DEL REGISTRO · N.º '+(index+1),'dialog-kicker'));const title=text('h2',item.nombre||'Producto','dialog-product-title');title.id='dialogTitle';content.append(title,text('p',money(item.precio),'dialog-price'),text('p','Precio y existencias históricos del 19-02-2026. No representan condiciones comerciales vigentes.','dialog-note'));
  const facts=document.createElement('dl');facts.className='product-facts';
  for(const [label,key] of [['Principio activo','pa_nombres'],['Dosis','pa_dosis'],['Forma farmacéutica','forma'],['Presentación del registro','presentacion'],['Código de barras','codigo_barra'],['Laboratorio','laboratorio'],['Stock registrado (histórico)','stock'],['Bioequivalente (registro)','bioequivalente'],['Petitorio mínimo (registro)','petitorio_minimo'],['Controlado (registro)','controlado'],['Tipo de cálculo original','tipo_calculo'],['Sigla original','sigla']]){const group=document.createElement('div');group.append(text('dt',label),text('dd',String(item[key]||'No informado')));facts.append(group);}
  const unit=document.createElement('div');unit.append(text('dt','P/U según cálculo original'),text('dd',unitPrice(item)));facts.append(unit);content.append(facts,text('p','P/U: precio dividido por presentación, según el cálculo del listado original. La unidad y el dato de presentación pueden variar entre productos; no compara tratamientos ni confirma equivalencia.','dialog-note'));
  const a=contact(item);a.className='btn primary dialog-contact';a.textContent='Consultar este producto por WhatsApp ↗';content.append(a);dialog.showModal();
 });
 $('closeDialog').addEventListener('click',()=>dialog.close());
 $('totalProducts').textContent=rawData.length.toLocaleString('es-CL')+' productos';
 filter();
})();
