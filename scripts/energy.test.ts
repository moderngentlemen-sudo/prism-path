import {test} from 'node:test';
import assert from 'node:assert/strict';
import {energyEdges,newlyLit} from '../lib/energy.ts';
test('Energy crosses only reciprocal live neighbors, never row wraps',()=>{
 const signal={lit:new Set([0,1,2,3]),depth:{0:0,1:1,2:3,3:2}};
 assert.deepEqual(energyEdges([10,12,2,9],2,signal),[{from:0,to:1},{from:1,to:3},{from:3,to:2}]);
 assert.deepEqual(energyEdges([2,2,8,0],2,signal),[]);
 assert.deepEqual(energyEdges([10,12,2,9],2,{...signal,lit:new Set([0])}),[]);
});
test('Activation feedback occurs only for newly illuminated tiles',()=>{
 assert.deepEqual(newlyLit(new Set([0,1]),new Set([0,1,2,3])),[2,3]);
 assert.deepEqual(newlyLit(new Set([0,1]),new Set([0,1])),[]);
 assert.deepEqual(newlyLit(new Set([0,1]),new Set()),[]);
});
