import assert from 'node:assert/strict';
import { bakeryStock, bakeryOrders, addToBakeryTray, bakeryOrderMatches, TRAY_LIMIT } from '../src/lib/bakery-play.ts';
const state = { bakeryCatalog: [{ id:'donut', name:'Donut' }, { id:'cupcake', name:'Cupcake' }, { id:'cookie', name:'Cookie' }], treats: [{id:'a',treatId:'donut'},{id:'b',treatId:'donut'},{id:'c',treatId:'cupcake'}], balance:42 };
const before=structuredClone(state);
const stock=bakeryStock(state);
assert.deepEqual(stock,[{id:'donut',name:'Donut',count:2},{id:'cupcake',name:'Cupcake',count:1}]);
assert.deepEqual(bakeryOrders([]),[]);
assert.deepEqual(bakeryStock({}),[]);
assert.deepEqual(bakeryOrders([{id:'donut',name:'Donut',count:1}]),[['donut'],['donut'],['donut']]);
for (let round=0;round<30;round++) {
  const orders=bakeryOrders(stock,round);
  assert.equal(orders.length,3);
  for (const order of orders) {
    assert(order.length>0 && order.length<=TRAY_LIMIT);
    for(const item of stock) assert(order.filter(id=>id===item.id).length<=item.count);
    assert(order.every(id=>stock.some(item=>item.id===id)));
    assert(bakeryOrderMatches(order,[...order].reverse()));
    assert(!bakeryOrderMatches(order,[...order,'cookie']));
    assert(!bakeryOrderMatches(order,order.slice(1)));
  }
}
let tray=[];
for(const id of ['donut','donut','donut','cookie','cupcake','cupcake']) tray=addToBakeryTray(tray,id,stock);
assert.deepEqual(tray,['donut','donut','cupcake']);
assert(!bakeryOrderMatches(['donut','cupcake'],['donut','donut']));
assert(!bakeryOrderMatches([],[]));
const bigStock=[{id:'donut',name:'Donut',count:100}];
assert.equal(bakeryOrders(bigStock)[2].length,4);
for(let i=0;i<10;i++) tray=addToBakeryTray(tray,'donut',bigStock);
assert.equal(tray.length,4);
assert.deepEqual(state,before);
console.log('Bakery play: owned stock, duplicates, bounded orders/trays, exact matching, and unchanged inventory pass.');
